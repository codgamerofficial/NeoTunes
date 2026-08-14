'use client';

import React, { useState } from 'react';
import { 
  Volume2, 
  Gauge, 
  Sliders, 
  Users, 
  Disc, 
  PlusSquare, 
  Clock, 
  Share2, 
  ChevronRight, 
  Download,
  X
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import StudioEqPanel from './StudioEqPanel';

interface PlayerOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerOptionsSheet({ isOpen, onClose }: PlayerOptionsSheetProps) {
  const { 
    volume, 
    setVolume, 
    playbackRate, 
    setPlaybackRate, 
    sleepTimerMinutes, 
    setSleepTimer 
  } = usePlaybackStore();

  const [showEqModal, setShowEqModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#121620]/95 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 p-6 space-y-6 max-h-[85vh] overflow-y-auto scrollbar-none shadow-2xl animate-slide-up select-none font-sans"
        aria-label="Player options menu"
      >
        {/* Drag Handle Bar */}
        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto" />

        {/* Header Title & Close */}
        <div className="flex items-center justify-between pt-1 pb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A8A7AF]">Player Controls</span>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Volume Control Slider (Screenshot 3) */}
        <div className="flex items-center gap-4 bg-white/5 p-3.5 rounded-2xl border border-white/10">
          <Volume2 className="w-5 h-5 text-[#00D9FF] shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00D9FF]"
          />
          <span className="text-xs font-mono font-bold text-white/80 w-9 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* 2. Playback Speed Gauge Slider (Screenshot 3) */}
        <div className="flex items-center gap-4 bg-white/5 p-3.5 rounded-2xl border border-white/10">
          <Gauge className="w-5 h-5 text-[#6246FF] shrink-0" />
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#6246FF]"
          />
          <span className="text-xs font-mono font-bold text-white/80 w-9 text-right">
            {playbackRate}x
          </span>
        </div>

        {/* 3. Action Menu Options List (Screenshot 3) */}
        <div className="space-y-1 divide-y divide-white/5">
          {/* Equalizer */}
          <button 
            onClick={() => setShowEqModal(true)}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Sliders className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] transition-colors" />
              <span className="text-sm font-semibold text-white">Equalizer</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
          </button>

          {/* Artists */}
          <button 
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Users className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] transition-colors" />
              <span className="text-sm font-semibold text-white">Artists</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
          </button>

          {/* Album */}
          <button 
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Disc className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] transition-colors" />
              <span className="text-sm font-semibold text-white">Album</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
          </button>

          {/* Add To Playlist */}
          <button 
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <PlusSquare className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] transition-colors" />
              <span className="text-sm font-semibold text-white">Add To Playlist</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
          </button>

          {/* Sleep Timer */}
          <button 
            onClick={() => setShowSleepTimerModal(true)}
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Clock className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] transition-colors" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-white">Sleep Timer</span>
                {sleepTimerMinutes && (
                  <span className="text-[10px] text-[#00D9FF] font-medium">Active: {sleepTimerMinutes}m</span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
          </button>

          {/* Download */}
          <button 
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Download className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] transition-colors" />
              <span className="text-sm font-semibold text-white">Download</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
          </button>

          {/* Share */}
          <button 
            className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Share2 className="w-5 h-5 text-white/80 group-hover:text-[#00D9FF] transition-colors" />
              <span className="text-sm font-semibold text-white">Share</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* Studio Equalizer Sub-modal */}
      {showEqModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-base font-bold text-white">Studio Equalizer</span>
              <button 
                onClick={() => setShowEqModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <StudioEqPanel />
          </div>
        </div>
      )}

      {/* Sleep Timer Sub-modal */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-base font-bold text-white">Sleep Timer</span>
              <button 
                onClick={() => setShowSleepTimerModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[5, 10, 15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSleepTimer(m);
                    setShowSleepTimerModal(false);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D9FF] hover:bg-[#00D9FF]/10 text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  {m} minutes
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setSleepTimer(null);
                setShowSleepTimerModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500/30 transition-all cursor-pointer mt-2"
            >
              Turn Off Timer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
