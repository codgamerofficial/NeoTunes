export function getCanonicalId(source: string, sourceId: string, type: string = 'track'): string {
  if (!sourceId) return `${source}:${type}:unknown`;
  if (sourceId.includes(':')) return sourceId;
  return `${source}:${type}:${sourceId}`;
}

export interface Artist {
  id: string; // canonicalId or source ID
  canonicalId: string;
  source: string;
  sourceId: string;
  name: string;
  imageUrl?: string;
  avatarUrl?: string; // alias for imageUrl
  genres?: string[];
  followers?: number;
  popularity?: number;
  externalUrl?: string;
  images?: { url: string; width?: number; height?: number }[];
}

export interface Album {
  id: string;
  canonicalId: string;
  source: string;
  sourceId: string;
  title: string;
  name?: string; // alias for title
  artists: (string | { id: string; name: string })[];
  artistId?: string;
  artistName?: string;
  artworkUrl?: string;
  coverUrl?: string; // alias for artworkUrl
  images?: { url: string; width?: number; height?: number }[];
  releaseDate?: string;
  totalTracks?: number;
  externalUrl?: string;
}

export interface CanonicalArtwork {
  small: string | null;
  medium: string | null;
  large: string | null;
  source: 'spotify' | 'youtube' | 'itunes' | 'deezer' | 'musicbrainz' | 'local' | 'fallback';
  verified: boolean;
}

export type TrackArtwork = CanonicalArtwork;

export interface TrackPlaySource {
  provider: string;
  sourceId: string;
}

export interface Track {
  id: string; // canonicalId e.g. "spotify:track:12345" or "youtube:video:abc"
  canonicalId: string;
  source: 'spotify' | 'youtube' | 'local' | 'cloud' | 'audius' | 'stream' | 'itunes' | 'deezer' | 'musicbrainz' | 'other';
  sourceId: string;
  title: string;
  artists: (string | { id: string; name: string })[];
  artistIds?: string[];
  album: string | {
    id?: string;
    name: string;
    artworkUrl?: string | null;
  };
  albumId?: string;
  artwork?: CanonicalArtwork;
  artworkUrl?: string;
  artworkSmall?: string;
  artworkMedium?: string;
  artworkLarge?: string;
  duration: number; // in seconds
  durationMs: number; // in milliseconds
  releaseDate?: string | null;
  explicit?: boolean;
  language?: string;
  genre?: string;
  playable: boolean;
  externalUrl?: string | null;
  previewUrl?: string;
  popularity?: number;
  playSource?: TrackPlaySource | null;

  // Canonical Metadata & Resolution Fields (Spec 1 & 2)
  youtubeVideoId?: string;
  spotifyTrackId?: string;
  isrc?: string;
  artworkSource?: string;
  artworkStatus?: 'loading' | 'resolved' | 'failed' | 'fallback';
  metadataSource?: string;
  metadataConfidence?: number;

  // Immersive Spatial Audio Metadata
  spatialFormat?: 'stereo' | 'multichannel' | 'spatial' | 'atmos' | 'unknown';
  isContentSpatialized?: boolean;

  // Backward compatibility fields
  artist?: string | {
    id?: string;
    name: string;
    avatarUrl?: string;
  };
  coverUrl?: string;
  sourceType?: 'youtube' | 'cloud' | 'audius' | 'stream';
  streamUrl?: string;
  audioQuality?: 'Opus 160' | 'AAC 256' | 'FLAC 24-Bit' | 'MP3 320';
  isFullLength?: boolean;
  plays?: string;
}

export interface Playlist {
  id: string;
  canonicalId: string;
  source: string;
  sourceId: string;
  name: string;
  description?: string;
  owner?: string;
  artworkUrl?: string;
  coverUrl?: string; // alias
  totalTracks?: number;
  externalUrl?: string;
  isPublic?: boolean;
  isCollaborative?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  tracks?: Track[];
}

export function getArtistName(artist: any): string {
  if (!artist) return 'Unknown Artist';
  if (Array.isArray(artist)) {
    const formatted = artist.map((a) => (typeof a === 'string' ? a : a?.name || '')).filter(Boolean).join(', ');
    return formatted || 'Unknown Artist';
  }
  if (typeof artist === 'string') return artist;
  if (typeof artist === 'object' && artist.name) return artist.name;
  return 'Unknown Artist';
}

export function getTrackArtists(track: Track): string[] {
  if (Array.isArray(track.artists) && track.artists.length > 0) {
    return track.artists.map((a) => (typeof a === 'string' ? a : a?.name || '')).filter(Boolean);
  }
  const name = getArtistName(track.artist);
  return name.split(/,\s*|\s*&\s*/).filter(Boolean);
}

export function getCoverUrl(track: Track): string {
  if (track.artworkUrl) return track.artworkUrl;
  if (track.artworkLarge) return track.artworkLarge;
  if (track.artworkMedium) return track.artworkMedium;
  if (track.artwork?.medium) return track.artwork.medium;
  if (track.coverUrl) return track.coverUrl;
  if (track.album && typeof track.album === 'object' && (track.album as any).coverUrl) {
    return (track.album as any).coverUrl;
  }
  return '';
}

export function toCanonicalTrack(raw: any): Track {
  const idStr = String(raw.id || raw.canonicalId || raw.sourceId || `track:${Math.random().toString(36).slice(2)}`);
  const canonicalId = getCanonicalId(raw.source || 'spotify', idStr, 'track');
  const artistStr = getArtistName(raw.artists || raw.artist);
  const artistList: string[] = Array.isArray(raw.artists)
    ? raw.artists.map((a: any) => (typeof a === 'string' ? a : a?.name || '')).filter(Boolean)
    : [artistStr];
  const cover = raw.coverUrl || raw.artworkUrl || raw.artwork?.medium || raw.cover || '';
  const durMs = raw.durationMs || (raw.duration ? raw.duration * 1000 : 180000);
  const albumStr = typeof raw.album === 'string' ? raw.album : (raw.album?.name || 'Single');

  return {
    id: canonicalId,
    canonicalId,
    source: raw.source || 'spotify',
    sourceId: raw.sourceId || idStr,
    title: raw.title || 'Unknown Title',
    artists: artistList,
    artist: artistStr,
    album: albumStr,
    artworkUrl: cover,
    coverUrl: cover,
    artwork: {
      small: raw.artwork?.small || cover,
      medium: raw.artwork?.medium || cover,
      large: raw.artwork?.large || cover,
      source: (raw.artwork?.source || raw.source || 'spotify') as any,
      verified: Boolean(cover),
    },
    duration: Math.floor(durMs / 1000),
    durationMs: durMs,
    releaseDate: raw.releaseDate || null,
    explicit: Boolean(raw.explicit),
    playable: raw.playable !== undefined ? Boolean(raw.playable) : true,
    externalUrl: raw.externalUrl || null,
    playSource: raw.playSource || { provider: raw.source || 'youtube', sourceId: raw.sourceId || idStr },
  };
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

export interface Dimension {
  id: string;
  name: string;
  code: string; // e.g. "DIMENSION 01"
  genre: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  bgGradient: string;
  iconName: string;
  description: string;
  popularTracksQuery: string;
}


