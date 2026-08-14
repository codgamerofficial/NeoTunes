export const CANONICAL_ARTWORK_MAP: Record<string, string> = {
  'high rated gabru': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'kesariya': 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
  'aaj ki raat': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'blinding lights': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
  'tere pyaar mein': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
  'dil se': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
};

export const DEFAULT_TRACK_ARTWORK = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80';
export const DEFAULT_ARTIST_AVATAR = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80';
export const DEFAULT_ALBUM_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80';

export function getTrackArtwork(track: any): string {
  if (!track) return DEFAULT_TRACK_ARTWORK;
  if (track.coverUrl && typeof track.coverUrl === 'string' && track.coverUrl.length > 5) {
    return track.coverUrl;
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
