'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { ListMusic, Plus, Play, Heart, Music, Disc } from 'lucide-react';

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
    <div className="p-6 md:p-10 space-y-8 bg-[#121212] text-white font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#181818]">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ListMusic className="h-8 w-8 text-[#29B6F6]" /> Your Playlists
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1">Curated collections and custom personal playlists.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#29B6F6] text-black font-bold text-xs hover:scale-105 transition-all shadow-lg">
          <Plus className="h-4 w-4" /> Create Playlist
        </button>
      </div>

      {/* Grid of Playlists */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {PLAYLISTS_DATA.map((pl) => (
          <div
            key={pl.id}
            onClick={() => router.push(`/search?q=${encodeURIComponent(pl.title)}`)}
            className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group space-y-3"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg bg-[#282828]">
              <ImageWithFallback src={pl.coverUrl} alt={pl.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <button className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#29B6F6] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-4 w-4 fill-black translate-x-0.5" />
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors truncate">{pl.title}</h3>
              <p className="text-xs text-[#B3B3B3] line-clamp-1 mt-0.5">{pl.desc}</p>
              <span className="text-[10px] font-mono text-[#29B6F6] mt-2 block">{pl.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
