'use client';

import React, { useState } from 'react';
import { usePlaybackStore } from '@/store/playback-store';
import { getArtistName } from '@/types';
import { Bug, X, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export function ArtworkDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTrack } = usePlaybackStore();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 z-50 p-2.5 rounded-full bg-[#121624]/90 backdrop-blur-md border border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF] hover:text-black shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all cursor-pointer"
        title="Open Artwork Debug Panel (DEV)"
      >
        <Bug className="w-4 h-4" />
      </button>
    );
  }

  const artworkUrl = currentTrack?.artworkUrl || currentTrack?.coverUrl || '';
  const status = currentTrack?.artworkStatus || (artworkUrl ? 'resolved' : 'fallback');
  const source = currentTrack?.artworkSource || (artworkUrl ? 'spotify' : 'fallback');
  const confidence = currentTrack?.metadataConfidence || (currentTrack ? 95 : 0);

  return (
    <div className="fixed bottom-24 right-4 z-50 w-80 bg-[#0C0F1A]/98 border border-[#00D4FF]/50 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white text-xs font-mono select-none backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <div className="flex items-center gap-2 font-bold text-[#00D4FF]">
          <Bug className="w-4 h-4" />
          <span>ARTWORK RESOLVER DEBUG</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/50 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {currentTrack ? (
        <div className="space-y-2">
          <div>
            <span className="text-white/40 block text-[10px]">TRACK</span>
            <span className="font-bold text-white truncate block">{currentTrack.title}</span>
          </div>

          <div>
            <span className="text-white/40 block text-[10px]">ARTIST</span>
            <span className="font-semibold text-white/80 truncate block">
              {getArtistName(currentTrack.artist)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-white/40 block text-[10px]">SOURCE</span>
              <span className="font-bold text-[#00D4FF] uppercase">{source}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px]">STATUS</span>
              <span className={`font-bold uppercase ${status === 'resolved' ? 'text-green-400' : 'text-amber-400'}`}>
                {status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-white/40 block text-[10px]">CONFIDENCE</span>
              <span className="font-bold text-purple-400">{confidence}%</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px]">PLAYBACK</span>
              <span className="font-bold text-emerald-400 uppercase">{currentTrack.source}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="text-white/40 block text-[10px] truncate mb-1">URL</span>
            <span className="text-[9px] text-white/70 break-all bg-black/50 p-1.5 rounded block max-h-16 overflow-y-auto">
              {artworkUrl || 'No active URL (Using Fallback)'}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-white/40">No active track playing</div>
      )}
    </div>
  );
}
