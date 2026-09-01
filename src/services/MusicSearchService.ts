import { Track, Artist, Album, Playlist, getCanonicalId } from '@/types';
import { spotifyProvider } from './providers';

export interface NormalizedSearchResult {
  topResult: {
    type: 'artist' | 'song' | 'album' | 'playlist';
    data: Track | Artist | Album | Playlist;
  } | null;
  songs: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  market?: string;
  type?: ('track' | 'artist' | 'album' | 'playlist')[];
  signal?: AbortSignal;
}

// 10-Tier Search Ranking score calculation
function calculateRelevanceScore(
  itemTitle: string,
  itemArtist: string = '',
  itemAlbum: string = '',
  query: string
): number {
  const q = query.toLowerCase().trim();
  const title = itemTitle.toLowerCase().trim();
  const artist = itemArtist.toLowerCase().trim();
  const album = itemAlbum.toLowerCase().trim();

  if (!q || !title) return 0;

  // Tier 1: Exact Title Match
  if (title === q) return 100;

  // Tier 2: Exact Artist Match
  if (artist === q) return 90;

  // Tier 3: Exact Album Match
  if (album === q) return 85;

  // Tier 5: Prefix Title Match
  if (title.startsWith(q)) return 75;

  // Tier 6: Token Match in Title
  const queryTokens = q.split(/\s+/).filter(Boolean);
  const titleTokens = title.split(/\s+/).filter(Boolean);
  const artistTokens = artist.split(/\s+/).filter(Boolean);

  const titleTokenMatches = queryTokens.filter((token) =>
    titleTokens.some((t) => t.includes(token) || token.includes(t))
  );
  if (titleTokenMatches.length === queryTokens.length) return 70;

  // Tier 7: Artist Token Match
  const artistTokenMatches = queryTokens.filter((token) =>
    artistTokens.some((a) => a.includes(token) || token.includes(a))
  );
  if (artistTokenMatches.length === queryTokens.length) return 65;

  // Tier 8: Partial Substring Match
  if (title.includes(q)) return 60;
  if (artist.includes(q)) return 55;
  if (album.includes(q)) return 50;

  // Tier 9: Any Token Substring Match
  if (titleTokenMatches.length > 0) return 40;
  if (artistTokenMatches.length > 0) return 35;

  return 0;
}

export class MusicSearchService {
  public static async searchAll(
    query: string,
    options?: SearchOptions
  ): Promise<NormalizedSearchResult> {
    const q = query.trim();
    if (!q) {
      return {
        topResult: null,
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
      };
    }

    try {
      // 1. Try querying /api/search API route (or fallback to direct SpotifyProvider)
      const params = new URLSearchParams({ q });
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.offset) params.set('offset', String(options.offset));

      let res: Response | null = null;
      try {
        const baseUrl =
          typeof window !== 'undefined'
            ? ''
            : `http://localhost:${process.env.PORT || '3002'}`;
        res = await fetch(`${baseUrl}/api/search?${params.toString()}`, {
          signal: options?.signal,
        });
      } catch (e) {
        // Fetch failed or aborted
        if ((e as any)?.name === 'AbortError') throw e;
      }

      let songs: Track[] = [];
      let artists: Artist[] = [];
      let albums: Album[] = [];
      let playlists: Playlist[] = [];

      if (res && res.ok) {
        const data = await res.json();
        
        songs = (data.songs || []).map((s: any) => {
          const canonicalId = s.canonicalId || s.id || getCanonicalId(s.source || 'spotify', s.sourceId || s.id, 'track');
          const artistName = typeof s.artist === 'string' ? s.artist : (s.artist?.name || s.artists?.join(', ') || 'Unknown Artist');
          const artistArr = Array.isArray(s.artists) ? s.artists : [artistName];
          const artworkUrl = s.artworkUrl || s.coverUrl || s.album?.coverUrl || '';
          
          return {
            id: canonicalId,
            canonicalId,
            source: s.source || 'spotify',
            sourceId: s.sourceId || s.id,
            title: s.title,
            artists: artistArr,
            artist: artistName,
            album: typeof s.album === 'string' ? s.album : (s.album?.name || 'Single'),
            albumId: s.album?.id,
            artworkUrl,
            coverUrl: artworkUrl,
            duration: s.duration || Math.floor((s.durationMs || 180000) / 1000),
            durationMs: s.durationMs || (s.duration ? s.duration * 1000 : 180000),
            releaseDate: s.releaseDate,
            popularity: s.popularity || 50,
            playable: true,
            sourceType: s.sourceType || 'stream',
          } as Track;
        });

        artists = (data.artists || []).map((a: any) => {
          const canonicalId = a.canonicalId || a.id || getCanonicalId(a.source || 'spotify', a.sourceId || a.id, 'artist');
          const imageUrl = a.imageUrl || a.avatarUrl || a.coverUrl || '';
          return {
            id: canonicalId,
            canonicalId,
            source: a.source || 'spotify',
            sourceId: a.sourceId || a.id,
            name: a.name,
            imageUrl,
            avatarUrl: imageUrl,
            genres: a.genres || [],
            followers: a.followers || 0,
            popularity: a.popularity || 0,
          } as Artist;
        });

        albums = (data.albums || []).map((al: any) => {
          const canonicalId = al.canonicalId || al.id || getCanonicalId(al.source || 'spotify', al.sourceId || al.id, 'album');
          const artworkUrl = al.artworkUrl || al.coverUrl || '';
          return {
            id: canonicalId,
            canonicalId,
            source: al.source || 'spotify',
            sourceId: al.sourceId || al.id,
            title: al.title || al.name,
            name: al.title || al.name,
            artists: Array.isArray(al.artists) ? al.artists : [al.artistName || al.artist?.name || 'Artist'],
            artistName: al.artistName || al.artist?.name,
            artworkUrl,
            coverUrl: artworkUrl,
            releaseDate: al.releaseDate,
          } as Album;
        });

        playlists = (data.playlists || []).map((p: any) => {
          const canonicalId = p.canonicalId || p.id || getCanonicalId(p.source || 'spotify', p.sourceId || p.id, 'playlist');
          const artworkUrl = p.artworkUrl || p.coverUrl || '';
          return {
            id: canonicalId,
            canonicalId,
            source: p.source || 'spotify',
            sourceId: p.sourceId || p.id,
            name: p.name,
            description: p.description || '',
            owner: p.owner || 'Spotify',
            artworkUrl,
            coverUrl: artworkUrl,
            totalTracks: p.totalTracks || p.trackCount || 0,
          } as Playlist;
        });
      } else {
        // Fallback directly to SpotifyProvider
        const providerRes = await spotifyProvider.search(q, {
          limit: options?.limit || 20,
          offset: options?.offset || 0,
          market: options?.market || 'IN',
        });
        songs = providerRes.songs;
        artists = providerRes.artists;
        albums = providerRes.albums;
        playlists = providerRes.playlists;
      }

      // Filter and Rank Songs
      let rankedSongs = songs
        .map((song) => {
          const artistName = Array.isArray(song.artists) ? song.artists.map((a) => (typeof a === 'string' ? a : (a as any)?.name || '')).join(', ') : (song.artist as any)?.name || (typeof song.artist === 'string' ? song.artist : '');
          const albumName = typeof song.album === 'string' ? song.album : (song.album as any)?.name || '';
          const score = calculateRelevanceScore(song.title, artistName, albumName, q);
          return { song, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || (b.song.popularity || 0) - (a.song.popularity || 0))
        .map((item) => item.song);

      // If strict token match yields 0 (for mood/genre queries like "Bengali acoustic melodies"), preserve provider returned songs
      if (rankedSongs.length === 0 && songs.length > 0) {
        rankedSongs = songs;
      }

      // Filter and Rank Artists strictly
      const rankedArtists = artists
        .map((artist) => {
          const score = calculateRelevanceScore(artist.name, '', '', q);
          return { artist, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || (b.artist.popularity || 0) - (a.artist.popularity || 0))
        .map((item) => item.artist);

      // Filter and Rank Albums strictly
      const rankedAlbums = albums
        .map((album) => {
          const artistName = Array.isArray(album.artists) ? album.artists.join(', ') : album.artistName || '';
          const score = calculateRelevanceScore(album.title || album.name || '', artistName, '', q);
          return { album, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.album);

      // Filter and Rank Playlists strictly
      const rankedPlaylists = playlists
        .map((playlist) => {
          const score = calculateRelevanceScore(playlist.name, playlist.description || '', '', q);
          return { playlist, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.playlist);

      // Calculate Top Result
      let topResult: NormalizedSearchResult['topResult'] = null;
      if (rankedArtists.length > 0 && rankedArtists[0].name.toLowerCase().trim() === q.toLowerCase().trim()) {
        topResult = { type: 'artist', data: rankedArtists[0] };
      } else if (rankedSongs.length > 0) {
        topResult = { type: 'song', data: rankedSongs[0] };
      } else if (rankedArtists.length > 0) {
        topResult = { type: 'artist', data: rankedArtists[0] };
      } else if (rankedAlbums.length > 0) {
        topResult = { type: 'album', data: rankedAlbums[0] };
      } else if (rankedPlaylists.length > 0) {
        topResult = { type: 'playlist', data: rankedPlaylists[0] };
      }

      return {
        topResult,
        songs: rankedSongs,
        artists: rankedArtists,
        albums: rankedAlbums,
        playlists: rankedPlaylists,
      };
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        throw err;
      }
      console.warn('[MusicSearchService] Search failed:', err);
      return {
        topResult: null,
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
      };
    }
  }

  public static async search(
    query: string,
    options?: SearchOptions
  ): Promise<NormalizedSearchResult> {
    return this.searchAll(query, options);
  }

  public static async searchTracks(
    query: string,
    options?: SearchOptions
  ): Promise<Track[]> {
    const res = await this.searchAll(query, { ...options, type: ['track'] });
    return res.songs;
  }

  public static async searchArtists(
    query: string,
    options?: SearchOptions
  ): Promise<Artist[]> {
    const res = await this.searchAll(query, { ...options, type: ['artist'] });
    return res.artists;
  }

  public static async searchAlbums(
    query: string,
    options?: SearchOptions
  ): Promise<Album[]> {
    const res = await this.searchAll(query, { ...options, type: ['album'] });
    return res.albums;
  }

  public static async searchPlaylists(
    query: string,
    options?: SearchOptions
  ): Promise<Playlist[]> {
    const res = await this.searchAll(query, { ...options, type: ['playlist'] });
    return res.playlists;
  }
}


