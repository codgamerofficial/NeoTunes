'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VinylTurntableStageProps {
  coverUrl: string;
  title: string;
  artist: string;
  isPlaying: boolean;
}

export default function VinylTurntableStage({ coverUrl, title, artist, isPlaying }: VinylTurntableStageProps) {
  return (
    <div className="relative w-full max-w-md aspect-square flex items-center justify-center select-none shrink-0 py-2">
      {/* 1. Glowing Ambient Stage Base */}
      <div className="absolute inset-x-8 bottom-2 h-8 bg-gradient-to-r from-[#7A3CFF]/40 via-[#00D4FF]/30 to-[#FF2D95]/40 rounded-full blur-2xl pointer-events-none" />

      {/* 2. Floating Album Cover Card */}
      <motion.div
        animate={{
          y: isPlaying ? [0, -4, 0] : 0,
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: 'easeInOut',
        }}
        className="relative z-20 w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-[24px] overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group shrink-0"
      >
        <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
        
        {/* Spine Reflection */}
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-r from-white/30 to-transparent" />
      </motion.div>

      {/* 3. Floating 3D Vinyl LP Record (Sliding out slightly from behind album art & spinning) */}
      <motion.div
        animate={{
          rotate: isPlaying ? 360 : 0,
          x: isPlaying ? [25, 32, 25] : 25,
        }}
        transition={{
          rotate: { repeat: Infinity, duration: 10, ease: 'linear' },
          x: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
        }}
        className="absolute z-10 w-40 h-40 sm:w-52 sm:h-52 lg:w-60 lg:h-60 rounded-full bg-[#08080A] border-4 border-[#181820] shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex items-center justify-center"
      >
        {/* Vinyl Grooves */}
        <div className="absolute inset-2 rounded-full border border-white/10" />
        <div className="absolute inset-5 rounded-full border border-white/5" />
        <div className="absolute inset-8 rounded-full border border-white/10" />
        <div className="absolute inset-12 rounded-full border border-white/5" />

        {/* Center Vinyl Label */}
        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#7A3CFF] to-[#FF2D95] p-1 flex items-center justify-center shadow-lg border border-white/20">
          <img src={coverUrl} alt="" className="h-full w-full object-cover rounded-full" />
          <div className="absolute h-3 w-3 rounded-full bg-[#08080A] border-2 border-white/40" />
        </div>
      </motion.div>

      {/* 4. Turntable Tonearm Needle */}
      <motion.div
        animate={{
          rotate: isPlaying ? 18 : 0,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-2 right-4 sm:right-8 z-30 w-20 h-24 pointer-events-none origin-top-right scale-90 sm:scale-100"
      >
        {/* Pivot Base */}
        <div className="absolute top-0 right-0 h-6 w-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-700 shadow-xl border border-white/30 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-[#7A3CFF]" />
        </div>

        {/* Arm Rod */}
        <div className="absolute top-3 right-2.5 w-1 h-20 bg-gradient-to-b from-gray-400 via-gray-200 to-gray-500 rounded-full transform rotate-[22deg] origin-top-right shadow-md" />

        {/* Needle Head cartridge */}
        <div className="absolute bottom-1 right-10 w-3 h-4 bg-[#00D4FF] rounded-sm shadow-[0_0_10px_#00D4FF] transform rotate-[22deg]" />
      </motion.div>
    </div>
  );
}
