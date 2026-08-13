import { Track, Artist, Album, Playlist } from '@/types';

export type ProviderName = 'spotify' | 'youtube' | 'musicbrainz' | 'neotunes_licensed';

export interface ProviderSearchResult {
  songs: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
  videos?: Array<{
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    durationMs: number;
  }>;
}

export interface TrackSourceMapping {
  id: string;
  trackId: string;
  provider: ProviderName;
  providerTrackId: string;
  providerUrl?: string;
  sourceType: 'stream' | 'embed' | 'hls' | 'local';
  availability: boolean;
  region?: string;
  quality?: string;
  durationMs: number;
  isActive: boolean;
}

export interface PlaybackResolution {
  trackId: string;
  provider: ProviderName;
  sourceId: string;
  streamUrl?: string;
  embedUrl?: string;
  sourceType: 'stream' | 'embed' | 'hls' | 'local';
  quality: string;
  isLicensed: boolean;
}

export interface MusicProvider {
  readonly name: ProviderName;
  readonly isConfigured: boolean;

  search(query: string, options?: { limit?: number; type?: string[] }): Promise<ProviderSearchResult>;
  getTrack(id: string): Promise<Track | null>;
  getArtist(id: string): Promise<Artist | null>;
  getAlbum(id: string): Promise<Album | null>;
  getPlaylist(id: string): Promise<Playlist | null>;
  getLyrics?(track: Track): Promise<string | null>;
  resolvePlayback?(trackId: string, preferredSource?: ProviderName): Promise<PlaybackResolution | null>;
}
