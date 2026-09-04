'use client';

import React from 'react';
import { Track, getArtistName } from '@/types';

interface TrackMetaProps {
  track: Track;
  className?: string;
}

export default function TrackMeta({ track, className = '' }: TrackMetaProps) {
  const artistName = getArtistName(track.artists || track.artist);
  const albumName = typeof track.album === 'object' ? (track.album as any)?.name : track.album;

  return (
    <div className={`min-w-0 flex-1 pr-2 select-none ${className}`}>
      {/* Title (1-2 lines maximum with responsive fluid typography) */}
      <h1 className="text-[clamp(22px,2vw,32px)] font-bold sm:font-extrabold text-white tracking-tight leading-[1.2] line-clamp-2 break-words">
        {track.title}
      </h1>

      {/* Artist & Context */}
      <div className="flex items-center gap-2 mt-1 min-w-0 flex-wrap">
        <p className="text-sm sm:text-[15px] font-semibold text-white/80 truncate max-w-[280px]">
          {artistName}
        </p>

        {albumName && albumName !== 'NeoTunes Single' && albumName !== track.title && (
          <>
            <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-white/50 truncate max-w-[240px]">
              {albumName}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
