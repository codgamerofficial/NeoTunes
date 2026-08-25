export type ListeningTimePeriod = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export type ListeningContextType =
  | 'FOCUS'
  | 'WORKOUT'
  | 'RELAX'
  | 'TRAVEL'
  | 'PARTY'
  | 'SLEEP'
  | 'COMMUTE'
  | 'ROMANTIC'
  | 'DISCOVERY'
  | 'GENERAL';

export type MoodType =
  | 'Happy'
  | 'Sad'
  | 'Calm'
  | 'Energetic'
  | 'Romantic'
  | 'Nostalgic'
  | 'Focused'
  | 'Melancholic'
  | 'Dreamy'
  | 'Motivational';

export interface PreferenceScore {
  key: string;
  score: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  lastUpdated: number;
}

export interface MusicProfile {
  userId: string;
  preferredArtists: PreferenceScore[];
  preferredGenres: PreferenceScore[];
  preferredLanguages: PreferenceScore[];
  preferredMoods: PreferenceScore[];
  preferredDecades: PreferenceScore[];
  timeBasedPreferences: Record<ListeningTimePeriod, { genres: string[]; moods: string[] }>;
  currentContext: ListeningContextType;
  noveltyPreference: number; // 0.1 to 0.5 (novelty budget)
  updatedAt: number;
}

export interface SmartMix {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  context: ListeningContextType;
  coverGradient: string;
  tags: string[];
  trackCount: number;
}

export interface WeeklyMusicSummary {
  userId: string;
  weekStart: string;
  topArtist: string;
  topGenre: string;
  totalListeningMinutes: number;
  newArtistsDiscovered: number;
  mostReplayedTrack: string;
  dominantMood: string;
}
