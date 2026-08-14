import { MusicProvider, ProviderName, ProviderSearchResult } from './types';
import { Track, Artist, Album, Playlist, getCanonicalId } from '@/types';
import { getSpotifyAccessToken } from '@/services/spotify';

export class SpotifyProvider implements MusicProvider {
  readonly name: ProviderName = 'spotify';

  get isConfigured(): boolean {
    return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
  }

  private async fetchApi<T>(endpoint: string): Promise<T | null> {
    try {
      const token = await getSpotifyAccessToken();
      if (!token) return null;
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

  async search(
    query: string,
    options?: { limit?: number; offset?: number; market?: string; type?: string[] }
  ): Promise<ProviderSearchResult> {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const market = options?.market || 'IN';
    const types = (options?.type || ['track', 'artist', 'album', 'playlist']).join(',');
    const encoded = encodeURIComponent(query);
    
    const data = await this.fetchApi<any>(
      `/search?q=${encoded}&type=${types}&limit=${limit}&offset=${offset}&market=${market}`
    );

    if (!data) {
      return { songs: [], artists: [], albums: [], playlists: [] };
    }

    const songs: Track[] = (data.tracks?.items || []).filter(Boolean).map((item: any) => {
      const canonicalId = getCanonicalId('spotify', item.id, 'track');
      const artistNames = item.artists?.map((a: any) => a.name) || ['Unknown Artist'];
      const artistIds = item.artists?.map((a: any) => a.id) || [];
      const primaryArtist = artistNames.join(', ');
      
      const images = item.album?.images || [];
      const artworkLarge = images[0]?.url;
      const artworkMedium = images[1]?.url || images[0]?.url;
      const artworkSmall = images[2]?.url || images[1]?.url || images[0]?.url;
      const artworkUrl = artworkLarge || artworkMedium || '';

      const durationMs = item.duration_ms || 180000;

      return {
        id: canonicalId,
        canonicalId,
        source: 'spotify',
        sourceId: item.id,
        title: item.name,
        artists: artistNames,
        artistIds,
        artist: {
          id: artistIds[0] || '',
          name: primaryArtist,
          avatarUrl: artworkUrl,
        },
        album: item.album?.name || 'Single',
        albumId: item.album?.id,
        artworkUrl,
        artworkSmall,
        artworkMedium,
        artworkLarge,
        coverUrl: artworkUrl,
        duration: Math.floor(durationMs / 1000),
        durationMs,
        releaseDate: item.album?.release_date,
        popularity: item.popularity || 50,
        previewUrl: item.preview_url || undefined,
        playable: true,
        externalUrl: item.external_urls?.spotify,
        sourceType: 'stream',
        isFullLength: true,
      };
    });

    const artists: Artist[] = (data.artists?.items || []).filter(Boolean).map((item: any) => {
      const canonicalId = getCanonicalId('spotify', item.id, 'artist');
      const imageUrl = item.images?.[0]?.url;
      return {
        id: canonicalId,
        canonicalId,
        source: 'spotify',
        sourceId: item.id,
        name: item.name,
        imageUrl,
        avatarUrl: imageUrl,
        genres: item.genres || [],
        followers: item.followers?.total || 0,
        popularity: item.popularity || 0,
        externalUrl: item.external_urls?.spotify,
        images: item.images || [],
      };
    });

    const albums: Album[] = (data.albums?.items || []).filter(Boolean).map((item: any) => {
      const canonicalId = getCanonicalId('spotify', item.id, 'album');
      const artworkUrl = item.images?.[0]?.url;
      const artistNames = item.artists?.map((a: any) => a.name) || [];
      return {
        id: canonicalId,
        canonicalId,
        source: 'spotify',
        sourceId: item.id,
        title: item.name,
        name: item.name,
        artists: artistNames,
        artistId: item.artists?.[0]?.id,
        artistName: artistNames.join(', '),
        artworkUrl,
        coverUrl: artworkUrl,
        images: item.images || [],
        releaseDate: item.release_date,
        totalTracks: item.total_tracks,
        externalUrl: item.external_urls?.spotify,
      };
    });

    const playlists: Playlist[] = (data.playlists?.items || []).filter(Boolean).map((item: any) => {
      const canonicalId = getCanonicalId('spotify', item.id, 'playlist');
      const artworkUrl = item.images?.[0]?.url;
      return {
        id: canonicalId,
        canonicalId,
        source: 'spotify',
        sourceId: item.id,
        name: item.name,
        description: item.description || '',
        owner: item.owner?.display_name || 'Spotify',
        artworkUrl,
        coverUrl: artworkUrl,
        totalTracks: item.tracks?.total || 0,
        externalUrl: item.external_urls?.spotify,
        isPublic: item.public ?? true,
        isCollaborative: item.collaborative ?? false,
        userId: item.owner?.id || 'spotify',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    return { songs, artists, albums, playlists };
  }

  async getTrack(id: string): Promise<Track | null> {
    const cleanId = id.replace(/^spotify:(track:)?/, '');
    const item = await this.fetchApi<any>(`/tracks/${cleanId}`);
    if (!item) return null;

    const canonicalId = getCanonicalId('spotify', item.id, 'track');
    const artistNames = item.artists?.map((a: any) => a.name) || ['Unknown Artist'];
    const artistIds = item.artists?.map((a: any) => a.id) || [];
    const artworkUrl = item.album?.images?.[0]?.url || '';
    const durationMs = item.duration_ms || 180000;

    return {
      id: canonicalId,
      canonicalId,
      source: 'spotify',
      sourceId: item.id,
      title: item.name,
      artists: artistNames,
      artistIds,
      artist: {
        id: artistIds[0] || '',
        name: artistNames.join(', '),
        avatarUrl: artworkUrl,
      },
      album: item.album?.name || 'Single',
      albumId: item.album?.id,
      artworkUrl,
      artworkLarge: artworkUrl,
      coverUrl: artworkUrl,
      duration: Math.floor(durationMs / 1000),
      durationMs,
      releaseDate: item.album?.release_date,
      popularity: item.popularity,
      previewUrl: item.preview_url || undefined,
      playable: true,
      externalUrl: item.external_urls?.spotify,
      sourceType: 'stream',
      isFullLength: true,
    };
  }

  async getArtist(id: string): Promise<Artist | null> {
    const cleanId = id.replace(/^spotify:(artist:)?/, '');
    const item = await this.fetchApi<any>(`/artists/${cleanId}`);
    if (!item) return null;

    const canonicalId = getCanonicalId('spotify', item.id, 'artist');
    const imageUrl = item.images?.[0]?.url;

    return {
      id: canonicalId,
      canonicalId,
      source: 'spotify',
      sourceId: item.id,
      name: item.name,
      imageUrl,
      avatarUrl: imageUrl,
      genres: item.genres || [],
      followers: item.followers?.total || 0,
      popularity: item.popularity || 0,
      externalUrl: item.external_urls?.spotify,
      images: item.images || [],
    };
  }

  async getArtistTopTracks(id: string, market: string = 'IN'): Promise<Track[]> {
    const cleanId = id.replace(/^spotify:(artist:)?/, '');
    const data = await this.fetchApi<any>(`/artists/${cleanId}/top-tracks?market=${market}`);
    if (!data?.tracks) return [];

    return data.tracks.map((item: any) => {
      const canonicalId = getCanonicalId('spotify', item.id, 'track');
      const artistNames = item.artists?.map((a: any) => a.name) || ['Unknown Artist'];
      const artworkUrl = item.album?.images?.[0]?.url || '';
      const durationMs = item.duration_ms || 180000;

      return {
        id: canonicalId,
        canonicalId,
        source: 'spotify',
        sourceId: item.id,
        title: item.name,
        artists: artistNames,
        artist: artistNames.join(', '),
        album: item.album?.name || 'Single',
        albumId: item.album?.id,
        artworkUrl,
        coverUrl: artworkUrl,
        duration: Math.floor(durationMs / 1000),
        durationMs,
        releaseDate: item.album?.release_date,
        popularity: item.popularity,
        playable: true,
        sourceType: 'stream',
      };
    });
  }

  async getAlbum(id: string): Promise<Album | null> {
    const cleanId = id.replace(/^spotify:(album:)?/, '');
    const item = await this.fetchApi<any>(`/albums/${cleanId}`);
    if (!item) return null;

    const canonicalId = getCanonicalId('spotify', item.id, 'album');
    const artworkUrl = item.images?.[0]?.url;
    const artistNames = item.artists?.map((a: any) => a.name) || [];

    return {
      id: canonicalId,
      canonicalId,
      source: 'spotify',
      sourceId: item.id,
      title: item.name,
      name: item.name,
      artists: artistNames,
      artistId: item.artists?.[0]?.id,
      artistName: artistNames.join(', '),
      artworkUrl,
      coverUrl: artworkUrl,
      images: item.images || [],
      releaseDate: item.release_date,
      totalTracks: item.total_tracks,
      externalUrl: item.external_urls?.spotify,
    };
  }

  async getAlbumTracks(id: string): Promise<Track[]> {
    const cleanId = id.replace(/^spotify:(album:)?/, '');
    const album = await this.getAlbum(cleanId);
    const data = await this.fetchApi<any>(`/albums/${cleanId}/tracks?limit=50`);
    if (!data?.items) return [];

    return data.items.map((item: any) => {
      const canonicalId = getCanonicalId('spotify', item.id, 'track');
      const artistNames = item.artists?.map((a: any) => a.name) || (album ? album.artists : ['Unknown Artist']);
      const artworkUrl = album?.artworkUrl || '';
      const durationMs = item.duration_ms || 180000;

      return {
        id: canonicalId,
        canonicalId,
        source: 'spotify',
        sourceId: item.id,
        title: item.name,
        artists: artistNames,
        artist: artistNames.join(', '),
        album: album?.title || 'Album',
        albumId: cleanId,
        artworkUrl,
        coverUrl: artworkUrl,
        duration: Math.floor(durationMs / 1000),
        durationMs,
        playable: true,
        sourceType: 'stream',
      };
    });
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const cleanId = id.replace(/^spotify:(playlist:)?/, '');
    const item = await this.fetchApi<any>(`/playlists/${cleanId}`);
    if (!item) return null;

    const canonicalId = getCanonicalId('spotify', item.id, 'playlist');
    const artworkUrl = item.images?.[0]?.url;

    const tracks: Track[] = (item.tracks?.items || []).filter(Boolean).map((tItem: any) => {
      const trackObj = tItem.track;
      if (!trackObj) return null;
      const tCanonicalId = getCanonicalId('spotify', trackObj.id, 'track');
      const artistNames = trackObj.artists?.map((a: any) => a.name) || ['Unknown Artist'];
      const tArtworkUrl = trackObj.album?.images?.[0]?.url || artworkUrl || '';
      const durationMs = trackObj.duration_ms || 180000;

      return {
        id: tCanonicalId,
        canonicalId: tCanonicalId,
        source: 'spotify',
        sourceId: trackObj.id,
        title: trackObj.name,
        artists: artistNames,
        artist: artistNames.join(', '),
        album: trackObj.album?.name || 'Single',
        artworkUrl: tArtworkUrl,
        coverUrl: tArtworkUrl,
        duration: Math.floor(durationMs / 1000),
        durationMs,
        playable: true,
        sourceType: 'stream',
      };
    }).filter(Boolean);

    return {
      id: canonicalId,
      canonicalId,
      source: 'spotify',
      sourceId: item.id,
      name: item.name,
      description: item.description || '',
      owner: item.owner?.display_name || 'Spotify',
      artworkUrl,
      coverUrl: artworkUrl,
      totalTracks: item.tracks?.total || tracks.length,
      externalUrl: item.external_urls?.spotify,
      isPublic: item.public ?? true,
      isCollaborative: item.collaborative ?? false,
      userId: item.owner?.id || 'spotify',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tracks,
    };
  }
}

