'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Radio, Play, Sparkles } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

export default function PodcastsPage() {
  const router = useRouter();
  const { playTrack } = usePlaybackStore();

  const podcasts = [
    {
      id: 'pod-reframe-show',
      title: 'The Reframe Show',
      host: 'Ranveer Allahbadia',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      episodes: '142 Episodes',
    },
    {
      id: 'pod-figuring-out',
      title: 'FIGURING OUT',
      host: 'Raj Shamani',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      episodes: '98 Episodes',
    },
    {
      id: 'pod-tech-future',
      title: 'Tech & Future 2026',
      host: 'NeoTunes Originals',
      cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80',
      episodes: '64 Episodes',
    },
  ];

  const categories = [
    { label: 'Health', icon: '❤️', count: '120 shows' },
    { label: 'Business', icon: '💼', count: '240 shows' },
    { label: 'Storytelling', icon: '📖', count: '180 shows' },
    { label: 'Tech & AI', icon: '⚡', count: '310 shows' },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#000000] text-[#F4F1F7] font-sans select-none pb-36">
      
      {/* Header */}
      <div>
        <span className="text-xs font-mono font-bold text-[#AFC7FF] uppercase tracking-widest flex items-center gap-1.5">
          <Radio className="h-4 w-4" /> NeoTunes Podcasts
        </span>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight pt-1">
          Listen to Top Minds &amp; Audio Series
        </h1>
      </div>

      {/* Featured Podcast Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {podcasts.map((pod) => (
          <motion.div
            key={pod.id}
            whileHover={{ y: -6 }}
            className="p-4 rounded-[28px] bg-[#121318] border border-white/10 space-y-4 cursor-pointer group hover:border-[#AFC7FF]/40 transition-all"
            onClick={() => playTrack({
              id: pod.id,
              title: pod.title,
              artist: pod.host,
              coverUrl: pod.cover,
              durationMs: 1800000,
              sourceType: 'youtube',
            })}
          >
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg border border-white/10">
              <img src={pod.cover} alt={pod.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <button className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-5 w-5 fill-black ml-0.5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white truncate group-hover:text-[#AFC7FF] transition-colors">{pod.title}</h3>
              <p className="text-xs text-[#A8A7AF]">{pod.host}</p>
              <p className="text-[10px] font-mono font-bold text-[#AFC7FF] pt-1">{pod.episodes}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-black text-white tracking-tight">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="p-5 rounded-2xl bg-[#121318] border border-white/10 flex items-center gap-3 cursor-pointer hover:border-[#7A3CFF]/40 transition-all"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <div className="text-sm font-black text-white">{cat.label}</div>
                <div className="text-[10px] text-[#A8A7AF]">{cat.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
