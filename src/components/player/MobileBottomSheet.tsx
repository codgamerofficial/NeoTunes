'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Sparkles, Music, Sliders, Headphones } from 'lucide-react';
import PlayerContextPanel, { ContextTab } from './PlayerContextPanel';
import { Track } from '@/types';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  lyrics: { time: number; text: string }[] | null;
  lyricsLoading: boolean;
  onSeek: (time: number) => void;
}

export default function MobileBottomSheet({
  isOpen,
  onToggle,
  track,
  isPlaying,
  currentTime,
  lyrics,
  lyricsLoading,
  onSeek,
}: MobileBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<ContextTab>('lyrics');

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40">
      {/* Peek Bar Button when Sheet is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-6 py-3 bg-[#0A0D14]/95 backdrop-blur-2xl border-t border-white/10 text-white select-none cursor-pointer mb-safe"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#00D4FF]" />
            <span className="text-xs font-bold tracking-wide">Swipe up for Lyrics, Queue & Studio EQ</span>
          </div>
          <ChevronUp className="h-5 w-5 text-[#00D4FF] animate-bounce" />
        </button>
      )}

      {/* Expandable Full-Screen Bottom Sheet Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 top-14 z-50 bg-[#07090E] flex flex-col justify-between pb-safe select-none"
          >
            {/* Sheet Top Handle & Close */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/60 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto" onClick={onToggle} />
              <button
                onClick={onToggle}
                className="p-1.5 rounded-full bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            {/* Context Panel Body */}
            <div className="flex-1 overflow-hidden p-3">
              <PlayerContextPanel
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                track={track}
                isPlaying={isPlaying}
                currentTime={currentTime}
                lyrics={lyrics}
                lyricsLoading={lyricsLoading}
                onSeek={onSeek}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
