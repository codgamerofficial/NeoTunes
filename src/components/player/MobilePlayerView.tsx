'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import MobileLyricsSheet from './MobileLyricsSheet';
import PlayerOptionsSheet from './PlayerOptionsSheet';
import AudioQualityModal from './AudioQualityModal';
import ShareCardModal from './ShareCardModal';
import QueueDrawer from './QueueDrawer';
import AddToPlaylistModal from './AddToPlaylistModal';
import { likedSongsService } from '@/services/likedSongsService';
import { getTrackThemeColors, extractDominantColorFromImage, PlayerThemeColors } from '@/utils/dynamicPlayerColors';
import {
  Heart,
  MoreHorizontal,
  Music,
  ChevronRight,
  Headphones,
  Shuffle,
  Repeat,
  Infinity as InfinityIcon,
  ListMusic,
  Volume1,
  Volume2,
  VolumeX,
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
    autoplayEnabled,
    audioQuality,
    setPlaying,
    nextTrack,
    prevTrack,
    setShuffle,
    setRepeatMode,
    setVolume,
    toggleMute,
    setProgress,
    setAutoplayEnabled,
  } = usePlaybackStore();

  const [showLyricsSheet, setShowLyricsSheet] = useState(false);
  const [showQueueSheet, setShowQueueSheet] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  // Scrubber drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Dynamic color theme
  const [theme, setTheme] = useState<PlayerThemeColors>(() => getTrackThemeColors(track));

  const currentTime = isDragging && dragTime !== null ? dragTime : progress;
  const displayDuration = duration > 0 ? duration : 180;
  const remainingTime = Math.max(0, displayDuration - currentTime);
  const progressPercent = Math.min(100, Math.max(0, (currentTime / displayDuration) * 100));

  const artworkUrl = resolveArtwork(track);
  const artistName = getArtistName(track.artists || track.artist);

  // Update theme when track changes
  useEffect(() => {
    if (!track) return;
    const fastTheme = getTrackThemeColors(track);
    setTheme(fastTheme);

    const art = resolveArtwork(track);
    if (art && !art.startsWith('data:')) {
      extractDominantColorFromImage(art).then((extracted) => {
        if (extracted) {
          setTheme(extracted);
        }
      });
    }
  }, [track]);

  // Sync liked state from likedSongsService
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

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Compute active lyric snippet for the live karaoke banner
  const activeLyricSnippet = React.useMemo(() => {
    if (lyricsLoading) return 'Loading lyrics...';
    if (!lyrics || lyrics.length === 0) return 'Sing along with synced lyrics';

    // Check if before first lyric
    if (lyrics[0] && progress < lyrics[0].time) {
      return 'Warming up';
    }

    // Find current active lyric line
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (progress >= lyrics[i].time) {
        return lyrics[i].text;
      }
    }

    return lyrics[0]?.text || 'Warming up';
  }, [lyrics, lyricsLoading, progress]);

  // Scrubber events
  const getSeekTimeFromEvent = (clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * displayDuration;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const newTime = getSeekTimeFromEvent(e.clientX);
    setDragTime(newTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newTime = getSeekTimeFromEvent(e.clientX);
    setDragTime(newTime);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const finalSeekTime = getSeekTimeFromEvent(e.clientX);
      setProgress(finalSeekTime);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: finalSeekTime } }));
      }
      setIsDragging(false);
      setDragTime(null);
    }
  };

  // Audio quality badge label
  const audioQualityLabel = React.useMemo(() => {
    switch (audioQuality) {
      case 'lossless':
        return 'Lossless, Master Quality';
      case 'very_high':
        return 'Hi-Res 24-bit 96kHz';
      case 'high':
        return 'Hi-Quality, Upgrading Quality';
      default:
        return 'Hi-Quality, Upgrading Quality';
    }
  }, [audioQuality]);

  return (
    <div
      className="w-full h-[100dvh] min-h-0 flex flex-col justify-between overflow-hidden select-none relative font-sans text-white transition-colors duration-700"
      style={{
        background: `linear-gradient(180deg, ${theme.topDark} 0%, ${theme.middleAmbient} 38%, ${theme.bottomBase} 100%)`,
      }}
    >
      {/* ── 1. ATMOSPHERIC ARTWORK GLOW ── */}
      {artworkUrl && (
        <div
          className="absolute top-0 left-0 right-0 h-[60vh] bg-cover bg-center filter blur-[60px] opacity-40 pointer-events-none scale-110 transition-all duration-1000"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
      )}

      {/* ── 2. TOP PULL-DOWN DISMISS HANDLE ── */}
      <div
        className="w-full pt-3 pb-1 flex justify-center shrink-0 z-20 cursor-pointer group"
        onClick={() => router.back()}
        aria-label="Dismiss player"
      >
        <div className="w-11 h-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors" />
      </div>

      {/* ── 3. SEAMLESS HERO ARTWORK (Upper 42-45% with bottom gradient fade) ── */}
      <div className="relative z-10 w-full flex-1 min-h-0 flex items-center justify-center px-4 overflow-hidden">
        <div
          className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          style={{
            maskImage: 'linear-gradient(to bottom, black 65%, rgba(0,0,0,0.85) 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 65%, rgba(0,0,0,0.85) 85%, transparent 100%)',
          }}
        >
          <Artwork
            source={artworkUrl}
            size="full"
            alt={track.title}
            canonicalId={track.id}
            type="track"
            className="w-full h-full object-cover"
          />
          {/* Subtle bottom fade matching background */}
          <div
            className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${theme.middleAmbient} 0%, transparent 100%)`,
            }}
          />
        </div>
      </div>

      {/* ── 4. LOWER CONTROL PANEL (Metadata, Lyrics, Scrubber, Transport, Volume, Bottom Actions) ── */}
      <div className="relative z-20 w-full max-w-md mx-auto px-6 pb-3 pt-1 flex flex-col gap-3 shrink-0">
        
        {/* ROW A: Track Info (Left) + Circular Action Buttons (Right) */}
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left: Song Title & Artist */}
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight line-clamp-1">
              {track.title}
            </h1>
            <p className="text-sm sm:text-base font-medium text-white/70 mt-0.5 line-clamp-1">
              {artistName}
            </p>
          </div>

          {/* Right: Heart (Like) & Options (...) Circle Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Heart Button */}
            <button
              onClick={handleLikeToggle}
              aria-label={isLiked ? 'Unlike track' : 'Like track'}
              className={`w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                likeAnimating ? 'scale-125' : 'scale-100'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked ? 'text-white fill-white' : 'text-white/80'
                }`}
              />
            </button>

            {/* Options Button */}
            <button
              onClick={() => setShowOptionsSheet(true)}
              aria-label="Track Options"
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-90 text-white/80 hover:text-white"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ROW B: Interactive Live Lyrics / Karaoke Snippet Banner */}
        <button
          onClick={() => setShowLyricsSheet(true)}
          className="w-full flex items-center gap-2 py-0.5 text-left text-sm sm:text-[15px] font-semibold text-white/85 hover:text-white transition-colors cursor-pointer group truncate"
        >
          <Music className="w-4 h-4 text-white/70 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate flex-1 font-semibold">{activeLyricSnippet}</span>
          <ChevronRight className="w-4 h-4 text-white/60 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* ROW C: Scrubber / Progress Timeline */}
        <div className="w-full space-y-1.5 pt-0.5">
          {/* Scrubber Bar */}
          <div
            ref={timelineRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            role="slider"
            aria-label="Seek progress"
            aria-valuemin={0}
            aria-valuemax={displayDuration}
            aria-valuenow={currentTime}
            className="relative py-2 cursor-pointer group focus:outline-none"
          >
            {/* Background Track */}
            <div className="h-1 w-full bg-white/25 rounded-full overflow-hidden relative group-hover:h-1.5 transition-all">
              {/* Played Fill */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-white rounded-full pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Thumb Dot Handle */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md pointer-events-none transition-transform ${
                isDragging ? 'scale-125' : 'scale-100'
              }`}
              style={{ left: `calc(${progressPercent}% - 7px)` }}
            />
          </div>

          {/* Timestamps & Quality Badge Row */}
          <div className="flex items-center justify-between text-xs font-semibold text-white/70 px-0.5">
            {/* Current Time */}
            <span className="tabular-nums min-w-[32px]">{formatTime(currentTime)}</span>

            {/* Audio Quality Indicator (Clickable to open quality selector) */}
            <button
              onClick={() => setShowQualityModal(true)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full hover:bg-white/10 text-white/75 hover:text-white transition-all cursor-pointer text-[11px] font-semibold truncate max-w-[220px]"
              title="Change Audio Quality"
            >
              <Headphones className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{audioQualityLabel}</span>
            </button>

            {/* Remaining Time */}
            <span className="tabular-nums min-w-[32px] text-right">-{formatTime(remainingTime)}</span>
          </div>
        </div>

        {/* ROW D: Primary Transport Controls (Rewind <<, Huge Play/Pause, Forward >>) */}
        <div className="w-full flex items-center justify-center gap-10 sm:gap-14 py-1">
          {/* Rewind / Previous Track Button */}
          <button
            onClick={prevTrack}
            aria-label="Previous Track"
            className="p-2 text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer"
            title="Previous Track"
          >
            <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
              <path d="M11 5L3 12L11 19V5ZM20 5L12 12L20 19V5Z" />
            </svg>
          </button>

          {/* Huge Clean White Play / Pause Button */}
          <button
            onClick={() => setPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="p-2 text-white hover:scale-105 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-13 h-13 sm:w-14 sm:h-14 fill-white" viewBox="0 0 24 24">
                <rect x="5" y="4" width="4.5" height="16" rx="2" />
                <rect x="14.5" y="4" width="4.5" height="16" rx="2" />
              </svg>
            ) : (
              <svg className="w-13 h-13 sm:w-14 sm:h-14 fill-white ml-1" viewBox="0 0 24 24">
                <path d="M6 4.5V19.5C6 20.3 6.9 20.8 7.6 20.4L19.5 12.9C20.2 12.5 20.2 11.5 19.5 11.1L7.6 3.6C6.9 3.2 6 3.7 6 4.5Z" />
              </svg>
            )}
          </button>

          {/* Forward / Next Track Button */}
          <button
            onClick={nextTrack}
            aria-label="Next Track"
            className="p-2 text-white hover:text-white/80 active:scale-90 transition-transform cursor-pointer"
            title="Next Track"
          >
            <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
              <path d="M4 5L12 12L4 19V5ZM13 5L21 12L13 19V5Z" />
            </svg>
          </button>
        </div>

        {/* ROW E: Dedicated Volume Slider Bar */}
        <div className="w-full flex items-center gap-3 px-2 py-0.5">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume1 className="w-4 h-4" />}
          </button>

          <div
            className="relative flex-1 h-2 flex items-center cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setVolume(val);
            }}
          >
            <div className="h-1 w-full bg-white/20 group-hover:h-1.5 rounded-full relative overflow-hidden transition-all">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setVolume(1)}
            aria-label="Max volume"
            className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* ROW F: Bottom Action Toolbar (Shuffle, Repeat, Infinity Autoplay, Queue) */}
        <div className="w-full grid grid-cols-4 items-center justify-items-center pt-1 pb-1">
          {/* 1. Shuffle */}
          <button
            onClick={() => {
              const next = !shuffle;
              setShuffle(next);
              showToast(next ? 'Shuffle On' : 'Shuffle Off');
            }}
            aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
            className={`p-3 transition-colors cursor-pointer active:scale-90 ${
              shuffle ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
            title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* 2. Repeat */}
          <button
            onClick={() => {
              const next = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
              setRepeatMode(next);
              showToast(next === 'off' ? 'Repeat Off' : next === 'all' ? 'Repeat All' : 'Repeat Current');
            }}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`p-3 transition-colors cursor-pointer relative active:scale-90 ${
              repeatMode !== 'off' ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat className="w-5 h-5" />
            {repeatMode === 'one' && (
              <span className="absolute text-[8px] font-black top-2 right-2 bg-white text-black rounded-full px-1">
                1
              </span>
            )}
          </button>

          {/* 3. Autoplay / Infinite Mode Pill Badge */}
          <button
            onClick={() => {
              const next = !autoplayEnabled;
              setAutoplayEnabled(next);
              showToast(next ? 'Autoplay On: Continuous playback' : 'Autoplay Off');
            }}
            aria-label={autoplayEnabled ? 'Disable continuous autoplay' : 'Enable continuous autoplay'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
              autoplayEnabled
                ? 'bg-white/25 text-white shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
            }`}
            title={autoplayEnabled ? 'Continuous Autoplay: On' : 'Continuous Autoplay: Off'}
          >
            <InfinityIcon className="w-6 h-6" />
          </button>

          {/* 4. Queue / Playlist Drawer */}
          <button
            onClick={() => setShowQueueSheet(true)}
            aria-label="Open Queue"
            className="p-3 text-white/70 hover:text-white transition-colors cursor-pointer active:scale-90"
            title="Up Next Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>

        {/* ROW G: Bottom Android Navigation Pill Bar */}
        <div className="w-32 h-1 bg-white/30 rounded-full mx-auto mb-1 mt-0.5 shrink-0 pointer-events-none" />

      </div>

      {/* ── 5. MODALS & SHEETS ── */}
      <MobileLyricsSheet
        isOpen={showLyricsSheet}
        onClose={() => setShowLyricsSheet(false)}
        track={track}
        lyrics={lyrics}
        lyricsLoading={lyricsLoading}
        currentTime={currentTime}
        onSeek={(time) => {
          setProgress(time);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('seek-track', { detail: { time } }));
          }
        }}
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

      <AudioQualityModal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
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
