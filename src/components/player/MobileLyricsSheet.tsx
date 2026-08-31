'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles, Mic2 } from 'lucide-react';
import { Track, getArtistName } from '@/types';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface LyricLine {
  time: number;
  text: string;
}

interface MobileLyricsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  lyrics: LyricLine[] | null;
  lyricsLoading: boolean;
  currentTime: number;
  onSeek?: (time: number) => void;
}

export default function MobileLyricsSheet({
  isOpen,
  onClose,
  track,
  lyrics,
  lyricsLoading,
  currentTime,
  onSeek,
}: MobileLyricsSheetProps) {
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!track) return null;

  const artistName = getArtistName(track.artists || track.artist);

  // Find active line index
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

  // Auto-scroll active lyric line if user is not actively scrolling
  useEffect(() => {
    if (!isUserScrollingRef.current && isOpen && lyrics && activeIdx >= 0 && lineRefs.current[activeIdx]) {
      lineRefs.current[activeIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIdx, lyrics, isOpen]);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      maxHeight="max-h-[85vh]"
      title={
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#DFFF00]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Synchronized Lyrics</span>
          </div>
          <h3 className="text-sm font-extrabold text-white truncate">{track.title}</h3>
          <p className="text-[11px] font-medium text-white/50 truncate">{artistName}</p>
        </div>
      }
    >
      <div 
        onScroll={handleUserScroll}
        className="p-5 py-6 space-y-5 text-left select-none font-sans min-h-[50vh] max-h-[70vh] overflow-y-auto scrollbar-none"
      >
        {lyricsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-white/50 text-center">
            <Mic2 className="w-8 h-8 text-[#DFFF00] animate-pulse" />
            <p className="text-xs font-semibold">Loading lyrics...</p>
          </div>
        ) : lyrics && lyrics.length > 0 ? (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIdx;
            const isPast = idx < activeIdx;

            return (
              <div
                key={`${line.time}_${idx}`}
                ref={(el) => { lineRefs.current[idx] = el as any; }}
                onClick={() => onSeek && onSeek(line.time)}
                className={`py-1 rounded-xl px-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#DFFF00] text-lg sm:text-xl font-extrabold bg-[#DFFF00]/10 border-l-2 border-[#DFFF00]'
                    : isPast
                    ? 'text-white/50 font-medium text-base hover:text-white/75'
                    : 'text-white/40 font-medium text-base hover:text-white/70'
                }`}
              >
                <p className="leading-relaxed select-text">{line.text}</p>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 text-[#9AA1AD]">
            <Mic2 className="h-8 w-8 text-white/20" />
            <p className="text-sm font-semibold text-white/80">Lyrics aren&apos;t available for this track.</p>
            <p className="text-xs text-[#9AA1AD]/60">Enjoy the high-fidelity sound stream.</p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
