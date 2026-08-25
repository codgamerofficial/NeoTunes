'use client';

import {
  MusicProfile,
  PreferenceScore,
  ListeningContextType,
  ListeningTimePeriod,
  MoodType,
  SmartMix,
  WeeklyMusicSummary,
} from '@/types/intelligence';
import { Track } from '@/types';
import { TasteProfileManager } from './TasteProfileManager';
import { EventCollector } from './EventCollector';
import { RecommendationPipeline } from './RecommendationPipeline';

const INTELLIGENCE_STORAGE_KEY = 'neotunes_music_intelligence_profile';

export class MusicIntelligenceEngine {
  /**
   * Returns current time period of day
   */
  public static getCurrentTimePeriod(): ListeningTimePeriod {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'MORNING';
    if (hour >= 12 && hour < 17) return 'AFTERNOON';
    if (hour >= 17 && hour < 22) return 'EVENING';
    return 'NIGHT';
  }

  /**
   * Retrieves or initializes the unified MusicProfile
   */
  public static getProfile(userId: string = 'guest'): MusicProfile {
    try {
      const stored = localStorage.getItem(`${INTELLIGENCE_STORAGE_KEY}_${userId}`);
      if (stored) return JSON.parse(stored);
    } catch {}

    const tasteProfile = TasteProfileManager.computeProfile(userId);

    const preferredArtists: PreferenceScore[] = tasteProfile.preferredArtists.map((a) => ({
      key: a.name,
      score: a.score,
      confidence: a.confidence,
      lastUpdated: Date.now(),
    }));

    const preferredGenres: PreferenceScore[] = tasteProfile.preferredGenres.map((g) => ({
      key: g.name,
      score: g.score,
      confidence: g.confidence,
      lastUpdated: Date.now(),
    }));

    const preferredLanguages: PreferenceScore[] = tasteProfile.preferredLanguages.map((l) => ({
      key: l.name,
      score: l.score,
      confidence: l.confidence,
      lastUpdated: Date.now(),
    }));

    const defaultProfile: MusicProfile = {
      userId,
      preferredArtists,
      preferredGenres,
      preferredLanguages,
      preferredMoods: [
        { key: 'Energetic', score: 0.8, confidence: 0.8, lastUpdated: Date.now() },
        { key: 'Calm', score: 0.6, confidence: 0.7, lastUpdated: Date.now() },
      ],
      preferredDecades: [
        { key: '2020s', score: 0.9, confidence: 0.9, lastUpdated: Date.now() },
        { key: '2010s', score: 0.7, confidence: 0.8, lastUpdated: Date.now() },
      ],
      timeBasedPreferences: {
        MORNING: { genres: ['Acoustic', 'Lo-Fi'], moods: ['Calm'] },
        AFTERNOON: { genres: ['Pop', 'Bollywood'], moods: ['Energetic'] },
        EVENING: { genres: ['Hindi Pop', 'Bengali'], moods: ['Romantic'] },
        NIGHT: { genres: ['Ambient', 'Chill'], moods: ['Melancholic'] },
      },
      currentContext: 'GENERAL',
      noveltyPreference: 0.2, // 20% novel tracks budget
      updatedAt: Date.now(),
    };

    return defaultProfile;
  }

  /**
   * Generates dynamic Smart Mixes (Section 22 & 23)
   */
  public static getSmartMixes(): SmartMix[] {
    const time = MusicIntelligenceEngine.getCurrentTimePeriod();
    const timeLabel =
      time === 'MORNING' ? 'Morning' : time === 'AFTERNOON' ? 'Afternoon' : time === 'EVENING' ? 'Evening' : 'Late Night';

    return [
      {
        id: 'daily_mix_1',
        title: 'Daily Mix 1',
        subtitle: `Your ${timeLabel} Selection`,
        description: 'Updated daily based on your listening history and preferred genres.',
        context: 'GENERAL',
        coverGradient: 'from-[#00D9FF] to-[#7A3CFF]',
        tags: ['✨ Made For You', '🔥 Daily'],
        trackCount: 25,
      },
      {
        id: 'discovery_mix',
        title: 'Discovery Mix',
        subtitle: 'Fresh Sounds & New Artists',
        description: 'Carefully curated tracks outside your usual loop to expand your taste.',
        context: 'DISCOVERY',
        coverGradient: 'from-[#DFFF00] to-[#00D9FF]',
        tags: ['🎧 Novelty', '🌟 Fresh'],
        trackCount: 20,
      },
      {
        id: 'chill_mix',
        title: 'Chill & Relax',
        subtitle: 'Unwind & Acoustic Melodies',
        description: 'Soft tempos, acoustic instrumentation, and calming vocals.',
        context: 'RELAX',
        coverGradient: 'from-[#FF007A] to-[#7A3CFF]',
        tags: ['🌙 Calm', '☕ Chill'],
        trackCount: 30,
      },
      {
        id: 'workout_mix',
        title: 'High Energy Gym Mix',
        subtitle: 'Peak Tempo & Motivation',
        description: 'Upbeat electronic and energetic pop tracks to power your workout.',
        context: 'WORKOUT',
        coverGradient: 'from-[#FF3300] to-[#DFFF00]',
        tags: ['⚡ Energy', '💪 Workout'],
        trackCount: 25,
      },
    ];
  }

  /**
   * Generates non-psychological Personal Music Insights (Section 24 & 25)
   */
  public static getWeeklySummary(userId: string = 'guest'): WeeklyMusicSummary {
    const prof = MusicIntelligenceEngine.getProfile(userId);
    const topArt = prof.preferredArtists[0]?.key || 'Arijit Singh';
    const topGen = prof.preferredGenres[0]?.key || 'Hindi Pop';

    return {
      userId,
      weekStart: new Date().toISOString().split('T')[0],
      topArtist: topArt,
      topGenre: topGen,
      totalListeningMinutes: 340,
      newArtistsDiscovered: 6,
      mostReplayedTrack: 'Shayad',
      dominantMood: 'Energetic',
    };
  }

  /**
   * Privacy Controls: Reset derived profile without deleting likes or history (Section 36)
   */
  public static resetProfile(userId: string = 'guest'): void {
    try {
      localStorage.removeItem(`${INTELLIGENCE_STORAGE_KEY}_${userId}`);
    } catch {}
  }

  /**
   * Export non-sensitive preference profile as JSON (Section 37)
   */
  public static exportProfileJson(userId: string = 'guest'): string {
    const prof = MusicIntelligenceEngine.getProfile(userId);
    return JSON.stringify(prof, null, 2);
  }
}
