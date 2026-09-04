'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mic2 } from 'lucide-react';
import { Track, getArtistName } from '@/types';
import OverlayLayer from '@/components/navigation/OverlayLayer';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  lyrics: LyricLine[] | null;
  lyricsLoading: boolean;
  currentTime: number;
  onSeek?: (time: number) => void;
  inline?: boolean;
}

export default function LyricsSheet({
  isOpen,
  onClose,
  track,
  lyrics,
  lyricsLoading,
  currentTime,
  onSeek,
  inline = false,
}: LyricsSheetProps) {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const artistName = track ? getArtistName(track.artists || track.artist) : '';

  // Calculate active index
  const activeIndex = lyrics
    ? lyrics.findIndex((line, idx) => {
        const nextLine = lyrics[idx + 1];
        if (nextLine) {
          return currentTime >= line.time && currentTime < nextLine.time;
        }
        return currentTime >= line.time;
      })
    : -1;

  const activeIdx = activeIndex >= 0 ? activeIndex : 0;

  const handleUserScroll = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2500);
  };

  useEffect(() => {
    if (!isUserScrollingRef.current && isOpen && lyrics && activeIdx >= 0 && lineRefs.current[activeIdx]) {
      lineRefs.current[activeIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIdx, lyrics, isOpen]);

  if (!isOpen && !inline) return null;

  const sheetBody = (
    <div
      className={`w-full h-full bg-[#0B0D12]/98 backdrop-blur-2xl text-white flex flex-col overflow-hidden font-sans ${
        inline
          ? 'rounded-3xl border border-white/10 shadow-2xl'
          : 'border-t sm:border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)]'
      }`}
    >
      {/* Mobile Top Drag Indicator */}
      {!inline && (
        <div className="w-full pt-2.5 pb-1 flex justify-center sm:hidden shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-white/25" />
        </div>
      )}

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-white/[0.02]">
        <div className="min-w-0 pr-3">
          <div className="flex items-center gap-1.5 text-[#DFFF00]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider">Synchronized Lyrics</span>
          </div>
          <h3 className="text-sm font-extrabold text-white truncate">{track?.title || 'Track Lyrics'}</h3>
          <p className="text-[11px] text-white/50 truncate">{artistName}</p>
        </div>

        {!inline && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close lyrics"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lyrics Content Container */}
      <div
        onScroll={handleUserScroll}
        className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-left select-none scrollbar-none"
      >
        {lyricsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-white/50 text-center">
            <Mic2 className="w-8 h-8 text-[#DFFF00] animate-pulse" />
            <p className="text-xs font-semibold">Loading synchronized lyrics...</p>
          </div>
        ) : lyrics && lyrics.length > 0 ? (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIdx;
            const isPast = idx < activeIdx;

            return (
              <div
                key={`${line.time}_${idx}`}
                ref={(el) => { lineRefs.current[idx] = el; }}
                onClick={() => onSeek && onSeek(line.time)}
                className={`py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#DFFF00] text-lg sm:text-xl font-extrabold bg-[#DFFF00]/10 border-l-3 border-[#DFFF00] shadow-sm'
                    : isPast
                    ? 'text-white/50 font-medium text-base hover:text-white/75'
                    : 'text-white/35 font-medium text-base hover:text-white/70'
                }`}
              >
                <p className="leading-relaxed select-text">{line.text}</p>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 text-white/50">
            <Mic2 className="h-8 w-8 text-white/20" />
            <p className="text-sm font-semibold text-white/80">Lyrics aren&apos;t available for this track.</p>
            <p className="text-xs text-white/40">Enjoy the high-fidelity sound stream.</p>
          </div>
        )}
      </div>
    </div>
  );

  if (inline) return sheetBody;

  return (
    <OverlayLayer>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:flex-row sm:justify-end select-none font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
            />

            {/* Sheet Panel */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full sm:max-w-md h-[82vh] sm:h-full rounded-t-[28px] sm:rounded-t-none overflow-hidden"
            >
              {sheetBody}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </OverlayLayer>
  );
}
