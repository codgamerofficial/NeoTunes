'use client';

import React from 'react';
import { Track, getCoverUrl } from '@/types';

interface ArtworkStageProps {
  track: Track | null;
  isPlaying: boolean;
  className?: string;
}

export default function ArtworkStage({
  track,
  isPlaying,
  className = '',
}: ArtworkStageProps) {
  const coverUrl = track
    ? getCoverUrl(track)
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80';

  return (
    <div className={`relative flex items-center justify-center p-4 ${className}`}>
      {/* Low-Opacity Blurred Ambient Backlight derived from Artwork */}
      <div
        className={`absolute inset-4 rounded-[36px] bg-cover bg-center filter blur-3xl opacity-35 transition-all duration-1000 pointer-events-none ${
          isPlaying ? 'scale-110' : 'scale-100'
        }`}
        style={{ backgroundImage: `url(${coverUrl})` }}
      />

      {/* Main Square 1:1 Sharp Artwork Container */}
      <div
        className={`relative z-10 aspect-square w-full max-w-[460px] lg:max-w-[520px] rounded-[32px] overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-out ${
          isPlaying ? 'scale-[1.01]' : 'scale-100'
        }`}
      >
        <img
          src={coverUrl}
          alt={track ? track.title : 'Album Cover'}
          className="w-full h-full object-cover select-none"
        />

        {/* Subtle Edge Reflection Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
      </div>
    </div>
  );
}
