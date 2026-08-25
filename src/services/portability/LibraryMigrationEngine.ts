'use client';

import { Track } from '@/types';
import { ImportMigrationReport, TrackMatchResult, NeoTunesBackupSchema } from '@/types/portability';
import { UniversalTrackMatcher } from './UniversalTrackMatcher';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicIntelligenceEngine } from '../MusicIntelligenceEngine';

export class LibraryMigrationEngine {
  /**
   * Processes raw track items into structured ImportMigrationReport (Section 15 & 65)
   */
  public static async processImportItems(
    items: { title: string; artist: string; album?: string; duration?: number; isrc?: string }[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<ImportMigrationReport> {
    const matchedTracks: Track[] = [];
    const reviewItems: TrackMatchResult[] = [];
    const unmatchedItems: { title: string; artist: string }[] = [];

    const existingCanonicalIds = new Set(
      usePlaybackStore.getState().history.map((t) => t.canonicalId || t.id)
    );

    let duplicatesCount = 0;
    let totalProcessed = 0;

    for (const item of items) {
      totalProcessed++;
      if (onProgress) onProgress(totalProcessed, items.length);

      const matchRes = await UniversalTrackMatcher.matchTrack(item);

      if (matchRes.confidence === 'HIGH' && matchRes.matchedTrack) {
        const canId = matchRes.matchedTrack.canonicalId || matchRes.matchedTrack.id;
        if (existingCanonicalIds.has(canId)) {
          duplicatesCount++;
        }
        existingCanonicalIds.add(canId);
        matchedTracks.push(matchRes.matchedTrack);
      } else if (matchRes.confidence === 'MEDIUM' || matchRes.confidence === 'LOW') {
        reviewItems.push(matchRes);
      } else {
        unmatchedItems.push({ title: item.title, artist: item.artist });
      }
    }

    return {
      totalProcessed: items.length,
      exactMatchesCount: matchedTracks.length,
      needsReviewCount: reviewItems.length,
      unavailableCount: unmatchedItems.length,
      duplicatesCount,
      matchedTracks,
      reviewItems,
      unmatchedItems,
    };
  }

  /**
   * Generates versioned NeoTunes Backup JSON (Section 35 & 36)
   */
  public static generateBackup(): NeoTunesBackupSchema {
    const store = usePlaybackStore.getState();
    return {
      format: 'neotunes-backup',
      version: 1,
      createdAt: new Date().toISOString(),
      profile: { userId: 'guest', exportedAt: Date.now() },
      playlists: [],
      tracks: store.history || [],
      preferences: MusicIntelligenceEngine.getProfile('guest'),
    };
  }

  /**
   * Validates and restores library backup JSON (Section 37 & 38)
   */
  public static restoreBackup(jsonString: string): { success: boolean; message: string; restoredTracksCount: number } {
    try {
      const backup: NeoTunesBackupSchema = JSON.parse(jsonString);
      if (backup.format !== 'neotunes-backup' || !backup.version) {
        return { success: false, message: 'Invalid backup format or incompatible version.', restoredTracksCount: 0 };
      }

      const validTracks = (backup.tracks || []).filter((t) => t.id && t.title);
      usePlaybackStore.getState().setQueue(validTracks);

      return {
        success: true,
        message: `Successfully restored ${validTracks.length} tracks from backup created at ${backup.createdAt}.`,
        restoredTracksCount: validTracks.length,
      };
    } catch {
      return { success: false, message: 'Failed to parse backup JSON file.', restoredTracksCount: 0 };
    }
  }
}
