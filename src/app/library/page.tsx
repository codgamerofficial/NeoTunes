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
  ListMusic,
  Compass,
  X,
  Play
} from 'lucide-react';

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Artwork } from '@/components/ui/Artwork';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { useToast } from '@/components/ui/NeoToast';
import { usePlaybackStore } from '@/store/playback-store';

export default function LibraryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { history } = usePlaybackStore();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'albums' | 'artists'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recently_added' | 'alphabetical' | 'type'>('recently_added');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');

  // Fetch Playlists (Server + Local guest storage)
  const { data: playlistsData, isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ['user-playlists'],
    queryFn: async () => {
      let serverPlaylists: any[] = [];
      try {
        const res = await fetch('/api/playlists');
        if (res.ok) {
          const data = await res.json();
          serverPlaylists = data.playlists || [];
        }
      } catch {}

      let localPlaylists: any[] = [];
      try {
        const stored = localStorage.getItem('neotunes_local_playlists');
        if (stored) {
          localPlaylists = JSON.parse(stored);
        }
      } catch {}

      // Deduplicate by ID
      const ids = new Set(serverPlaylists.map((p: any) => p.id));
      const merged = [
        ...serverPlaylists,
        ...localPlaylists.filter((p: any) => !ids.has(p.id))
      ];

      return { playlists: merged };
    },
  });

  // Fetch Liked Songs Count
  const { data: likedData } = useQuery({
    queryKey: ['liked-songs-count'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/liked');
        if (res.ok) return res.json();
      } catch {}
      return { tracks: [] };
    },
  });

  // Create Playlist Mutation with automatic guest fallback
  const createPlaylistMutation = useMutation({
    mutationFn: async (payload: { name: string; description: string }) => {
      try {
        const res = await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          return res.json();
        }
      } catch {}

      // Guest / Offline fallback
      const localPlaylist = {
        id: `local_playlist_${Date.now()}`,
        name: payload.name,
        description: payload.description || '',
        trackCount: 0,
        tracks: [],
        cover_url: '',
        artwork_url: '',
        created_at: new Date().toISOString(),
      };

      try {
        const existing = JSON.parse(localStorage.getItem('neotunes_local_playlists') || '[]');
        localStorage.setItem('neotunes_local_playlists', JSON.stringify([localPlaylist, ...existing]));
      } catch {}

      return { playlist: localPlaylist };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-playlists'] });
      setShowCreateModal(false);
      setPlaylistName('');
      setPlaylistDesc('');
      showToast('Playlist created successfully!');
    },
    onError: () => {
      showToast('Failed to create playlist', 'error');
    }
  });

  const userPlaylists = playlistsData?.playlists || [];
  const likedCount = likedData?.tracks?.length || 0;

  const quickAccessItems = [
    { id: 'liked', title: 'Liked Songs', count: `${likedCount} ${likedCount === 1 ? 'song' : 'songs'}`, icon: Heart, href: '/liked', color: 'text-[#DFFF00]' },
    { id: 'downloaded', title: 'Downloads', count: 'Offline cache', icon: Download, href: '/downloads', color: 'text-[#00E5FF]' },
    { id: 'recently_played', title: 'Recently Played', count: `${history.length || 0} ${history.length === 1 ? 'song' : 'songs'}`, icon: Clock, href: '/history', color: 'text-[#DFFF00]' },
    { id: 'history', title: 'Listening History', count: 'Full activity', icon: HistoryIcon, href: '/history', color: 'text-[#00E5FF]' },
  ];

  const combinedItems = [
    ...userPlaylists.map((pl: any) => ({
      id: pl.id,
      title: pl.name,
      subtitle: `Playlist • ${pl.trackCount || (pl.tracks ? pl.tracks.length : 0)} songs`,
      type: 'playlist',
      cover: pl.cover_url || pl.artwork_url || '',
      href: `/playlist/${pl.id}`,
    })),
  ];

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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;
    createPlaylistMutation.mutate({ name: playlistName, description: playlistDesc });
  };

  return (
    <FeatureErrorBoundary featureName="Library">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-6xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <LibraryIcon className="h-6 w-6 text-[#DFFF00]" /> Your Library
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA1AD]">
              Your custom playlists, favorite songs, offline downloads, and history.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-full bg-[#11141A] border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white/10 text-[#DFFF00]' : 'text-[#9AA1AD] hover:text-white'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white/10 text-[#DFFF00]' : 'text-[#9AA1AD] hover:text-white'
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Create Playlist Button */}
            <NeoButton
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 fill-black" /> Create Playlist
            </NeoButton>
          </div>
        </div>

        {/* Quick Access Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <NeoCard
                key={item.id}
                interactive
                onClick={() => router.push(item.href)}
                className="p-4 flex items-center gap-3.5 cursor-pointer group"
              >
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${item.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-white truncate group-hover:text-[#DFFF00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">{item.count}</p>
                </div>
              </NeoCard>
            );
          })}
        </div>

        {/* Filter Tabs & Search / Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Tabs */}
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#DFFF00] text-black font-bold shadow-sm'
                    : 'bg-[#11141A] border border-white/5 text-[#9AA1AD] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex items-center bg-[#11141A] border border-white/10 rounded-2xl px-3 py-1.5 flex-1 sm:w-56">
              <Search className="h-3.5 w-3.5 text-[#9AA1AD] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search library..."
                className="bg-transparent text-xs text-white placeholder-[#9AA1AD] focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#9AA1AD]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#11141A] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="recently_added" className="bg-[#11141A] text-white">Recently Added</option>
                <option value="alphabetical" className="bg-[#11141A] text-white">A–Z Title</option>
                <option value="type" className="bg-[#11141A] text-white">Type</option>
              </select>
            </div>
          </div>
        </div>

        {/* Library Content */}
        {isLoadingPlaylists ? (
          <NeoSkeleton variant="card" count={4} />
        ) : filteredItems.length === 0 ? (
          <NeoEmptyState
            icon={ListMusic}
            title={searchQuery ? `No library items matching "${searchQuery}"` : "Build your next sound"}
            description={searchQuery ? "Try searching for a different title or clearing your search." : "Create custom playlists to save your favorite songs and organize your audio world."}
            actionLabel="Create Playlist"
            onAction={() => setShowCreateModal(true)}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <NeoCard
                key={item.id}
                interactive
                onClick={() => router.push(item.href)}
                className="p-3.5 space-y-3 group"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/5 bg-white/5">
                  <Artwork
                    source={item.cover}
                    size="medium"
                    canonicalId={item.id}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-[#DFFF00] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play className="h-3.5 w-3.5 fill-black ml-0.5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white truncate group-hover:text-[#DFFF00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">{item.subtitle}</p>
                </div>
              </NeoCard>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredItems.map((item) => (
              <NeoCard
                key={item.id}
                interactive
                onClick={() => router.push(item.href)}
                className="p-3 flex items-center gap-3.5 group"
              >
                <Artwork
                  source={item.cover}
                  size="small"
                  canonicalId={item.id}
                  className="h-12 w-12 rounded-xl object-cover border border-white/5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xs text-white truncate group-hover:text-[#DFFF00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">{item.subtitle}</p>
                </div>
              </NeoCard>
            ))}
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white">Create New Playlist</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-full text-[#9AA1AD] hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9AA1AD]">Playlist Title</label>
                  <input
                    type="text"
                    required
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="e.g., Midnight Melodies"
                    className="w-full bg-[#171A21] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#9AA1AD] focus:outline-none focus:border-[#DFFF00]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9AA1AD]">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={playlistDesc}
                    onChange={(e) => setPlaylistDesc(e.target.value)}
                    placeholder="Give your playlist a vibe or description..."
                    className="w-full bg-[#171A21] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#9AA1AD] focus:outline-none focus:border-[#DFFF00]/50 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <NeoButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </NeoButton>

                  <NeoButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={createPlaylistMutation.isPending}
                  >
                    Create Playlist
                  </NeoButton>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
