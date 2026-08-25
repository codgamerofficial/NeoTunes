'use client';

import { Track, getArtistName } from '@/types';
import { TasteProfileManager, UserTasteProfile } from './TasteProfileManager';
import { MusicSearchService } from './MusicSearchService';

export interface ScoredRecommendation extends Track {
  scoreBreakdown: {
    preferenceScore: number;
    artistAffinity: number;
    genreAffinity: number;
    languageAffinity: number;
    recencyScore: number;
    skipPenalty: number;
    dislikePenalty: number;
    repetitionPenalty: number;
    totalScore: number;
  };
  recommendationReason: string;
  coldStartLevel: 1 | 2 | 3;
}

export interface RecommendationFeedSection {
  id: string;
  title: string;
  subtitle: string;
  tracks: ScoredRecommendation[];
}

export class RecommendationPipeline {
  /**
   * Validates canonical candidate track for playability and source completeness
   */
  public static validateCandidate(track: Track): boolean {
    if (!track || !track.id || !track.title) return false;
    if (!track.source || !track.sourceId) return false;
    if (track.playable === false) return false;
    return true;
  }

  /**
   * Generates a fully personalized recommendation feed with sections
   */
  public static async generatePersonalizedFeed(
    userId: string = 'guest',
    onboardingGenres: string[] = []
  ): Promise<RecommendationFeedSection[]> {
    const settings = TasteProfileManager.getSettings();
    const profile = TasteProfileManager.computeProfile(userId);

    // Determine Cold Start Level
    let coldStartLevel: 1 | 2 | 3 = 1;
    if (profile.preferredArtists.length > 0 || profile.preferredGenres.length > 0) {
      coldStartLevel = 3;
    } else if (onboardingGenres.length > 0) {
      coldStartLevel = 2;
    }

    // 1. Fetch Candidate Tracks from Hybrid Sources
    const querySeeds = [
      ...(profile.preferredArtists.slice(0, 2).map((a) => a.name)),
      ...(profile.preferredGenres.slice(0, 2).map((g) => g.name)),
      ...(onboardingGenres.slice(0, 2)),
      'Arijit Singh Hits',
      'Trending Hits 2026',
      'Bollywood Top 50',
      'Lo-Fi Chill Beats',
    ];

    const candidateMap = new Map<string, Track>();

    await Promise.all(
      querySeeds.slice(0, 4).map(async (seed) => {
        try {
          const searchRes = await MusicSearchService.searchAll(seed);
          for (const song of searchRes.songs) {
            if (RecommendationPipeline.validateCandidate(song)) {
              candidateMap.set(song.canonicalId || song.id, song);
            }
          }
        } catch {}
      })
    );

    const candidates = Array.from(candidateMap.values());

    // 2. Score & Rank Candidates
    const scoredCandidates = candidates
      .map((track) => RecommendationPipeline.scoreTrack(track, profile, coldStartLevel))
      .filter((track) => !profile.notInterestedTrackIds.includes(track.id) && !profile.notInterestedTrackIds.includes(track.canonicalId))
      .sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);

    // 3. Apply Diversity & Repetition Control (Max 2 tracks per artist per section)
    const applyDiversity = (list: ScoredRecommendation[]): ScoredRecommendation[] => {
      const artistCounts: Record<string, number> = {};
      const result: ScoredRecommendation[] = [];

      for (const item of list) {
        const artistKey = getArtistName(item.artists || item.artist).toLowerCase();
        const currentCount = artistCounts[artistKey] || 0;
        if (currentCount < 2) {
          result.push(item);
          artistCounts[artistKey] = currentCount + 1;
        }
      }
      return result;
    };

    const finalCandidates = applyDiversity(scoredCandidates);

    // 4. Construct Dynamic Feed Sections based on signals
    const sections: RecommendationFeedSection[] = [];

    // Section 1: Made For You / Continue Listening
    if (finalCandidates.length > 0) {
      sections.push({
        id: 'made_for_you',
        title: coldStartLevel === 3 ? 'Made For You' : 'Trending Hits For You',
        subtitle: coldStartLevel === 3 ? 'Curated from your recent listening activity' : 'Popular releases crafted for your taste',
        tracks: finalCandidates.slice(0, 10),
      });
    }

    // Section 2: Artist / Genre Focus Section
    if (profile.preferredArtists.length > 0) {
      const topArtist = profile.preferredArtists[0].name;
      const artistTracks = finalCandidates.filter((t) =>
        getArtistName(t.artists || t.artist).toLowerCase().includes(topArtist.toLowerCase())
      );
      if (artistTracks.length > 0) {
        sections.push({
          id: 'artist_focus',
          title: `Because you listen to ${topArtist}`,
          subtitle: `Selected tracks and related releases`,
          tracks: artistTracks.slice(0, 8),
        });
      }
    }

    // Section 3: Discover Something Different (Exploration 20%)
    const discoveryTracks = finalCandidates
      .filter((t) => t.scoreBreakdown.artistAffinity === 0)
      .slice(0, 8);

    if (discoveryTracks.length > 0) {
      sections.push({
        id: 'discover_new',
        title: 'Discover Something Different',
        subtitle: 'Fresh releases and emerging artists to explore',
        tracks: discoveryTracks,
      });
    }

    return sections;
  }

  /**
   * Transparent Scoring Pipeline
   */
  public static scoreTrack(
    track: Track,
    profile: UserTasteProfile,
    coldStartLevel: 1 | 2 | 3
  ): ScoredRecommendation {
    const artistName = getArtistName(track.artists || track.artist).toLowerCase();
    
    let artistAffinity = 0;
    let genreAffinity = 0;
    let languageAffinity = 0;
    let skipPenalty = 0;
    let dislikePenalty = 0;
    let reason = 'Recommended for you';

    // Artist Match
    const matchedArtist = profile.preferredArtists.find((a) => artistName.includes(a.name.toLowerCase()));
    if (matchedArtist) {
      artistAffinity = 40 * matchedArtist.confidence;
      reason = `Because you listened to ${matchedArtist.name}`;
    }

    // Skip Penalty
    if (profile.skippedTrackIds.includes(track.id) || profile.skippedTrackIds.includes(track.canonicalId)) {
      skipPenalty = 30;
    }

    // Dislike Penalty
    if (profile.notInterestedTrackIds.includes(track.id) || profile.notInterestedTrackIds.includes(track.canonicalId)) {
      dislikePenalty = 100;
    }

    const popularityScore = (track.popularity || 50) * 0.2; // Max +20
    const totalScore = Math.max(0, Math.round(artistAffinity + genreAffinity + languageAffinity + popularityScore - skipPenalty - dislikePenalty));

    if (coldStartLevel < 3 && !matchedArtist) {
      reason = 'Trending discovery release';
    }

    return {
      ...track,
      scoreBreakdown: {
        preferenceScore: Math.round(popularityScore),
        artistAffinity: Math.round(artistAffinity),
        genreAffinity: Math.round(genreAffinity),
        languageAffinity: Math.round(languageAffinity),
        recencyScore: 10,
        skipPenalty,
        dislikePenalty,
        repetitionPenalty: 0,
        totalScore,
      },
      recommendationReason: reason,
      coldStartLevel,
    };
  }
}
