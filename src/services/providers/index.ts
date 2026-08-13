import { SpotifyProvider } from './SpotifyProvider';
import { YouTubeProvider } from './YouTubeProvider';
import { MusicBrainzProvider } from './MusicBrainzProvider';
import { ProviderSearchResult, MusicProvider } from './types';
import { Track, Artist, Album, Playlist } from '@/types';
import { correctSpelling, classifySemanticIntent } from '@/lib/searchEngine';

export const spotifyProvider = new SpotifyProvider();
export const youtubeProvider = new YouTubeProvider();
export const musicBrainzProvider = new MusicBrainzProvider();

export const providers: MusicProvider[] = [
  spotifyProvider,
  youtubeProvider,
  musicBrainzProvider,
];

export interface AggregatedSearchResults {
  correctedQuery?: string;
  intent: ReturnType<typeof classifySemanticIntent>;
  songs: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
  videos: Array<{
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    durationMs: number;
  }>;
}

export async function aggregateSearch(query: string): Promise<AggregatedSearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      intent: { intent: 'general', tags: [] },
      songs: [],
      artists: [],
      albums: [],
      playlists: [],
      videos: [],
    };
  }

  // 1. Spell correction check
  const { corrected, changed } = correctSpelling(trimmed);
  const activeQuery = changed ? corrected : trimmed;

  // 2. Classify semantic intent
  const intent = classifySemanticIntent(activeQuery);

  // 3. Query configured providers in parallel
  const results = await Promise.allSettled(
    providers.map((p) => (p.isConfigured ? p.search(activeQuery) : Promise.resolve(null)))
  );

  const songsMap = new Map<string, Track>();
  const artistsMap = new Map<string, Artist>();
  const albumsMap = new Map<string, Album>();
  const playlistsMap = new Map<string, Playlist>();
  const videosList: Array<{
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    durationMs: number;
  }> = [];

  results.forEach((res) => {
    if (res.status === 'fulfilled' && res.value) {
      const data: ProviderSearchResult = res.value;

      data.songs.forEach((song) => {
        const key = `${song.title.toLowerCase().trim()}_${typeof song.artist === 'string' ? song.artist.toLowerCase() : song.artist.name.toLowerCase()}`;
        if (!songsMap.has(key)) {
          songsMap.set(key, song);
        }
      });

      data.artists.forEach((artist) => {
        const key = artist.name.toLowerCase().trim();
        if (!artistsMap.has(key)) {
          artistsMap.set(key, artist);
        }
      });

      data.albums.forEach((album) => {
        const key = `${album.name.toLowerCase().trim()}_${(album.artistName || '').toLowerCase()}`;
        if (!albumsMap.has(key)) {
          albumsMap.set(key, album);
        }
      });

      data.playlists.forEach((playlist) => {
        if (!playlistsMap.has(playlist.id)) {
          playlistsMap.set(playlist.id, playlist);
        }
      });

      if (data.videos) {
        videosList.push(...data.videos);
      }
    }
  });

  return {
    correctedQuery: changed ? corrected : undefined,
    intent,
    songs: Array.from(songsMap.values()),
    artists: Array.from(artistsMap.values()),
    albums: Array.from(albumsMap.values()),
    playlists: Array.from(playlistsMap.values()),
    videos: videosList,
  };
}
