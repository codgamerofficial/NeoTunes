'use client';

import { Track } from '@/types';
import { MusicSearchService } from '../MusicSearchService';
import { RecommendationPipeline } from '../RecommendationPipeline';

export interface ImportResult {
  matchedTracks: Track[];
  unmatchedTitles: string[];
  totalParsed: number;
}

export class PlaylistImporterExporter {
  /**
   * Imports playlist data from JSON payload with canonical track validation (Section 22 & 23)
   */
  public static async importFromJson(jsonString: string): Promise<ImportResult> {
    const matchedTracks: Track[] = [];
    const unmatchedTitles: string[] = [];

    try {
      const parsed = JSON.parse(jsonString);
      const rawItems: any[] = Array.isArray(parsed) ? parsed : parsed.tracks || [];

      for (const item of rawItems) {
        const query = typeof item === 'string' ? item : `${item.title || ''} ${item.artist || ''}`.trim();
        if (!query) continue;

        const searchRes = await MusicSearchService.searchAll(query, { limit: 1 });
        if (searchRes.songs.length > 0) {
          const cand = searchRes.songs[0];
          if (RecommendationPipeline.validateCandidate(cand)) {
            matchedTracks.push(cand);
            continue;
          }
        }
        unmatchedTitles.push(query);
      }

      return {
        matchedTracks,
        unmatchedTitles,
        totalParsed: rawItems.length,
      };
    } catch {
      return { matchedTracks: [], unmatchedTitles: ['Invalid JSON format'], totalParsed: 0 };
    }
  }

  /**
   * Exports playlist tracks to normalized Portable JSON (Section 24 & 25)
   */
  public static exportToJson(playlistName: string, tracks: Track[]): string {
    const exportData = {
      name: playlistName,
      exportedAt: new Date().toISOString(),
      generator: 'NeoTunes Ecosystem 1.0',
      tracks: tracks.map((t) => ({
        title: t.title,
        artist: typeof t.artist === 'string' ? t.artist : (t.artists && t.artists[0]) || 'Unknown',
        album: typeof t.album === 'string' ? t.album : t.album?.name || '',
        source: t.source,
        sourceId: t.sourceId,
        canonicalId: t.canonicalId || t.id,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }
}
