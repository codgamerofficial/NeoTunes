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

export default function LibraryPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'albums' | 'artists' | 'tracks' | 'downloads'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreationMenu, setShowCreationMenu] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const libraryQuickAccess = [
    { id: 'liked', title: 'Liked Songs', subtitle: 'Saved favorites', icon: Heart, href: '/library?tab=liked' },
    { id: 'downloaded', title: 'Downloads', subtitle: 'Offline music', icon: Download, href: '/library?tab=downloads' },
    { id: 'recently_played', title: 'Recently Played', subtitle: 'Recent sessions', icon: Clock, href: '/library?tab=history' },
    { id: 'history', title: 'Listening History', subtitle: 'Track history', icon: HistoryIcon, href: '/library?tab=history' },
  ];

  const libraryItems = [
    { id: 'lofi', title: 'Lo-Fi Chill & Code', subtitle: 'Custom Playlist', type: 'Playlist', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', isPinned: true, href: '/playlists/lo-fi-vibes' },
    { id: 'afterhours', title: 'After Hours', subtitle: 'The Weeknd · Album', type: 'Album', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80', isPinned: false, href: '/albums/after-hours' },
    { id: 'arijit', title: 'Arijit Singh', subtitle: 'Artist', type: 'Artist', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80', isPinned: false, href: '/artists/arijit-singh' },
    { id: 'collab1', title: 'Roadtrip 2026', subtitle: 'Collaborative Playlist', type: 'Playlist', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80', isPinned: true, href: '/playlists/roadtrip-2026' },
  ];

  const filteredItems = libraryItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const creationOptions = [
    { label: 'Create Playlist', desc: 'Build a collection from your music', icon: ListPlus, action: () => setShowCreatePlaylistModal(true) },
    { label: 'Import Playlist', desc: 'Bring a playlist from a supported service', icon: Share2, action: () => alert('Enter a playlist URL to import into NeoTunes.') },
    { label: 'Create Folder', desc: 'Organize playlists into folders', icon: FolderPlus, action: () => alert('Playlist folder created.') },
    { label: 'Start Jam', desc: 'Listen together with friends', icon: Radio, action: () => router.push('/jam/ROOM123') },
    { label: 'Smart Playlist', desc: 'Let Neo build a playlist from rules', icon: Wand2, action: () => router.push('/search?q=AI%20Mix') },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#000000] text-[#F4F1F7] font-sans select-none pb-36 relative min-h-screen">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Library className="h-8 w-8 text-[#AFC7FF]" /> Your Library
          </h1>
          <p className="text-sm text-[#A8A7AF] mt-1">
            Everything you&apos;ve saved, played, downloaded, and created.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreatePlaylistModal(true)}
            className="px-4 py-2 rounded-full bg-[#AFC7FF] text-black text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" /> Create Playlist
          </button>

          <div className="flex items-center bg-[#121318] p-1 rounded-full border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#AFC7FF] text-black' : 'text-white/40 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#AFC7FF] text-black' : 'text-white/40 hover:text-white'}`}
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
              whileHover={{ y: -3 }}
              onClick={() => router.push(card.href)}
              className="p-4 rounded-3xl bg-[#121318] border border-white/10 hover:border-[#AFC7FF]/40 cursor-pointer transition-all space-y-3 group"
            >
              <div className="h-10 w-10 rounded-2xl bg-white/5 text-[#AFC7FF] flex items-center justify-center border border-white/10 group-hover:bg-[#AFC7FF] group-hover:text-black transition-all">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-[#AFC7FF] transition-colors">{card.title}</h3>
                <p className="text-xs text-[#A8A7AF] mt-0.5">{card.subtitle}</p>
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A7AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your library..."
              className="w-full bg-[#121318] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-[#A8A7AF] outline-none focus:border-[#AFC7FF]/50 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {['all', 'playlists', 'albums', 'artists', 'tracks', 'downloads'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#AFC7FF] text-black shadow-[0_0_10px_rgba(175,199,255,0.4)]'
                    : 'bg-[#121318] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ITEMS DISPLAY ── */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => router.push(item.href)}
              whileHover={{ y: -3 }}
              className="p-3.5 rounded-3xl bg-[#121318] border border-white/10 hover:border-[#AFC7FF]/40 cursor-pointer transition-all space-y-2.5 group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img src={item.cover} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {item.isPinned && (
                  <span className="absolute top-2 right-2 p-1 rounded-full bg-black/70 backdrop-blur-md text-[#AFC7FF] border border-white/15">
                    <Pin className="h-3 w-3 fill-[#AFC7FF]" />
                  </span>
                )}
              </div>

              <div>
                <div className="font-bold text-xs sm:text-sm text-white group-hover:text-[#AFC7FF] truncate transition-colors">{item.title}</div>
                <div className="text-[11px] text-[#A8A7AF] truncate mt-0.5">{item.subtitle}</div>
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
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#AFC7FF]/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <img src={item.cover} alt={item.title} className="h-12 w-12 rounded-xl object-cover" />
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-[#AFC7FF] transition-colors">{item.title}</div>
                  <div className="text-xs text-[#A8A7AF]">{item.subtitle}</div>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{item.type}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE PLAYLIST MODAL ── */}
      <AnimatePresence>
        {showCreatePlaylistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setShowCreatePlaylistModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#121318] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ListPlus className="h-5 w-5 text-[#AFC7FF]" /> Create New Playlist
                </h3>
                <button onClick={() => setShowCreatePlaylistModal(false)} className="text-white/40 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#A8A7AF]">Playlist Name</label>
                <input
                  type="text"
                  autoFocus
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My NeoTunes Playlist..."
                  className="w-full bg-[#17181D] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#AFC7FF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreatePlaylistModal(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newPlaylistName.trim()) {
                      setShowCreatePlaylistModal(false);
                      setNewPlaylistName('');
                      router.push('/library');
                    }
                  }}
                  className="px-5 py-2 rounded-full bg-[#AFC7FF] text-black text-xs font-bold hover:scale-105 transition-transform"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FLOATING ACTION BUTTON (+) ── */}
      <div className="fixed bottom-24 right-8 z-40">
        <AnimatePresence>
          {showCreationMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="mb-3 p-2 bg-[#121318] border border-white/15 rounded-3xl shadow-2xl space-y-1 w-64 backdrop-blur-xl"
            >
              {creationOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setShowCreationMenu(false);
                      opt.action();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 text-white text-xs font-bold transition-all text-left cursor-pointer group"
                  >
                    <div className="p-2 rounded-xl bg-white/5 text-[#AFC7FF] group-hover:bg-[#AFC7FF] group-hover:text-black transition-colors shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-white group-hover:text-[#AFC7FF] transition-colors">{opt.label}</div>
                      <div className="text-[10px] text-[#A8A7AF] font-normal">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowCreationMenu(!showCreationMenu)}
          className="h-14 w-14 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center shadow-[0_0_25px_rgba(175,199,255,0.5)] hover:scale-105 transition-transform cursor-pointer"
        >
          <Plus className={`h-7 w-7 transition-transform duration-300 ${showCreationMenu ? 'rotate-45' : ''}`} />
        </button>
      </div>

    </div>
  );
}
