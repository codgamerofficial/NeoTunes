'use client';

import { Track } from '@/types';
import { MatchConfidence, TrackMatchResult } from '@/types/portability';
import { MusicSearchService } from '../MusicSearchService';
import { RecommendationPipeline } from '../RecommendationPipeline';

export class UniversalTrackMatcher {
  /**
   * Normalizes string for matching comparison
   */
  public static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Detects track version type (Section 6 & 11)
   */
  public static detectVersion(title: string): 'ORIGINAL' | 'LIVE' | 'REMIX' | 'ACOUSTIC' | 'COVER' {
    const t = title.toLowerCase();
    if (t.includes('live')) return 'LIVE';
    if (t.includes('remix') || t.includes('mix')) return 'REMIX';
    if (t.includes('acoustic') || t.includes('unplugged')) return 'ACOUSTIC';
    if (t.includes('cover')) return 'COVER';
    return 'ORIGINAL';
  }

  /**
   * Evaluates candidate track match with multi-tier confidence & version protection
   */
  public static async matchTrack(input: {
    title: string;
    artist: string;
    album?: string;
    duration?: number;
    isrc?: string;
  }): Promise<TrackMatchResult> {
    const inputNormTitle = UniversalTrackMatcher.normalizeString(input.title);
    const inputNormArtist = UniversalTrackMatcher.normalizeString(input.artist);
    const inputVersion = UniversalTrackMatcher.detectVersion(input.title);

    // Query canonical search service
    const searchRes = await MusicSearchService.searchAll(`${input.title} ${input.artist}`);
    const candidates = searchRes.songs.filter((t) => RecommendationPipeline.validateCandidate(t));

    if (candidates.length === 0) {
      return {
        sourceTrack: input,
        matchedTrack: null,
        confidence: 'NONE',
        matchExplanation: 'No verified source found',
      };
    }

    // 1. Tier 1: ISRC Exact Match
    if (input.isrc) {
      const isrcMatch = candidates.find((c) => c.isrc && c.isrc.toUpperCase() === input.isrc?.toUpperCase());
      if (isrcMatch) {
        return {
          sourceTrack: input,
          matchedTrack: isrcMatch,
          confidence: 'HIGH',
          matchExplanation: 'Matched by exact ISRC identifier',
        };
      }
    }

    // 2. Tier 2: Exact Title + Primary Artist + Album
    for (const cand of candidates) {
      const candNormTitle = UniversalTrackMatcher.normalizeString(cand.title);
      const rawArtist = typeof cand.artist === 'string' ? cand.artist : typeof cand.artists?.[0] === 'string' ? cand.artists[0] : (cand.artists?.[0] as any)?.name || '';
      const candNormArtist = UniversalTrackMatcher.normalizeString(rawArtist);
      const candVersion = UniversalTrackMatcher.detectVersion(cand.title);

      // Version Awareness Safeguard: Original cannot auto-resolve to Live/Remix
      if (inputVersion !== candVersion) continue;

      if (candNormTitle === inputNormTitle && candNormArtist === inputNormArtist) {
        return {
          sourceTrack: input,
          matchedTrack: cand,
          confidence: 'HIGH',
          matchExplanation: 'Matched by exact Title + Artist metadata',
        };
      }
    }

    // 3. Tier 3: Duration Tolerance Check (±15 seconds)
    if (input.duration) {
      for (const cand of candidates) {
        const candVersion = UniversalTrackMatcher.detectVersion(cand.title);
        if (inputVersion !== candVersion) continue;

        const durDiff = Math.abs((cand.duration || 0) - input.duration);
        if (durDiff <= 15) {
          return {
            sourceTrack: input,
            matchedTrack: cand,
            confidence: 'MEDIUM',
            matchExplanation: `Matched by Title + Duration similarity (diff: ${durDiff}s)`,
            availableOptions: candidates.slice(0, 3),
          };
        }
      }
    }

    // 4. Tier 4: Title-Only Match -> Low Confidence (Needs User Review)
    const topMatch = candidates[0];
    return {
      sourceTrack: input,
      matchedTrack: topMatch,
      confidence: 'LOW',
      matchExplanation: 'Possible match based on title similarity only. User review recommended.',
      availableOptions: candidates.slice(0, 3),
    };
  }
}
