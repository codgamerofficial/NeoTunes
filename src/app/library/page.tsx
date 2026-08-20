'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Library, 
  LayoutGrid, 
  List, 
  Heart, 
  Download, 
  Clock, 
  History as HistoryIcon,
  FolderPlus,
  Plus, 
  Pin,
  Music,
  Disc,
  User,
  Radio,
  Sparkles,
  Share2,
  ListPlus,
  Wand2,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Artwork } from '@/components/ui/Artwork';

export default function LibraryPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'albums' | 'artists' | 'tracks' | 'downloads'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [createdPlaylists, setCreatedPlaylists] = useState<any[]>([]);

  const libraryQuickAccess = [
    { id: 'liked', title: 'Liked Songs', subtitle: 'Saved favorites', icon: Heart, href: '/liked' },
    { id: 'downloaded', title: 'Downloads', subtitle: 'Offline music', icon: Download, href: '/downloads' },
    { id: 'recently_played', title: 'Recently Played', subtitle: 'Recent sessions', icon: Clock, href: '/history' },
    { id: 'history', title: 'Listening History', subtitle: 'Track history', icon: HistoryIcon, href: '/history' },
  ];

  // Canonical high-res artwork URLs matching exact titles
  const defaultLibraryItems = [
    { 
      id: 'lofi', 
      title: 'Lo-Fi Chill & Code', 
      subtitle: 'Custom Playlist', 
      type: 'playlist', 
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/10/8d/62/108d62ce-38b4-09ec-a9b0-994c502b4d99/8902894354222.jpg/600x600bb.jpg', 
      isPinned: true, 
      href: '/playlists/lo-fi-vibes' 
    },
    { 
      id: 'afterhours', 
      title: 'After Hours', 
      subtitle: 'The Weeknd · Album', 
      type: 'album', 
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4b/65/59/4b6559d8-9c59-efd5-1c39-3eb8132e0e01/16UMGIM56461.rgb.jpg/600x600bb.jpg', 
      isPinned: false, 
      href: '/albums/after-hours' 
    },
    { 
      id: 'arijit', 
      title: 'Arijit Singh', 
      subtitle: 'Artist', 
      type: 'artist', 
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/4a/01/5e/4a015e57-2292-6d2b-5e4d-bf7d1bdfecad/8902894363293.jpg/600x600bb.jpg', 
      isPinned: false, 
      href: '/artists/arijit-singh' 
    },
    { 
      id: 'collab1', 
      title: 'Roadtrip 2026', 
      subtitle: 'Collaborative Playlist', 
      type: 'playlist', 
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d5/43/d8/d543d8ef-51a8-8e68-07e5-1a85116743b4/8902894361596.jpg/600x600bb.jpg', 
      isPinned: true, 
      href: '/playlists/roadtrip-2026' 
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

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPl = {
        id: `pl-${Date.now()}`,
        title: newPlaylistName.trim(),
        subtitle: 'Custom Playlist',
        type: 'playlist',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
        isPinned: false,
        href: `/playlists/pl-${Date.now()}`
      };
      setCreatedPlaylists([newPl, ...createdPlaylists]);
      setNewPlaylistName('');
      setShowCreatePlaylistModal(false);
    }
  };

  return (
    <FeatureErrorBoundary featureName="Library">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F4F1F7] font-sans select-none pb-36 relative min-h-screen z-10 max-w-[1650px] mx-auto">
      
        {/* ── HEADER (Specs 8, 9, 10) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <Library className="h-8 w-8 text-[#00D4FF]" /> Your Library
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Everything you&apos;ve saved, liked, played, and created.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreatePlaylistModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#00D4FF] text-black text-xs font-black uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer shadow-[0_0_18px_rgba(0,214,255,0.4)]"
            >
              <Plus className="h-4 w-4" /> Create Playlist
            </button>

            <div className="flex items-center bg-[#111524]/90 p-1 rounded-full border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#00D4FF] text-black shadow-md' : 'text-white/40 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#00D4FF] text-black shadow-md' : 'text-white/40 hover:text-white'}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── QUICK ACCESS MODULES (Specs 11-15) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {libraryQuickAccess.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -3 }}
                onClick={() => router.push(card.href)}
                className="p-4 rounded-3xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all space-y-3 group shadow-md"
              >
                <div className="h-10 w-10 rounded-2xl bg-white/5 text-[#00D4FF] flex items-center justify-center border border-white/10 group-hover:bg-[#00D4FF] group-hover:text-black transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#00D4FF] transition-colors">{card.title}</h3>
                  <p className="text-xs text-white/60 mt-0.5 font-medium">{card.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── LIBRARY SEARCH BAR & CATEGORY TABS (Specs 17-21) ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Library */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full bg-[#111524]/90 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder:text-white/40 outline-none focus:border-[#00D4FF]/50 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {(['all', 'playlists', 'albums', 'artists', 'tracks', 'downloads'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#00D4FF] text-black shadow-[0_0_12px_rgba(0,214,255,0.4)]'
                      : 'bg-[#111524]/80 border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── ITEMS DISPLAY (Specs 10, 22-26) ── */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl space-y-3 bg-[#0D101C]/60 max-w-md mx-auto">
            <Music className="h-8 w-8 mx-auto text-white/30" />
            <h3 className="text-sm font-bold text-white">Your Library is empty</h3>
            <p className="text-xs text-white/50">Save songs, albums, artists and playlists and they will appear here.</p>
            <button
              onClick={() => router.push('/search')}
              className="px-5 py-2 rounded-full bg-[#00D4FF] text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
            >
              Browse Catalog
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                onClick={() => router.push(item.href)}
                whileHover={{ y: -4 }}
                className="p-3.5 rounded-3xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all space-y-3 group shadow-md"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40">
                  <Artwork
                    source={item.cover}
                    size="large"
                    alt={item.title}
                    type={item.type as any}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.isPinned && (
                    <span className="absolute top-2 right-2 p-1 rounded-full bg-black/70 backdrop-blur-md text-[#00D4FF] border border-white/15">
                      <Pin className="h-3 w-3 fill-[#00D4FF]" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-bold text-xs sm:text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{item.title}</div>
                  <div className="text-[11px] text-white/60 truncate mt-0.5 font-medium">{item.subtitle}</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(item.href)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all group shadow-md"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Artwork
                    source={item.cover}
                    size="small"
                    alt={item.title}
                    type={item.type as any}
                    className="h-12 w-12 rounded-xl flex-shrink-0 object-cover border border-white/15"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white group-hover:text-[#00D4FF] transition-colors truncate">{item.title}</div>
                    <div className="text-xs text-white/60 truncate font-medium">{item.subtitle}</div>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 uppercase">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── CREATE PLAYLIST MODAL (Specs 9, 29) ── */}
        <AnimatePresence>
          {showCreatePlaylistModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setShowCreatePlaylistModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[#0D101C] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ListPlus className="h-5 w-5 text-[#00D4FF]" /> Create New Playlist
                  </h3>
                  <button onClick={() => setShowCreatePlaylistModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-white/60">Playlist Name</label>
                  <input
                    type="text"
                    autoFocus
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="My NeoTunes Playlist..."
                    className="w-full bg-[#111524] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowCreatePlaylistModal(false)}
                    className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePlaylist}
                    className="px-5 py-2 rounded-full bg-[#00D4FF] text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:scale-105 transition-transform"
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
