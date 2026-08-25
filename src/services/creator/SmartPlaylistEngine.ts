'use client';

import { Track, getArtistName } from '@/types';
import { SmartPlaylistRule } from '@/types/creator';
import { MusicSearchService } from '../MusicSearchService';
import { RecommendationPipeline } from '../RecommendationPipeline';

export class SmartPlaylistEngine {
  /**
   * Generates dynamic Smart Playlist tracks based on user rules (Section 13 & 15)
   */
  public static async generateSmartPlaylist(rules: SmartPlaylistRule[], queryKeyword: string = 'Bengali'): Promise<Track[]> {
    const searchRes = await MusicSearchService.searchAll(queryKeyword);
    const validTracks = searchRes.songs.filter((t) => RecommendationPipeline.validateCandidate(t));

    return validTracks.filter((track) => {
      for (const rule of rules) {
        if (rule.field === 'artist') {
          const name = getArtistName(track.artists || track.artist).toLowerCase();
          if (!name.includes(String(rule.value).toLowerCase())) return false;
        }
        if (rule.field === 'genre' && track.genre) {
          if (!track.genre.toLowerCase().includes(String(rule.value).toLowerCase())) return false;
        }
        if (rule.field === 'duration' && track.duration) {
          if (rule.operator === 'LESS_THAN' && track.duration >= Number(rule.value)) return false;
          if (rule.operator === 'GREATER_THAN' && track.duration <= Number(rule.value)) return false;
        }
      }
      return true;
    });
  }
}
