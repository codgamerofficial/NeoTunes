'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Flame, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface CarouselItem {
  id: string;
  title: string;
  badge?: string;
  songCount?: string;
  tag?: string;
  cover: string;
  artist?: string;
}

export default function Immersive3DCarousel() {
  const { playTrack } = usePlayerStore();
  const [activeIndex, setActiveIndex] = useState(2);

  const items: CarouselItem[] = [
    {
      id: 'top-hits-2024',
      title: 'Top Hits 2024',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      artist: 'Global Chartbuster',
      songCount: '100 Songs',
    },
    {
      id: 'lofi-chill',
      title: 'Lo-Fi Chill',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      artist: 'Deep Focus & Study',
      songCount: '75 Songs',
    },
    {
      id: 'viral-reels-hits',
      title: 'Viral Reels Hits',
      badge: '🔥 Viral',
      songCount: '50 Songs',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
      artist: 'Trending Worldwide',
    },
    {
      id: 'romantic-hindi',
      title: 'Romantic Hindi',
      cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
      artist: 'Arijit, Atif & Pritam',
      songCount: '60 Songs',
    },
    {
      id: 'edm-festival',
      title: 'EDM Festival',
      cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80',
      artist: 'Avicii, Martin Garrix',
      songCount: '80 Songs',
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-[#0A071E] via-[#09061A] to-[#05030F] border border-white/10 p-6 md:p-10 shadow-2xl space-y-6">
      {/* Background Cosmic Portal Artwork */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#7A3CFF]/30 via-[#00D4FF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Neon Ring Portal Artwork */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-64 border-2 border-[#7A3CFF]/40 rounded-full shadow-[0_0_50px_#7A3CFF] pointer-events-none flex items-center justify-center">
        <div className="w-48 h-48 border border-[#00D4FF]/30 rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            3D Immersive Explore
          </h2>
          <p className="text-xs text-white/50">Explore top trending collections in interactive 3D</p>
        </div>

        <button className="text-xs font-bold text-[#00D4FF] hover:underline cursor-pointer">
          View All
        </button>
      </div>

      {/* 3D Stage Stage Container */}
      <div className="relative z-10 h-72 md:h-80 flex items-center justify-center perspective-[1200px] overflow-hidden">
        {items.map((item, idx) => {
          const offset = idx - activeIndex;
          const absOffset = Math.abs(offset);

          let rotateY = offset * -18;
          let translateZ = -absOffset * 140;
          let translateX = offset * 180;
          let scale = 1 - absOffset * 0.15;
          let opacity = 1 - absOffset * 0.3;

          if (absOffset > 2) {
            opacity = 0;
          }

          return (
            <motion.div
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              animate={{
                rotateY,
                translateZ,
                translateX,
                scale,
                opacity,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="absolute w-44 sm:w-56 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 bg-[#120F26] group select-none"
            >
              <img src={item.cover} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Badge */}
              {item.badge && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF2D95] to-[#7A3CFF] text-[10px] font-black text-white uppercase tracking-wider shadow-lg flex items-center gap-1">
                  {item.badge}
                </div>
              )}

              {/* Content Bottom */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <h3 className="text-sm font-black text-white truncate drop-shadow-md">{item.title}</h3>
                <p className="text-[11px] text-white/70 truncate">{item.artist}</p>
                {item.songCount && (
                  <p className="text-[10px] font-mono text-[#00D4FF] font-bold">{item.songCount}</p>
                )}
              </div>

              {/* Center Play Button for Active Card */}
              {offset === 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack({
                      id: item.id,
                      title: item.title,
                      artist: item.artist || 'NeoTunes',
                      coverUrl: item.cover,
                      durationMs: 220000,
                      sourceType: 'youtube',
                    });
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-gradient-to-tr from-[#7A3CFF] to-[#00D4FF] text-black flex items-center justify-center shadow-[0_0_30px_#7A3CFF] hover:scale-110 transition-transform"
                >
                  <Play className="h-7 w-7 fill-black ml-1" />
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Dots & Arrow Controls */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        <button onClick={handlePrev} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition-all">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                activeIndex === idx ? 'w-6 bg-[#00D4FF] shadow-[0_0_10px_#00D4FF]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button onClick={handleNext} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition-all">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
