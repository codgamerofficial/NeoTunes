'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Trash2, ArrowUp, ArrowDown, Music, History, Check } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

export default function QueueDrawer({ isOpen, onClose, inline = false }: QueueDrawerProps) {
  const {
    currentTrack,
    queue,
    history,
    playTrack,
    removeFromQueue,
    clearQueue,
    reorderQueue,
  } = usePlaybackStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Handle Keyboard Escape key to close queue sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showClearConfirm) setShowClearConfirm(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showClearConfirm, onClose]);

  if (!isOpen && !inline) return null;

  const currentTrackIndex = currentTrack
    ? queue.findIndex((t) => t.id === currentTrack.id)
    : -1;

  const nextUpTracks = currentTrackIndex >= 0 ? queue.slice(currentTrackIndex + 1) : queue;

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleConfirmClear = () => {
    clearQueue();
    setShowClearConfirm(false);
  };

  const drawerContent = (
    <div className={`w-full h-full bg-[#050505] text-[#F5F5F5] flex flex-col overflow-hidden font-sans ${inline ? 'rounded-2xl border border-[#292929]' : 'border-l border-[#292929] shadow-2xl'}`}>
      
      {/* ── HEADER BAR ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#292929] bg-[#090A0C] shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight font-mono flex items-center gap-2">
            PLAY QUEUE
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/30">
              {queue.length} Tracks
            </span>
          </h2>
          <p className="text-xs text-[#A1A1A6]">Manage your active playback queue</p>
        </div>

        {!inline && (
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-white/10 text-[#A1A1A6] hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close queue sheet"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── MODE TABS (Queue vs History & Clear Action) ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#292929] bg-[#090A0C] shrink-0">
        <div className="flex items-center gap-1.5 bg-white/[0.045] p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'queue' ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm' : 'text-[#A1A1A6] hover:text-white'
            }`}
          >
            <Music className="h-3.5 w-3.5" /> Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history' ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm' : 'text-[#A1A1A6] hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" /> History ({history.length})
          </button>
        </div>

        {queue.length > 0 && activeTab === 'queue' && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* ── TRACK LIST CONTAINER ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
        
        {/* NOW PLAYING SECTION */}
        {currentTrack && activeTab === 'queue' && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#DFFF00] block px-1">
              NOW PLAYING
            </span>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.08] border border-[#DFFF00]/50 shadow-md">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Artwork
                  source={resolveArtwork(currentTrack)}
                  size="small"
                  alt={currentTrack.title}
                  canonicalId={currentTrack.id}
                  type="track"
                  className="h-12 w-12 rounded-lg object-cover border border-white/20 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                  <p className="text-[11px] text-[#A1A1A6] truncate">{getArtistName(currentTrack.artists || currentTrack.artist)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase bg-[#DFFF00] text-black">
                  PLAYING
                </span>
              </div>
            </div>
          </div>
        )}

        {/* UP NEXT QUEUE LIST */}
        {activeTab === 'queue' && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A1A1A6] block px-1">
              UP NEXT ({nextUpTracks.length})
            </span>

            {nextUpTracks.length > 0 ? (
              <div className="space-y-2">
                {nextUpTracks.map((track, idx) => (
                  <div
                    key={track.id + '_' + idx}
                    className="h-[76px] p-2.5 rounded-xl bg-[#090A0C] border border-[#292929] hover:border-white/20 flex items-center justify-between transition-all group"
                  >
                    <div
                      onClick={() => playTrack(track)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <Artwork
                        source={resolveArtwork(track)}
                        size="small"
                        canonicalId={track.id}
                        type="track"
                        className="h-12 w-12 rounded-lg object-cover border border-[#292929] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] truncate transition-colors">
                          {track.title}
                        </div>
                        <div className="text-[11px] text-[#A1A1A6] truncate">
                          {getArtistName(track.artists || track.artist)} • {formatTime(track.duration)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-[#A1A1A6] px-1">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => removeFromQueue(track.id)}
                        className="p-1.5 text-[#A1A1A6] hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove from queue"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <Music className="w-8 h-8 text-[#A1A1A6] mx-auto" />
                <p className="text-xs text-[#A1A1A6]">No upcoming tracks in queue.</p>
              </div>
            )}
          </div>
        )}

        {/* LISTENING HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A1A1A6] block px-1">
              RECENTLY PLAYED ({history.length})
            </span>
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((track, idx) => (
                  <div
                    key={track.id + '_hist_' + idx}
                    onClick={() => playTrack(track)}
                    className="h-[76px] p-2.5 rounded-xl bg-[#090A0C] border border-[#292929] hover:border-white/20 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Artwork
                        source={resolveArtwork(track)}
                        size="small"
                        canonicalId={track.id}
                        type="track"
                        className="h-12 w-12 rounded-lg object-cover border border-[#292929] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] truncate transition-colors">
                          {track.title}
                        </div>
                        <div className="text-[11px] text-[#A1A1A6] truncate">
                          {getArtistName(track.artists || track.artist)}
                        </div>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-[#A1A1A6] group-hover:text-[#DFFF00]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <History className="w-8 h-8 text-[#A1A1A6] mx-auto" />
                <p className="text-xs text-[#A1A1A6]">No listening history recorded yet.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── CLEAR QUEUE CONFIRMATION DIALOG ── */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#090A0C] border border-[#292929] rounded-2xl p-6 shadow-2xl space-y-4 z-10 text-center"
            >
              <h3 className="text-base font-bold text-white font-mono">Clear Queue?</h3>
              <p className="text-xs text-[#A1A1A6]">
                This will remove {nextUpTracks.length} upcoming tracks from your queue.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-full bg-white/5 text-[#A1A1A6] hover:text-white text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClear}
                  className="px-5 py-2 rounded-full bg-red-500 text-white text-xs font-mono font-bold uppercase tracking-wider"
                >
                  Clear Queue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );

  if (inline) return drawerContent;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-md h-full z-10">
        {drawerContent}
      </div>
    </div>
  );
}
