'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Sparkles, Tv, AlignLeft } from 'lucide-react';

export type LyricMode = 'classic' | 'kinetic' | 'projector';

export interface LyricLine {
  timeMs: number;
  text: string;
  words?: Array<{ word: string; startMs: number; endMs: number }>;
}

interface KineticLyricsViewProps {
  lyrics: LyricLine[];
  currentTimeMs: number;
  mode?: LyricMode;
  onModeChange?: (mode: LyricMode) => void;
}

export default function KineticLyricsView({
  lyrics,
  currentTimeMs,
  mode = 'kinetic',
  onModeChange,
}: KineticLyricsViewProps) {
  const [activeMode, setActiveMode] = useState<LyricMode>(mode);

  const handleModeToggle = (newMode: LyricMode) => {
    setActiveMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  const activeLineIndex = lyrics.findIndex((line, idx) => {
    const nextLine = lyrics[idx + 1];
    if (nextLine) {
      return currentTimeMs >= line.timeMs && currentTimeMs < nextLine.timeMs;
    }
    return currentTimeMs >= line.timeMs;
  });

  const currentLine = lyrics[activeLineIndex] || lyrics[0];

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-[#000000]/80 backdrop-blur-2xl rounded-3xl border border-white/10 text-white select-none relative overflow-hidden">
      
      {/* Mode Switcher Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 z-10">
        <span className="text-xs font-black uppercase tracking-widest text-[#AFC7FF] flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Synchronized Lyrics
        </span>

        <div className="flex items-center gap-1.5 bg-[#17181D] p-1 rounded-full border border-white/10">
          <button
            onClick={() => handleModeToggle('classic')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'classic' ? 'bg-[#AFC7FF] text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <AlignLeft className="h-3.5 w-3.5" /> Classic
          </button>
          <button
            onClick={() => handleModeToggle('kinetic')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'kinetic' ? 'bg-[#AFC7FF] text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Type className="h-3.5 w-3.5" /> Kinetic
          </button>
          <button
            onClick={() => handleModeToggle('projector')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'projector' ? 'bg-[#AFC7FF] text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            <Tv className="h-3.5 w-3.5" /> Projector
          </button>
        </div>
      </div>

      {/* Main Lyric Display Container */}
      <div className="flex-1 flex items-center justify-center my-6 overflow-hidden">
        {activeMode === 'classic' && (
          <div className="space-y-6 text-center overflow-y-auto max-h-[400px] scrollbar-none px-4">
            {lyrics.map((line, idx) => {
              const isActive = idx === activeLineIndex;
              return (
                <motion.p
                  key={idx}
                  animate={{ scale: isActive ? 1.08 : 1, opacity: isActive ? 1 : 0.4 }}
                  className={`text-lg sm:text-2xl font-bold transition-all ${
                    isActive ? 'text-[#AFC7FF] drop-shadow-[0_0_15px_rgba(175,199,255,0.6)]' : 'text-white/40'
                  }`}
                >
                  {line.text}
                </motion.p>
              );
            })}
          </div>
        )}

        {activeMode === 'kinetic' && currentLine && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLine.text}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-4 px-6"
            >
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[0_0_30px_rgba(175,199,255,0.4)]">
                {currentLine.text}
              </h2>
            </motion.div>
          </AnimatePresence>
        )}

        {activeMode === 'projector' && currentLine && (
          <div className="text-center px-8 max-w-5xl">
            <motion.h1
              key={currentLine.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-4xl sm:text-7xl font-black text-[#AFC7FF] tracking-tighter uppercase leading-none drop-shadow-[0_0_50px_rgba(175,199,255,0.8)]"
            >
              {currentLine.text}
            </motion.h1>
          </div>
        )}
      </div>

    </div>
  );
}
