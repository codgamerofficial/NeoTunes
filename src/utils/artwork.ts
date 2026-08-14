export const CANONICAL_ARTWORK_MAP: Record<string, string> = {
  'dai dai': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'bhulbo kemony': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  'shakira': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'freaked out': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'freaked out (after hours)': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'freaked out (rj pasin remix)': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
  "freakin' out": 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800&q=80',
  'freak out': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80',
  'high rated gabru': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'kesariya': 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
  'aaj ki raat': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'blinding lights': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
};

export const DEFAULT_TRACK_ARTWORK = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80';
export const DEFAULT_ARTIST_AVATAR = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80';
export const DEFAULT_ALBUM_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80';

export interface CanonicalTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  plays: string;
  durationMs: number;
  sourceType: 'youtube' | 'cloud' | 'audius' | 'stream';
}

export const FREAKED_OUT_TRACKS: CanonicalTrack[] = [
  {
    id: 'freaked-out-main',
    title: 'FREAKED OUT',
    artist: 'Fat Papi,prodshushy',
    album: 'FREAKED OUT Single',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    plays: '4 crore plays',
    durationMs: 158000, // 2:38
    sourceType: 'stream',
  },
  {
    id: 'freaked-out-after-hours',
    title: 'FREAKED OUT (AFTER HOURS)',
    artist: 'Fat Papi,prodshushy',
    album: 'FREAKED OUT After Hours',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    plays: '54 lakh plays',
    durationMs: 184000,
    sourceType: 'stream',
  },
  {
    id: 'freaked-out-rj-pasin',
    title: 'freaked out (RJ Pasin remix)',
    artist: 'ptasinski,RJ Pasin',
    album: 'RJ Pasin Remixes',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    plays: '9.8 lakh plays',
    durationMs: 142000,
    sourceType: 'stream',
  },
  {
    id: 'freakin-out-moonrocks',
    title: "Freakin' Out",
    artist: 'Dexter and The Moonrocks',
    album: 'Western Space Rock',
    coverUrl: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800&q=80',
    plays: '3.5 crore plays',
    durationMs: 210000,
    sourceType: 'stream',
  },
  {
    id: 'freaked-out-after-hours-sped',
    title: 'FREAKED OUT (AFTER HOURS SPED',
    artist: 'Fat Papi,prodshushy',
    album: 'Sped Up Nightcore Collection',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    plays: '10 lakh plays',
    durationMs: 128000,
    sourceType: 'stream',
  },
];

export function getTrackArtwork(track: any): string {
  if (!track) return DEFAULT_TRACK_ARTWORK;
  if (track.coverUrl && typeof track.coverUrl === 'string' && track.coverUrl.length > 5) {
    return track.coverUrl;
  }
  if (track.artwork && typeof track.artwork === 'string' && track.artwork.length > 5) {
    return track.artwork;
  }
  if (track.album?.coverUrl && typeof track.album.coverUrl === 'string' && track.album.coverUrl.length > 5) {
    return track.album.coverUrl;
  }
  if (track.title) {
    const norm = String(track.title).toLowerCase().trim();
    for (const [key, url] of Object.entries(CANONICAL_ARTWORK_MAP)) {
      if (norm.includes(key) || key.includes(norm)) return url;
    }
  }
  return DEFAULT_TRACK_ARTWORK;
}

export function getArtistArtwork(artist: any): string {
  if (!artist) return DEFAULT_ARTIST_AVATAR;
  if (typeof artist === 'string') return DEFAULT_ARTIST_AVATAR;
  if (artist.avatarUrl) return artist.avatarUrl;
  if (artist.coverUrl) return artist.coverUrl;
  if (artist.imageUrl) return artist.imageUrl;
  return DEFAULT_ARTIST_AVATAR;
}

export function getAlbumArtwork(album: any): string {
  if (!album) return DEFAULT_ALBUM_COVER;
  if (typeof album === 'string') return DEFAULT_ALBUM_COVER;
  if (album.coverUrl) return album.coverUrl;
  if (album.artwork) return album.artwork;
  return DEFAULT_ALBUM_COVER;
}
