'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles, Mic2 } from 'lucide-react';

export interface LyricLine {
  timeMs: number;
  text: string;
}

interface SynchronizedLyricsViewProps {
  lyrics: LyricLine[] | null;
  currentTimeMs: number;
  onSeek?: (timeSeconds: number) => void;
  className?: string;
}

export default function SynchronizedLyricsView({
  lyrics,
  currentTimeMs,
  onSeek,
  className = '',
}: SynchronizedLyricsViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasLyrics = lyrics && lyrics.length > 0;

  // Determine active line index
  const activeLineIndex = hasLyrics
    ? lyrics.findIndex((line, idx) => {
        const nextLine = lyrics[idx + 1];
        if (nextLine) {
          return currentTimeMs >= line.timeMs && currentTimeMs < nextLine.timeMs;
        }
        return currentTimeMs >= line.timeMs;
      })
    : -1;

  const activeIdx = activeLineIndex >= 0 ? activeLineIndex : 0;

  // Detect user manual scroll to prevent fighting scroll position
  const handleUserScroll = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2500);
  };

  // Subtle auto-scroll to current active line if user is not actively scrolling
  useEffect(() => {
    if (!isUserScrollingRef.current && hasLyrics && lineRefs.current[activeIdx]) {
      lineRefs.current[activeIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIdx, hasLyrics]);

  if (!hasLyrics) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#9AA1AD] select-none ${className}`}>
        <Mic2 className="h-8 w-8 text-white/20 mb-3" />
        <p className="text-sm font-semibold text-white/80">
          Lyrics aren&apos;t available for this track.
        </p>
        <p className="text-xs text-[#9AA1AD]/60 mt-1">
          Enjoy the high-fidelity sound stream.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col justify-between p-4 bg-[#11141A]/95 rounded-3xl border border-white/[0.08] backdrop-blur-2xl select-none relative overflow-hidden font-sans ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 z-20 shrink-0 px-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#DFFF00] flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#DFFF00]" /> Lyrics
        </span>
        <span className="text-[10px] font-medium text-[#9AA1AD]">
          Tap line to jump
        </span>
      </div>

      {/* Static Synchronized Scrolling List */}
      <div
        ref={containerRef}
        onScroll={handleUserScroll}
        className="relative flex-1 overflow-y-auto scrollbar-none py-10 px-3 space-y-5"
      >
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIdx;
          const isPast = idx < activeIdx;

          return (
            <div
              key={`${line.timeMs}_${idx}`}
              ref={(el) => { lineRefs.current[idx] = el; }}
              onClick={() => onSeek && onSeek(line.timeMs / 1000)}
              className={`transition-all duration-300 py-1 cursor-pointer rounded-xl px-2.5 text-left ${
                isActive
                  ? 'text-[#DFFF00] font-extrabold text-base sm:text-lg opacity-100 bg-[#DFFF00]/10 border-l-2 border-[#DFFF00]'
                  : isPast
                  ? 'text-white/60 font-medium text-sm sm:text-base hover:text-white/80'
                  : 'text-white/40 font-medium text-sm sm:text-base hover:text-white/70'
              }`}
            >
              <p className="leading-relaxed select-text">{line.text}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
