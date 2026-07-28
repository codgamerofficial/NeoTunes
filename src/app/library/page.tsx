'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import {
  Library as LibraryIcon,
  Plus,
  Play,
  Heart,
  Disc,
  Users,
  FolderDown,
  List,
  Grid,
  Search,
  CheckCircle2,
  ListMusic,
} from 'lucide-react';

type FilterType = 'All' | 'Playlists' | 'Albums' | 'Artists' | 'Liked' | 'Downloaded';

interface LibraryItem {
  id: string;
  title: string;
  type: string;
  subtitle: string;
  cover: string;
}

const MOCK_PLAYLISTS: LibraryItem[] = [
  { id: 'chill-hits', title: 'Chill Hits', type: 'Playlist', subtitle: '50 tracks', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: 'lo-fi-beats', title: 'Lo-Fi Coding Beats', type: 'Playlist', subtitle: '40 tracks', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  { id: 'bollywood-classics', title: 'Bollywood Classics', type: 'Playlist', subtitle: '65 tracks', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
  { id: 'workout-energy', title: 'High Energy Workout', type: 'Playlist', subtitle: '30 tracks', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
];

const MOCK_ALBUMS: LibraryItem[] = [
  { id: 'love-aaj-kal', title: 'Love Aaj Kal', type: 'Album', subtitle: 'Pritam & Arijit Singh', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: 'after-hours', title: 'After Hours', type: 'Album', subtitle: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
  { id: 'endless-summer', title: 'Endless Summer Vacation', type: 'Album', subtitle: 'Miley Cyrus', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
];

const MOCK_ARTISTS: LibraryItem[] = [
  { id: 'arijit-singh', title: 'Arijit Singh', type: 'Artist', subtitle: '42.5M Followers', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  { id: 'the-weeknd', title: 'The Weeknd', type: 'Artist', subtitle: '105M Followers', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
  { id: 'coldplay', title: 'Coldplay', type: 'Artist', subtitle: '82M Followers', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
];

export default function LibraryPage() {
  const router = useRouter();
  const { playTrack } = usePlaybackStore();
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch count of liked tracks
  const { data: likedData } = useQuery<{ tracks: any[] }>({
    queryKey: ['liked-songs'],
    queryFn: async () => {
      const res = await fetch('/api/liked');
      if (!res.ok) return { tracks: [] };
      return res.json();
    },
  });

  const likedCount = likedData?.tracks?.length || 0;

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#121212] text-white font-sans select-none">
      
      {/* 1. Header & Actions */}
      <div className="flex items-center justify-between pb-6 border-b border-[#181818]">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LibraryIcon className="h-8 w-8 text-[#29B6F6]" /> Your Library
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1">Playlists, albums, followed artists, and saved music.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/playlists')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#29B6F6] text-black font-bold text-xs hover:scale-105 transition-all shadow-lg"
          >
            <Plus className="h-4 w-4" /> Create Playlist
          </button>

          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-full border border-[#282828]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-[#282828] text-white' : 'text-[#B3B3B3] hover:text-white'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-[#282828] text-white' : 'text-[#B3B3B3] hover:text-white'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Pills & Library Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Playlists', 'Albums', 'Artists', 'Liked', 'Downloaded'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-white text-black font-extrabold'
                  : 'bg-[#181818] hover:bg-[#282828] text-[#B3B3B3] hover:text-white border border-[#282828]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search within library */}
        <div className="relative flex items-center w-full sm:w-64">
          <Search className="absolute left-3 h-3.5 w-3.5 text-[#B3B3B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in Library..."
            className="w-full bg-[#181818] border border-[#282828] focus:border-[#29B6F6] rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#B3B3B3] outline-none transition-all"
          />
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          
          {/* LIKED SONGS FEATURED CARD */}
          {(activeFilter === 'All' || activeFilter === 'Liked') && (
            <div
              onClick={() => router.push('/liked')}
              className="col-span-2 sm:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/80 via-blue-900/50 to-[#181818] border border-blue-500/20 cursor-pointer group flex flex-col justify-between h-56 relative shadow-xl hover:scale-[1.02] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-full bg-[#29B6F6] text-black shadow-lg">
                  <Heart className="h-6 w-6 fill-black" />
                </div>
                <button className="h-12 w-12 rounded-full bg-[#29B6F6] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-5 w-5 fill-black translate-x-0.5" />
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white">Liked Songs</h2>
                <p className="text-xs font-semibold text-[#29B6F6] mt-1">{likedCount} saved songs</p>
              </div>
            </div>
          )}

          {/* PLAYLISTS */}
          {(activeFilter === 'All' || activeFilter === 'Playlists') &&
            MOCK_PLAYLISTS.map((pl) => (
              <div
                key={pl.id}
                onClick={() => router.push(`/search?q=${encodeURIComponent(pl.title)}`)}
                className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group space-y-3"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg bg-[#282828]">
                  <ImageWithFallback src={pl.cover} alt={pl.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#29B6F6] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-4 w-4 fill-black translate-x-0.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors truncate">{pl.title}</h3>
                  <p className="text-xs text-[#B3B3B3] truncate mt-0.5">{pl.type} • {pl.subtitle}</p>
                </div>
              </div>
            ))}

          {/* ALBUMS */}
          {(activeFilter === 'All' || activeFilter === 'Albums') &&
            MOCK_ALBUMS.map((alb) => (
              <div
                key={alb.id}
                onClick={() => router.push(`/search?q=${encodeURIComponent(alb.title)}`)}
                className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group space-y-3"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg bg-[#282828]">
                  <ImageWithFallback src={alb.cover} alt={alb.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#29B6F6] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-4 w-4 fill-black translate-x-0.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors truncate">{alb.title}</h3>
                  <p className="text-xs text-[#B3B3B3] truncate mt-0.5">{alb.type} • {alb.subtitle}</p>
                </div>
              </div>
            ))}

          {/* ARTISTS */}
          {(activeFilter === 'All' || activeFilter === 'Artists') &&
            MOCK_ARTISTS.map((art) => (
              <div
                key={art.id}
                onClick={() => router.push(`/search?q=${encodeURIComponent(art.title)}`)}
                className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group text-center space-y-3"
              >
                <div className="relative aspect-square w-full rounded-full overflow-hidden shadow-lg bg-[#282828] mx-auto border-2 border-transparent group-hover:border-[#29B6F6] transition-all">
                  <ImageWithFallback src={art.cover} alt={art.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors truncate flex items-center justify-center gap-1">
                    {art.title} <CheckCircle2 className="h-3.5 w-3.5 text-[#29B6F6]" />
                  </h3>
                  <p className="text-xs text-[#B3B3B3] mt-0.5">{art.subtitle}</p>
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-2">
          {/* LIKED SONGS LIST ROW */}
          <div
            onClick={() => router.push('/liked')}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#29B6F6] text-black flex items-center justify-center shadow-md">
                <Heart className="h-6 w-6 fill-black" />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors">Liked Songs</p>
                <p className="text-xs text-[#B3B3B3]">{likedCount} saved songs</p>
              </div>
            </div>
            <span className="text-xs font-mono text-[#29B6F6]">Playlist</span>
          </div>

          {/* PLAYLISTS & ALBUMS LIST ROWS */}
          {[...MOCK_PLAYLISTS, ...MOCK_ALBUMS].map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/search?q=${encodeURIComponent(item.title)}`)}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0">
                  <ImageWithFallback src={item.cover} alt={item.title} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors">{item.title}</p>
                  <p className="text-xs text-[#B3B3B3]">{item.type} • {item.subtitle}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#B3B3B3]">{item.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
