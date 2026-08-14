import { MusicProvider, ProviderName, ProviderSearchResult } from './types';
import { Track, Artist, Album, Playlist } from '@/types';

export class YouTubeProvider implements MusicProvider {
  readonly name: ProviderName = 'youtube';

  get isConfigured(): boolean {
    return Boolean(process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY);
  }

  private get apiKey(): string {
    return process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
  }

  async search(query: string, options?: { limit?: number }): Promise<ProviderSearchResult> {
    const limit = options?.limit || 15;
    if (!this.isConfigured) {
      return { songs: [], artists: [], albums: [], playlists: [], videos: [] };
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=${limit}&key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return { songs: [], artists: [], albums: [], playlists: [], videos: [] };

      const data = await res.json();
      const items = data.items || [];

      const videos = items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        durationMs: 180000,
      }));

      const songs: Track[] = items.map((item: any) => ({
        id: `yt_${item.id.videoId}`,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        album: 'YouTube Music',
        durationMs: 180000,
        sourceType: 'youtube',
        sourceId: item.id.videoId,
        coverUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        isFullLength: true,
      }));

      return { songs, artists: [], albums: [], playlists: [], videos };
    } catch (err) {
      console.warn('[YouTubeProvider] Search failed:', err);
      return { songs: [], artists: [], albums: [], playlists: [], videos: [] };
    }
  }

  async getTrack(id: string): Promise<Track | null> {
    const videoId = id.replace(/^yt_/, '');
    if (!this.isConfigured) return null;

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return null;

      const data = await res.json();
      const item = data.items?.[0];
      if (!item) return null;

      return {
        id: `youtube:track:${item.id}`,
        canonicalId: `youtube:track:${item.id}`,
        source: 'youtube',
        sourceId: item.id,
        title: item.snippet.title,
        artists: [item.snippet.channelTitle],
        artist: item.snippet.channelTitle,
        album: 'YouTube Music',
        duration: 180,
        durationMs: 180000,
        artworkUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        coverUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        playable: true,
      };
    } catch (err) {
      console.warn('[YouTubeProvider] getTrack failed:', err);
      return null;
    }
  }

  async getArtist(): Promise<Artist | null> {
    return null;
  }

  async getAlbum(): Promise<Album | null> {
    return null;
  }

  async getPlaylist(): Promise<Playlist | null> {
    return null;
  }
}
