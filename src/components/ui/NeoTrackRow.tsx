'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus, Volume2 } from 'lucide-react';
import { Track, getArtistName } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import { usePlaybackStore } from '@/store/playback-store';
import { likedSongsService } from '@/services/likedSongsService';

export interface NeoTrackRowProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
  showCover?: boolean;
  showDuration?: boolean;
  showLike?: boolean;
  showMore?: boolean;
  showAddQueue?: boolean;
  onMoreClick?: (track: Track, e: React.MouseEvent) => void;
  playlistContext?: Track[];
  className?: string;
}

export function NeoTrackRow({
  track,
  index,
  showIndex = false,
  showCover = true,
  showDuration = true,
  showLike = true,
  showMore = true,
  showAddQueue = true,
  onMoreClick,
  playlistContext,
  className = '',
}: NeoTrackRowProps) {
  const { currentTrack, isPlaying, playTrack, setPlaying, addToQueue } = usePlaybackStore();
  const [isLiked, setIsLiked] = useState(false);

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

  const isCurrentTrack = currentTrack?.id === track.id || currentTrack?.canonicalId === track.canonicalId;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handleRowClick = () => {
    if (isCurrentTrack) {
      setPlaying(!isPlaying);
    } else {
      playTrack(track, playlistContext);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = await likedSongsService.toggleLike(track);
    setIsLiked(next);
  };

  const handleAddQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoreClick) {
      onMoreClick(track, e);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) return '3:20';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const artistName = getArtistName(track.artists || track.artist);

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/[0.06] transition-all duration-150 cursor-pointer select-none border border-transparent hover:border-white/[0.08] ${
        isCurrentTrack ? 'bg-white/[0.08] border-white/[0.12] shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {showIndex && typeof index === 'number' && (
          <span className="w-5 text-center text-xs font-mono font-bold text-[#9AA1AD] group-hover:hidden shrink-0">
            {isCurrentlyPlaying ? <Volume2 className="h-3.5 w-3.5 text-[#DFFF00] animate-pulse mx-auto" /> : index + 1}
          </span>
        )}

        {showIndex && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick();
            }}
            className="w-5 hidden group-hover:flex items-center justify-center text-white shrink-0 cursor-pointer"
            aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-4 w-4 fill-current text-[#DFFF00]" />
            ) : (
              <Play className="h-4 w-4 fill-current text-white" />
            )}
          </button>
        )}

        {showCover && (
          <div className="relative shrink-0">
            <Artwork
              track={track}
              size="small"
              className="h-11 w-11 rounded-xl object-cover border border-white/10 shadow-sm"
            />
            {isCurrentlyPlaying && (
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-[#DFFF00] shadow-[0_0_8px_#DFFF00] animate-pulse" />
              </div>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h4
            className={`text-sm font-bold truncate transition-colors ${
              isCurrentTrack ? 'text-[#DFFF00]' : 'text-[#F5F7FA] group-hover:text-white'
            }`}
          >
            {track.title}
          </h4>
          <p className="text-xs text-[#9AA1AD] truncate mt-0.5 font-medium">
            {artistName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {showLike && (
          <button
            onClick={handleLike}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors touch-target flex items-center justify-center cursor-pointer ${
              isLiked ? 'text-[#DFFF00]' : 'text-[#9AA1AD] hover:text-white'
            }`}
            title="Like track"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#DFFF00]' : ''}`} />
          </button>
        )}

        {showAddQueue && (
          <button
            onClick={handleAddQueue}
            className="p-2 rounded-full hover:bg-white/10 text-[#9AA1AD] hover:text-[#DFFF00] transition-colors hidden sm:flex touch-target items-center justify-center cursor-pointer"
            title="Add to queue"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}

        {showDuration && (
          <span className="text-xs text-[#9AA1AD] font-mono min-w-[36px] text-right">
            {formatDuration(track.duration)}
          </span>
        )}

        {showMore && (
          <button
            onClick={handleMore}
            className="p-2 rounded-full hover:bg-white/10 text-[#9AA1AD] hover:text-white transition-colors touch-target flex items-center justify-center cursor-pointer"
            title="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default NeoTrackRow;
