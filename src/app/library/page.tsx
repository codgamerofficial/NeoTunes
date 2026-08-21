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
      
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292929] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#292929] text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.2em]">
              <Library className="h-3.5 w-3.5 text-[#DFFF00]" /> NEOTUNES N/OS // MEDIA VAULT
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-mono">
              Your Library
            </h1>
            <p className="text-xs sm:text-sm text-[#A0A0A0]">
              Everything you&apos;ve saved, liked, played, and created.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreatePlaylistModal(true)}
              className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#DFFF00] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create Playlist
            </button>

            <div className="flex items-center bg-[#111111] p-1 rounded-full border border-[#292929]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#DFFF00] text-black font-bold shadow-sm' : 'text-[#A0A0A0] hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#DFFF00] text-black font-bold shadow-sm' : 'text-[#A0A0A0] hover:text-white'}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── QUICK ACCESS MODULES ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {libraryQuickAccess.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -2 }}
                onClick={() => router.push(card.href)}
                className="p-4 rounded-xl bg-[#111111] border border-[#292929] hover:border-white/40 cursor-pointer transition-all space-y-3 group"
              >
                <div className="h-10 w-10 rounded-lg bg-black text-[#DFFF00] flex items-center justify-center border border-[#292929] group-hover:bg-[#DFFF00] group-hover:text-black transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#DFFF00] transition-colors">{card.title}</h3>
                  <p className="text-xs text-[#A0A0A0] mt-0.5 font-medium">{card.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── LIBRARY SEARCH BAR & CATEGORY TABS ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Library */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full bg-[#111111] border border-[#292929] rounded-full pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-[#A0A0A0] outline-none focus:border-white/40 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white">
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
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'bg-[#111111] border border-[#292929] text-[#A0A0A0] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── ITEMS DISPLAY ── */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#292929] rounded-xl space-y-3 bg-[#111111] max-w-md mx-auto">
            <Music className="h-8 w-8 mx-auto text-[#A0A0A0]" />
            <h3 className="text-sm font-bold text-white font-mono">Your Library is empty</h3>
            <p className="text-xs text-[#A0A0A0]">Save songs, albums, artists and playlists and they will appear here.</p>
            <button
              onClick={() => router.push('/search')}
              className="px-5 py-2 rounded-full bg-white text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-sm hover:bg-[#DFFF00]"
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
                className="p-3 rounded-xl bg-[#111111] border border-[#292929] hover:border-white/40 cursor-pointer transition-all space-y-3 group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-black/40 border border-[#292929]">
                  <Artwork
                    source={item.cover}
                    size="large"
                    alt={item.title}
                    type={item.type as any}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.isPinned && (
                    <span className="absolute top-2 right-2 p-1 rounded-full bg-black/80 backdrop-blur-md text-[#DFFF00] border border-[#292929]">
                      <Pin className="h-3 w-3 fill-[#DFFF00]" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-bold text-xs sm:text-sm text-white group-hover:text-[#DFFF00] truncate transition-colors">{item.title}</div>
                  <div className="text-[11px] text-[#A0A0A0] truncate mt-0.5 font-medium">{item.subtitle}</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(item.href)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#111111] border border-[#292929] hover:border-white/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Artwork
                    source={item.cover}
                    size="small"
                    alt={item.title}
                    type={item.type as any}
                    className="h-12 w-12 rounded-lg flex-shrink-0 object-cover border border-[#292929]"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white group-hover:text-[#DFFF00] transition-colors truncate">{item.title}</div>
                    <div className="text-xs text-[#A0A0A0] truncate font-medium">{item.subtitle}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#151515] border border-[#292929] text-[#A0A0A0] uppercase">
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
