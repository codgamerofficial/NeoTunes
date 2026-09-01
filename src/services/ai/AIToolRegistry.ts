'use client';

import { Track } from '@/types';
import { usePlaybackStore } from '@/store/playback-store';
import { NeoAssistant } from '../NeoAssistant';

export interface ClientAIToolDefinition {
  name: string;
  description: string;
  permission: 'READ' | 'WRITE' | 'DESTRUCTIVE';
  requiresConfirmation: boolean;
}

export class AIToolRegistry {
  public static async executePlayTrack(query: string): Promise<{ success: boolean; track?: Track; message: string }> {
    const res = await NeoAssistant.handleUserPrompt(`Play ${query}`);
    const track = res.tracks?.[0];
    return {
      success: !!track,
      track,
      message: res.reply,
    };
  }

  public static getCurrentTrackDetails(): { isPlaying: boolean; track: Track | null } {
    const store = usePlaybackStore.getState();
    return {
      isPlaying: store.isPlaying,
      track: store.currentTrack,
    };
  }
}
