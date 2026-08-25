import { Track } from './index';

export type RadioType = 'TRACK' | 'ARTIST' | 'ALBUM' | 'GENRE' | 'MOOD' | 'ACTIVITY';

export type NoveltyMode = 'SAFE' | 'BALANCED' | 'ADVENTUROUS' | 'SURPRISE';

export interface RadioSeed {
  type: RadioType;
  id: string;
  name: string;
  artistName?: string;
  artworkUrl?: string;
}

export interface SessionTasteProfile {
  artists: string[];
  genres: string[];
  languages: string[];
  moods: string[];
  recentTracks: string[]; // Canonical IDs
  negativeSignals: string[]; // Disliked/skipped canonical IDs
}

export interface SmartQueueConfig {
  noveltyMode: NoveltyMode;
  artistCooldownCount: number; // e.g. 3 tracks before same artist allowed again
  albumCooldownCount: number;
  allowPreviews: boolean;
}

export interface RecommendationCandidate {
  track: Track;
  score: number;
  explanation: string;
  poolType: 'FAMILIAR' | 'SIMILAR' | 'NEW' | 'TRENDING' | 'SOCIAL';
}
