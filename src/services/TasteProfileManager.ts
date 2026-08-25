'use client';

import { EventCollector, ListeningEvent } from './EventCollector';

export interface AffinityMetric {
  name: string;
  score: number;
  confidence: number; // 0 to 1
}

export interface UserTasteProfile {
  userId: string;
  preferredArtists: AffinityMetric[];
  preferredGenres: AffinityMetric[];
  preferredLanguages: AffinityMetric[];
  preferredMoods: AffinityMetric[];
  notInterestedTrackIds: string[];
  skippedTrackIds: string[];
  lastUpdated: number;
}

const TASTE_PROFILE_STORAGE_KEY = 'neotunes_taste_profile';
const SETTINGS_STORAGE_KEY = 'neotunes_recommendation_settings';

export interface RecommendationSettings {
  personalizedRecommendationsEnabled: boolean;
  useListeningHistory: boolean;
  explorationRatio: number; // 0.2 default (20%)
}

export class TasteProfileManager {
  public static getSettings(): RecommendationSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      personalizedRecommendationsEnabled: true,
      useListeningHistory: true,
      explorationRatio: 0.2,
    };
  }

  public static updateSettings(settings: Partial<RecommendationSettings>): void {
    const current = TasteProfileManager.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  public static computeProfile(userId: string = 'guest'): UserTasteProfile {
    const settings = TasteProfileManager.getSettings();
    if (!settings.personalizedRecommendationsEnabled || !settings.useListeningHistory) {
      return {
        userId,
        preferredArtists: [],
        preferredGenres: [],
        preferredLanguages: [],
        preferredMoods: [],
        notInterestedTrackIds: [],
        skippedTrackIds: [],
        lastUpdated: Date.now(),
      };
    }

    const events = EventCollector.getRecentEvents(300);
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const artistScores: Record<string, number> = {};
    const genreScores: Record<string, number> = {};
    const languageScores: Record<string, number> = {};
    const moodScores: Record<string, number> = {};

    const notInterestedSet = new Set<string>();
    const skippedSet = new Set<string>();

    for (const evt of events) {
      if (evt.userId !== userId && userId !== 'guest') continue;

      // Time decay factor (7-day half life)
      const ageDays = (now - evt.timestamp) / ONE_DAY_MS;
      const decayWeight = Math.exp(-ageDays / 7);

      let eventWeight = 0;
      switch (evt.eventType) {
        case 'PLAY_STARTED': eventWeight = 0.1; break;
        case 'PLAY_30_SECONDS': eventWeight = 0.4; break;
        case 'PLAY_50_PERCENT': eventWeight = 0.7; break;
        case 'PLAY_COMPLETED': eventWeight = 1.0; break;
        case 'REPLAYED': eventWeight = 1.3; break;
        case 'LIKED': eventWeight = 1.6; break;
        case 'ADDED_TO_PLAYLIST': eventWeight = 1.5; break;
        case 'DOWNLOADED': eventWeight = 1.2; break;
        case 'SKIPPED':
          eventWeight = -0.5;
          if (evt.trackId) skippedSet.add(evt.trackId);
          break;
        case 'NOT_INTERESTED':
          eventWeight = -2.5;
          if (evt.trackId) notInterestedSet.add(evt.trackId);
          break;
      }

      const netScore = eventWeight * decayWeight;

      if (evt.artistName) {
        const key = evt.artistName.trim();
        artistScores[key] = (artistScores[key] || 0) + netScore;
      }
      if (evt.genre) {
        const key = evt.genre.trim();
        genreScores[key] = (genreScores[key] || 0) + netScore;
      }
      if (evt.language) {
        const key = evt.language.trim();
        languageScores[key] = (languageScores[key] || 0) + netScore;
      }
    }

    const formatAffinity = (scores: Record<string, number>): AffinityMetric[] => {
      const entries = Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1]);
      
      const maxScore = entries[0]?.[1] || 1;
      return entries.slice(0, 10).map(([name, score]) => ({
        name,
        score: Math.round(score * 10) / 10,
        confidence: Math.min(1.0, Math.round((score / maxScore) * 100) / 100),
      }));
    };

    const profile: UserTasteProfile = {
      userId,
      preferredArtists: formatAffinity(artistScores),
      preferredGenres: formatAffinity(genreScores),
      preferredLanguages: formatAffinity(languageScores),
      preferredMoods: formatAffinity(moodScores),
      notInterestedTrackIds: Array.from(notInterestedSet),
      skippedTrackIds: Array.from(skippedSet),
      lastUpdated: now,
    };

    try {
      localStorage.setItem(TASTE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {}

    return profile;
  }

  public static clearTasteProfile(): void {
    try {
      localStorage.removeItem(TASTE_PROFILE_STORAGE_KEY);
      EventCollector.clearEvents();
    } catch {}
  }
}
