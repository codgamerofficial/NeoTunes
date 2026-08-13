import { MusicProvider, ProviderName, ProviderSearchResult } from './types';
import { Track, Artist, Album, Playlist } from '@/types';
import { getSpotifyAccessToken } from '@/services/spotify';

export class SpotifyProvider implements MusicProvider {
  readonly name: ProviderName = 'spotify';

  get isConfigured(): boolean {
    return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
  }

  private async fetchApi<T>(endpoint: string): Promise<T | null> {
    try {
      const token = await getSpotifyAccessToken();
      const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch (err) {
      console.warn(`[SpotifyProvider] API call failed (${endpoint}):`, err);
      return null;
    }
  }

  async search(query: string, options?: { limit?: number; type?: string[] }): Promise<ProviderSearchResult> {
    const limit = options?.limit || 20;
    const types = (options?.type || ['track', 'artist', 'album', 'playlist']).join(',');
    const encoded = encodeURIComponent(query);
    const data = await this.fetchApi<any>(`/search?q=${encoded}&type=${types}&limit=${limit}`);

    if (!data) {
      return { songs: [], artists: [], albums: [], playlists: [] };
    }

    const songs: Track[] = (data.tracks?.items || []).map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: {
        id: item.artists?.[0]?.id || '',
        name: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
        avatarUrl: item.album?.images?.[0]?.url,
      },
      album: {
        id: item.album?.id || '',
        name: item.album?.name || '',
        coverUrl: item.album?.images?.[0]?.url,
      },
      durationMs: item.duration_ms || 180000,
      popularity: item.popularity,
      previewUrl: item.preview_url || undefined,
      sourceType: 'stream',
      sourceId: item.id,
      coverUrl: item.album?.images?.[0]?.url,
      isFullLength: true,
    }));

    const artists: Artist[] = (data.artists?.items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      genres: item.genres || [],
      popularity: item.popularity,
      avatarUrl: item.images?.[0]?.url,
      images: item.images || [],
    }));

    const albums: Album[] = (data.albums?.items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      artistId: item.artists?.[0]?.id,
      artistName: item.artists?.map((a: any) => a.name).join(', '),
      coverUrl: item.images?.[0]?.url,
      images: item.images || [],
      releaseDate: item.release_date,
    }));

    const playlists: Playlist[] = (data.playlists?.items || []).filter(Boolean).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      coverUrl: item.images?.[0]?.url,
      isPublic: true,
      isCollaborative: false,
      userId: item.owner?.id || 'spotify',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return { songs, artists, albums, playlists };
  }

  async getTrack(id: string): Promise<Track | null> {
    const item = await this.fetchApi<any>(`/tracks/${id}`);
    if (!item) return null;

    return {
      id: item.id,
      title: item.name,
      artist: {
        id: item.artists?.[0]?.id || '',
        name: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      },
      album: {
        id: item.album?.id || '',
        name: item.album?.name || '',
        coverUrl: item.album?.images?.[0]?.url,
      },
      durationMs: item.duration_ms,
      popularity: item.popularity,
      previewUrl: item.preview_url || undefined,
      sourceType: 'stream',
      sourceId: item.id,
      coverUrl: item.album?.images?.[0]?.url,
    };
  }

  async getArtist(id: string): Promise<Artist | null> {
    const item = await this.fetchApi<any>(`/artists/${id}`);
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      genres: item.genres || [],
      popularity: item.popularity,
      avatarUrl: item.images?.[0]?.url,
      images: item.images || [],
    };
  }

  async getAlbum(id: string): Promise<Album | null> {
    const item = await this.fetchApi<any>(`/albums/${id}`);
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      artistId: item.artists?.[0]?.id,
      artistName: item.artists?.map((a: any) => a.name).join(', '),
      coverUrl: item.images?.[0]?.url,
      images: item.images || [],
      releaseDate: item.release_date,
    };
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const item = await this.fetchApi<any>(`/playlists/${id}`);
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      coverUrl: item.images?.[0]?.url,
      isPublic: item.public ?? true,
      isCollaborative: item.collaborative ?? false,
      userId: item.owner?.id || 'spotify',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
