'use client';

import { Track, getArtistName } from '@/types';
import { PlaylistHealthReport } from '@/types/creator';

export class PlaylistHealthAnalyzer {
  /**
   * Analyzes playlist health score and metadata characteristics (Section 45 & 49)
   */
  public static analyze(tracks: Track[]): PlaylistHealthReport {
    if (!tracks || tracks.length === 0) {
      return {
        healthScore: 100,
        totalTracks: 0,
        totalDuration: 0,
        duplicatesCount: 0,
        unavailableCount: 0,
        previewOnlyCount: 0,
        artistDiversityScore: 100,
      };
    }

    const seenCanonicalIds = new Set<string>();
    const uniqueArtists = new Set<string>();
    let duplicatesCount = 0;
    let previewOnlyCount = 0;
    let totalDuration = 0;

    for (const track of tracks) {
      const canId = track.canonicalId || track.id;
      if (seenCanonicalIds.has(canId)) {
        duplicatesCount++;
      }
      seenCanonicalIds.add(canId);

      const artistStr = getArtistName(track.artists || track.artist);
      if (artistStr) uniqueArtists.add(artistStr);

      if (track.duration && track.duration <= 35 && !track.isrc) {
        previewOnlyCount++;
      }

      totalDuration += track.duration || 0;
    }

    const artistDiversityScore = Math.min(100, Math.round((uniqueArtists.size / tracks.length) * 100));

    // Deduct penalties for duplicates and previews
    let healthScore = 100;
    healthScore -= duplicatesCount * 10;
    healthScore -= previewOnlyCount * 15;
    if (healthScore < 0) healthScore = 0;

    return {
      healthScore,
      totalTracks: tracks.length,
      totalDuration,
      duplicatesCount,
      unavailableCount: 0,
      previewOnlyCount,
      artistDiversityScore,
    };
  }
}
