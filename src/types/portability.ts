import { Track } from './index';

export type MatchConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type ImportJobStatus =
  | 'QUEUED'
  | 'PARSING'
  | 'MATCHING'
  | 'VERIFYING'
  | 'COMMITTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface ProviderReference {
  source: string;
  sourceId: string;
  playable: boolean;
}

export interface UniversalTrack {
  universalId: string;
  title: string;
  normalizedTitle: string;
  artists: string[];
  album?: string;
  duration: number; // in seconds
  isrc?: string;
  upc?: string;
  versionType?: 'ORIGINAL' | 'LIVE' | 'REMIX' | 'ACOUSTIC' | 'COVER' | 'OTHER';
  sourceReferences: ProviderReference[];
  metadataConfidence: MatchConfidence;
}

export interface TrackMatchResult {
  sourceTrack: { title: string; artist: string; album?: string; duration?: number };
  matchedTrack: Track | null;
  confidence: MatchConfidence;
  matchExplanation: string;
  availableOptions?: Track[];
}

export interface ImportMigrationReport {
  totalProcessed: number;
  exactMatchesCount: number;
  needsReviewCount: number;
  unavailableCount: number;
  duplicatesCount: number;
  matchedTracks: Track[];
  reviewItems: TrackMatchResult[];
  unmatchedItems: { title: string; artist: string }[];
}

export interface NeoTunesBackupSchema {
  format: 'neotunes-backup';
  version: number;
  createdAt: string;
  profile: any;
  playlists: any[];
  tracks: Track[];
  preferences: any;
}
