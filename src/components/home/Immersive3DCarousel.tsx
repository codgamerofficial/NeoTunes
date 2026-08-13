'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

interface CarouselItem {
  id: string;
  title: string;
  badge?: string;
  songCount?: string;
  cover: string;
  artist?: string;
}

export default function Immersive3DCarousel() {
  const { playTrack } = usePlaybackStore();
  const [activeIndex, setActiveIndex] = useState(2);

  const items: CarouselItem[] = [
    {
      id: 'top-hits-2024',
      title: 'Top Hits 2026',
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
      title: 'Viral Hits',
      badge: '🔥 Trending',
      songCount: '50 Songs',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
      artist: 'Trending Worldwide',
    },
    {
      id: 'romantic-hindi',
      title: 'Romantic Mix',
      cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
      artist: 'Arijit, Atif & Pritam',
      songCount: '60 Songs',
    },
    {
      id: 'edm-festival',
      title: 'EDM Pulse',
      cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80',
      artist: 'Martin Garrix, Avicii',
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
    <div className="relative rounded-[32px] overflow-hidden bg-[#121318] border border-white/10 p-6 md:p-10 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            3D Immersive Discovery
          </h2>
          <p className="text-xs text-[#A8A7AF]">Explore top trending collections in interactive 3D</p>
        </div>

        <button className="text-xs font-bold text-[#AFC7FF] hover:underline cursor-pointer">
          View All
        </button>
      </div>

      {/* 3D Stage Container */}
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
              className="absolute w-44 sm:w-56 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-2xl border border-white/20 bg-[#17181D] group select-none"
            >
              <img src={item.cover} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Badge */}
              {item.badge && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FF2D95] text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
                  {item.badge}
                </div>
              )}

              {/* Content Bottom */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <h3 className="text-sm font-black text-white truncate drop-shadow-md">{item.title}</h3>
                <p className="text-[11px] text-[#A8A7AF] truncate">{item.artist}</p>
                {item.songCount && (
                  <p className="text-[10px] font-mono text-[#AFC7FF] font-bold">{item.songCount}</p>
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
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center shadow-[0_0_30px_rgba(175,199,255,0.5)] hover:scale-110 transition-transform cursor-pointer"
                >
                  <Play className="h-7 w-7 fill-black ml-1" />
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        <button onClick={handlePrev} className="p-2 rounded-full bg-[#17181D] border border-white/10 hover:bg-white/10 text-white/70 transition-all cursor-pointer">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === idx ? 'w-6 bg-[#AFC7FF] shadow-[0_0_10px_#AFC7FF]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button onClick={handleNext} className="p-2 rounded-full bg-[#17181D] border border-white/10 hover:bg-white/10 text-white/70 transition-all cursor-pointer">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
