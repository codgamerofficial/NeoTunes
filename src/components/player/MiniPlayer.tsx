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
  Volume2,
  VolumeX,
  Maximize2,
  Sliders,
  Radio,
  Clock,
  Wifi,
  Cast
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getArtistName } from '@/types';
import { getTrackArtwork } from '@/utils/artwork';
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
    setPlaying,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    setProgress,
    sleepTimerMinutes,
  } = usePlaybackStore();

  const currentTime = progress;

  const { isSidebarOpen, isRightPanelOpen } = useLayoutStore();
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);

  // Hide mini player on full Now Playing route or if no track
  if (pathname === '/player' || !currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const displayDuration = duration > 0 ? duration : 225; // 3:45 default for Dai Dai
  const progressPercent = displayDuration > 0 ? Math.min(100, (currentTime / displayDuration) * 100) : 0;

  const leftPos = isSidebarOpen ? 'md:left-[272px]' : 'md:left-[96px]';
  const rightPos = isRightPanelOpen ? 'md:right-[340px]' : 'md:right-6';

  const artworkUrl = getTrackArtwork(currentTrack);
  const artistName = getArtistName(currentTrack.artist);

  return (
    <div className={`fixed bottom-[74px] md:bottom-4 left-3 right-3 md:left-4 md:right-4 ${leftPos} ${rightPos} z-40 transition-all duration-300`}>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-[#171B26]/98 backdrop-blur-2xl border border-white/10 rounded-[26px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden font-sans select-none"
      >
        {/* Glowing Top Progress Line (Screenshot 2: Electric Cyan & Pink Bar) */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPercent = clickX / rect.width;
            const targetTime = newPercent * displayDuration;
            setProgress(targetTime);
            window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: targetTime } }));
          }}
          className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer group"
        >
          <div
            className="h-full bg-gradient-to-r from-[#00D9FF] via-[#7657FF] to-[#FF2E9A] rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Left: Artwork + Track Title + Artist (Screenshot 2) */}
          <div 
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            onClick={() => router.push('/player')}
          >
            <img
              src={artworkUrl}
              alt={currentTrack.title}
              className="h-11 w-11 rounded-xl object-cover border border-white/10 shadow-md shrink-0 bg-black/40"
            />

            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate hover:text-[#00D9FF] transition-colors">
                {currentTrack.title}
              </h4>
              <p className="text-[11px] text-white/60 truncate font-medium mt-0.5">
                {artistName}
              </p>
            </div>
          </div>

          {/* Center Playback Controls (Screenshot 2: Prev, Glowing Cyan Play/Pause, Next, Timestamps) */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={prevTrack} 
              className="text-white/60 hover:text-white transition-colors cursor-pointer hidden sm:block p-1.5"
            >
              <SkipBack className="h-4 w-4 fill-current" />
            </button>

            {/* Cyan Glowing Play/Pause Button (Screenshot 2) */}
            <button
              onClick={() => setPlaying(!isPlaying)}
              className="h-10 w-10 rounded-full bg-[#00D9FF] text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,217,255,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-black" />
              ) : (
                <Play className="h-5 w-5 fill-black ml-0.5" />
              )}
            </button>

            <button 
              onClick={nextTrack} 
              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1.5"
              aria-label="Next Track"
            >
              <SkipForward className="h-4 w-4 fill-current text-white/80" />
            </button>

            {/* Realtime Timestamp (Screenshot 2: 1:27 / 3:45) */}
            <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono font-medium text-white/50 pl-1">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(displayDuration)}</span>
            </div>
          </div>

          {/* Right Action Tools: Cast, Expand Fullscreen (Screenshot 2) */}
          <div className="flex items-center gap-1.5 shrink-0 justify-end">
            <button
              onClick={() => setShowDevicesModal(true)}
              className="p-2 rounded-full text-white/60 hover:text-[#00D9FF] hover:bg-white/10 transition-all cursor-pointer"
              title="Cast / Devices"
            >
              <Wifi className="h-4 w-4" />
            </button>

            <button
              onClick={() => router.push('/player')}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Expand Player"
              aria-label="Expand Now Playing"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <QueueDrawer isOpen={showQueueDrawer} onClose={() => setShowQueueDrawer(false)} />
      <EqualizerModal isOpen={showEqModal} onClose={() => setShowEqModal(false)} />
      <SleepTimerModal isOpen={showSleepTimerModal} onClose={() => setShowSleepTimerModal(false)} />
      <DeviceSelectorModal isOpen={showDevicesModal} onClose={() => setShowDevicesModal(false)} />
      <AudioQualityModal isOpen={showQualityModal} onClose={() => setShowQualityModal(false)} />
    </div>
  );
}
