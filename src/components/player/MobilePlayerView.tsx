'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import MobileLyricsSheet from './MobileLyricsSheet';
import PlayerOptionsSheet from './PlayerOptionsSheet';
import DeviceSelectorModal from './DeviceSelectorModal';
import ShareCardModal from './ShareCardModal';
import QueueDrawer from './QueueDrawer';
import ProgressTimeline from './ProgressTimeline';
import PlaybackControls from './PlaybackControls';
import AddToPlaylistModal from './AddToPlaylistModal';
import { likedSongsService } from '@/services/likedSongsService';
import {
  ChevronDown,
  Heart,
  Plus,
  Check,
  Share2,
  MoreHorizontal,
  Mic2,
  ListMusic,
  Headphones
} from 'lucide-react';
import { useToast } from '@/components/ui/NeoToast';

interface MobilePlayerViewProps {
  track: Track;
  lyrics: { time: number; text: string }[] | null;
  lyricsLoading: boolean;
}

export default function MobilePlayerView({
  track,
  lyrics,
  lyricsLoading,
}: MobilePlayerViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    isPlaying,
    progress,
    duration,
    shuffle,
    repeatMode,
    volume,
    isMuted,
    setPlaying,
    nextTrack,
    prevTrack,
    setShuffle,
    setRepeatMode,
    setVolume,
    toggleMute,
    setProgress,
  } = usePlaybackStore();

  const [showLyricsSheet, setShowLyricsSheet] = useState(false);
  const [showQueueSheet, setShowQueueSheet] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : 180;
  const artworkUrl = resolveArtwork(track);
  const artistName = getArtistName(track.artists || track.artist);

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
    setShowAddToPlaylistModal(true);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: track.title,
        text: `Listen to "${track.title}" by ${artistName} on NeoTunes`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      setShowShareModal(true);
    }
  };

  const handleSeek = (newTime: number) => {
    setProgress(newTime);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: newTime } }));
    }
  };

  return (
    <div className="w-full h-[100dvh] min-h-0 bg-[#050608] text-[#F5F7FA] grid grid-rows-[56px_minmax(0,1fr)_56px] overflow-hidden select-none relative font-sans px-5 pt-safe pb-safe">
      
      {/* ── 1. SUBTLE ATMOSPHERIC BACKDROP ── */}
      {artworkUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center filter blur-[60px] opacity-25 scale-110 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-[#050608]/75 to-[#050608] pointer-events-none" />

      {/* ── 2. TOP HEADER (Row 1: 56px) ── */}
      <header className="relative z-10 flex items-center justify-between h-full w-full shrink-0">
        <button
          onClick={() => router.back()}
          aria-label="Close full player"
          className="h-11 w-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
        >
          <ChevronDown className="h-6 w-6" />
        </button>

        <div className="text-center min-w-0 px-3 flex-1">
          <span className="text-[10px] font-bold text-[#DFFF00] tracking-[0.2em] uppercase block">
            NOW PLAYING
          </span>
          <span className="text-xs font-bold text-white truncate block mt-0.5" title={track.title}>
            {track.title}
          </span>
        </div>

        <button
          onClick={() => setShowOptionsSheet(true)}
          aria-label="Track options"
          className="h-11 w-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      {/* ── 3. MAIN CENTER BODY (Row 2: minmax(0, 1fr) - Artwork, Metadata, Actions, Scrubber, Transport) ── */}
      <main className="relative z-10 min-h-0 h-full flex flex-col items-center justify-center gap-[clamp(5px,1.3vh,14px)] max-w-md mx-auto w-full overflow-hidden py-1">
        
        {/* Artwork Stage (Hero 1:1 Aspect Ratio dynamically filling 36vh / up to 350px) */}
        <div className="relative aspect-square w-[clamp(220px,36vh,350px)] max-w-[min(84vw,350px)] rounded-[26px] sm:rounded-[32px] overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-[#11141A] shrink-0">
          <Artwork
            source={artworkUrl}
            size="full"
            alt={track.title}
            canonicalId={track.id}
            type="track"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Track Info (Title 1-2 lines & Artist) */}
        <div className="w-full text-center space-y-0.5 px-3 shrink-0">
          <h1 className="text-lg sm:text-xl font-extrabold text-white line-clamp-2 leading-tight tracking-tight">
            {track.title}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#9AA1AD] line-clamp-1">
            {artistName}
          </p>
        </div>

        {/* Action Buttons Row (Like, Save, Share) */}
        <div className="flex items-center justify-center gap-4 shrink-0">
          {/* Like */}
          <button
            onClick={handleLikeToggle}
            aria-label={isLiked ? 'Unlike song' : 'Like song'}
            className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              likeAnimating ? 'scale-125' : 'scale-100'
            } ${
              isLiked
                ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00] shadow-[0_0_12px_rgba(223,255,0,0.25)]'
                : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white'
            }`}
            title="Like"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#DFFF00]' : ''}`} />
          </button>

          {/* Save / Add to Playlist */}
          <button
            onClick={handleSaveToggle}
            aria-label="Add to Playlist"
            className="h-11 w-11 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Add to Playlist"
          >
            {isSaved ? <Check className="h-4 w-4 text-[#DFFF00]" /> : <Plus className="h-4 w-4" />}
          </button>

          {/* Share */}
          <button
            onClick={handleShareClick}
            aria-label="Share Track"
            className="h-11 w-11 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Share Track"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Timeline */}
        <ProgressTimeline
          currentTime={currentTime}
          duration={displayDuration}
          onSeek={handleSeek}
          className="w-full max-w-sm px-1 shrink-0"
        />

        {/* Playback Controls (Responsive Gaps & Hero 64px Play Button) */}
        <PlaybackControls
          isPlaying={isPlaying}
          shuffle={shuffle}
          repeatMode={repeatMode}
          volume={volume}
          isMuted={isMuted}
          onTogglePlay={() => setPlaying(!isPlaying)}
          onPrev={prevTrack}
          onNext={nextTrack}
          onToggleShuffle={() => setShuffle(!shuffle)}
          onToggleRepeat={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
          showVolume={false}
          className="w-full max-w-sm shrink-0"
        />

      </main>

      {/* ── 4. BOTTOM ACTION BAR ([ Lyrics ] [ Queue ] [ Devices ]) ── */}
      <footer className="relative z-10 grid grid-cols-3 gap-2 py-3 border-t border-white/[0.06] bg-[#050608]/90 shrink-0 w-full max-w-sm mx-auto mb-1">
        <button
          onClick={() => setShowLyricsSheet(true)}
          className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#9AA1AD] hover:text-[#DFFF00] active:scale-95 transition-all cursor-pointer"
        >
          <Mic2 className="h-4 w-4" />
          <span>Lyrics</span>
        </button>

        <button
          onClick={() => setShowQueueSheet(true)}
          className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#9AA1AD] hover:text-[#DFFF00] active:scale-95 transition-all cursor-pointer"
        >
          <ListMusic className="h-4 w-4" />
          <span>Queue</span>
        </button>

        <button
          onClick={() => setShowDeviceModal(true)}
          className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#9AA1AD] hover:text-[#DFFF00] active:scale-95 transition-all cursor-pointer"
        >
          <Headphones className="h-4 w-4" />
          <span>Devices</span>
        </button>
      </footer>

      {/* ── 5. SHEETS & MODALS ── */}
      <MobileLyricsSheet
        isOpen={showLyricsSheet}
        onClose={() => setShowLyricsSheet(false)}
        track={track}
        lyrics={lyrics}
        lyricsLoading={lyricsLoading}
        currentTime={currentTime}
        onSeek={handleSeek}
      />

      <QueueDrawer
        isOpen={showQueueSheet}
        onClose={() => setShowQueueSheet(false)}
      />

      <PlayerOptionsSheet
        isOpen={showOptionsSheet}
        onClose={() => setShowOptionsSheet(false)}
        track={track}
        onShare={() => {
          setShowOptionsSheet(false);
          setShowShareModal(true);
        }}
      />

      <DeviceSelectorModal
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
      />

      <ShareCardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        track={track}
      />

      <AddToPlaylistModal
        isOpen={showAddToPlaylistModal}
        onClose={() => setShowAddToPlaylistModal(false)}
        track={track}
      />

    </div>
  );
}
