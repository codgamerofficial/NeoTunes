'use client';

import { MusicIntent, MusicIntentType } from '@/types/ai-copilot';

export class MusicIntentEngine {
  /**
   * Translates natural language prompt into structured MusicIntent (Section 2 & 4)
   */
  public static parseIntent(prompt: string): MusicIntent {
    const lower = prompt.toLowerCase().trim();

    if (lower.startsWith('play ') || lower.startsWith('listen to ')) {
      const query = lower.replace(/^play\s+/, '').replace(/^listen to\s+/, '').trim();
      return {
        type: 'PLAY_TRACK',
        parameters: { query },
        confidence: 'HIGH',
        requiresConfirmation: false,
      };
    }

    if (lower.includes('delete playlist') || lower.includes('remove playlist')) {
      return {
        type: 'DELETE_PLAYLIST',
        parameters: { playlistName: 'Target Playlist' },
        confidence: 'HIGH',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to delete this playlist permanently? This action cannot be undone.',
      };
    }

    if (lower.includes('start radio') || lower.includes('radio')) {
      return {
        type: 'START_RADIO',
        parameters: { seed: 'Bengali' },
        confidence: 'HIGH',
        requiresConfirmation: false,
      };
    }

    if (lower.includes('lyrics') || lower.includes('show lyrics')) {
      return {
        type: 'SHOW_LYRICS',
        parameters: {},
        confidence: 'HIGH',
        requiresConfirmation: false,
      };
    }

    return {
      type: 'SEARCH_MUSIC',
      parameters: { query: lower },
      confidence: 'MEDIUM',
      requiresConfirmation: false,
    };
  }
}
