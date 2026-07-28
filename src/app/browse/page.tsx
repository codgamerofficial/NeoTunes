'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Play, Compass, Flame, Radio, Sparkles, Music, Disc } from 'lucide-react';

const GENRES = [
  { id: 'pop', title: 'Pop & Chart', bg: 'from-pink-600 to-purple-800', count: '1,240 tracks', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: 'hiphop', title: 'Hip-Hop & Rap', bg: 'from-[#29B6F6] to-blue-900', count: '980 tracks', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
  { id: 'lofi', title: 'Lo-Fi Coding Beats', bg: 'from-emerald-600 to-teal-900', count: '850 tracks', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  { id: 'classical', title: 'Classical & Ambient', bg: 'from-amber-600 to-orange-900', count: '620 tracks', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
  { id: 'rock', title: 'Rock & Alternative', bg: 'from-red-600 to-rose-900', count: '1,100 tracks', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
  { id: 'electronic', title: 'EDM & Synthwave', bg: 'from-purple-600 to-indigo-900', count: '1,450 tracks', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
  { id: 'jazz', title: 'Smooth Jazz', bg: 'from-cyan-600 to-blue-800', count: '430 tracks', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
  { id: 'rb', title: 'R&B & Soul', bg: 'from-fuchsia-600 to-pink-900', count: '740 tracks', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80' },
];

const MOODS = [
  { id: 'focus', title: 'Deep Focus Coding', desc: 'Instrumental ambient soundscapes for flow state', icon: Sparkles },
  { id: 'chill', title: 'Late Night Chill', desc: 'Smooth beats and acoustic rhythms', icon: Compass },
  { id: 'workout', title: 'High Energy Workout', desc: '140+ BPM driving beats to push your limits', icon: Flame },
  { id: 'rain', title: 'Rainy Day Acoustics', desc: 'Warm piano and intimate vocal tones', icon: Radio },
];

export default function BrowsePage() {
  const router = useRouter();
  const { playTrack } = usePlaybackStore();

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#121212] text-white font-sans select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Browse Genres & Moods</h1>
        <p className="text-sm text-[#B3B3B3] mt-1">Explore curated categories, top charts, and specialized audio mixes.</p>
      </div>

      {/* Mood Mixes */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-white tracking-tight">Curated Mood Mixes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOODS.map((mood) => {
            const Icon = mood.icon;
            return (
              <div
                key={mood.id}
                onClick={() => router.push(`/search?q=${encodeURIComponent(mood.title)}`)}
                className="p-5 rounded-2xl bg-[#181818] hover:bg-[#282828] border border-[#282828] cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#29B6F6]/10 text-[#29B6F6]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <button className="h-9 w-9 rounded-full bg-[#29B6F6] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-4 w-4 fill-black translate-x-0.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors">{mood.title}</h3>
                  <p className="text-xs text-[#B3B3B3] mt-1 line-clamp-2">{mood.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Genres Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-white tracking-tight">Genres & Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {GENRES.map((g) => (
            <div
              key={g.id}
              onClick={() => router.push(`/search?q=${encodeURIComponent(g.title)}`)}
              className="relative h-44 rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-[#282828]"
            >
              <ImageWithFallback src={g.cover} alt={g.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent p-4 flex flex-col justify-between">
                <span className="text-[10px] font-mono font-bold text-[#29B6F6] uppercase bg-black/60 px-2 py-0.5 rounded-md w-fit backdrop-blur-sm">
                  {g.count}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-[#29B6F6] transition-colors">{g.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
