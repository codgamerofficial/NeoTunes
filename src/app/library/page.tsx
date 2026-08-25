'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Library as LibraryIcon, 
  LayoutGrid, 
  List, 
  Heart, 
  Download, 
  Clock, 
  History as HistoryIcon,
  Plus, 
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Play,
  Loader2,
  ListMusic,
  Compass
} from 'lucide-react';

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { usePlaybackStore } from '@/store/playback-store';

export default function LibraryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { history } = usePlaybackStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'albums' | 'artists'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recently_added' | 'alphabetical' | 'type'>('recently_added');
  
  // Create Playlist Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');

  // Fetch Playlists from API
  const { data: playlistsData, isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ['user-playlists'],
    queryFn: async () => {
      const res = await fetch('/api/playlists');
      if (!res.ok) return { playlists: [] };
      return res.json();
    },
  });

  // Fetch Liked Songs count from API
  const { data: likedData } = useQuery({
    queryKey: ['liked-songs-count'],
    queryFn: async () => {
      const res = await fetch('/api/liked');
      if (!res.ok) return { tracks: [] };
      return res.json();
    },
  });

  // Create Playlist Mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (payload: { name: string; description: string }) => {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create playlist');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-playlists'] });
      setShowCreateModal(false);
      setPlaylistName('');
      setPlaylistDesc('');
    },
  });

  const userPlaylists = playlistsData?.playlists || [];
  const likedCount = likedData?.tracks?.length || 0;

  const libraryQuickAccess = [
    { id: 'liked', title: 'Liked Songs', count: `${likedCount} ${likedCount === 1 ? 'track' : 'tracks'}`, icon: Heart, href: '/liked', color: 'text-[#FF2D95]' },
    { id: 'downloaded', title: 'Downloads', count: 'Offline cache', icon: Download, href: '/downloads', color: 'text-[#00D9FF]' },
    { id: 'recently_played', title: 'Recently Played', count: `${history.length || 0} ${history.length === 1 ? 'track' : 'tracks'}`, icon: Clock, href: '/history', color: 'text-[#DFFF00]' },
    { id: 'history', title: 'Listening History', count: 'Full log', icon: HistoryIcon, href: '/history', color: 'text-[#7A3CFF]' },
  ];

  // REAL Library items derived purely from user records (ZERO hardcoded fallback cards)
  const combinedItems = [
    ...userPlaylists.map((pl: any) => ({
      id: pl.id,
      title: pl.name,
      subtitle: `Playlist • ${pl.trackCount || 0} tracks`,
      type: 'playlist',
      cover: pl.cover_url || pl.artwork_url || '',
      href: `/playlists/${pl.id}`,
    })),
  ];

  // Filter & Sort Library Items
  const filteredItems = combinedItems
    .filter((item) => {
      if (activeTab === 'playlists' && item.type !== 'playlist') return false;
      if (activeTab === 'albums' && item.type !== 'album') return false;
      if (activeTab === 'artists' && item.type !== 'artist') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      return 0;
    });

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;
    createPlaylistMutation.mutate({ name: playlistName, description: playlistDesc });
  };

  return (
    <FeatureErrorBoundary featureName="Library">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-6xl mx-auto min-h-screen">
        
        {/* ── 1. HEADER & ACTION TOOLBAR ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <LibraryIcon className="h-6 w-6 text-[#DFFF00]" /> Your Library
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1A6]">
              Your playlists, saved albums, favorite artists, and offline downloads.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white/15 text-[#DFFF00]' : 'text-[#A1A1A6] hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white/15 text-[#DFFF00]' : 'text-[#A1A1A6] hover:text-white'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Create Playlist Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-4 w-4 fill-black text-black" />
              <span>Create Playlist</span>
            </button>
          </div>
        </div>

        {/* ── 2. QUICK ACCESS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {libraryQuickAccess.map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard
                key={item.id}
                onClick={() => router.push(item.href)}
                className="p-4 flex items-center gap-3.5 cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
              >
                <div className={`p-2.5 rounded-2xl bg-white/5 border border-white/10 ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate group-hover:text-[#DFFF00] transition-colors">{item.title}</div>
                  <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">{item.count}</div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* ── 3. FILTER TABS & SEARCH / SORT ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto py-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'playlists', label: 'Playlists' },
              { id: 'albums', label: 'Albums' },
              { id: 'artists', label: 'Artists' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm'
                    : 'bg-white/5 border border-white/10 text-[#A1A1A6] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex items-center bg-white/[0.055] border border-white/10 rounded-2xl px-3 py-1.5 backdrop-blur-md flex-1 sm:w-60">
              <Search className="h-3.5 w-3.5 text-[#A1A1A6] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search library..."
                className="bg-transparent text-xs text-white placeholder-[#A1A1A6] focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#A1A1A6]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="recently_added" className="bg-[#08090C] text-white">Recently Added</option>
                <option value="alphabetical" className="bg-[#08090C] text-white">A–Z Title</option>
                <option value="type" className="bg-[#08090C] text-white">Category Type</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 4. REAL LIBRARY CONTENT GRID / LIST ── */}
        {isLoadingPlaylists ? (
          <div className="flex h-48 flex-col items-center justify-center text-[#A1A1A6]">
            <Loader2 className="h-6 w-6 animate-spin text-[#DFFF00]" />
            <span className="mt-2 text-xs font-mono">Loading library collections...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-4 max-w-md mx-auto my-6">
            <div className="p-3 rounded-full bg-white/5 text-[#DFFF00] w-12 h-12 mx-auto flex items-center justify-center border border-white/10">
              <ListMusic className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Your library is empty</h3>
              <p className="text-xs text-[#A1A1A6] leading-relaxed">
                {searchQuery
                  ? `No playlists or items matching "${searchQuery}".`
                  : 'Create your first custom playlist or explore music across NeoTunes to populate your library.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-105 transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Create Playlist
              </button>
              <button
                onClick={() => router.push('/browse')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-mono font-bold hover:bg-white/10 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Compass className="h-4 w-4 text-[#00D9FF]" /> Browse Music
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <GlassCard
                key={item.id}
                onClick={() => router.push(item.href)}
                className="p-3.5 flex flex-col space-y-3 cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                  <Artwork
                    source={item.cover}
                    size="medium"
                    canonicalId={item.id}
                    type={item.type === 'artist' ? 'artist' : 'album'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-lg">
                      <Play className="h-5 w-5 fill-black text-black ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#A1A1A6] truncate">{item.subtitle}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <GlassCard
                key={item.id}
                onClick={() => router.push(item.href)}
                className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <Artwork
                    source={item.cover}
                    size="small"
                    canonicalId={item.id}
                    type={item.type === 'artist' ? 'artist' : 'album'}
                    className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">{item.subtitle}</div>
                  </div>
                </div>

                <MoreHorizontal className="h-4 w-4 text-[#A1A1A6] group-hover:text-white" />
              </GlassCard>
            ))}
          </div>
        )}

        {/* ── 5. CREATE PLAYLIST MODAL ── */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#0A0D16] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#DFFF00]" /> Create New Playlist
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full text-[#A1A1A6] hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-[#A1A1A6] uppercase tracking-wider">Playlist Name</label>
                  <input
                    type="text"
                    required
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="My Chill Hits"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 px-4 text-xs text-white placeholder-[#A1A1A6] outline-none focus:border-[#DFFF00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-[#A1A1A6] uppercase tracking-wider">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={playlistDesc}
                    onChange={(e) => setPlaylistDesc(e.target.value)}
                    placeholder="Collection description..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 px-4 text-xs text-white placeholder-[#A1A1A6] outline-none focus:border-[#DFFF00] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createPlaylistMutation.isPending}
                    className="flex-1 py-2.5 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {createPlaylistMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
