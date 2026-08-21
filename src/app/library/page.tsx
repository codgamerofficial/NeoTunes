'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Library as LibraryIcon, 
  LayoutGrid, 
  List, 
  Heart, 
  Download, 
  Clock, 
  History as HistoryIcon,
  Plus, 
  Pin,
  Music,
  Disc,
  User,
  Radio,
  Sparkles,
  Share2,
  ListPlus,
  Search,
  X,
  ArrowUpDown,
  MoreHorizontal,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';

export default function LibraryPage() {
  const router = useRouter();
  const { currentTrack, playTrack, addToQueue, queue, history } = usePlaybackStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'albums' | 'artists' | 'tracks' | 'downloads'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recently_added' | 'alphabetical' | 'artist'>('recently_added');
  
  // Create Playlist Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [createdPlaylists, setCreatedPlaylists] = useState<any[]>([]);

  // Track Likes State
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set(['lofi_1', 'after_1']));

  const libraryQuickAccess = [
    { id: 'liked', title: 'Liked Songs', count: `${likedTrackIds.size + 42} tracks`, icon: Heart, href: '/liked' },
    { id: 'downloaded', title: 'Downloads', count: '12 tracks', icon: Download, href: '/downloads' },
    { id: 'recently_played', title: 'Recently Played', count: `${history.length || 18} tracks`, icon: Clock, href: '/history' },
    { id: 'history', title: 'Listening History', count: `${history.length * 4 || 156} plays`, icon: HistoryIcon, href: '/history' },
  ];

  const defaultLibraryItems = [
    { 
      id: 'pl_lofi', 
      title: 'Lo-Fi Chill & Code', 
      subtitle: 'Custom Playlist • 24 tracks', 
      type: 'playlist', 
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/10/8d/62/108d62ce-38b4-09ec-a9b0-994c502b4d99/8902894354222.jpg/600x600bb.jpg', 
      isPinned: true, 
      href: '/playlists/lo-fi-vibes' 
    },
    { 
      id: 'alb_afterhours', 
      title: 'After Hours', 
      subtitle: 'The Weeknd • Album', 
      type: 'album', 
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4b/65/59/4b6559d8-9c59-efd5-1c39-3eb8132e0e01/16UMGIM56461.rgb.jpg/600x600bb.jpg', 
      isPinned: false, 
      href: '/albums/after-hours' 
    },
    { 
      id: 'art_arijit', 
      title: 'Arijit Singh', 
      subtitle: 'Artist', 
      type: 'artist', 
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/4a/01/5e/4a015e57-2292-6d2b-5e4d-bf7d1bdfecad/8902894363293.jpg/600x600bb.jpg', 
      isPinned: false, 
      href: '/artists/arijit-singh' 
    },
    { 
      id: 'pl_roadtrip', 
      title: 'Roadtrip 2026', 
      subtitle: 'Collaborative Playlist • 18 tracks', 
      type: 'playlist', 
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d5/43/d8/d543d8ef-51a8-8e68-07e5-1a85116743b4/8902894361596.jpg/600x600bb.jpg', 
      isPinned: true, 
      href: '/playlists/roadtrip-2026' 
    },
    { 
      id: 'trk_kolkata', 
      title: 'Kolkata Flow', 
      subtitle: 'Saswata Dey • Single', 
      type: 'track', 
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80', 
      isPinned: false, 
      href: '/track/kolkata-flow',
      track: {
        id: 'trk_kolkata',
        title: 'Kolkata Flow',
        artists: ['Saswata Dey'],
        artist: 'Saswata Dey',
        album: 'Drive Thru',
        artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
        duration: 184,
        playable: true
      }
    },
  ];

  const allItems = [...createdPlaylists, ...defaultLibraryItems];

  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'playlists') return item.type === 'playlist';
    if (activeTab === 'albums') return item.type === 'album';
    if (activeTab === 'artists') return item.type === 'artist';
    if (activeTab === 'tracks') return item.type === 'track';
    if (activeTab === 'downloads') return item.type === 'download';
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0; // Default recently added order
  });

  const handleCreatePlaylist = () => {
    if (playlistName.trim()) {
      const newPl = {
        id: `pl-${Date.now()}`,
        title: playlistName.trim(),
        subtitle: playlistDesc.trim() || 'Custom Playlist • 0 tracks',
        type: 'playlist',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
        isPinned: false,
        href: `/playlists/pl-${Date.now()}`
      };
      setCreatedPlaylists([newPl, ...createdPlaylists]);
      setPlaylistName('');
      setPlaylistDesc('');
      setShowCreateModal(false);
    }
  };

  const toggleLikeTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <FeatureErrorBoundary featureName="Library">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 relative min-h-screen z-10 max-w-[1550px] mx-auto">
      
        {/* ── 1. COMPACT LIBRARY HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Library
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1A6] mt-0.5">
              Your saved music, playlists and listening history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" /> Create Playlist
            </button>

            <div className="flex items-center bg-white/[0.055] p-1 rounded-full border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#DFFF00] text-black font-bold shadow-sm' : 'text-[#A1A1A6] hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#DFFF00] text-black font-bold shadow-sm' : 'text-[#A1A1A6] hover:text-white'}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. QUICK ACCESS 2x2 GRID (140-160px Height) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {libraryQuickAccess.map((card) => {
            const Icon = card.icon;
            return (
              <GlassCard
                key={card.id}
                onClick={() => router.push(card.href)}
                className="p-4 rounded-2xl cursor-pointer hover:border-[#DFFF00]/40 transition-all space-y-3 group min-h-[140px] flex flex-col justify-between"
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 text-[#DFFF00] flex items-center justify-center border border-white/10 group-hover:bg-[#DFFF00] group-hover:text-black transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#DFFF00] transition-colors">{card.title}</h3>
                  <p className="text-[11px] text-[#A1A1A6] mt-0.5 font-mono">{card.count}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* ── 3. SEARCH BAR & FILTER PILLS ── */}
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1A6]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full bg-white/[0.055] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#A1A1A6] outline-none focus:border-[#DFFF00] transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1A6] hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {(['all', 'playlists', 'albums', 'artists', 'tracks', 'downloads'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm'
                      : 'bg-white/[0.045] border border-white/10 text-[#A1A1A6] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. ITEMS DISPLAY ── */}
        {sortedItems.length === 0 ? (
          <GlassCard className="p-10 text-center space-y-3 max-w-md mx-auto">
            <Music className="h-8 w-8 mx-auto text-[#DFFF00]" />
            <h3 className="text-sm font-bold text-white">Your Library is empty</h3>
            <p className="text-xs text-[#A1A1A6]">Save songs, albums, artists and playlists and they will appear here.</p>
            <button
              onClick={() => router.push('/search')}
              className="px-5 py-2 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-sm hover:scale-105 transition-transform"
            >
              Browse Catalog
            </button>
          </GlassCard>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sortedItems.map((item) => (
              <GlassCard
                key={item.id}
                onClick={() => {
                  if (item.type === 'track' && item.track) {
                    playTrack(item.track);
                  } else {
                    router.push(item.href);
                  }
                }}
                className="p-3 cursor-pointer transition-all space-y-3 group hover:border-[#DFFF00]/40"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <Artwork
                    source={resolveArtwork(item.cover || item)}
                    size="medium"
                    canonicalId={item.id}
                    type={item.type === 'artist' ? 'artist' : 'track'}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      item.type === 'artist' ? 'rounded-full' : 'rounded-xl'
                    }`}
                  />
                  {item.isPinned && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-[#DFFF00] border border-white/10">
                      <Pin className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white truncate group-hover:text-[#DFFF00] transition-colors">{item.title}</h4>
                  <p className="text-[11px] text-[#A1A1A6] truncate mt-0.5">{item.subtitle}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedItems.map((item) => (
              <GlassCard
                key={item.id}
                onClick={() => {
                  if (item.type === 'track' && item.track) {
                    playTrack(item.track);
                  } else {
                    router.push(item.href);
                  }
                }}
                className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Artwork
                    source={resolveArtwork(item.cover || item)}
                    size="small"
                    canonicalId={item.id}
                    type={item.type === 'artist' ? 'artist' : 'track'}
                    className={`w-12 h-12 object-cover border border-white/10 shrink-0 ${
                      item.type === 'artist' ? 'rounded-full' : 'rounded-xl'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#DFFF00] truncate transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => toggleLikeTrack(item.id, e)}
                    className={`p-2 rounded-full bg-white/5 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
                      likedTrackIds.has(item.id) ? 'text-[#DFFF00] bg-white/12' : 'text-[#A1A1A6] hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedTrackIds.has(item.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-2 rounded-full bg-white/5 text-[#A1A1A6] hover:text-white transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* ── CREATE PLAYLIST GLASS MODAL ── */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#050608] border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl text-[#F5F5F7]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Create Playlist</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full text-[#A1A1A6] hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider block mb-1.5">
                      PLAYLIST NAME
                    </label>
                    <input
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="My Favorite Vibes"
                      className="w-full bg-white/[0.055] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#DFFF00]"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider block mb-1.5">
                      DESCRIPTION (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={playlistDesc}
                      onChange={(e) => setPlaylistDesc(e.target.value)}
                      placeholder="A chill mix for late night coding"
                      className="w-full bg-white/[0.055] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#DFFF00]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-full bg-white/5 text-xs font-mono font-bold text-[#A1A1A6] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePlaylist}
                    disabled={!playlistName.trim()}
                    className={`px-5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                      playlistName.trim() ? 'bg-[#DFFF00] text-black shadow-md' : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </FeatureErrorBoundary>
  );
}
