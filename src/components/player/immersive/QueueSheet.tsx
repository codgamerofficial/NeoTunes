'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Music, History, Play } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import { useToast } from '@/components/ui/NeoToast';
import OverlayLayer from '@/components/navigation/OverlayLayer';

interface QueueSheetProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

export default function QueueSheet({
  isOpen,
  onClose,
  inline = false,
}: QueueSheetProps) {
  const {
    currentTrack,
    queue,
    history,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = usePlaybackStore();

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  const handleConfirmClear = () => {
    clearQueue();
    setShowClearConfirm(false);
    showToast('Queue cleared');
  };

  const content = (
    <div
      className={`w-full h-full bg-[#0B0D12]/98 backdrop-blur-2xl text-[#F5F7FA] flex flex-col overflow-hidden font-sans ${
        inline
          ? 'rounded-3xl border border-white/10 shadow-2xl'
          : 'border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Playing Queue
            <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/30">
              {queue.length} Tracks
            </span>
          </h2>
          <p className="text-[11px] text-white/50">Next tracks in session</p>
        </div>

        {!inline && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close queue"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.08] bg-white/[0.01] shrink-0">
        <div className="flex items-center gap-1.5 bg-white/[0.05] p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Music className="h-3.5 w-3.5" /> Up Next ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" /> History ({history.length})
          </button>
        </div>

        {queue.length > 0 && activeTab === 'queue' && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Scrollable Track Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
        {/* Now Playing Header */}
        {currentTrack && activeTab === 'queue' && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFFF00] block px-1">
              Now Playing
            </span>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#DFFF00]/10 border border-[#DFFF00]/30 shadow-md">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Artwork
                  source={resolveArtwork(currentTrack)}
                  size="small"
                  alt={currentTrack.title}
                  canonicalId={currentTrack.id}
                  type="track"
                  className="h-11 w-11 rounded-xl object-cover border border-white/15 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                  <p className="text-[11px] text-[#DFFF00] font-medium truncate mt-0.5">
                    {getArtistName(currentTrack.artists || currentTrack.artist)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-ping" />
              </div>
            </div>
          </div>
        )}

        {/* Up Next List */}
        {activeTab === 'queue' && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block px-1">
              Next Up ({nextUpTracks.length})
            </span>

            {nextUpTracks.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/50 border border-white/5 rounded-2xl bg-white/[0.02]">
                Queue is empty. Select songs to add them to your queue.
              </div>
            ) : (
              <div className="space-y-1">
                {nextUpTracks.map((trk, idx) => (
                  <div
                    key={`${trk.id}_${idx}`}
                    onClick={() => playTrack(trk, queue)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.08] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Artwork
                        source={resolveArtwork(trk)}
                        size="small"
                        canonicalId={trk.id}
                        type="track"
                        className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-white group-hover:text-[#DFFF00] truncate transition-colors">
                          {trk.title}
                        </h4>
                        <p className="text-[11px] text-white/50 truncate">
                          {getArtistName(trk.artists || trk.artist)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(trk.id);
                        }}
                        className="p-1.5 text-white/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from queue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block px-1">
              Played Earlier ({history.length})
            </span>

            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/50 border border-white/5 rounded-2xl bg-white/[0.02]">
                No songs played yet this session.
              </div>
            ) : (
              <div className="space-y-1">
                {history.map((trk, idx) => (
                  <div
                    key={`${trk.id}_${idx}`}
                    onClick={() => playTrack(trk)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.08] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Artwork
                        source={resolveArtwork(trk)}
                        size="small"
                        canonicalId={trk.id}
                        type="track"
                        className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-white group-hover:text-[#DFFF00] truncate transition-colors">
                          {trk.title}
                        </h4>
                        <p className="text-[11px] text-white/50 truncate">
                          {getArtistName(trk.artists || trk.artist)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#11141A] border border-white/12 rounded-2xl p-5 w-full max-w-xs space-y-3 text-center shadow-2xl">
            <h3 className="text-sm font-bold text-white">Clear Playback Queue?</h3>
            <p className="text-xs text-white/60">This will remove upcoming tracks from your queue.</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/15 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white transition-all shadow-md"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (inline) return content;

  return (
    <OverlayLayer>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-end select-none font-sans">
            {/* Dimmed Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />

            {/* Desktop Slide-in or Mobile Full Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full max-w-md h-full"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </OverlayLayer>
  );
}
