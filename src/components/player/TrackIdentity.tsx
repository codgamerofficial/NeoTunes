'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Share2, Plus, Disc, CheckCircle2, ShieldCheck, MoreHorizontal, Sparkles } from 'lucide-react';
import { Track, getArtistName } from '@/types';

interface TrackIdentityProps {
  track: Track | null;
  audioQuality?: string;
  onShare?: () => void;
  onAddToPlaylist?: () => void;
  className?: string;
}

export default function TrackIdentity({
  track,
  audioQuality = 'auto',
  onShare,
  onAddToPlaylist,
  className = '',
}: TrackIdentityProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  if (!track) {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        <div className="h-8 bg-white/10 rounded-lg w-3/4" />
        <div className="h-4 bg-white/10 rounded-lg w-1/2" />
        <div className="h-4 bg-white/10 rounded-lg w-1/3" />
      </div>
    );
  }

  const fullArtistName = getArtistName(track.artists || track.artist);
  const albumTitle = typeof track.album === 'object' && track.album ? ((track.album as any).name || (track.album as any).title) : (track.album || 'Single Release');

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
  };

  return (
    <div className={`space-y-5 select-none ${className}`}>
      {/* Small Eyebrow Label */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-black text-[#00D4FF] uppercase tracking-[0.25em]">
          NOW STREAMING
        </span>
        {(track as any).explicit && (
          <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-white/10 text-white/70 border border-white/20">
            EXPLICIT
          </span>
        )}
      </div>

      {/* Main Track Title & Artist */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] max-w-full truncate">
          {track.title}
        </h1>

        <div className="text-sm sm:text-base md:text-lg font-bold text-[#00D4FF]">
          <Link
            href={`/search?q=${encodeURIComponent(fullArtistName)}`}
            className="hover:underline hover:text-white transition-colors"
          >
            {fullArtistName}
          </Link>
        </div>

        {/* Album & Release Metadata */}
        <div className="flex items-center gap-2 text-xs text-white/60 font-medium pt-1">
          <Disc className="h-3.5 w-3.5 text-[#00D4FF]/70 shrink-0" />
          <span className="truncate">{albumTitle}</span>
        </div>
      </div>

      {/* Verified Audio Quality & Feature Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30">
          LOSSLESS
        </span>
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">
          HI-RES
        </span>
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
          SYNCED LYRICS
        </span>
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-[#EC4899]/15 text-[#EC4899] border border-[#EC4899]/30">
          DOLBY ATMOS
        </span>
      </div>

      {/* Compact Action Buttons */}
      <div className="flex items-center gap-2.5 pt-2">
        <button
          onClick={handleLikeToggle}
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${
            likeAnimating ? 'scale-125' : 'scale-100'
          } ${
            isLiked
              ? 'bg-[#EC4899]/20 border-[#EC4899] text-[#EC4899] shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isLiked ? 'Liked' : 'Like Track'}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#EC4899]' : ''}`} />
        </button>

        <button
          onClick={onAddToPlaylist}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Add to Playlist"
        >
          <Plus className="h-4 w-4" />
        </button>

        <button
          onClick={onShare}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Share Track"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <button
          className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="More Options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
