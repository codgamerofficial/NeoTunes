'use client';

import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';

export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  trackCount: number;
  coverUrl?: string;
  isPublic?: boolean;
}

const LIKED_IDS_KEY = 'neotunes_liked_tracks';
const LIKED_DATA_KEY = 'neotunes_liked_tracks_data';
const LOCAL_PLAYLISTS_KEY = 'neotunes_local_playlists';

export const likedSongsService = {
  /**
   * Check if a track is liked locally
   */
  isLiked(trackId: string): boolean {
    if (typeof window === 'undefined' || !trackId) return false;
    try {
      const stored = localStorage.getItem(LIKED_IDS_KEY);
      if (!stored) return false;
      const ids: string[] = JSON.parse(stored);
      return ids.includes(trackId);
    } catch {
      return false;
    }
  },

  /**
   * Toggle like status with instant local cache + background API sync
   */
  async toggleLike(track: Track): Promise<boolean> {
    if (typeof window === 'undefined' || !track?.id) return false;

    const currentLiked = this.isLiked(track.id);
    const nextLiked = !currentLiked;

    try {
      // 1. Update ID set
      const storedIds = localStorage.getItem(LIKED_IDS_KEY);
      let ids: string[] = storedIds ? JSON.parse(storedIds) : [];
      if (nextLiked) {
        if (!ids.includes(track.id)) ids.push(track.id);
      } else {
        ids = ids.filter((id) => id !== track.id);
      }
      localStorage.setItem(LIKED_IDS_KEY, JSON.stringify(ids));

      // 2. Update Full Track Cache
      const storedData = localStorage.getItem(LIKED_DATA_KEY);
      let tracks: Track[] = storedData ? JSON.parse(storedData) : [];
      if (nextLiked) {
        const cleanTrack: Track = {
          id: track.id,
          canonicalId: track.canonicalId || track.id,
          source: track.source || 'spotify',
          sourceId: track.sourceId || track.id,
          title: track.title,
          artists: Array.isArray(track.artists) ? track.artists : [getArtistName(track.artist)],
          artist: getArtistName(track.artist),
          album: typeof track.album === 'object' ? (track.album as any)?.name || 'Single' : track.album || 'Single',
          artworkUrl: resolveArtwork(track),
          coverUrl: resolveArtwork(track),
          duration: track.duration || 180,
          durationMs: track.durationMs || (track.duration ? track.duration * 1000 : 180000),
          popularity: track.popularity || 80,
          playable: true,
        };
        tracks = [cleanTrack, ...tracks.filter((t) => t.id !== track.id)];
      } else {
        tracks = tracks.filter((t) => t.id !== track.id);
      }
      localStorage.setItem(LIKED_DATA_KEY, JSON.stringify(tracks));

      // 3. Broadcast Event to all listeners
      window.dispatchEvent(
        new CustomEvent('neotunes_liked_change', {
          detail: { trackId: track.id, isLiked: nextLiked, track },
        })
      );

      // 4. Background API Sync
      const artistName = getArtistName(track.artists || track.artist);
      const apiTrack = {
        id: track.id,
        title: track.title,
        artist: {
          id: `artist_${encodeURIComponent(artistName.toLowerCase())}`,
          name: artistName,
        },
        album: {
          id: `album_${encodeURIComponent((typeof track.album === 'object' ? (track.album as any)?.name : track.album || 'single').toLowerCase())}`,
          name: typeof track.album === 'object' ? (track.album as any)?.name || 'Single' : track.album || 'Single',
          coverUrl: resolveArtwork(track),
        },
        durationMs: track.durationMs || (track.duration ? track.duration * 1000 : 180000),
        popularity: track.popularity || 80,
        previewUrl: track.previewUrl || '',
        sourceType: track.source || 'youtube',
        sourceId: track.sourceId || track.id,
      };

      fetch('/api/liked', {
        method: nextLiked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id, track: apiTrack }),
      }).catch(() => {});

      return nextLiked;
    } catch (err) {
      console.warn('[LikedSongsService] toggleLike error:', err);
      return nextLiked;
    }
  },

  /**
   * Get all liked tracks (API + Local storage fallback)
   */
  async getLikedTracks(): Promise<Track[]> {
    if (typeof window === 'undefined') return [];

    try {
      const res = await fetch('/api/liked');
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
          const formatted: Track[] = data.tracks.map((tr: any) => ({
            id: tr.canonicalId || `spotify:track:${tr.id}`,
            canonicalId: tr.canonicalId || `spotify:track:${tr.id}`,
            source: tr.source || 'spotify',
            sourceId: tr.sourceId || tr.id,
            title: tr.title,
            artists: Array.isArray(tr.artists) ? tr.artists : [getArtistName(tr.artist)],
            artist: getArtistName(tr.artist),
            album: typeof tr.album === 'object' ? tr.album?.name || 'Single' : tr.album || 'Single',
            artworkUrl: resolveArtwork(tr),
            coverUrl: resolveArtwork(tr),
            duration: Math.floor((tr.durationMs || 180000) / 1000),
            durationMs: tr.durationMs || 180000,
            playable: true,
          }));

          // Cache in localStorage
          localStorage.setItem(LIKED_DATA_KEY, JSON.stringify(formatted));
          localStorage.setItem(LIKED_IDS_KEY, JSON.stringify(formatted.map((t) => t.id)));

          return formatted;
        }
      }
    } catch {}

    // Fallback to local storage
    try {
      const stored = localStorage.getItem(LIKED_DATA_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    return [];
  },

  /**
   * Fetch all user playlists
   */
  async getPlaylists(): Promise<UserPlaylist[]> {
    if (typeof window === 'undefined') return [];

    let apiPlaylists: UserPlaylist[] = [];
    try {
      const res = await fetch('/api/playlists');
      if (res.ok) {
        const data = await res.json();
        if (data.playlists && Array.isArray(data.playlists)) {
          apiPlaylists = data.playlists.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            trackCount: p.trackCount || 0,
            coverUrl: p.cover_url || p.coverUrl,
            isPublic: p.is_public ?? true,
          }));
        }
      }
    } catch {}

    // Local storage playlists
    let localPlaylists: UserPlaylist[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_PLAYLISTS_KEY);
      if (stored) {
        localPlaylists = JSON.parse(stored);
      }
    } catch {}

    // Merge by ID
    const map = new Map<string, UserPlaylist>();
    [...apiPlaylists, ...localPlaylists].forEach((pl) => map.set(pl.id, pl));

    // If zero playlists, provide a default "My Favorites" playlist
    if (map.size === 0) {
      const defaultPl: UserPlaylist = {
        id: 'playlist_favorites',
        name: 'My Favorites',
        description: 'Your favorite tracks in one place',
        trackCount: 0,
        isPublic: false,
      };
      map.set(defaultPl.id, defaultPl);
      try {
        localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify([defaultPl]));
      } catch {}
    }

    return Array.from(map.values());
  },

  /**
   * Create a new playlist
   */
  async createPlaylist(name: string, description?: string): Promise<UserPlaylist> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Playlist name is required');

    let createdPlaylist: UserPlaylist = {
      id: `local_pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmed,
      description: description?.trim() || '',
      trackCount: 0,
      isPublic: true,
    };

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, description: description?.trim() || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.playlist) {
          createdPlaylist = {
            id: data.playlist.id,
            name: data.playlist.name,
            description: data.playlist.description,
            trackCount: 0,
            coverUrl: data.playlist.cover_url,
            isPublic: data.playlist.is_public,
          };
        }
      }
    } catch {}

    // Save to local storage
    try {
      const stored = localStorage.getItem(LOCAL_PLAYLISTS_KEY);
      const list: UserPlaylist[] = stored ? JSON.parse(stored) : [];
      list.unshift(createdPlaylist);
      localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(list));
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neotunes_playlist_change', { detail: { playlist: createdPlaylist } }));
    }

    return createdPlaylist;
  },

  /**
   * Add a track to a playlist
   */
  async addTrackToPlaylist(playlistId: string, track: Track): Promise<{ success: boolean; alreadyExists?: boolean }> {
    if (typeof window === 'undefined' || !playlistId || !track?.id) {
      return { success: false };
    }

    const artistName = getArtistName(track.artists || track.artist);
    const cleanTrack = {
      id: track.id,
      title: track.title,
      artist: {
        id: `artist_${encodeURIComponent(artistName.toLowerCase())}`,
        name: artistName,
      },
      album: {
        id: `album_${encodeURIComponent((typeof track.album === 'object' ? (track.album as any)?.name : track.album || 'single').toLowerCase())}`,
        name: typeof track.album === 'object' ? (track.album as any)?.name || 'Single' : track.album || 'Single',
        coverUrl: resolveArtwork(track),
      },
      durationMs: track.durationMs || (track.duration ? track.duration * 1000 : 180000),
      popularity: track.popularity || 80,
      previewUrl: track.previewUrl || '',
      sourceType: track.source || 'youtube',
      sourceId: track.sourceId || track.id,
    };

    // 1. Update local playlist track list
    const plTracksKey = `neotunes_playlist_tracks_${playlistId}`;
    try {
      const stored = localStorage.getItem(plTracksKey);
      let tracks: Track[] = stored ? JSON.parse(stored) : [];
      if (tracks.some((t) => t.id === track.id)) {
        return { success: true, alreadyExists: true };
      }
      tracks.push(track);
      localStorage.setItem(plTracksKey, JSON.stringify(tracks));

      // Increment track count on playlist in local storage
      const storedPls = localStorage.getItem(LOCAL_PLAYLISTS_KEY);
      if (storedPls) {
        const pls: UserPlaylist[] = JSON.parse(storedPls);
        const target = pls.find((p) => p.id === playlistId);
        if (target) {
          target.trackCount = (target.trackCount || 0) + 1;
          if (!target.coverUrl) target.coverUrl = resolveArtwork(track);
          localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(pls));
        }
      }
    } catch {}

    // 2. Sync to API
    try {
      await fetch(`/api/playlists/${playlistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_track',
          track: cleanTrack,
        }),
      });
    } catch {}

    window.dispatchEvent(
      new CustomEvent('neotunes_playlist_change', {
        detail: { playlistId, trackId: track.id },
      })
    );

    return { success: true, alreadyExists: false };
  },

  /**
   * Check if track is already in a playlist
   */
  isTrackInPlaylist(playlistId: string, trackId: string): boolean {
    if (typeof window === 'undefined' || !playlistId || !trackId) return false;
    try {
      const stored = localStorage.getItem(`neotunes_playlist_tracks_${playlistId}`);
      if (!stored) return false;
      const tracks: Track[] = JSON.parse(stored);
      return tracks.some((t) => t.id === trackId);
    } catch {
      return false;
    }
  },
};
