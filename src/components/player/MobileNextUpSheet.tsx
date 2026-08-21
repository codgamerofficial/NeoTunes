'use client';

import React from 'react';
import { Shuffle, GripVertical, Music, Trash2, X, MoreHorizontal } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { getArtistName } from '@/types';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface MobileNextUpSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNextUpSheet({ isOpen, onClose }: MobileNextUpSheetProps) {
  const { 
    currentTrack, 
    queue, 
    playTrack, 
    shuffle, 
    setShuffle, 
    removeFromQueue, 
    clearQueue 
  } = usePlaybackStore();

  const displayQueue = queue || [];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      maxHeight="max-h-[88vh]"
      title={
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-white tracking-tight">Queue</span>
          <span className="text-xs font-mono font-semibold text-[#00D4FF]">
            ({displayQueue.length} tracks)
          </span>
        </div>
      }
      headerRight={
        displayQueue.length > 0 ? (
          <button
            onClick={() => clearQueue()}
            className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-extrabold hover:bg-red-500/30 transition-colors cursor-pointer"
          >
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="p-4 space-y-4 select-none font-sans text-white">
        
        {/* NOW PLAYING ITEM CARD */}
        {currentTrack && (
          <div className="space-y-2 pb-3 border-b border-white/10">
            <span className="text-[10px] font-mono font-black text-[#00D4FF] uppercase tracking-widest block">
              NOW PLAYING
            </span>
            <div className="p-3 rounded-2xl bg-[#00D4FF]/15 border border-[#00D4FF]/40 flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <Artwork
                    source={currentTrack.artworkUrl || currentTrack.coverUrl}
                    size="medium"
                    canonicalId={currentTrack.canonicalId || currentTrack.id}
                    type="track"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                    <Music className="w-5 h-5 text-[#00D4FF] animate-pulse" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-white truncate">{currentTrack.title}</div>
                  <div className="text-xs text-[#00D4FF] font-semibold truncate">
                    {getArtistName(currentTrack.artists || currentTrack.artist)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="flex items-end gap-0.5 h-4 px-2">
                  <span className="w-1 bg-[#00D4FF] h-full animate-bounce rounded-full" />
                  <span className="w-1 bg-[#00D4FF] h-2/3 animate-bounce rounded-full delay-75" />
                  <span className="w-1 bg-[#00D4FF] h-4/5 animate-bounce rounded-full delay-150" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* UP NEXT LIST */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider">
              UP NEXT
            </span>
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                shuffle 
                  ? 'bg-[#00D4FF] text-black font-extrabold' 
                  : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            {displayQueue.map((item, idx) => {
              const isCurrent = currentTrack ? (currentTrack.canonicalId || currentTrack.id) === (item.canonicalId || item.id) : idx === 0;
              const artist = getArtistName(item.artists || item.artist);

              return (
                <div
                  key={item.canonicalId || item.id || idx}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-white/10 border border-[#00D4FF]/30' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div 
                    onClick={() => {
                      playTrack(item);
                      onClose();
                    }}
                    className="flex items-center gap-3.5 min-w-0 flex-1"
                  >
                    <Artwork
                      source={item.artworkUrl || item.coverUrl}
                      size="medium"
                      canonicalId={item.canonicalId || item.id}
                      type="track"
                      className="shrink-0"
                    />

                    <div className="flex flex-col min-w-0 pr-2">
                      <span className={`text-sm font-bold truncate ${isCurrent ? 'text-[#00D4FF]' : 'text-white'}`}>
                        {item.title}
                      </span>
                      <span className="text-xs font-medium text-white/60 truncate">
                        {artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(item.id);
                      }}
                      className="p-2 rounded-full text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 text-white/30 cursor-grab">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}

            {displayQueue.length === 0 && (
              <div className="text-center py-10 text-white/40 space-y-1">
                <p className="text-sm font-bold">Your queue is empty</p>
                <p className="text-xs">Add tracks from Search, Home, or Recommendations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
