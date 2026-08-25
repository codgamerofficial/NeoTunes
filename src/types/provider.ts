import { Track, Artist, Album, CanonicalArtwork } from './index';

export type ProviderType = 'MUSIC' | 'LYRICS' | 'ARTWORK' | 'AI' | 'RECOMMENDATION';

export type ProviderHealthStatus = 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE';

export interface ProviderCapability {
  search: boolean;
  stream: boolean;
  lyrics: boolean;
  artwork: boolean;
  download: boolean;
  fullLength: boolean;
  preview: boolean;
  albums: boolean;
  artists: boolean;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  version: string;
  type: ProviderType;
  capabilities: ProviderCapability;
  status: ProviderHealthStatus;
}

export interface IMusicProvider {
  metadata: ProviderMetadata;
  searchTracks(query: string, options?: { limit?: number }): Promise<Track[]>;
  searchArtists(query: string, options?: { limit?: number }): Promise<Artist[]>;
  searchAlbums(query: string, options?: { limit?: number }): Promise<Album[]>;
  resolveTrack(canonicalId: string): Promise<Track | null>;
  getArtwork(track: Track): Promise<CanonicalArtwork | null>;
  getStreamUrl(track: Track): Promise<string | null>;
}
