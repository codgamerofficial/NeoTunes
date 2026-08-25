'use client';

import { Track, getArtistName } from '@/types';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService } from './MusicSearchService';
import { RecommendationPipeline } from './RecommendationPipeline';
import { EventCollector } from './EventCollector';
import { TasteProfileManager } from './TasteProfileManager';
import { MusicIntelligenceEngine } from './MusicIntelligenceEngine';

export type NeoIntent =
  | 'SEARCH_TRACK'
  | 'SEARCH_ARTIST'
  | 'SEARCH_ALBUM'
  | 'DISCOVER_MUSIC'
  | 'PLAY_TRACK'
  | 'PLAY_ARTIST'
  | 'PLAY_ALBUM'
  | 'PLAYLIST_CREATE'
  | 'PLAYLIST_ADD'
  | 'PLAYLIST_REMOVE'
  | 'PLAYLIST_PLAY'
  | 'QUEUE_ADD'
  | 'QUEUE_REMOVE'
  | 'QUEUE_CLEAR'
  | 'NEXT_TRACK'
  | 'PREVIOUS_TRACK'
  | 'PAUSE'
  | 'RESUME'
  | 'SHUFFLE_ON'
  | 'SHUFFLE_OFF'
  | 'REPEAT_ON'
  | 'REPEAT_OFF'
  | 'SHOW_LIBRARY'
  | 'SHOW_LIKED'
  | 'SHOW_HISTORY'
  | 'SHOW_DOWNLOADS'
  | 'SHOW_LYRICS'
  | 'RECOMMEND'
  | 'EXPLAIN_RECOMMENDATION'
  | 'UNKNOWN';

export interface NeoAssistantResponse {
  intent: NeoIntent;
  reply: string;
  tracks?: Track[];
  playlistTitle?: string;
  playlistDescription?: string;
  tags?: string[];
  suggestedPrompts?: string[];
  executedTool?: string;
  ambiguityOptions?: Track[];
}

export class NeoAssistant {
  /**
   * Fast Deterministic Intent Router
   * Checks for 0ms simple player commands before invoking external LLM
   */
  public static processQuery(query: string): { isDirectCommand: boolean; directResponse?: NeoAssistantResponse } {
    const clean = query.trim().toLowerCase();
    const store = usePlaybackStore.getState();

    // 1. Direct Playback Control Commands (0ms latency, 0 LLM cost)
    if (clean === 'pause' || clean === 'stop') {
      store.setPlaying(false);
      return {
        isDirectCommand: true,
        directResponse: {
          intent: 'PAUSE',
          reply: 'Playback paused.',
          executedTool: 'setPlaying(false)',
        },
      };
    }

    if (clean === 'play' || clean === 'resume' || clean === 'continue') {
      store.setPlaying(true);
      return {
        isDirectCommand: true,
        directResponse: {
          intent: 'RESUME',
          reply: 'Playback resumed.',
          executedTool: 'setPlaying(true)',
        },
      };
    }

    if (clean === 'next' || clean === 'skip' || clean === 'next song') {
      store.nextTrack();
      return {
        isDirectCommand: true,
        directResponse: {
          intent: 'NEXT_TRACK',
          reply: 'Skipped to next track.',
          executedTool: 'nextTrack()',
        },
      };
    }

    if (clean === 'previous' || clean === 'prev' || clean === 'previous song') {
      store.prevTrack();
      return {
        isDirectCommand: true,
        directResponse: {
          intent: 'PREVIOUS_TRACK',
          reply: 'Returned to previous track.',
          executedTool: 'prevTrack()',
        },
      };
    }

    if (clean.includes('shuffle on') || clean === 'shuffle') {
      store.setShuffle(!store.shuffle);
      return {
        isDirectCommand: true,
        directResponse: {
          intent: 'SHUFFLE_ON',
          reply: `Shuffle mode ${!store.shuffle ? 'enabled' : 'disabled'}.`,
          executedTool: 'setShuffle()',
        },
      };
    }

    if (clean.includes('what\'s playing') || clean.includes('what song is this') || clean === 'current track') {
      const trk = store.currentTrack;
      if (trk) {
        const artistStr = getArtistName(trk.artists || trk.artist);
        return {
          isDirectCommand: true,
          directResponse: {
            intent: 'SHOW_LIBRARY',
            reply: `You're currently listening to "${trk.title}" by ${artistStr}.`,
            tracks: [trk],
            executedTool: 'getCurrentTrack()',
          },
        };
      } else {
        return {
          isDirectCommand: true,
          directResponse: {
            intent: 'SHOW_LIBRARY',
            reply: 'No track is currently playing.',
            executedTool: 'getCurrentTrack()',
          },
        };
      }
    }

    if (clean.includes('music taste') || clean.includes('my taste') || clean.includes('what kind of music')) {
      const summary = MusicIntelligenceEngine.getWeeklySummary();
      return {
        isDirectCommand: true,
        directResponse: {
          intent: 'EXPLAIN_RECOMMENDATION',
          reply: `Based on your listening history, your top artist is ${summary.topArtist} and your preferred genre is ${summary.topGenre}. You've logged ${summary.totalListeningMinutes} minutes of high-fidelity listening this week.`,
          tags: ['✨ Music Profile', `🎤 ${summary.topArtist}`, `🎧 ${summary.topGenre}`],
          executedTool: 'MusicIntelligenceEngine.getWeeklySummary()',
        },
      };
    }

    return { isDirectCommand: false };
  }

  /**
   * Main Assistant Execution Engine
   * Sitting strictly ABOVE verified search, recommendation, and player systems
   */
  public static async handleUserPrompt(
    prompt: string,
    history: any[] = []
  ): Promise<NeoAssistantResponse> {
    // 1. Check direct commands first
    const directCheck = NeoAssistant.processQuery(prompt);
    if (directCheck.isDirectCommand && directCheck.directResponse) {
      return directCheck.directResponse;
    }

    // 2. Query Copilot API for structured intent & parameters
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history,
          currentTrack: usePlaybackStore.getState().currentTrack,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawTracks: Track[] = data.tracks || [];

        // 3. Hallucination Safeguard: Filter candidates strictly through canonical validation
        const validTracks = rawTracks.filter((t) => RecommendationPipeline.validateCandidate(t));

        // 4. Ambiguity Resolution Check
        let ambiguityOptions: Track[] | undefined = undefined;
        if (validTracks.length > 1 && data.intent === 'PLAY_TRACK') {
          const firstTitle = validTracks[0].title.toLowerCase();
          const hasMultipleVersions = validTracks.slice(1).some((t) => t.title.toLowerCase().includes(firstTitle));
          if (hasMultipleVersions) {
            ambiguityOptions = validTracks.slice(0, 3);
          }
        }

        // If intent is PLAY and single verified track exists, trigger global player
        if (data.intent === 'PLAY_TRACK' && validTracks.length > 0 && !ambiguityOptions) {
          usePlaybackStore.getState().playTrack(validTracks[0], validTracks);
        }

        return {
          intent: (data.intent as NeoIntent) || 'DISCOVER_MUSIC',
          reply: data.reply || `Here are top matches for "${prompt}".`,
          tracks: validTracks,
          playlistTitle: data.playlistTitle,
          playlistDescription: data.playlistDescription,
          tags: data.tags || ['✨ AI Discovery', '🎧 Verified Stream'],
          suggestedPrompts: data.suggestedPrompts || ['Play something like this', 'Make a workout mix'],
          executedTool: 'MusicSearchService.searchAll()',
          ambiguityOptions,
        };
      }
    } catch (err) {
      console.warn('NeoAssistant remote query failed, executing local resolution fallback:', err);
    }

    // 5. Graceful Local Resolution Fallback via MusicSearchService & RecommendationPipeline
    try {
      const searchRes = await MusicSearchService.searchAll(prompt);
      const validTracks = searchRes.songs.filter((t) => RecommendationPipeline.validateCandidate(t));

      return {
        intent: 'DISCOVER_MUSIC',
        reply: validTracks.length > 0
          ? `Found verified releases for "${prompt}".`
          : `I couldn't find exact matches for "${prompt}".`,
        tracks: validTracks.slice(0, 4),
        tags: ['✨ Verified Search'],
        executedTool: 'MusicSearchService.searchAll()',
      };
    } catch {
      return {
        intent: 'UNKNOWN',
        reply: `Music search isn't available right now. Please check your connection.`,
        tracks: [],
        executedTool: 'fallback',
      };
    }
  }
}
