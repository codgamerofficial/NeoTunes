'use client';

import React from 'react';
import { Track } from '@/types';
import { getTrackArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';

interface ArtworkStageProps {
  track: Track | null;
  isPlaying: boolean;
  className?: string;
  sizeClassName?: string;
}

export default function ArtworkStage({
  track,
  isPlaying,
  className = '',
  sizeClassName = 'w-[clamp(260px,44vh,480px)] aspect-square max-w-[480px] max-h-[480px]',
}: ArtworkStageProps) {
  const coverUrl = getTrackArtwork(track);

  return (
    <div className={`relative flex items-center justify-center select-none shrink-0 ${className}`}>
      {/* Subtle Artwork-Derived Ambient Lighting Aura */}
      {coverUrl && (
        <div
          className={`absolute inset-0 rounded-[36px] bg-cover bg-center filter blur-3xl opacity-25 transition-all duration-1000 pointer-events-none ${
            isPlaying ? 'scale-105 opacity-30' : 'scale-95 opacity-15'
          }`}
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
      )}

      {/* Main Square 1:1 Sharp Artwork Container */}
      <div
        className={`relative z-10 ${sizeClassName} rounded-[28px] sm:rounded-[32px] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] transition-all duration-500 ease-out bg-[#11141A] ${
          isPlaying ? 'scale-[1.01]' : 'scale-100'
        }`}
      >
        <Artwork
          source={coverUrl}
          size="full"
          alt={track ? track.title : 'Album Cover'}
          canonicalId={track ? track.id : undefined}
          type="track"
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Subtle Glass Edge Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/[0.08] pointer-events-none" />
      </div>
    </div>
  );
}
