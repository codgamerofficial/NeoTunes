'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Share2, Plus, Disc, CheckCircle2, ShieldCheck } from 'lucide-react';
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

  const fullArtistName = getArtistName(track.artist);
  const artistList = fullArtistName.split(/,\s*|\s*&\s*/).filter(Boolean);
  const primaryArtist = artistList[0] || 'Unknown Artist';
  const secondaryArtists = artistList.slice(1);

  const albumTitle = (track as any).album || (track as any).albumName || 'Album unavailable';
  
  // Real Quality Status Resolution
  const getQualityBadgeLabel = () => {
    if (audioQuality === 'lossless' || (track as any).sourceType === 'flac') return 'Lossless';
    if (audioQuality === 'very_high' || audioQuality === 'high') return 'High Quality';
    if (audioQuality === 'normal') return 'Standard';
    return 'Quality: Source dependent';
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
  };

  return (
    <div className={`space-y-5 select-none ${className}`}>
      {/* Small Eyebrow Label */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-[0.2em]">
          NOW STREAMING
        </span>
        {(track as any).explicit && (
          <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-white/10 text-white/70 border border-white/20">
            E
          </span>
        )}
      </div>

      {/* Main Track Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight flex items-start gap-2">
          <span>{track.title}</span>
          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#00D9FF] shrink-0 mt-1" />
        </h1>

        {/* Clickable Artists List */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-2 text-sm sm:text-base font-bold text-[#00D9FF]">
          <Link
            href={`/search?q=${encodeURIComponent(primaryArtist)}`}
            className="hover:underline hover:text-white transition-colors"
          >
            {primaryArtist}
          </Link>
          {secondaryArtists.length > 0 && (
            <span className="text-white/60 font-normal">
              with{' '}
              {secondaryArtists.map((artist, idx) => (
                <React.Fragment key={artist}>
                  <Link
                    href={`/search?q=${encodeURIComponent(artist)}`}
                    className="hover:underline hover:text-white transition-colors text-white/80"
                  >
                    {artist}
                  </Link>
                  {idx < secondaryArtists.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </span>
          )}
        </div>

        {/* Album & Release Metadata */}
        <div className="flex items-center gap-2 pt-1.5 text-xs text-white/50 font-medium">
          <Disc className="h-3.5 w-3.5 text-white/40" />
          <span className="truncate">{albumTitle}</span>
          {(track as any).releaseYear && (
            <>
              <span>•</span>
              <span>{(track as any).releaseYear}</span>
            </>
          )}
        </div>
      </div>

      {/* Verified Audio Quality & Feature Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#00D9FF]/15 text-[#00D9FF] border border-[#00D9FF]/30">
          <ShieldCheck className="h-3 w-3" />
          {getQualityBadgeLabel()}
        </span>
        {(track as any).lyricsAvailability !== false && (
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#6D3BFF]/15 text-[#6D3BFF] border border-[#6D3BFF]/30">
            Synced Lyrics
          </span>
        )}
      </div>

      {/* Primary Interaction Buttons (Heart, Playlist, Share) */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleLikeToggle}
          className={`p-3 rounded-full border transition-all cursor-pointer ${
            likeAnimating ? 'scale-125' : 'scale-100'
          } ${
            isLiked
              ? 'bg-[#FF2D9A]/20 border-[#FF2D9A] text-[#FF2D9A] shadow-[0_0_15px_rgba(255,45,154,0.4)]'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isLiked ? 'Liked (L)' : 'Like Track (L)'}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-[#FF2D9A]' : ''}`} />
        </button>

        <button
          onClick={onAddToPlaylist}
          className="p-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Add to Playlist"
        >
          <Plus className="h-5 w-5" />
        </button>

        <button
          onClick={onShare}
          className="p-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Share Track"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
