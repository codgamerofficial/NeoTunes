'use client';

import React from 'react';
import { Track } from '@/types';
import { getTrackArtwork } from '@/utils/artwork';

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
  const coverUrl = getTrackArtwork(track);

  return (
    <div className={`relative flex items-center justify-center w-full ${className}`}>
      {/* Low-Opacity Ambient Backlight glow derived from Artwork */}
      <div
        className={`absolute inset-0 rounded-[40px] bg-cover bg-center filter blur-3xl opacity-40 transition-transform duration-1000 pointer-events-none ${
          isPlaying ? 'scale-105' : 'scale-95'
        }`}
        style={{ backgroundImage: `url(${coverUrl})` }}
      />

      {/* Main Square 1:1 Sharp Artwork Container */}
      <div
        className={`relative z-10 aspect-square w-full max-w-[min(82vw,360px)] sm:max-w-[380px] lg:max-w-[min(38vw,460px)] xl:max-w-[min(42vw,560px)] rounded-3xl sm:rounded-[32px] overflow-hidden border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] transition-all duration-700 ease-out ${
          isPlaying ? 'scale-[1.01] shadow-[0_30px_70px_rgba(0,214,255,0.15)]' : 'scale-100'
        }`}
      >
        <img
          src={coverUrl}
          alt={track ? track.title : 'Album Cover'}
          className="w-full h-full object-cover select-none"
        />

        {/* Subtle Glass Edge Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
      </div>
    </div>
  );
}
