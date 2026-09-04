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
      {/* Title */}
      <h1 className="text-xl sm:text-2xl md:text-[26px] font-bold text-white tracking-tight leading-tight line-clamp-1 break-words">
        {track.title}
      </h1>

      {/* Artist & Context */}
      <div className="flex items-center gap-2 mt-0.5 min-w-0">
        <p className="text-sm sm:text-base font-medium text-white/75 truncate">
          {artistName}
        </p>

        {albumName && albumName !== 'NeoTunes Single' && albumName !== track.title && (
          <>
            <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-white/50 truncate">
              {albumName}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
