'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { useLayoutStore } from '@/store/layout-store';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Maximize2,
  FileText,
  Music,
  Headphones,
  Heart
} from 'lucide-react';
import { getArtistName } from '@/types';
import { getTrackArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import QueueDrawer from './QueueDrawer';
import EqualizerModal from './EqualizerModal';
import SleepTimerModal from './SleepTimerModal';
import DeviceSelectorModal from './DeviceSelectorModal';
import AudioQualityModal from './AudioQualityModal';

export default function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    setPlaying,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    setProgress,
    setShuffle,
    setRepeatMode,
  } = usePlaybackStore();

  const { isSidebarOpen } = useLayoutStore();
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!currentTrack || pathname === '/player') return null;

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : 196;
  const progressPercent = displayDuration > 0 ? Math.min(100, Math.max(0, (currentTime / displayDuration) * 100)) : 0;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const artworkUrl = getTrackArtwork(currentTrack);
  const artistName = getArtistName(currentTrack.artist);

  const leftPositionClass = isSidebarOpen ? 'md:left-[280px]' : 'md:left-[80px]';

  return (
    <>
      {/* PERSISTENT APPLICATION CONTROL BAR (STATE A) */}
      <footer
        className={`fixed bottom-16 md:bottom-0 left-0 ${leftPositionClass} right-0 h-[64px] md:h-[88px] z-40 bg-[#070A14]/95 backdrop-blur-2xl border-t border-white/10 px-3 md:px-6 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 flex items-center justify-between font-sans`}
      >
        {/* ── LEFT COLUMN: ARTWORK & TRACK IDENTITY ── */}
        <div 
          onClick={() => router.push('/player')}
          className="flex items-center gap-3 min-w-0 flex-1 sm:w-1/4 sm:max-w-[280px] cursor-pointer group"
        >
          <div className="relative shrink-0">
            <Artwork
              source={artworkUrl || undefined}
              size="medium"
              alt={currentTrack.title}
              canonicalId={currentTrack.id}
              className="h-12 w-12 md:h-14 md:w-14 rounded-xl object-cover border border-white/15 shadow-md transition-transform group-hover:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1 pr-2">
            <h4 className="font-black text-xs md:text-sm text-white truncate group-hover:text-[#00D4FF] transition-colors">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] md:text-xs text-white/60 truncate font-semibold mt-0.5">
              {artistName}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="p-1.5 text-white/50 hover:text-white transition-colors cursor-pointer hidden sm:block shrink-0"
            title="Like track"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'text-[#FF2E9A] fill-[#FF2E9A]' : ''}`} />
          </button>
        </div>

        {/* ── MOBILE RIGHT ACTION BUTTONS (PLAY/PAUSE & NEXT ONLY - Spec 18) ── */}
        <div className="flex sm:hidden items-center gap-2 shrink-0">
          <button
            onClick={() => setPlaying(!isPlaying)}
            className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#00D4FF] via-[#6D3BFF] to-[#FF2D9A] text-white flex items-center justify-center shadow-[0_0_15px_rgba(0,214,255,0.4)] active:scale-95 transition-transform cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-white text-white" />
            ) : (
              <Play className="h-5 w-5 fill-white text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>
        </div>

        {/* ── DESKTOP CENTER COLUMN: TRANSPORT CONTROLS & SEEK SCRUBBER ── */}
        <div className="hidden sm:flex flex-col items-center justify-center min-w-0 flex-1 max-w-[580px] px-2 md:px-6 space-y-1">
          {/* Transport Buttons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                shuffle ? 'text-[#00D4FF]' : 'text-white/40 hover:text-white'
              }`}
              title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              onClick={prevTrack}
              className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>

            <button
              onClick={() => setPlaying(!isPlaying)}
              className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-gradient-to-tr from-[#00D4FF] via-[#6D3BFF] to-[#FF2D9A] text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-white text-white" />
              ) : (
                <Play className="h-5 w-5 fill-white text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>

            <button
              onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                repeatMode !== 'off' ? 'text-[#00D4FF]' : 'text-white/40 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Seek Scrubber */}
          <div className="w-full flex items-center gap-2.5 text-[10px] font-mono font-bold text-white/50">
            <span className="text-[#00D4FF] shrink-0 w-8 text-right">{formatTime(currentTime)}</span>

            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
                const targetTime = newPercent * displayDuration;
                setProgress(targetTime);
                window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: targetTime } }));
              }}
              className="relative flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group py-1"
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00D4FF] via-[#6D3BFF] to-[#FF2D9A] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-md scale-0 group-hover:scale-100 transition-transform pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 6px)` }}
              />
            </div>

            <span className="shrink-0 w-8">{formatTime(displayDuration)}</span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: VOLUME & SECONDARY CONTROLS ── */}
        <div className="flex items-center justify-end gap-3 min-w-0 w-1/4 max-w-[280px]">
          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-white/60 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#00D4FF]"
              title="Volume"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => router.push('/player')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                pathname === '/player' ? 'text-[#00D4FF] bg-white/10' : 'text-white/60 hover:text-white'
              }`}
              title="Synced Lyrics"
            >
              <FileText className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowQueueDrawer(true)}
              className="p-1.5 rounded-full text-white/60 hover:text-white transition-all cursor-pointer"
              title="Queue"
            >
              <Music className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowDevicesModal(true)}
              className="p-1.5 rounded-full text-white/60 hover:text-[#00D4FF] transition-all cursor-pointer hidden sm:block"
              title="Audio Devices"
            >
              <Headphones className="h-4 w-4" />
            </button>

            <button
              onClick={() => router.push('/player')}
              className="p-1.5 rounded-full text-white/60 hover:text-white transition-all cursor-pointer hidden sm:block"
              title="Expand Player"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Popovers & Drawers (Specs 13, 14, 15) */}
      <QueueDrawer isOpen={showQueueDrawer} onClose={() => setShowQueueDrawer(false)} />
      <EqualizerModal isOpen={showEqModal} onClose={() => setShowEqModal(false)} />
      <SleepTimerModal isOpen={showSleepTimerModal} onClose={() => setShowSleepTimerModal(false)} />
      <DeviceSelectorModal isOpen={showDevicesModal} onClose={() => setShowDevicesModal(false)} />
      <AudioQualityModal isOpen={showQualityModal} onClose={() => setShowQualityModal(false)} />
    </>
  );
}
