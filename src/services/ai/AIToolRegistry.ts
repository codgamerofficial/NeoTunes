'use client';

import { AIToolDefinition, ToolPermission } from '@/types/ai-copilot';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService } from '../MusicSearchService';
import { RecommendationPipeline } from '../RecommendationPipeline';
import { Track } from '@/types';

export class AIToolRegistry {
  private static tools: Map<string, AIToolDefinition> = new Map();

  public static registerTool(def: AIToolDefinition): void {
    AIToolRegistry.tools.set(def.name, def);
  }

  public static getTool(name: string): AIToolDefinition | undefined {
    return AIToolRegistry.tools.get(name);
  }

  /**
   * Sanitizes input strings against prompt injection (Section 71)
   */
  public static sanitizeMetadataInput(rawText: string): string {
    if (!rawText) return '';
    return rawText
      .replace(/ignore previous instructions/gi, '')
      .replace(/system prompt/gi, '')
      .trim();
  }

  /**
   * Plays a track by exact canonical search query (Section 3 & 11)
   */
  public static async executePlayTrack(query: string): Promise<{ success: boolean; track?: Track; message: string }> {
    const cleanQuery = AIToolRegistry.sanitizeMetadataInput(query);
    const searchRes = await MusicSearchService.searchAll(cleanQuery);

    if (searchRes.songs.length === 0) {
      return { success: false, message: `Could not find a verified track for "${cleanQuery}".` };
    }

    const candidate = searchRes.songs.find((t) => RecommendationPipeline.validateCandidate(t)) || searchRes.songs[0];
    const store = usePlaybackStore.getState();
    store.playTrack(candidate, [candidate]);

    return {
      success: true,
      track: candidate,
      message: `Playing ${candidate.title} by ${typeof candidate.artist === 'string' ? candidate.artist : candidate.artists?.join(', ')}.`,
    };
  }

  /**
   * Reads currently playing track details (Section 9)
   */
  public static getCurrentTrackDetails(): { isPlaying: boolean; track: Track | null } {
    const store = usePlaybackStore.getState();
    return {
      isPlaying: store.isPlaying,
      track: store.currentTrack,
    };
  }
}

// Register tools into registry
AIToolRegistry.registerTool({ name: 'getCurrentTrack', description: 'Gets current playing track', permission: 'READ', requiresConfirmation: false });
AIToolRegistry.registerTool({ name: 'playTrack', description: 'Exact search and play canonical track', permission: 'WRITE', requiresConfirmation: false });
AIToolRegistry.registerTool({ name: 'deletePlaylist', description: 'Deletes a playlist permanently', permission: 'DESTRUCTIVE', requiresConfirmation: true });
