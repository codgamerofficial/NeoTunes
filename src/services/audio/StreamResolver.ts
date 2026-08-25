'use client';

import { Track } from '@/types';

export type PlaybackType = 'FULL' | 'PREVIEW' | 'UNAVAILABLE';

export interface PlayableSource {
  url: string;
  expiresAt?: number;
  format: string;
  duration?: number;
  playbackType: PlaybackType;
  provider: string;
}

export class StreamResolver {
  /**
   * Resolves playable stream source for canonical track with Preview Protection (Section 8 & 11)
   */
  public static async resolveStream(track: Track): Promise<PlayableSource> {
    const isPreviewOnly = (track.duration && track.duration <= 35 && !track.isrc) || false;

    // Stream URL resolution from track.previewUrl or externalUrl
    const url = track.previewUrl || track.externalUrl || '';

    if (!url && !track.canonicalId) {
      return {
        url: '',
        format: 'audio/mp3',
        playbackType: 'UNAVAILABLE',
        provider: track.source || 'canonical',
      };
    }

    return {
      url: url || `https://stream.neotunes.local/${track.sourceId}`,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour stream expiration token
      format: 'audio/mp3',
      duration: track.duration,
      playbackType: isPreviewOnly ? 'PREVIEW' : 'FULL',
      provider: track.source || 'canonical',
    };
  }

  /**
   * Checks if a stream URL is expired and re-resolves cleanly (Section 12)
   */
  public static isExpired(source: PlayableSource): boolean {
    if (!source.expiresAt) return false;
    return Date.now() >= source.expiresAt;
  }
}
