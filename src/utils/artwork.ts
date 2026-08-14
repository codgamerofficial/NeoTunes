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

export function getTrackArtwork(track: any): string {
  if (!track) return '';
  
  const key = track.canonicalId || track.id;
  if (key && artworkCache.has(key)) {
    return artworkCache.get(key)!;
  }

  if (track.artworkUrl && typeof track.artworkUrl === 'string' && track.artworkUrl.trim()) {
    if (key) artworkCache.set(key, track.artworkUrl);
    return track.artworkUrl;
  }
  if (track.artworkLarge && typeof track.artworkLarge === 'string' && track.artworkLarge.trim()) {
    if (key) artworkCache.set(key, track.artworkLarge);
    return track.artworkLarge;
  }
  if (track.artworkMedium && typeof track.artworkMedium === 'string' && track.artworkMedium.trim()) {
    if (key) artworkCache.set(key, track.artworkMedium);
    return track.artworkMedium;
  }
  if (track.coverUrl && typeof track.coverUrl === 'string' && track.coverUrl.trim()) {
    if (key) artworkCache.set(key, track.coverUrl);
    return track.coverUrl;
  }
  if (track.artwork && typeof track.artwork === 'string' && track.artwork.trim()) {
    if (key) artworkCache.set(key, track.artwork);
    return track.artwork;
  }
  if (track.album && typeof track.album === 'object' && track.album.coverUrl) {
    if (key) artworkCache.set(key, track.album.coverUrl);
    return track.album.coverUrl;
  }
  
  return '';
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

