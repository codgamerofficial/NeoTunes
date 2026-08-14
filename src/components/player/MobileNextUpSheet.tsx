'use client';

import React from 'react';
import { Shuffle, GripVertical, Music, X } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { getArtistName } from '@/types';

interface MobileNextUpSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNextUpSheet({ isOpen, onClose }: MobileNextUpSheetProps) {
  const { currentTrack, queue, playTrack, shuffle, setShuffle } = usePlaybackStore();

  if (!isOpen) return null;

  const displayQueue = queue || [];

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Expandable Next Up Bottom Sheet */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0E121B]/98 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 p-6 space-y-5 max-h-[88vh] flex flex-col shadow-2xl animate-slide-up select-none font-sans"
        aria-label="Next Up Queue"
      >
        {/* Drag Handle Bar */}
        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto shrink-0" />

        {/* Header Title & Close */}
        <div className="flex items-center justify-between pt-1 pb-2 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-wide">Next Up</span>
            <span className="text-xs font-mono font-medium text-white/50">({displayQueue.length})</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Queue Items List */}
        <div className="flex-1 overflow-y-auto scrollbar-none space-y-2 pr-1">
          {displayQueue.map((item, idx) => {
            const isCurrent = currentTrack ? (currentTrack.canonicalId || currentTrack.id) === (item.canonicalId || item.id) : idx === 0;
            const artist = getArtistName(item.artists || item.artist);

            return (
              <div
                key={item.canonicalId || item.id || idx}
                onClick={() => playTrack(item)}
                className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                  isCurrent 
                    ? 'bg-white/10 border border-[#00D9FF]/30 shadow-lg' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Left: Artwork + Track Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <Artwork
                      source={item.artworkUrl || item.coverUrl}
                      size="medium"
                      canonicalId={item.canonicalId || item.id}
                      type="track"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl backdrop-blur-[2px] flex items-center justify-center">
                        <Music className="w-5 h-5 text-[#00D9FF] animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 pr-2">
                    <span className={`text-sm font-bold truncate ${isCurrent ? 'text-[#00D9FF]' : 'text-white'}`}>
                      {item.title}
                    </span>
                    <span className="text-xs font-medium text-white/60 truncate">
                      {artist}
                    </span>
                  </div>
                </div>

                {/* Right: Drag Handle Icon */}
                <div className="p-2 text-white/40 group-hover:text-white/80 transition-colors shrink-0 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Bottom Right Shuffle Pill Button */}
        <div className="pt-2 flex justify-end shrink-0">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`px-5 py-2.5 rounded-full border text-xs font-bold flex items-center gap-2 shadow-xl transition-all cursor-pointer ${
              shuffle 
                ? 'bg-[#00D9FF] text-black border-[#00D9FF] shadow-[#00D9FF]/30' 
                : 'bg-[#1D2230] text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>
    </>
  );
}

