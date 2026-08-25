import { Track } from './index';

export type NodeCategory =
  | 'TRACK'
  | 'RECORDING'
  | 'ARTIST'
  | 'ALBUM'
  | 'GENRE'
  | 'MOOD'
  | 'LANGUAGE'
  | 'CONTEXT';

export type RecordingVersion =
  | 'ORIGINAL'
  | 'LIVE'
  | 'REMIX'
  | 'ACOUSTIC'
  | 'COVER'
  | 'REMASTER';

export type DiscoveryMode = 'FAMILIAR' | 'BALANCED' | 'DISCOVERY' | 'EXPERIMENTAL';

export type ListeningContextType = 'MORNING' | 'WORKOUT' | 'FOCUS' | 'TRAVEL' | 'NIGHT' | 'PARTY';

export type GraphRelationType =
  | 'SIMILAR_TO'
  | 'SAME_ARTIST'
  | 'SAME_GENRE'
  | 'SAME_LANGUAGE'
  | 'ALTERNATIVE_VERSION'
  | 'COLLABORATION';

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  relationType: GraphRelationType;
  confidence: number; // 0 - 1.0
  origin: 'METADATA' | 'BEHAVIORAL' | 'EDITORIAL';
}

export interface UserMusicProfile {
  favoriteArtists: string[];
  favoriteGenres: string[];
  favoriteLanguages: string[];
  negativeArtists: string[];
  negativeGenres: string[];
}

export interface GraphRecommendationResult {
  track: Track;
  reason: string;
  confidence: number;
}
