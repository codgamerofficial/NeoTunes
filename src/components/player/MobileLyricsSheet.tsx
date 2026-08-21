'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles, Music2 } from 'lucide-react';
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

  // Auto-scroll active lyric line
  useEffect(() => {
    if (isOpen && lyrics && activeIdx >= 0 && lineRefs.current[activeIdx]) {
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
          <div className="flex items-center gap-1.5 text-[#00D4FF]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Synced Lyrics</span>
          </div>
          <h3 className="text-sm font-extrabold text-white truncate">{track.title}</h3>
          <p className="text-[11px] font-medium text-white/50 truncate">{artistName}</p>
        </div>
      }
    >
      <div className="p-5 py-6 space-y-6 text-center select-none font-sans min-h-[50vh]">
        {lyricsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-white/50">
            <Sparkles className="w-8 h-8 text-[#00D4FF] animate-spin" />
            <p className="text-xs font-mono">Fetching synchronized lyrics...</p>
          </div>
        ) : lyrics && lyrics.length > 0 ? (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIdx;
            const isPast = idx < activeIdx;

            return (
              <p
                key={idx}
                ref={(el) => { lineRefs.current[idx] = el; }}
                onClick={() => onSeek && onSeek(line.time)}
                className={`text-lg sm:text-xl font-extrabold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-[#00D4FF] scale-105 drop-shadow-[0_0_20px_rgba(0,212,255,0.7)]'
                    : isPast
                    ? 'text-white/40 font-bold'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                {line.text}
              </p>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center text-white/50">
            <div className="p-4 rounded-full bg-white/5 border border-white/10">
              <Music2 className="w-8 h-8 text-white/40" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="text-sm font-bold text-white/80">Lyrics unavailable for this track.</p>
              <p className="text-xs text-white/40">We could not retrieve synchronized lyrics for this release.</p>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
