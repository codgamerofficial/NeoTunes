'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Sparkles, AlignLeft } from 'lucide-react';

export type LyricMode = 'classic' | 'kinetic';

export interface LyricLine {
  timeMs: number;
  text: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

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

  const activeIdx = activeLineIndex >= 0 ? activeLineIndex : 0;
  const currentLine = lyrics[activeIdx] || lyrics[0];

  // Auto-scroll active lyric line into center
  useEffect(() => {
    if (activeMode === 'classic' && lineRefs.current[activeIdx]) {
      lineRefs.current[activeIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIdx, activeMode]);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-[#07090E]/90 backdrop-blur-2xl rounded-3xl border border-white/10 text-white select-none relative overflow-hidden">
      
      {/* Mode Switcher Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 z-20 shrink-0">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#00D4FF] flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#00D4FF]" /> Synchronized Lyrics
        </span>

        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full border border-white/10">
          <button
            onClick={() => handleModeToggle('classic')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'classic' ? 'bg-[#00D4FF] text-black shadow-[0_0_10px_rgba(0,214,255,0.4)]' : 'text-white/60 hover:text-white'
            }`}
          >
            <AlignLeft className="h-3.5 w-3.5" /> Classic
          </button>
          <button
            onClick={() => handleModeToggle('kinetic')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'kinetic' ? 'bg-[#00D4FF] text-black shadow-[0_0_10px_rgba(0,214,255,0.4)]' : 'text-white/60 hover:text-white'
            }`}
          >
            <Type className="h-3.5 w-3.5" /> Kinetic
          </button>
        </div>
      </div>

      {/* Main Lyric Display Container with Gradient Mask */}
      <div className="relative flex-1 my-3 overflow-hidden lyrics-mask">
        {activeMode === 'classic' ? (
          <div
            ref={containerRef}
            className="h-full w-full overflow-y-auto scrollbar-none py-12 px-4 space-y-6 text-center"
          >
            {lyrics.map((line, idx) => {
              const isActive = idx === activeIdx;
              const isPast = idx < activeIdx;
              return (
                <p
                  key={idx}
                  ref={(el) => { lineRefs.current[idx] = el; }}
                  className={`text-base sm:text-xl lg:text-2xl font-bold transition-all duration-300 ${
                    isActive
                      ? 'text-[#00D4FF] text-xl sm:text-2xl lg:text-3xl font-black drop-shadow-[0_0_18px_rgba(0,214,255,0.6)] scale-105 opacity-100'
                      : isPast
                      ? 'text-white/35 opacity-40 hover:opacity-70'
                      : 'text-white/60 opacity-60 hover:opacity-90'
                  }`}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center p-4">
            {currentLine && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLine.text}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 1.03 }}
                  transition={{ duration: 0.25 }}
                  className="text-center space-y-3"
                >
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[0_0_25px_rgba(0,214,255,0.5)]">
                    {currentLine.text}
                  </h2>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
