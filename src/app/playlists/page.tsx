'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ListMusic, Plus, Play, Heart, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const PLAYLISTS_DATA = [
  { id: 'chill-hits', title: 'Chill Hits', desc: 'Kick back with the softest pop & lo-fi beats.', count: '50 songs', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
  { id: 'workout-mix', title: 'Workout Mix', desc: '140+ BPM driving electronic & hip-hop beats.', count: '30 songs', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
  { id: 'lo-fi-vibes', title: 'Lo-Fi Vibes', desc: 'Ambient instrumental study beats for deep focus.', count: '40 songs', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
  { id: 'my-favorites', title: 'My Favorites', desc: 'Your personal top played tracks & saved jams.', count: '25 songs', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80' },
  { id: 'bollywood-classics', title: 'Bollywood Classics', desc: 'Timeless melodies from romantic Hindi cinema.', count: '65 songs', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
  { id: 'top-50-global', title: 'Top 50 Global', desc: 'The most played songs in the world right now.', count: '50 songs', coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80' },
];

export default function PlaylistsPage() {
  const router = useRouter();

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#050505] text-white font-sans select-none pb-36">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ListMusic className="h-8 w-8 text-[#00D4FF]" /> Playlists &amp; Collections
          </h1>
          <p className="text-sm text-white/50 mt-1">Explore your curated mixes, collaborative playlists, and saved albums.</p>
        </div>

        <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-bold text-xs shadow-[0_0_15px_#00D4FF] hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" /> Create Playlist
        </button>
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {PLAYLISTS_DATA.map((pl) => (
          <motion.div
            key={pl.id}
            onClick={() => router.push(`/playlists/${pl.id}`)}
            whileHover={{ y: -4 }}
            className="p-4 rounded-3xl bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all space-y-3 group"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <img src={pl.coverUrl} alt={pl.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-3.5 rounded-full bg-[#00D4FF] text-black shadow-[0_0_15px_#00D4FF]">
                  <Play className="h-5 w-5 fill-black ml-0.5" />
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{pl.title}</div>
              <div className="text-xs text-white/50 truncate mt-0.5">{pl.desc}</div>
              <div className="text-[11px] font-mono text-[#00D4FF] mt-1">{pl.count}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
