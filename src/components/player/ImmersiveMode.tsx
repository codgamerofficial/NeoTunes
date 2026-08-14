'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, X, Sparkles, Palette } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import KineticLyricsView, { LyricLine } from './KineticLyricsView';
import { getArtistName } from '@/types';

export type ThemePreset = 'album_adaptive' | 'midnight' | 'aurora' | 'crimson' | 'cyber' | 'ocean' | 'sunset' | 'amoled';

const THEME_STYLES: Record<ThemePreset, string> = {
  album_adaptive: 'from-indigo-900/60 via-purple-950/80 to-black',
  midnight: 'from-slate-950 via-zinc-950 to-black',
  aurora: 'from-teal-900/60 via-emerald-950/80 to-black',
  crimson: 'from-rose-950/70 via-red-950/80 to-black',
  cyber: 'from-cyan-950/70 via-fuchsia-950/80 to-black',
  ocean: 'from-blue-950/70 via-slate-950 to-black',
  sunset: 'from-amber-950/70 via-orange-950/80 to-black',
  amoled: 'from-black via-black to-black',
};

interface ImmersiveModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImmersiveMode({ isOpen, onClose }: ImmersiveModeProps) {
  const { currentTrack, isPlaying, togglePlay, nextTrack, previousTrack, currentTime } = usePlayerStore();
  const [theme, setTheme] = useState<ThemePreset>('album_adaptive');
  const [showThemePicker, setShowThemePicker] = useState(false);

  if (!isOpen || !currentTrack) return null;

  const mockLyrics: LyricLine[] = [
    { timeMs: 0, text: 'Listening to ' + currentTrack.title },
    { timeMs: 5000, text: 'Feel the rhythm flow through your veins' },
    { timeMs: 12000, text: 'Lost in the frequency of sound' },
    { timeMs: 20000, text: 'NeoTunes Soundstage Immersive Experience' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-gradient-to-b ${THEME_STYLES[theme]} flex flex-col justify-between p-6 sm:p-12 text-white select-none backdrop-blur-3xl`}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#AFC7FF] animate-pulse" />
            <span className="font-black text-sm uppercase tracking-widest text-[#AFC7FF]">
              NeoTunes Immersive Stage
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
              title="Change Stage Theme"
            >
              <Palette className="h-5 w-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Theme Picker Dropdown */}
        <AnimatePresence>
          {showThemePicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 right-12 z-30 p-3 bg-[#17181D] border border-white/15 rounded-2xl shadow-2xl grid grid-cols-2 gap-2 w-64 backdrop-blur-xl"
            >
              {(Object.keys(THEME_STYLES) as ThemePreset[]).map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => {
                    setTheme(tKey);
                    setShowThemePicker(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    theme === tKey ? 'bg-[#AFC7FF] text-black' : 'bg-white/5 hover:bg-white/10 text-white/80'
                  }`}
                >
                  {tKey.replace('_', ' ')}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Stage: Hero Artwork & Kinetic Lyrics */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 my-8 max-w-6xl mx-auto w-full z-10">
          {/* Artwork Stage */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="relative aspect-square w-64 sm:w-80 md:w-96 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(175,199,255,0.3)] border border-white/20"
            >
              <img
                src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80'}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            </motion.div>

            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white truncate max-w-md">{currentTrack.title}</h1>
              <p className="text-sm font-bold text-[#AFC7FF] truncate">
                {getArtistName(currentTrack.artists || currentTrack.artist)}
              </p>
            </div>
          </div>

          {/* Kinetic Lyrics Panel */}
          <div className="h-80 sm:h-96 w-full">
            <KineticLyricsView lyrics={mockLyrics} currentTimeMs={currentTime * 1000} mode="kinetic" />
          </div>
        </div>

        {/* Minimal Floating Player Controls */}
        <div className="flex items-center justify-center gap-6 z-20 pb-4">
          <button onClick={previousTrack} className="p-3 text-white/70 hover:text-white transition-colors cursor-pointer">
            <SkipBack className="h-6 w-6" />
          </button>

          <button
            onClick={togglePlay}
            className="h-16 w-16 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center shadow-[0_0_30px_rgba(175,199,255,0.6)] hover:scale-105 transition-transform cursor-pointer"
          >
            {isPlaying ? <Pause className="h-7 w-7 fill-black" /> : <Play className="h-7 w-7 fill-black ml-1" />}
          </button>

          <button onClick={nextTrack} className="p-3 text-white/70 hover:text-white transition-colors cursor-pointer">
            <SkipForward className="h-6 w-6" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
