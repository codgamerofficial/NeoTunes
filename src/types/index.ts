export interface Artist {
  id: string;
  name: string;
  genres?: string[];
  popularity?: number;
  avatarUrl?: string;
  images?: { url: string; width?: number; height?: number }[];
}

export interface Album {
  id: string;
  name: string;
  artistId?: string;
  artistName?: string;
  coverUrl?: string;
  images?: { url: string; width?: number; height?: number }[];
  releaseDate?: string;
}

export interface Track {
  id: string; // Track ID (Spotify ID, iTunes ID, or local UUID)
  title: string;
  artist: string | {
    id?: string;
    name: string;
    avatarUrl?: string;
  };
  album?: string | {
    id?: string;
    name?: string;
    coverUrl?: string;
  };
  durationMs: number;
  popularity?: number;
  previewUrl?: string;
  sourceType: 'youtube' | 'cloud' | 'audius' | 'stream';
  sourceId?: string; // YouTube Video ID or direct audio stream ID
  streamUrl?: string; // Direct full audio URL
  coverUrl?: string;
  audioQuality?: 'Opus 160' | 'AAC 256' | 'FLAC 24-Bit' | 'MP3 320';
  isFullLength?: boolean;
}

export function getArtistName(artist: Track['artist']): string {
  if (!artist) return 'Unknown Artist';
  if (typeof artist === 'string') return artist;
  if (typeof artist === 'object' && artist.name) return artist.name;
  return 'Unknown Artist';
}

export function getCoverUrl(track: Track): string {
  if (track.coverUrl) return track.coverUrl;
  if (track.album && typeof track.album === 'object' && track.album.coverUrl) return track.album.coverUrl;
  return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tracks?: Track[];
}

export interface UserProfile {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  favoriteGenres: string[];
  favoriteArtists: string[];
  playbackQuality: 'auto' | 'high' | 'low';
  theme: 'dark' | 'light';
}
