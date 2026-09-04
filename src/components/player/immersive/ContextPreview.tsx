'use client';

import React from 'react';
import { Music, ChevronRight } from 'lucide-react';
import { Track } from '@/types';

interface ContextPreviewProps {
  track: Track;
  lyrics: { time: number; text: string }[] | null;
  lyricsLoading: boolean;
  progress: number;
  onOpenLyrics: () => void;
  className?: string;
}

export default function ContextPreview({
  track,
  lyrics,
  lyricsLoading,
  progress,
  onOpenLyrics,
  className = '',
}: ContextPreviewProps) {
  // Compute active lyric snippet or fall back to track context
  const activeSnippet = React.useMemo(() => {
    if (lyricsLoading) return 'Loading lyrics...';
    if (lyrics && lyrics.length > 0) {
      if (lyrics[0] && progress < lyrics[0].time) {
        return 'Warming up';
      }
      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (progress >= lyrics[i].time) {
          return lyrics[i].text;
        }
      }
      return lyrics[0]?.text || 'Warming up';
    }

    // Fallback context: Album or Genre or Listening context
    const albumName = typeof track.album === 'object' ? (track.album as any)?.name : track.album;
    if (albumName && albumName !== 'NeoTunes Single') {
      return `Album • ${albumName}`;
    }
    return 'View lyrics & song credits';
  }, [lyrics, lyricsLoading, progress, track]);

  return (
    <button
      onClick={onOpenLyrics}
      className={`w-full flex items-center gap-2 py-0.5 text-left text-sm sm:text-[15px] font-semibold text-white/80 hover:text-white transition-colors cursor-pointer group truncate select-none ${className}`}
      aria-label="Open lyrics panel"
    >
      <Music className="w-4 h-4 text-white/60 shrink-0 group-hover:scale-105 transition-transform" />
      <span className="truncate flex-1 font-medium transition-opacity duration-300">
        {activeSnippet}
      </span>
      <ChevronRight className="w-4 h-4 text-white/50 shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}
