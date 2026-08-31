'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Share2, Plus, Check, MoreHorizontal } from 'lucide-react';
import { Track, getArtistName } from '@/types';
import { useToast } from '@/components/ui/NeoToast';
import { likedSongsService } from '@/services/likedSongsService';

interface TrackIdentityProps {
  track: Track | null;
  audioQuality?: string;
  onShare?: () => void;
  onAddToPlaylist?: () => void;
  onOpenOptions?: () => void;
  className?: string;
}

export default function TrackIdentity({
  track,
  onShare,
  onAddToPlaylist,
  onOpenOptions,
  className = '',
}: TrackIdentityProps) {
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  // Sync liked state from likedSongsService and listen to app-wide changes
  useEffect(() => {
    if (!track?.id) return;
    setIsLiked(likedSongsService.isLiked(track.id));

    const handleLikedChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ trackId: string; isLiked: boolean }>;
      if (customEvent.detail && customEvent.detail.trackId === track.id) {
        setIsLiked(customEvent.detail.isLiked);
      }
    };

    window.addEventListener('neotunes_liked_change', handleLikedChange);
    return () => {
      window.removeEventListener('neotunes_liked_change', handleLikedChange);
    };
  }, [track?.id]);

  if (!track) {
    return (
      <div className={`space-y-2 animate-pulse ${className}`}>
        <div className="h-6 bg-white/10 rounded-lg w-48 mx-auto" />
        <div className="h-4 bg-white/10 rounded-lg w-32 mx-auto" />
      </div>
    );
  }

  const fullArtistName = getArtistName(track.artists || track.artist);
  const albumTitle = typeof track.album === 'object' && track.album 
    ? ((track.album as any).name || (track.album as any).title) 
    : (track.album || '');

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);

    const nextState = await likedSongsService.toggleLike(track);
    setIsLiked(nextState);
    showToast(nextState ? 'Saved to Liked Songs' : 'Removed from Liked Songs');
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToPlaylist) {
      onAddToPlaylist();
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare();
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: track.title,
        text: `Listen to "${track.title}" by ${fullArtistName} on NeoTunes`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard');
    }
  };

  return (
    <div className={`space-y-1.5 select-none flex flex-col items-center text-center shrink-0 w-full ${className}`}>
      
      {/* Track Title (1-2 lines with full text handling) */}
      <div className="space-y-0.5 max-w-lg px-3 mx-auto">
        <h1 
          className="text-base sm:text-lg md:text-xl lg:text-[22px] font-extrabold text-[#F5F7FA] tracking-tight leading-snug line-clamp-2"
          title={track.title}
        >
          {track.title}
        </h1>

        {/* Artist */}
        <div className="text-xs sm:text-sm font-semibold text-[#9AA1AD] line-clamp-1">
          <Link
            href={`/search?q=${encodeURIComponent(fullArtistName)}`}
            className="hover:text-[#00E5FF] hover:underline transition-colors"
          >
            {fullArtistName}
          </Link>
        </div>

        {/* Album / Context */}
        {albumTitle && (
          <p className="text-[10px] sm:text-xs text-[#9AA1AD]/60 line-clamp-1 font-medium">
            {albumTitle}
          </p>
        )}
      </div>

      {/* Action Buttons Row (Icon-first with 44-48px touch targets) */}
      <div className="flex items-center justify-center gap-2 pt-1">
        {/* Like */}
        <button
          onClick={handleLikeToggle}
          aria-label={isLiked ? 'Unlike song' : 'Like song'}
          className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            likeAnimating ? 'scale-125' : 'scale-100'
          } ${
            isLiked
              ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.25)]'
              : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10'
          }`}
          title={isLiked ? 'Liked' : 'Like'}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#DFFF00]' : ''}`} />
        </button>

        {/* Save / Add to Playlist */}
        <button
          onClick={handleSaveToggle}
          aria-label={isSaved ? 'Saved to library' : 'Save to playlist'}
          className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            isSaved
              ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00]'
              : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10'
          }`}
          title="Add to Playlist"
        >
          {isSaved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>

        {/* Share */}
        <button
          onClick={handleShareClick}
          aria-label="Share Track"
          className="h-11 w-11 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
          title="Share Track"
        >
          <Share2 className="h-4 w-4" />
        </button>

        {/* More Options */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenOptions?.();
          }}
          aria-label="More Options"
          className="h-11 w-11 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
          title="More Options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
