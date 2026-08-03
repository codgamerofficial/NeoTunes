'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mic, Moon, Sparkles, ChevronRight, ChevronLeft, Play, Radio, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function BottomFeaturesGrid() {
  const { playTrack } = usePlayerStore();
  const [active3dCard, setActive3dCard] = useState(1);

  const albumCards = [
    { title: 'STARBOY', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
    { title: 'After Hours', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
    { title: 'Dua Lipa', artist: 'Complete Edition', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
    { title: 'AVICII', artist: 'Love Hits', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80' },
  ];

  const vibeRooms = [
    { title: 'Chill Lounge', count: '120 listening', bg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
    { title: 'Night Drive', count: '96 listening', bg: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80' },
    { title: 'Lo-Fi Cafe', count: '74 listening', bg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
    { title: 'Rainy Mood', count: '57 listening', bg: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      
      {/* ── CARD 1: 3D SCROLL EXPERIENCE ── */}
      <div className="glass-card-v2 p-5 rounded-[28px] border border-white/10 space-y-4 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider">
            3D SCROLL EXPERIENCE
          </h3>
          <p className="text-[11px] text-white/50">Scroll through albums, artists & genres in a 3D space.</p>
        </div>

        {/* 3D Mini Album Stage */}
        <div className="relative h-40 w-full flex items-center justify-center overflow-hidden">
          <div className="flex items-center gap-2">
            {albumCards.map((card, idx) => (
              <motion.div
                key={card.title}
                onClick={() => setActive3dCard(idx)}
                animate={{
                  scale: active3dCard === idx ? 1.05 : 0.85,
                  rotateY: (idx - active3dCard) * -15,
                  opacity: active3dCard === idx ? 1 : 0.6,
                }}
                className="w-24 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/20 relative cursor-pointer group shrink-0"
              >
                <img src={card.cover} alt={card.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                  <span className="text-[10px] font-black text-white truncate">{card.title}</span>
                  <span className="text-[8px] text-white/60 truncate">{card.artist}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <button 
            onClick={() => setActive3dCard((prev) => (prev > 0 ? prev - 1 : albumCards.length - 1))}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-mono text-white/40 font-bold">{active3dCard + 1} / {albumCards.length}</span>
          <button 
            onClick={() => setActive3dCard((prev) => (prev < albumCards.length - 1 ? prev + 1 : 0))}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── CARD 2: LIVE JAM ── */}
      <div className="glass-card-v2 p-5 rounded-[28px] border border-white/10 space-y-4 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-[#7A3CFF] uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE JAM
          </h3>
          <p className="text-[11px] text-white/50">Listen together. Anywhere.</p>
        </div>

        {/* Room Header */}
        <div className="p-3 rounded-2xl bg-[#120F24] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              🎧 Room: Chill Vibes
            </span>
            <span className="h-2 w-2 rounded-full bg-[#00D4FF] animate-ping" />
          </div>

          {/* Member Avatars */}
          <div className="flex items-center justify-between">
            <div className="flex items-center -space-x-2">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
              ].map((src, i) => (
                <img key={i} src={src} alt="" className="h-7 w-7 rounded-full object-cover border-2 border-[#120F24]" />
              ))}
              <div className="h-7 w-7 rounded-full bg-[#7A3CFF] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-[#120F24]">
                +6
              </div>
            </div>

            <button className="btn-neo-primary px-3 py-1 text-xs font-black cursor-pointer">
              Join Room
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 3: SMART LYRICS ── */}
      <div className="glass-card-v2 p-5 rounded-[28px] border border-white/10 space-y-4 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-[#FF2D95] uppercase tracking-wider flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5" /> SMART LYRICS
          </h3>
          <p className="text-[11px] text-white/50">Feel the lyrics come alive.</p>
        </div>

        {/* Lyric lines container */}
        <div className="p-3.5 rounded-2xl bg-[#140B1D] border border-white/10 space-y-2 text-center">
          <p className="text-xs font-bold text-white/40">Tere bina zindagi se</p>
          <p className="text-sm font-black text-[#00D4FF] drop-shadow-[0_0_8px_#00D4FF]">
            koi shikwa to nahi...
          </p>
          <p className="text-xs font-bold text-white/40">Shikwa nahi...</p>
        </div>
      </div>

      {/* ── CARD 4: VIBE ROOM ── */}
      <div className="glass-card-v2 p-5 rounded-[28px] border border-white/10 space-y-4 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider flex items-center gap-1.5">
            <Moon className="h-3.5 w-3.5" /> VIBE ROOM
          </h3>
          <p className="text-[11px] text-white/50">Aesthetic rooms for every mood.</p>
        </div>

        {/* 2x2 Grid of Room Cards */}
        <div className="grid grid-cols-2 gap-2">
          {vibeRooms.map((room) => (
            <div
              key={room.title}
              className="relative h-16 rounded-xl overflow-hidden border border-white/10 group cursor-pointer"
            >
              <img src={room.bg} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/60 p-2 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-white truncate">{room.title}</span>
                <span className="text-[8px] font-mono text-[#00D4FF]">{room.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
