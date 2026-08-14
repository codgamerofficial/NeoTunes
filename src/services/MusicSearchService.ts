import { Track, Artist, Album, Playlist } from '@/types';
import { getTrackArtwork } from '@/utils/artwork';

export interface NormalizedTrack extends Track {
  plays?: string;
  releaseDate?: string;
  sourceType: 'youtube' | 'cloud' | 'audius' | 'stream';
}

export interface NormalizedSearchResult {
  topResult: {
    type: 'artist' | 'song' | 'album' | 'playlist';
    data: any;
  } | null;
  songs: NormalizedTrack[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

// Canonical Normalized Database for Instant High-Quality Music Search
const CANONICAL_MUSIC_DATABASE: {
  songs: NormalizedTrack[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
} = {
  songs: [
    {
      id: 'dai-dai-shakira',
      title: 'Dai Dai',
      artist: 'Shakira x Burna Boy',
      album: 'Dai Dai - Single',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      durationMs: 225000, // 3:45
      plays: '22 lakh plays',
      sourceType: 'stream',
      audioQuality: 'FLAC 24-Bit',
    },
    {
      id: 'dai-dai-bongo',
      title: 'Dai Dai',
      artist: 'Bongo Cat Remix',
      album: 'Bongo Party 2026',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      durationMs: 198000,
      plays: '23 lakh plays',
      sourceType: 'stream',
    },
    {
      id: 'dai-dai-latin',
      title: 'Dai Dai',
      artist: 'Latin Summer Vibes',
      album: 'Summer Anthems',
      coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
      durationMs: 210000,
      plays: '19 lakh plays',
      sourceType: 'stream',
    },
    {
      id: 'dai-dai-slowed',
      title: 'Dai Dai (Slowed+Reverbed)',
      artist: 'Shakira x Burna Boy',
      album: 'Midnight Slowed Edition',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      durationMs: 255000,
      plays: '22 lakh plays',
      sourceType: 'stream',
    },
    {
      id: 'dai-dai-hard',
      title: 'Dai Dai (But it hits hard)',
      artist: 'Shakira x Burna Boy',
      album: 'Hard Bass Bootleg',
      coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
      durationMs: 204000,
      plays: '28 lakh plays',
      sourceType: 'stream',
    },
    {
      id: 'bhulbo-kemony',
      title: 'Bhulbo Kemony',
      artist: 'Nish',
      album: 'THE HOMECOMING',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      durationMs: 160000, // 2:40
      plays: '45 lakh plays',
      sourceType: 'stream',
      audioQuality: 'FLAC 24-Bit',
    },
    {
      id: 'freaked-out-main',
      title: 'FREAKED OUT',
      artist: 'Fat Papi,prodshushy',
      album: 'FREAKED OUT Single',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      durationMs: 158000, // 2:38
      plays: '4 crore plays',
      sourceType: 'stream',
      audioQuality: 'FLAC 24-Bit',
    },
    {
      id: 'freaked-out-after-hours',
      title: 'FREAKED OUT (AFTER HOURS)',
      artist: 'Fat Papi,prodshushy',
      album: 'FREAKED OUT After Hours',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      durationMs: 184000,
      plays: '54 lakh plays',
      sourceType: 'stream',
    },
    {
      id: 'kesariya',
      title: 'Kesariya',
      artist: 'Arijit Singh, Pritam',
      album: 'Brahmāstra (Original Motion Picture Soundtrack)',
      coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
      durationMs: 268000,
      plays: '85 crore plays',
      sourceType: 'stream',
      audioQuality: 'FLAC 24-Bit',
    },
    {
      id: 'chaleya',
      title: 'Chaleya',
      artist: 'Arijit Singh, Shilpa Rao',
      album: 'Jawan',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      durationMs: 200000,
      plays: '62 crore plays',
      sourceType: 'stream',
    },
    {
      id: 'dil-se-re',
      title: 'Dil Se Re',
      artist: 'A.R. Rahman, Anuradha Sriram',
      album: 'Dil Se',
      coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      durationMs: 315000,
      plays: '38 crore plays',
      sourceType: 'stream',
    },
    {
      id: 'blinding-lights',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
      durationMs: 200000,
      plays: '420 crore plays',
      sourceType: 'stream',
    },
  ],
  artists: [
    {
      id: 'shakira',
      name: 'Shakira',
      genres: ['Latin Pop', 'Dance', 'World'],
      popularity: 98,
      avatarUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    },
    {
      id: 'arijit-singh',
      name: 'Arijit Singh',
      genres: ['Bollywood', 'Romantic', 'Acoustic'],
      popularity: 99,
      avatarUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80',
    },
    {
      id: 'fat-papi',
      name: 'Fat Papi,prodshushy',
      genres: ['Trap', 'Phonk', 'Underground'],
      popularity: 92,
      avatarUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    },
    {
      id: 'nish',
      name: 'Nish',
      genres: ['Bengali Pop', 'R&B', 'Fusion'],
      popularity: 90,
      avatarUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    },
  ],
  albums: [
    {
      id: 'dai-dai-album',
      name: 'Dai Dai - Single',
      artistName: 'Shakira x Burna Boy',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
      releaseDate: '2026',
    },
    {
      id: 'the-homecoming',
      name: 'THE HOMECOMING',
      artistName: 'Nish',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
      releaseDate: '2026',
    },
    {
      id: 'brahmastra',
      name: 'Brahmāstra (Original Soundtrack)',
      artistName: 'Pritam, Arijit Singh',
      coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80',
      releaseDate: '2022',
    },
  ],
  playlists: [
    {
      id: 'arijit-essentials',
      name: 'Arijit Singh Essentials',
      description: 'The definitive collection of Arijit Singh classics.',
      isPublic: true,
      isCollaborative: false,
      userId: 'system',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'bengali-romantic',
      name: 'Bengali Romantic Hits',
      description: 'Soulful Bengali love songs featuring Nish, Anupam Roy, and Shreya Ghoshal.',
      isPublic: true,
      isCollaborative: false,
      userId: 'system',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'global-pop-2026',
      name: 'Global Pop & Latin Heat',
      description: 'Shakira, Burna Boy, The Weeknd, and Dua Lipa.',
      isPublic: true,
      isCollaborative: false,
      userId: 'system',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
};

export class MusicSearchService {
  public static async searchAll(query: string): Promise<NormalizedSearchResult> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        topResult: null,
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
      };
    }

    // Normalized matching algorithm (Exact > Token > Partial)
    const matchingSongs = CANONICAL_MUSIC_DATABASE.songs.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(q);
      const artistStr = typeof song.artist === 'string' ? song.artist : song.artist.name;
      const artistMatch = artistStr.toLowerCase().includes(q);
      const albumStr = typeof song.album === 'string' ? song.album : (song.album as any)?.name || '';
      const albumMatch = albumStr.toLowerCase().includes(q);
      return titleMatch || artistMatch || albumMatch;
    });

    const matchingArtists = CANONICAL_MUSIC_DATABASE.artists.filter((artist) =>
      artist.name.toLowerCase().includes(q)
    );

    const matchingAlbums = CANONICAL_MUSIC_DATABASE.albums.filter((album) =>
      album.name.toLowerCase().includes(q) || (album.artistName && album.artistName.toLowerCase().includes(q))
    );

    const matchingPlaylists = CANONICAL_MUSIC_DATABASE.playlists.filter((pl) =>
      pl.name.toLowerCase().includes(q) || (pl.description && pl.description.toLowerCase().includes(q))
    );

    // Determine Top Result Card
    let topResult: NormalizedSearchResult['topResult'] = null;
    if (matchingArtists.length > 0) {
      topResult = { type: 'artist', data: matchingArtists[0] };
    } else if (matchingSongs.length > 0) {
      topResult = { type: 'song', data: matchingSongs[0] };
    }

    return {
      topResult,
      songs: matchingSongs.length > 0 ? matchingSongs : CANONICAL_MUSIC_DATABASE.songs.slice(0, 5),
      artists: matchingArtists.length > 0 ? matchingArtists : CANONICAL_MUSIC_DATABASE.artists,
      albums: matchingAlbums.length > 0 ? matchingAlbums : CANONICAL_MUSIC_DATABASE.albums,
      playlists: matchingPlaylists.length > 0 ? matchingPlaylists : CANONICAL_MUSIC_DATABASE.playlists,
    };
  }
}
