'use client';

import { Track, getArtistName } from '@/types';
import { MusicSearchService } from './MusicSearchService';
import { TasteProfileManager, UserTasteProfile } from './TasteProfileManager';

export interface AutoplayContext {
  currentTrack: Track | null;
  history?: Track[];
  sessionPlayedIds?: string[];
  sessionSkippedIds?: string[];
  mode?: 'personal_mix' | 'artist_radio' | 'discovery';
  diversityLevel?: 'familiar' | 'balanced' | 'discovery';
}

export interface ScoredCandidate {
  track: Track;
  score: number;
  breakdown: {
    artistAffinity: number;
    genreAffinity: number;
    languageAffinity: number;
    moodAffinity: number;
    popularityScore: number;
    freshnessBonus: number;
    repetitionPenalty: number;
    skipPenalty: number;
  };
}

export class SmartRecommender {
  /**
   * Selects the single best next track based on current track, user taste profile,
   * session history, and diversity constraints.
   */
  public static async getNextTrack(context: AutoplayContext): Promise<Track | null> {
    const candidates = await SmartRecommender.getRankedCandidates(context, 1);
    return candidates.length > 0 ? candidates[0].track : null;
  }

  /**
   * Pre-fetches a batch of recommended tracks (e.g. 3 tracks for the autoplay queue).
   */
  public static async prefetchNextTracks(
    context: AutoplayContext,
    count: number = 3
  ): Promise<Track[]> {
    const candidates = await SmartRecommender.getRankedCandidates(context, count);
    return candidates.map((c) => c.track);
  }

  /**
   * Main recommendation pipeline:
   * 1. Query construction from context & taste profile
   * 2. Candidate fetching via MusicSearchService
   * 3. Candidate deduplication & availability filtering
   * 4. Multi-factor scoring (affinity, freshness, penalties)
   * 5. Diversity re-ranking
   */
  public static async getRankedCandidates(
    context: AutoplayContext,
    limit: number = 5
  ): Promise<ScoredCandidate[]> {
    const currentTrack = context.currentTrack;
    const mode = context.mode || 'personal_mix';
    const diversity = context.diversityLevel || 'balanced';
    const history = context.history || [];
    const sessionPlayedIds = new Set(context.sessionPlayedIds || []);
    const sessionSkippedIds = new Set(context.sessionSkippedIds || []);

    const tasteProfile = TasteProfileManager.computeProfile();
    const currentArtist = currentTrack
      ? getArtistName(currentTrack.artists || currentTrack.artist)
      : '';
    const currentGenre = currentTrack?.genre || '';
    const currentLang = currentTrack?.language || '';

    // Step 1: Build diverse search queries
    const queries = SmartRecommender.buildSearchQueries({
      currentArtist,
      currentGenre,
      currentLang,
      mode,
      tasteProfile,
    });

    // Step 2: Fetch candidates concurrently
    const candidatePool: Track[] = [];
    const searchPromises = queries.map((q) =>
      MusicSearchService.searchAll(q, { limit: 8 })
        .then((res) => res.songs || [])
        .catch(() => [] as Track[])
    );

    const searchResults = await Promise.allSettled(searchPromises);
    for (const result of searchResults) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        candidatePool.push(...result.value);
      }
    }

    // Step 3: Deduplication and availability filtering
    const playedHistoryIds = new Set(history.slice(-30).map((t) => t.id));
    const notInterestedIds = new Set(tasteProfile.notInterestedTrackIds || []);
    const seenSignatures = new Set<string>();

    if (currentTrack) {
      seenSignatures.add(SmartRecommender.getTrackSignature(currentTrack.title, currentArtist));
      if (currentTrack.id) seenSignatures.add(currentTrack.id);
      if (currentTrack.canonicalId) seenSignatures.add(currentTrack.canonicalId);
    }

    const eligibleCandidates: Track[] = [];

    for (const track of candidatePool) {
      if (!track || !track.title) continue;
      const trackArtist = getArtistName(track.artists || track.artist);
      const signature = SmartRecommender.getTrackSignature(track.title, trackArtist);

      // Filter out duplicates
      if (seenSignatures.has(signature)) continue;
      if (track.id && seenSignatures.has(track.id)) continue;
      if (track.canonicalId && seenSignatures.has(track.canonicalId)) continue;

      // Filter out tracks already played in current session or recent history
      if (track.id && (sessionPlayedIds.has(track.id) || playedHistoryIds.has(track.id))) {
        continue;
      }
      if (track.canonicalId && (sessionPlayedIds.has(track.canonicalId) || playedHistoryIds.has(track.canonicalId))) {
        continue;
      }

      // Filter out user marked "Not Interested"
      if (track.id && notInterestedIds.has(track.id)) continue;
      if (track.canonicalId && notInterestedIds.has(track.canonicalId)) continue;

      seenSignatures.add(signature);
      if (track.id) seenSignatures.add(track.id);
      if (track.canonicalId) seenSignatures.add(track.canonicalId);

      eligibleCandidates.push(track);
    }

    // Step 4: Fallback if no candidate survived filtering
    if (eligibleCandidates.length === 0) {
      const fallbackQuery = currentArtist ? `${currentArtist} music` : 'popular hits';
      try {
        const fallbackRes = await MusicSearchService.searchAll(fallbackQuery, { limit: 5 });
        for (const t of fallbackRes.songs || []) {
          if (t && t.id !== currentTrack?.id) {
            eligibleCandidates.push(t);
          }
        }
      } catch {}
    }

    if (eligibleCandidates.length === 0) {
      return [];
    }

    // Step 5: Score candidates
    const scoredCandidates: ScoredCandidate[] = eligibleCandidates.map((candidate) => {
      return SmartRecommender.scoreCandidate({
        candidate,
        currentTrack,
        currentArtist,
        currentGenre,
        currentLang,
        tasteProfile,
        history,
        sessionSkippedIds,
        mode,
        diversity,
      });
    });

    // Step 6: Diversity Re-ranking
    scoredCandidates.sort((a, b) => b.score - a.score);

    const reRanked: ScoredCandidate[] = [];
    const recentArtistCount = new Map<string, number>();

    // Seed recent artists from immediate play history
    const immediateHistory = history.slice(-5);
    for (const h of immediateHistory) {
      const art = getArtistName(h.artists || h.artist).toLowerCase();
      recentArtistCount.set(art, (recentArtistCount.get(art) || 0) + 1);
    }

    const pool = [...scoredCandidates];
    while (pool.length > 0 && reRanked.length < limit) {
      let chosenIndex = 0;

      // Unless in artist_radio mode, avoid 2 consecutive tracks from the same artist
      if (mode !== 'artist_radio') {
        const lastSelectedArtist = reRanked.length > 0
          ? getArtistName(reRanked[reRanked.length - 1].track.artists || reRanked[reRanked.length - 1].track.artist).toLowerCase()
          : (currentArtist ? currentArtist.toLowerCase() : null);

        for (let i = 0; i < pool.length; i++) {
          const candidateArtist = getArtistName(pool[i].track.artists || pool[i].track.artist).toLowerCase();
          const count = recentArtistCount.get(candidateArtist) || 0;

          if (candidateArtist !== lastSelectedArtist && count < 2) {
            chosenIndex = i;
            break;
          }
        }
      }

      const [selected] = pool.splice(chosenIndex, 1);
      const chosenArtist = getArtistName(selected.track.artists || selected.track.artist).toLowerCase();
      recentArtistCount.set(chosenArtist, (recentArtistCount.get(chosenArtist) || 0) + 1);
      reRanked.push(selected);
    }

    return reRanked;
  }

  /**
   * Helper to build targeted queries for candidate generation
   */
  private static buildSearchQueries({
    currentArtist,
    currentGenre,
    currentLang,
    mode,
    tasteProfile,
  }: {
    currentArtist: string;
    currentGenre: string;
    currentLang: string;
    mode: 'personal_mix' | 'artist_radio' | 'discovery';
    tasteProfile: UserTasteProfile;
  }): string[] {
    const queries: string[] = [];

    if (mode === 'artist_radio' && currentArtist) {
      queries.push(`${currentArtist} top hits`);
      queries.push(`${currentArtist} live acoustic`);
      if (currentGenre) queries.push(`${currentArtist} ${currentGenre}`);
      queries.push(`${currentArtist} essentials`);
      return queries;
    }

    if (mode === 'discovery') {
      const topGenre = tasteProfile.preferredGenres[0]?.name || currentGenre || 'indie pop';
      queries.push(`${topGenre} new trending`);
      queries.push('global viral discovery music');
      if (tasteProfile.preferredLanguages[0]?.name) {
        queries.push(`${tasteProfile.preferredLanguages[0].name} indie music`);
      }
      return queries;
    }

    // Default: 'personal_mix'
    if (currentArtist) {
      queries.push(`${currentArtist} hits`);
    }

    const preferredGenre = currentGenre || tasteProfile.preferredGenres[0]?.name;
    if (preferredGenre) {
      queries.push(`${preferredGenre} top songs`);
    }

    const preferredLang = currentLang || tasteProfile.preferredLanguages[0]?.name;
    if (preferredLang) {
      queries.push(`${preferredLang} trending music`);
    }

    // Discovery query from secondary taste profile or general trending
    const secondaryArtist = tasteProfile.preferredArtists.find(
      (a) => a.name.toLowerCase() !== currentArtist.toLowerCase()
    );
    if (secondaryArtist) {
      queries.push(`${secondaryArtist.name} songs`);
    } else {
      queries.push('trending acoustic pop hits');
    }

    return queries.slice(0, 4);
  }

  /**
   * Computes a multi-factor score for an individual candidate track
   */
  private static scoreCandidate({
    candidate,
    currentTrack,
    currentArtist,
    currentGenre,
    currentLang,
    tasteProfile,
    history,
    sessionSkippedIds,
    mode,
    diversity,
  }: {
    candidate: Track;
    currentTrack: Track | null;
    currentArtist: string;
    currentGenre: string;
    currentLang: string;
    tasteProfile: UserTasteProfile;
    history: Track[];
    sessionSkippedIds: Set<string>;
    mode: 'personal_mix' | 'artist_radio' | 'discovery';
    diversity: 'familiar' | 'balanced' | 'discovery';
  }): ScoredCandidate {
    const candidateArtist = getArtistName(candidate.artists || candidate.artist).toLowerCase();
    const candidateGenre = (candidate.genre || '').toLowerCase();
    const candidateLang = (candidate.language || '').toLowerCase();

    // 1. Artist Affinity (0 - 35)
    let artistAffinity = 0;
    if (mode === 'artist_radio' && candidateArtist === currentArtist.toLowerCase()) {
      artistAffinity = 35;
    } else {
      const profileArtist = tasteProfile.preferredArtists.find(
        (a) => a.name.toLowerCase() === candidateArtist
      );
      if (profileArtist) {
        artistAffinity = Math.min(30, Math.round((profileArtist.score / 100) * 30));
      } else if (candidateArtist === currentArtist.toLowerCase()) {
        artistAffinity = mode === 'discovery' ? 5 : 20;
      }
    }

    // 2. Genre Affinity (0 - 25)
    let genreAffinity = 0;
    if (currentGenre && candidateGenre && (candidateGenre.includes(currentGenre.toLowerCase()) || currentGenre.toLowerCase().includes(candidateGenre))) {
      genreAffinity += 15;
    }
    const profileGenre = tasteProfile.preferredGenres.find(
      (g) => g.name.toLowerCase() === candidateGenre
    );
    if (profileGenre) {
      genreAffinity = Math.min(25, genreAffinity + Math.round((profileGenre.score / 100) * 15));
    }

    // 3. Language Affinity (0 - 20)
    let languageAffinity = 0;
    if (currentLang && candidateLang && currentLang.toLowerCase() === candidateLang) {
      languageAffinity += 15;
    }
    const profileLang = tasteProfile.preferredLanguages.find(
      (l) => l.name.toLowerCase() === candidateLang
    );
    if (profileLang) {
      languageAffinity = Math.min(20, languageAffinity + 10);
    }

    // 4. Mood / Continuity (0 - 15)
    let moodAffinity = 8;
    if (candidate.duration && currentTrack?.duration) {
      const diff = Math.abs(candidate.duration - currentTrack.duration);
      if (diff < 60) moodAffinity += 5;
    }

    // 5. Popularity Score (0 - 10)
    const popularity = candidate.popularity || 50;
    const popularityScore = Math.min(10, Math.round((popularity / 100) * 10));

    // 6. Freshness Bonus (0 - 10)
    let freshnessBonus = 0;
    const recent5Artists = history.slice(-5).map((t) => getArtistName(t.artists || t.artist).toLowerCase());
    if (!recent5Artists.includes(candidateArtist)) {
      freshnessBonus = 8;
    }
    if (diversity === 'discovery' && !tasteProfile.preferredArtists.some((a) => a.name.toLowerCase() === candidateArtist)) {
      freshnessBonus += 7;
    }

    // 7. Repetition Penalty (0 - 50)
    let repetitionPenalty = 0;
    const lastTrackArtist = history.length > 0 ? getArtistName(history[history.length - 1].artists || history[history.length - 1].artist).toLowerCase() : '';
    if (mode !== 'artist_radio' && candidateArtist === lastTrackArtist) {
      repetitionPenalty += 30; // Strong penalty for same artist back-to-back
    }

    const artistCountInRecent5 = recent5Artists.filter((a) => a === candidateArtist).length;
    if (artistCountInRecent5 >= 2) {
      repetitionPenalty += 25;
    }

    // 8. Skip Penalty (0 - 30)
    let skipPenalty = 0;
    if (candidate.id && sessionSkippedIds.has(candidate.id)) {
      skipPenalty += 30;
    }
    if (candidate.canonicalId && sessionSkippedIds.has(candidate.canonicalId)) {
      skipPenalty += 30;
    }
    if (tasteProfile.skippedTrackIds.includes(candidate.id) || (candidate.canonicalId && tasteProfile.skippedTrackIds.includes(candidate.canonicalId))) {
      skipPenalty += 20;
    }

    // Diversity mode weights
    let modeMultiplier = 1.0;
    if (diversity === 'familiar') {
      artistAffinity = Math.round(artistAffinity * 1.3);
      freshnessBonus = Math.round(freshnessBonus * 0.7);
    } else if (diversity === 'discovery') {
      artistAffinity = Math.round(artistAffinity * 0.6);
      freshnessBonus = Math.round(freshnessBonus * 1.5);
    }

    const totalScore = Math.max(
      0,
      Math.round(
        artistAffinity +
        genreAffinity +
        languageAffinity +
        moodAffinity +
        popularityScore +
        freshnessBonus -
        repetitionPenalty -
        skipPenalty
      )
    );

    return {
      track: candidate,
      score: totalScore,
      breakdown: {
        artistAffinity,
        genreAffinity,
        languageAffinity,
        moodAffinity,
        popularityScore,
        freshnessBonus,
        repetitionPenalty,
        skipPenalty,
      },
    };
  }

  private static getTrackSignature(title: string, artist: string): string {
    const cleanTitle = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanArtist = (artist || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanTitle}___${cleanArtist}`;
  }
}
