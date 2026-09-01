import {
  NeoAIToolRegistry,
  NeoExecutionContext,
  ClientDirective,
  PendingAIAction,
  ToolExecutionResult,
} from './NeoAIToolRegistry';
import { NeoGuardrails } from './NeoGuardrails';
import { INeoAIProvider, ProviderMessage } from './providers/INeoAIProvider';
import { BedrockProvider } from './providers/BedrockProvider';
import { NeoTruthEngine, TruthProvenance } from './NeoTruthEngine';
import { Track } from '@/types';
import { NeoQueryCleaner } from './NeoQueryCleaner';

export interface NeoConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface NeoOrchestratorResponse {
  reply: string;
  tracks: Track[];
  clientDirectives: ClientDirective[];
  executedTools: Array<{
    name: string;
    source: string;
    success: boolean;
    provenance?: TruthProvenance;
  }>;
  pendingAction?: PendingAIAction | null;
  provenanceBadges: string[];
  latencyMs: number;
  modelId: string;
  tokensUsed?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export class NeoOrchestrator {
  private provider: INeoAIProvider;

  constructor(provider?: INeoAIProvider) {
    this.provider = provider || new BedrockProvider();
  }

  public setProvider(provider: INeoAIProvider) {
    this.provider = provider;
  }

  public async processMessage(
    userPrompt: string,
    history: NeoConversationMessage[] = [],
    context: NeoExecutionContext = {}
  ): Promise<NeoOrchestratorResponse> {
    const startTime = Date.now();

    // 1. INPUT VALIDATION & PROMPT INJECTION GUARDRAIL
    const guardrailCheck = NeoGuardrails.assessInput(userPrompt);
    if (!guardrailCheck.isSafe) {
      return {
        reply:
          "I cannot process instructions that attempt to override NeoTunes security policies or system safeguards.",
        tracks: [],
        clientDirectives: [],
        executedTools: [],
        provenanceBadges: ['Security Guardrail Active'],
        latencyMs: Date.now() - startTime,
        modelId: this.provider.defaultModelId,
      };
    }

    // 2. QUERY CLEANING & INTENT PARSING
    const parsedIntent = NeoQueryCleaner.clean(userPrompt);

    // 3. CONSTRUCT SYSTEM PROMPT
    const activeTrack = context.clientState?.currentTrack;
    const isPlaying = context.clientState?.playbackState?.isPlaying ?? false;
    const activeDevice = context.clientState?.activeDevice?.name || 'System Audio';

    const systemPrompt = `You are Neo, the official Music Intelligence & Tool Orchestrator for NeoTunes.

CURRENT RUNTIME CONTEXT:
- Active Player Track: ${activeTrack ? `"${activeTrack.title}" by ${activeTrack.artist || 'Unknown'}` : 'No track loaded'}
- Playback Status: ${isPlaying ? 'PLAYING' : 'PAUSED / IDLE'}
- Connected Audio Output: ${activeDevice}
- Spatial Audio: Available
- User Session: ${context.isGuest ? 'Guest Listener' : `Authenticated User (${context.userId})`}

CORE OPERATING DIRECTIVES:
1. Always prioritize authoritative NeoTunes tools over assumptions.
2. If the user asks to play, queue, search, check playback, inspect devices, or create playlists, use the corresponding tool.
3. For music requests (e.g. "Play Bengali acoustic melodies"), use searchMusic with cleaned search terms ("Bengali acoustic melodies") or getRecommendations.
4. For duration-specific playlist requests (e.g. "Create a 45 minute playlist"), use createSmartPlaylist.
5. NEVER invent songs, artists, albums, playlists, devices, storage values, or playback state.
6. If data cannot be verified from tools, explicitly state that it cannot currently be verified.
7. Keep replies natural, concise, and focused on music listening.`;

    const messages: ProviderMessage[] = [
      ...history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: userPrompt },
    ];

    const allTools = NeoAIToolRegistry.getBedrockToolSpecs();
    const executedTools: NeoOrchestratorResponse['executedTools'] = [];
    const clientDirectives: ClientDirective[] = [];
    const accumulatedTracks: Track[] = [];
    const provenanceBadges: string[] = [];
    let pendingAction: PendingAIAction | null = null;
    let finalReply = '';

    // 4. MULTI-STEP TOOL ORCHESTRATION LOOP (Max 3 iterations)
    try {
      let currentIteration = 0;
      const maxIterations = 3;

      while (currentIteration < maxIterations) {
        currentIteration++;

        const response = await this.provider.generateResponse(systemPrompt, messages, allTools);

        if (response.toolCalls.length === 0) {
          finalReply = response.content;
          break;
        }

        // Execute tool calls requested by model
        const toolResultMessages: string[] = [];

        for (const call of response.toolCalls) {
          const result: ToolExecutionResult = await NeoAIToolRegistry.executeTool(
            call.name,
            call.input,
            context
          );

          executedTools.push({
            name: call.name,
            source: result.source,
            success: result.success,
            provenance: result.provenance,
          });

          if (result.provenance) {
            provenanceBadges.push(NeoTruthEngine.getBadgeLabel(result.provenance));
          }

          if (result.clientDirective) {
            clientDirectives.push(result.clientDirective);
          }

          if (result.pendingAction) {
            pendingAction = result.pendingAction;
          }

          // Extract verified tracks
          if (result.data?.tracks && Array.isArray(result.data.tracks)) {
            for (const t of result.data.tracks) {
              if (t && t.title && !accumulatedTracks.some((at) => at.id === t.id)) {
                accumulatedTracks.push(t);
              }
            }
          } else if (result.data?.track && result.data.track.title) {
            if (!accumulatedTracks.some((at) => at.id === result.data.track.id)) {
              accumulatedTracks.push(result.data.track);
            }
          }

          toolResultMessages.push(
            `Tool "${call.name}" result: ${JSON.stringify(result.data || result.message)}`
          );
        }

        // Return tool results back to provider for final answer
        messages.push({
          role: 'assistant',
          content: response.content || 'Executing tools...',
        });
        messages.push({
          role: 'user',
          content: toolResultMessages.join('\n'),
        });
      }
    } catch (err: any) {
      console.warn('[NeoOrchestrator] Provider execution fallback:', err);
      // Deterministic fallback if Bedrock connection fails
      return this.handleOfflineDeterministicFallback(userPrompt, parsedIntent, context, startTime);
    }

    if (!finalReply) {
      if (accumulatedTracks.length > 0) {
        finalReply = `Here are verified tracks matching your request:`;
      } else {
        finalReply = "I've checked the NeoTunes platform for your request.";
      }
    }

    const sanitizedReply = NeoGuardrails.sanitizeOutput(finalReply);

    return {
      reply: sanitizedReply,
      tracks: accumulatedTracks,
      clientDirectives,
      executedTools,
      pendingAction,
      provenanceBadges: Array.from(new Set(provenanceBadges)),
      latencyMs: Date.now() - startTime,
      modelId: this.provider.defaultModelId,
    };
  }

  /**
   * Deterministic local fallback if Bedrock API is temporarily offline
   */
  private async handleOfflineDeterministicFallback(
    userPrompt: string,
    parsedIntent: ReturnType<typeof NeoQueryCleaner.clean>,
    context: NeoExecutionContext,
    startTime: number
  ): Promise<NeoOrchestratorResponse> {
    const executedTools: NeoOrchestratorResponse['executedTools'] = [];
    const clientDirectives: ClientDirective[] = [];
    const tracks: Track[] = [];

    if (parsedIntent.actionVerb === 'GET_CURRENT_TRACK') {
      const res = await NeoAIToolRegistry.executeTool('getCurrentTrack', {}, context);
      executedTools.push({ name: 'getCurrentTrack', source: res.source, success: res.success, provenance: res.provenance });
      if (res.data?.track) tracks.push(res.data.track);
      return {
        reply: res.data?.track
          ? `You are listening to "${res.data.track.title}" by ${res.data.track.artist || res.data.track.artists?.join(', ')}.`
          : 'No track is currently playing.',
        tracks,
        clientDirectives,
        executedTools,
        provenanceBadges: [NeoTruthEngine.getBadgeLabel(res.provenance)],
        latencyMs: Date.now() - startTime,
        modelId: 'neotunes-deterministic-engine',
      };
    }

    if (parsedIntent.actionVerb === 'GET_QUEUE') {
      const res = await NeoAIToolRegistry.executeTool('getQueue', {}, context);
      executedTools.push({ name: 'getQueue', source: res.source, success: res.success, provenance: res.provenance });
      if (res.data?.queue) tracks.push(...res.data.queue);
      return {
        reply: res.data?.queue?.length > 0
          ? `Here is your current queue (${res.data.queue.length} tracks):`
          : 'Your queue is currently empty.',
        tracks,
        clientDirectives,
        executedTools,
        provenanceBadges: [NeoTruthEngine.getBadgeLabel(res.provenance)],
        latencyMs: Date.now() - startTime,
        modelId: 'neotunes-deterministic-engine',
      };
    }

    if (parsedIntent.actionVerb === 'GET_DEVICE') {
      const res = await NeoAIToolRegistry.executeTool('getDevices', {}, context);
      executedTools.push({ name: 'getDevices', source: res.source, success: res.success, provenance: res.provenance });
      const activeDev = res.data?.devices?.find((d: any) => d.isActive);
      return {
        reply: activeDev
          ? `You are connected to ${activeDev.name} (${activeDev.type}).`
          : 'No active external audio output detected.',
        tracks,
        clientDirectives,
        executedTools,
        provenanceBadges: [NeoTruthEngine.getBadgeLabel(res.provenance)],
        latencyMs: Date.now() - startTime,
        modelId: 'neotunes-deterministic-engine',
      };
    }

    if (parsedIntent.actionVerb === 'CREATE_PLAYLIST') {
      const res = await NeoAIToolRegistry.executeTool(
        'createSmartPlaylist',
        {
          name: parsedIntent.language ? `${parsedIntent.language} Mix` : 'Neo Tunes Mix',
          language: parsedIntent.language,
          mood: parsedIntent.mood,
          targetDurationMinutes: parsedIntent.targetDurationMinutes || 45,
          excludeRecentlyPlayed: true,
        },
        context
      );
      executedTools.push({ name: 'createSmartPlaylist', source: res.source, success: res.success, provenance: res.provenance });
      if (res.data?.tracks) tracks.push(...res.data.tracks);
      return {
        reply: res.message || `Created playlist "${res.data?.name}" with ${res.data?.trackCount} verified tracks.`,
        tracks,
        clientDirectives,
        executedTools,
        provenanceBadges: [NeoTruthEngine.getBadgeLabel(res.provenance)],
        latencyMs: Date.now() - startTime,
        modelId: 'neotunes-deterministic-engine',
      };
    }

    if (parsedIntent.actionVerb === 'PLAY' || parsedIntent.isActionCommand) {
      const res = await NeoAIToolRegistry.executeTool(
        'playTrack',
        { query: parsedIntent.cleanedSearchQuery },
        context
      );
      executedTools.push({ name: 'playTrack', source: res.source, success: res.success, provenance: res.provenance });
      if (res.clientDirective) clientDirectives.push(res.clientDirective);
      if (res.data?.track) tracks.push(res.data.track);

      return {
        reply: res.message || `Playing "${parsedIntent.cleanedSearchQuery}".`,
        tracks,
        clientDirectives,
        executedTools,
        provenanceBadges: [NeoTruthEngine.getBadgeLabel(res.provenance)],
        latencyMs: Date.now() - startTime,
        modelId: 'neotunes-deterministic-engine',
      };
    }

    // Default search
    const searchRes = await NeoAIToolRegistry.executeTool(
      'searchMusic',
      { query: parsedIntent.cleanedSearchQuery },
      context
    );
    executedTools.push({ name: 'searchMusic', source: searchRes.source, success: searchRes.success, provenance: searchRes.provenance });
    if (searchRes.data?.tracks) tracks.push(...searchRes.data.tracks);

    return {
      reply: tracks.length > 0
        ? `Found ${tracks.length} tracks matching "${parsedIntent.cleanedSearchQuery}".`
        : `No matches found for "${parsedIntent.cleanedSearchQuery}" in the catalog.`,
      tracks,
      clientDirectives,
      executedTools,
      provenanceBadges: [NeoTruthEngine.getBadgeLabel(searchRes.provenance)],
      latencyMs: Date.now() - startTime,
      modelId: 'neotunes-deterministic-engine',
    };
  }
}

export const neoOrchestrator = new NeoOrchestrator();
