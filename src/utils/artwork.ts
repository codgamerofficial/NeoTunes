import { Track, Artist, Album, Playlist, getCoverUrl as getTrackCoverUrl } from '@/types';

// In-memory artwork cache keyed strictly by canonicalId or URL (NOT title or index)
const artworkCache = new Map<string, string>();

export function cacheArtwork(key: string, url: string): void {
  if (key && url) {
    artworkCache.set(key, url);
  }
}

export function getCachedArtwork(key: string): string | undefined {
  return artworkCache.get(key);
}

export function resolveArtwork(track: any): string {
  if (!track) return 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80';
  
  const key = track.canonicalId || track.id;
  if (key && artworkCache.has(key)) {
    return artworkCache.get(key)!;
  }

  // Priority: 1. Canonical Track Artwork Properties
  let resolvedUrl = '';
  if (track.artworkUrl && typeof track.artworkUrl === 'string' && track.artworkUrl.trim()) {
    resolvedUrl = track.artworkUrl;
  } else if (track.coverUrl && typeof track.coverUrl === 'string' && track.coverUrl.trim()) {
    resolvedUrl = track.coverUrl;
  } else if (track.artworkLarge && typeof track.artworkLarge === 'string' && track.artworkLarge.trim()) {
    resolvedUrl = track.artworkLarge;
  } else if (track.artworkMedium && typeof track.artworkMedium === 'string' && track.artworkMedium.trim()) {
    resolvedUrl = track.artworkMedium;
  } else if (track.artwork && typeof track.artwork === 'string' && track.artwork.trim()) {
    resolvedUrl = track.artwork;
  } else if (track.thumbnail && typeof track.thumbnail === 'string' && track.thumbnail.trim()) {
    resolvedUrl = track.thumbnail;
  } else if (track.thumbnailUrl && typeof track.thumbnailUrl === 'string' && track.thumbnailUrl.trim()) {
    resolvedUrl = track.thumbnailUrl;
  } else if (track.albumCover && typeof track.albumCover === 'string' && track.albumCover.trim()) {
    resolvedUrl = track.albumCover;
  } else if (track.cover_url && typeof track.cover_url === 'string' && track.cover_url.trim()) {
    resolvedUrl = track.cover_url;
  } 
  // Priority: 2. Album Artwork Object
  else if (track.album && typeof track.album === 'object') {
    resolvedUrl = track.album.coverUrl || track.album.artworkUrl || track.album.artwork || track.album.cover_url || '';
  }

  // Priority: 3. Provider artwork / images array fallback
  if (!resolvedUrl && Array.isArray(track.images) && track.images.length > 0) {
    resolvedUrl = track.images[0]?.url || '';
  }

  // Priority: 4. Verified NeoTunes fallback
  if (!resolvedUrl) {
    resolvedUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80';
  }

  if (key && resolvedUrl) {
    artworkCache.set(key, resolvedUrl);
  }

  return resolvedUrl;
}

export function getTrackArtwork(track: any): string {
  return resolveArtwork(track);
}

export function getArtistArtwork(artist: any): string {
  if (!artist) return '';
  if (typeof artist === 'string') return '';
  
  const key = artist.canonicalId || artist.id;
  if (key && artworkCache.has(key)) {
    return artworkCache.get(key)!;
  }

  const url = artist.imageUrl || artist.avatarUrl || artist.coverUrl || artist.images?.[0]?.url || '';
  if (url && key) artworkCache.set(key, url);
  return url;
}

export function getAlbumArtwork(album: any): string {
  if (!album) return '';
  if (typeof album === 'string') return '';
  
  const key = album.canonicalId || album.id;
  if (key && artworkCache.has(key)) {
    return artworkCache.get(key)!;
  }

  const url = album.artworkUrl || album.coverUrl || album.artwork || album.images?.[0]?.url || '';
  if (url && key) artworkCache.set(key, url);
  return url;
}

export function getPlaylistArtwork(playlist: any): string {
  if (!playlist) return '';
  if (typeof playlist === 'string') return '';
  
  const key = playlist.canonicalId || playlist.id;
  if (key && artworkCache.has(key)) {
    return artworkCache.get(key)!;
  }

  const url = playlist.artworkUrl || playlist.coverUrl || playlist.images?.[0]?.url || '';
  if (url && key) artworkCache.set(key, url);
  return url;
}

