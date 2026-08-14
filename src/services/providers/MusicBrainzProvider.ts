import { MusicProvider, ProviderName, ProviderSearchResult } from './types';
import { Track, Artist, Album, Playlist } from '@/types';

export class MusicBrainzProvider implements MusicProvider {
  readonly name: ProviderName = 'musicbrainz';

  get isConfigured(): boolean {
    return true; // MusicBrainz public open API
  }

  private async fetchMb<T>(endpoint: string): Promise<T | null> {
    try {
      const res = await fetch(`https://musicbrainz.org/ws/2${endpoint}&fmt=json`, {
        headers: {
          'User-Agent': 'NeoTunes/1.0.0 ( contact@neotunes.app )',
        },
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch (err) {
      console.warn(`[MusicBrainzProvider] Request failed (${endpoint}):`, err);
      return null;
    }
  }

  async search(query: string, options?: { limit?: number }): Promise<ProviderSearchResult> {
    const limit = options?.limit || 10;
    const encoded = encodeURIComponent(query);

    const [artistData, recordingData] = await Promise.all([
      this.fetchMb<any>(`/artist/?query=${encoded}&limit=${limit}`),
      this.fetchMb<any>(`/recording/?query=${encoded}&limit=${limit}`),
    ]);

    const artists: Artist[] = (artistData?.artists || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      genres: (item.tags || []).slice(0, 3).map((t: any) => t.name),
      popularity: item.score || 50,
      avatarUrl: `https://coverartarchive.org/release-group/${item.id}/front`,
    }));

    const songs: Track[] = (recordingData?.recordings || []).map((item: any) => {
      const artistName = item['artist-credit']?.[0]?.name || 'Unknown Artist';
      const releaseName = item.releases?.[0]?.title || 'Single';
      const releaseId = item.releases?.[0]?.id;
      return {
        id: `mb_${item.id}`,
        title: item.title,
        artist: artistName,
        album: releaseName,
        durationMs: item.length || 180000,
        sourceType: 'cloud',
        sourceId: item.id,
        coverUrl: releaseId ? `https://coverartarchive.org/release/${releaseId}/front-250` : undefined,
      };
    });

    return { songs, artists, albums: [], playlists: [] };
  }

  async getTrack(id: string): Promise<Track | null> {
    const mbId = id.replace(/^mb_/, '');
    const data = await this.fetchMb<any>(`/recording/${mbId}?inc=artists+releases`);
    if (!data) return null;

    const artistName = data['artist-credit']?.[0]?.name || 'Unknown Artist';
    const releaseName = data.releases?.[0]?.title || 'Single';
    const releaseId = data.releases?.[0]?.id;

    return {
      id: `musicbrainz:track:${data.id}`,
      canonicalId: `musicbrainz:track:${data.id}`,
      source: 'jiosaavn' as any,
      sourceId: data.id,
      title: data.title,
      artists: [artistName],
      artist: artistName,
      album: releaseName,
      duration: Math.floor((data.length || 180000) / 1000),
      durationMs: data.length || 180000,
      artworkUrl: releaseId ? `https://coverartarchive.org/release/${releaseId}/front-250` : undefined,
      coverUrl: releaseId ? `https://coverartarchive.org/release/${releaseId}/front-250` : undefined,
      playable: true,
    };
  }

  async getArtist(id: string): Promise<Artist | null> {
    const data = await this.fetchMb<any>(`/artist/${id}?inc=tags`);
    if (!data) return null;
    return {
      id: `musicbrainz:artist:${data.id}`,
      canonicalId: `musicbrainz:artist:${data.id}`,
      source: 'spotify',
      sourceId: data.id,
      name: data.name,
      genres: (data.tags || []).map((t: any) => t.name),
      followers: 100000,
    };
  }

  async getAlbum(id: string): Promise<Album | null> {
    const data = await this.fetchMb<any>(`/release/${id}?inc=artists`);
    if (!data) return null;
    return {
      id: `musicbrainz:album:${data.id}`,
      canonicalId: `musicbrainz:album:${data.id}`,
      source: 'spotify',
      sourceId: data.id,
      title: data.title,
      name: data.title,
      artists: [data['artist-credit']?.[0]?.name || 'Artist'],
      artistName: data['artist-credit']?.[0]?.name,
      artworkUrl: `https://coverartarchive.org/release/${data.id}/front`,
      coverUrl: `https://coverartarchive.org/release/${data.id}/front`,
      releaseDate: data.date,
    };
  }

  async getPlaylist(): Promise<Playlist | null> {
    return null;
  }
}
