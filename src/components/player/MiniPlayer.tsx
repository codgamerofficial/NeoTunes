'use client';

import React, { useState, useEffect } from 'react';
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
  FileText,
  Heart,
  ListMusic,
  Maximize2
} from 'lucide-react';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import QueueDrawer from './QueueDrawer';
import EqualizerModal from './EqualizerModal';
import SleepTimerModal from './SleepTimerModal';
import DeviceSelectorModal from './DeviceSelectorModal';
import AudioQualityModal from './AudioQualityModal';
import { AudioOutputSheet } from './AudioOutputSheet';
import { likedSongsService } from '@/services/likedSongsService';

export default function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentTrack,
    history,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    playTrack,
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
  const [showAudioOutputSheet, setShowAudioOutputSheet] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const activeTrack: Track | null = currentTrack || (history.length > 0 ? history[0] : null);

  useEffect(() => {
    if (!activeTrack?.id) return;
    setIsLiked(likedSongsService.isLiked(activeTrack.id));

    const handleLikedChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ trackId: string; isLiked: boolean }>;
      if (customEvent.detail && customEvent.detail.trackId === activeTrack.id) {
        setIsLiked(customEvent.detail.isLiked);
      }
    };

    window.addEventListener('neotunes_liked_change', handleLikedChange);
    return () => {
      window.removeEventListener('neotunes_liked_change', handleLikedChange);
    };
  }, [activeTrack?.id]);

  if (pathname === '/player') return null;
  if (!activeTrack) return null;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) {
      playTrack(activeTrack);
    } else {
      setPlaying(!isPlaying);
    }
  };

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : 196;
  const progressPercent = displayDuration > 0 ? Math.min(100, Math.max(0, (currentTime / displayDuration) * 100)) : 0;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const artworkUrl = resolveArtwork(activeTrack);
  const artistName = getArtistName(activeTrack.artists || activeTrack.artist);

  const leftPositionClass = isSidebarOpen ? 'md:left-64' : 'md:left-20';

  return (
    <>
      {/* Mini Player Bar */}
      <footer
        className={`fixed bottom-16 md:bottom-0 left-0 ${leftPositionClass} right-0 h-[64px] md:h-[84px] z-30 bg-[#0B0D12]/92 backdrop-blur-2xl border-t border-white/[0.08] px-3 md:px-6 select-none shadow-[0_-5px_24px_rgba(0,0,0,0.85)] transition-all duration-300 flex items-center justify-between font-sans`}
      >
        {/* Progress Line at top edge for mobile/compact */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 md:hidden overflow-hidden">
          <div
            className="h-full bg-[#DFFF00] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Left Column: Track Info */}
        <div
          onClick={() => router.push('/player')}
          className="flex items-center gap-3 min-w-0 flex-1 sm:w-1/4 sm:max-w-[280px] cursor-pointer group"
        >
          <div className="relative shrink-0">
            <Artwork
              source={artworkUrl || undefined}
              size="medium"
              alt={activeTrack.title}
              canonicalId={activeTrack.id}
              className="h-11 w-11 md:h-13 md:w-13 rounded-xl object-cover border border-white/10 shadow-md transition-transform group-hover:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1 pr-2">
            <h4 className="font-bold text-xs md:text-sm text-[#F5F7FA] truncate group-hover:text-[#DFFF00] transition-colors">
              {activeTrack.title}
            </h4>
            <p className="text-[11px] md:text-xs text-[#9AA1AD] truncate font-medium mt-0.5">
              {artistName}
            </p>
          </div>

          <button
            onClick={async (e) => {
              e.stopPropagation();
              const next = await likedSongsService.toggleLike(activeTrack);
              setIsLiked(next);
            }}
            className="p-1.5 text-[#9AA1AD] hover:text-white transition-colors cursor-pointer hidden sm:block shrink-0"
            title="Like track"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'text-[#DFFF00] fill-[#DFFF00]' : ''}`} />
          </button>
        </div>

        {/* Mobile Right Controls: Play/Pause and Next */}
        <div className="flex sm:hidden items-center gap-2 shrink-0">
          <button
            onClick={handlePlayToggle}
            className="h-10 w-10 rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-black text-black" />
            ) : (
              <Play className="h-5 w-5 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>
        </div>

        {/* Desktop Center: Transport Controls & Scrubber */}
        <div className="hidden sm:flex flex-col items-center justify-center min-w-0 flex-1 max-w-[560px] px-2 md:px-6 space-y-1">
          <div className="flex items-center gap-4 md:gap-5">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${
                shuffle ? 'text-[#DFFF00]' : 'text-[#9AA1AD] hover:text-white'
              }`}
              title={shuffle ? 'Shuffle: On' : 'Shuffle: Off'}
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              onClick={prevTrack}
              className="p-1.5 text-[#9AA1AD] hover:text-white transition-colors cursor-pointer hover:scale-105 active:scale-95"
              title="Previous Track"
            >
              <SkipBack className="h-4.5 w-4.5 fill-current" />
            </button>

            <button
              onClick={handlePlayToggle}
              className="h-10 w-10 rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4.5 w-4.5 fill-black text-black" />
              ) : (
                <Play className="h-4.5 w-4.5 fill-black text-black ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-[#9AA1AD] hover:text-white transition-colors cursor-pointer hover:scale-105 active:scale-95"
              title="Next Track"
            >
              <SkipForward className="h-4.5 w-4.5 fill-current" />
            </button>

            <button
              onClick={() => {
                const nextMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
                setRepeatMode(nextMode);
              }}
              className={`p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${
                repeatMode !== 'off' ? 'text-[#DFFF00]' : 'text-[#9AA1AD] hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          {/* Scrubber */}
          <div className="w-full flex items-center gap-2.5">
            <span className="text-[11px] text-[#9AA1AD] min-w-[34px] text-right font-medium">
              {formatTime(currentTime)}
            </span>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                const newTime = ratio * displayDuration;
                setProgress(newTime);
                window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: newTime } }));
              }}
              className="relative flex-1 h-1.5 bg-white/10 hover:h-2 rounded-full cursor-pointer group transition-all"
            >
              <div
                className="h-full bg-[#DFFF00] rounded-full transition-all relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow transition-opacity" />
              </div>
            </div>
            <span className="text-[11px] text-[#9AA1AD] min-w-[34px] font-medium">
              {formatTime(displayDuration)}
            </span>
          </div>
        </div>

        {/* Desktop Right: Extra Actions & Volume */}
        <div className="hidden sm:flex items-center justify-end gap-2.5 sm:w-1/4 sm:max-w-[280px]">
          <button
            onClick={() => router.push('/lyrics')}
            className="p-2 text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
            title="View Lyrics"
          >
            <FileText className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowQueueDrawer(true)}
            className="p-2 text-[#9AA1AD] hover:text-[#DFFF00] transition-colors cursor-pointer"
            title="Queue"
          >
            <ListMusic className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5 group">
            <button
              onClick={toggleMute}
              className="p-1.5 text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
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
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 md:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#DFFF00]"
              aria-label="Volume"
            />
          </div>

          <button
            onClick={() => router.push('/player')}
            className="p-2 text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
            title="Open Full Player"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* Auxiliary Player Sheets/Drawers */}
      <QueueDrawer isOpen={showQueueDrawer} onClose={() => setShowQueueDrawer(false)} />
      <EqualizerModal isOpen={showEqModal} onClose={() => setShowEqModal(false)} />
      <SleepTimerModal isOpen={showSleepTimerModal} onClose={() => setShowSleepTimerModal(false)} />
      <DeviceSelectorModal isOpen={showDevicesModal} onClose={() => setShowDevicesModal(false)} />
      <AudioQualityModal isOpen={showQualityModal} onClose={() => setShowQualityModal(false)} />
      <AudioOutputSheet isOpen={showAudioOutputSheet} onClose={() => setShowAudioOutputSheet(false)} />
    </>
  );
}
