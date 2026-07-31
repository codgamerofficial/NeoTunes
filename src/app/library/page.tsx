'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Library, LayoutGrid, List, Heart, Download, Music, Disc, Users, Plus, Pin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LibraryPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'albums' | 'artists' | 'downloaded'>('all');

  const libraryItems = [
    { id: 'liked', title: 'Liked Songs', subtitle: '512 tracks', type: 'Playlist', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', isPinned: true, href: '/liked' },
    { id: 'lofi', title: 'Lo-Fi Chill & Code', subtitle: '60 tracks', type: 'Playlist', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', isPinned: true, href: '/playlists/lo-fi-vibes' },
    { id: 'afterhours', title: 'After Hours', subtitle: 'The Weeknd • Album', type: 'Album', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80', isPinned: false, href: '/albums/after-hours' },
    { id: 'arijit', title: 'Arijit Singh', subtitle: 'Artist • 34M Followers', type: 'Artist', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80', isPinned: false, href: '/artists/arijit-singh' },
    { id: 'workout', title: 'High Energy Gym', subtitle: '45 tracks', type: 'Playlist', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80', isPinned: false, href: '/playlists/workout-mix' },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#050505] text-white font-sans select-none pb-36">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Library className="h-8 w-8 text-[#00D4FF]" /> Your Music Library
          </h1>
          <p className="text-sm text-white/50 mt-1">Manage your saved playlists, albums, artists, and downloaded offline tracks.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/playlists')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-bold text-xs shadow-[0_0_15px_#00D4FF]"
          >
            <Plus className="h-4 w-4" /> Create Playlist
          </button>

          <div className="flex items-center bg-[#101010] p-1 rounded-full border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white/10 text-[#00D4FF]' : 'text-white/40'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white/10 text-[#00D4FF]' : 'text-white/40'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
        {['all', 'playlists', 'albums', 'artists', 'downloaded'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-[#00D4FF] text-black shadow-[0_0_10px_#00D4FF]'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ITEMS DISPLAY */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {libraryItems.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => router.push(item.href)}
              whileHover={{ y: -4 }}
              className="p-4 rounded-3xl bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all space-y-3 group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img src={item.cover} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {item.isPinned && (
                  <span className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-[#00D4FF] border border-white/10">
                    <Pin className="h-3.5 w-3.5 fill-[#00D4FF]" />
                  </span>
                )}
              </div>

              <div>
                <div className="font-bold text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{item.title}</div>
                <div className="text-xs text-white/50 truncate mt-0.5">{item.subtitle}</div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {libraryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(item.href)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <img src={item.cover} alt={item.title} className="h-12 w-12 rounded-xl object-cover" />
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-[#00D4FF] transition-colors">{item.title}</div>
                  <div className="text-xs text-white/50">{item.subtitle}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{item.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
