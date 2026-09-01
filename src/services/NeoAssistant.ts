'use client';

import { Track, getArtistName } from '@/types';
import { usePlaybackStore } from '@/store/playback-store';
import { useSettingsStore } from '@/store/settings-store';
import { realDeviceManager } from './realDeviceService';
import { likedSongsService } from './likedSongsService';

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

export interface PendingActionInfo {
  actionId: string;
  tool: string;
  arguments: Record<string, any>;
  summary: string;
  expiresAt: number;
}

export interface NeoAssistantResponse {
  intent: NeoIntent;
  reply: string;
  tracks?: Track[];
  executedTools?: Array<{ name: string; source: string; success: boolean }>;
  pendingAction?: PendingActionInfo | null;
  suggestedPrompts?: string[];
  tags?: string[];
  modelId?: string;
  latencyMs?: number;
}

export class NeoAssistant {
  /**
   * Fast Deterministic Local Short-Circuit for 0ms simple player controls
   */
  public static processQuery(query: string): { isDirectCommand: boolean; directResponse?: NeoAssistantResponse } {
    const clean = query.trim().toLowerCase();
    const store = usePlaybackStore.getState();

    if (clean === 'pause' || clean === 'stop') {
      store.setPlaying(false);
      return {
        isDirectCommand: true,
        directResponse: {
          intent: 'PAUSE',
          reply: 'Playback paused.',
          executedTools: [{ name: 'pausePlayback', source: 'NeoTunesGlobalPlayer', success: true }],
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
          executedTools: [{ name: 'resumePlayback', source: 'NeoTunesGlobalPlayer', success: true }],
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
          executedTools: [{ name: 'nextTrack', source: 'NeoTunesQueueController', success: true }],
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
          executedTools: [{ name: 'prevTrack', source: 'NeoTunesQueueController', success: true }],
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
            executedTools: [{ name: 'getCurrentTrack', source: 'NeoTunesGlobalPlayer', success: true }],
          },
        };
      } else {
        return {
          isDirectCommand: true,
          directResponse: {
            intent: 'SHOW_LIBRARY',
            reply: 'No track is currently playing.',
            executedTools: [{ name: 'getCurrentTrack', source: 'NeoTunesGlobalPlayer', success: true }],
          },
        };
      }
    }

    return { isDirectCommand: false };
  }

  /**
   * Main Assistant Execution Engine connecting to Amazon Bedrock backend
   */
  public static async handleUserPrompt(
    prompt: string,
    history: any[] = [],
    confirmedActionId?: string
  ): Promise<NeoAssistantResponse> {
    // 1. Fast deterministic check
    if (!confirmedActionId) {
      const directCheck = NeoAssistant.processQuery(prompt);
      if (directCheck.isDirectCommand && directCheck.directResponse) {
        return directCheck.directResponse;
      }
    }

    // 2. Gather full real-time client state for tool execution
    const playbackStore = usePlaybackStore.getState();
    const settingsStore = useSettingsStore.getState();
    let activeDevice: any = null;

    try {
      activeDevice = await realDeviceManager.getCurrentAudioOutput();
    } catch {}

    let downloads: any[] = [];
    try {
      const storedDownloads = localStorage.getItem('neotunes_downloads');
      if (storedDownloads) {
        downloads = JSON.parse(storedDownloads);
      }
    } catch {}

    let likedIds: string[] = [];
    try {
      const storedLiked = localStorage.getItem('neotunes_liked_tracks');
      if (storedLiked) {
        likedIds = JSON.parse(storedLiked);
      }
    } catch {}

    const clientState = {
      currentTrack: playbackStore.currentTrack,
      playbackState: {
        isPlaying: playbackStore.isPlaying,
        progress: playbackStore.progress,
        duration: playbackStore.duration,
        volume: playbackStore.volume,
        playbackStatus: playbackStore.playbackStatus,
        shuffle: playbackStore.shuffle,
        repeatMode: playbackStore.repeatMode,
      },
      queue: playbackStore.queue,
      history: playbackStore.history,
      activeDevice,
      audioCapabilities: {
        spatialAudioAvailable: true,
        soundstageMode: playbackStore.soundstageMode,
        audioQuality: playbackStore.audioQuality,
        sampleRate: '96,000 Hz',
        bitDepth: '24-bit',
      },
      downloads,
      settings: settingsStore,
      likedTrackIds: likedIds,
    };

    // 3. Query Neo Bedrock API Route
    try {
      const res = await fetch('/api/neo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history: history.slice(-6).map((h) => ({
            role: h.role === 'user' || h.sender === 'user' ? 'user' : 'assistant',
            content: typeof h.content === 'string' ? h.content : h.text || '',
          })),
          clientState,
          confirmedActionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const tracks: Track[] = data.tracks || [];

        // 4. Execute any client-side player mutation directives returned by verified tool execution
        if (Array.isArray(data.clientDirectives)) {
          for (const directive of data.clientDirectives) {
            switch (directive.type) {
              case 'PLAY_TRACK':
                if (directive.payload?.track) {
                  playbackStore.playTrack(directive.payload.track, directive.payload.queue || [directive.payload.track]);
                }
                break;
              case 'PAUSE':
                playbackStore.setPlaying(false);
                break;
              case 'RESUME':
                playbackStore.setPlaying(true);
                break;
              case 'NEXT_TRACK':
                playbackStore.nextTrack();
                break;
              case 'PREVIOUS_TRACK':
                playbackStore.prevTrack();
                break;
              case 'SEEK':
                if (typeof directive.payload?.positionSeconds === 'number') {
                  playbackStore.setProgress(directive.payload.positionSeconds);
                }
                break;
              case 'ADD_QUEUE':
                if (directive.payload?.track) {
                  playbackStore.addToQueue(directive.payload.track);
                }
                break;
              case 'REMOVE_QUEUE':
                if (directive.payload?.trackId) {
                  playbackStore.removeFromQueue(directive.payload.trackId);
                }
                break;
              case 'PLAY_NEXT':
                if (directive.payload?.track) {
                  playbackStore.addNext(directive.payload.track);
                }
                break;
              case 'CLEAR_QUEUE':
                playbackStore.clearQueue();
                break;
              case 'LIKE_TRACK':
                if (directive.payload?.track) {
                  likedSongsService.toggleLike(directive.payload.track);
                }
                break;
            }
          }
        }

        return {
          intent: (data.clientDirectives?.[0]?.type as NeoIntent) || 'DISCOVER_MUSIC',
          reply: data.reply,
          tracks,
          executedTools: data.executedTools || [],
          pendingAction: data.pendingAction || null,
          tags: ['✨ Amazon Bedrock', '🎧 Verified Stream'],
          suggestedPrompts: ['Play something like this', 'What is playing right now?', 'Show my queue'],
          modelId: data.modelId,
          latencyMs: data.latencyMs,
        };
      }
    } catch (err) {
      console.warn('[NeoAssistant] Remote Bedrock query failed:', err);
    }

    return {
      intent: 'UNKNOWN',
      reply: `I couldn't complete that action right now. Please check your connection.`,
      tracks: [],
    };
  }

  /**
   * Confirms and executes a pending destructive action (e.g. Delete Playlist, Clear History)
   */
  public static async confirmPendingAction(actionId: string): Promise<NeoAssistantResponse> {
    try {
      const res = await fetch('/api/neo/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId }),
      });

      if (res.ok) {
        const result = await res.json();
        return {
          intent: 'PLAYLIST_REMOVE',
          reply: result.message || 'Action executed successfully.',
          executedTools: [{ name: 'executePendingAction', source: result.source || 'NeoTunes', success: result.success }],
        };
      }
    } catch (err) {
      console.error('Failed to confirm action:', err);
    }

    return {
      intent: 'UNKNOWN',
      reply: 'Failed to execute confirmed action.',
    };
  }
}
