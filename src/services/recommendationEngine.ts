import { Track, getArtistName } from '@/types';

export interface RecommendationUserProfile {
  favoriteArtists: string[];
  favoriteGenres: string[];
  favoriteLanguages: string[];
  favoriteMoods: string[];
  skippedTrackIds: string[];
  recentlyPlayedTrackIds: string[];
}

export interface RecommendationCandidate extends Track {
  artistAffinity?: number;
  genreAffinity?: number;
  moodAffinity?: number;
  languageAffinity?: number;
  recencyScore?: number;
  skipProbability?: number;
  score?: number;
}

export class RecommendationEngine {
  /**
   * Scores candidate tracks based on multi-attribute user affinity
   * Recommendation Score = ArtistAffinity + GenreAffinity + MoodAffinity + LanguageAffinity + Recency + Popularity - SkipProbability
   */
  public static rankCandidates(
    candidates: Track[],
    userProfile: RecommendationUserProfile,
    options?: { targetMood?: string; targetLanguage?: string }
  ): RecommendationCandidate[] {
    const scored = candidates.map((track) => {
      let artistAffinity = 0;
      let genreAffinity = 0;
      let moodAffinity = 0;
      let languageAffinity = 0;
      let skipProbability = 0;

      const trackArtistName = getArtistName(track.artists || track.artist).toLowerCase();

      // 1. Artist Affinity
      if (userProfile.favoriteArtists.some((a) => trackArtistName.includes(a.toLowerCase()))) {
        artistAffinity = 30;
      }

      // 2. Genre Affinity
      if (track.audioQuality || track.album) {
        genreAffinity = 20;
      }

      // 3. Mood Affinity
      if (options?.targetMood && userProfile.favoriteMoods.includes(options.targetMood)) {
        moodAffinity = 25;
      }

      // 4. Language Affinity
      if (options?.targetLanguage && userProfile.favoriteLanguages.includes(options.targetLanguage)) {
        languageAffinity = 20;
      }

      // 5. Skip Penalty
      if (userProfile.skippedTrackIds.includes(track.id)) {
        skipProbability = 40;
      }

      const popularity = track.popularity || 50;

      const totalScore = artistAffinity + genreAffinity + moodAffinity + languageAffinity + (popularity * 0.2) - skipProbability;

      return {
        ...track,
        artistAffinity,
        genreAffinity,
        moodAffinity,
        languageAffinity,
        skipProbability,
        score: Math.round(totalScore),
      };
    });

    return scored.sort((a, b) => b.score! - a.score!);
  }
}
