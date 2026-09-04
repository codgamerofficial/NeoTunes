'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Trash2, ArrowUp, ArrowDown, Music, History, Check, Sparkles, Infinity as InfinityIcon, Plus } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { useToast } from '@/components/ui/NeoToast';

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
    autoplayEnabled,
    autoplayQueue,
    autoplayMode,
    diversityLevel,
    playTrack,
    addToQueue,
    removeFromQueue,
    removeFromAutoplayQueue,
    clearQueue,
    reorderQueue,
    setAutoplayEnabled,
    setAutoplayMode,
    setDiversityLevel,
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

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleConfirmClear = () => {
    clearQueue();
    setShowClearConfirm(false);
    showToast('Queue cleared');
  };

  const drawerContent = (
    <div className={`w-full h-full bg-[#0B0D12] text-[#F5F7FA] flex flex-col overflow-hidden font-sans ${inline ? 'rounded-2xl border border-white/10' : 'border-l border-white/10 shadow-2xl'}`}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#11141A] shrink-0">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Playback Queue
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#DFFF00]/10 text-[#DFFF00] border border-[#DFFF00]/20">
              {queue.length} Tracks
            </span>
          </h2>
          <p className="text-xs text-[#9AA1AD]">Active tracks in current session</p>
        </div>

        {!inline && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
            aria-label="Close queue sheet"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-[#11141A] shrink-0">
        <div className="flex items-center gap-1.5 bg-[#171A21] p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'queue' ? 'bg-[#DFFF00] text-black font-bold shadow-sm' : 'text-[#9AA1AD] hover:text-white'
            }`}
          >
            <Music className="h-3.5 w-3.5" /> Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history' ? 'bg-[#DFFF00] text-black font-bold shadow-sm' : 'text-[#9AA1AD] hover:text-white'
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

      {/* Track List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
        
        {/* Now Playing */}
        {currentTrack && activeTab === 'queue' && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFFF00] block px-1">
              Now Playing
            </span>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171A21] border border-[#DFFF00]/30 shadow-md">
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
                  <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
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
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA1AD] block px-1">
              Next Up ({nextUpTracks.length})
            </span>

            {nextUpTracks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9AA1AD] border border-white/5 rounded-2xl bg-[#11141A]/50">
                Queue is empty. Add songs to queue while listening.
              </div>
            ) : (
              <div className="space-y-1">
                {nextUpTracks.map((trk, idx) => (
                  <div
                    key={`${trk.id}_${idx}`}
                    onClick={() => playTrack(trk, queue)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#11141A] border border-white/5 hover:border-white/15 hover:bg-[#171A21] cursor-pointer transition-all group"
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
                        <p className="text-[11px] text-[#9AA1AD] truncate">
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
                        className="p-1.5 text-[#9AA1AD] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* Autoplay Recommendations Section */}
        {activeTab === 'queue' && (
          <div className="space-y-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFFF00] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#DFFF00]" />
                  Autoplay Next
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#DFFF00]/10 text-[#DFFF00] border border-[#DFFF00]/20">
                  {autoplayEnabled ? `${autoplayQueue.length} Ready` : 'Paused'}
                </span>
              </div>

              {/* Autoplay On/Off Toggle Button */}
              <button
                onClick={() => {
                  const next = !autoplayEnabled;
                  setAutoplayEnabled(next);
                  showToast(next ? 'Autoplay enabled' : 'Autoplay paused');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  autoplayEnabled
                    ? 'bg-[#DFFF00]/20 text-[#DFFF00] border border-[#DFFF00]/30 hover:bg-[#DFFF00]/30'
                    : 'bg-white/5 text-[#9AA1AD] border border-white/10 hover:text-white'
                }`}
              >
                <InfinityIcon className="w-3.5 h-3.5" />
                {autoplayEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Mode Selector */}
            {autoplayEnabled && (
              <div className="flex flex-wrap items-center gap-1.5 px-1">
                <span className="text-[10px] text-[#9AA1AD] font-medium mr-1">Vibe:</span>
                {(['personal_mix', 'artist_radio', 'discovery'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setAutoplayMode(m);
                      showToast(
                        `Autoplay: ${
                          m === 'personal_mix'
                            ? 'Personal Mix'
                            : m === 'artist_radio'
                            ? 'Artist Radio'
                            : 'Discovery Mode'
                        }`
                      );
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      autoplayMode === m
                        ? 'bg-white/20 text-white font-semibold shadow-sm border border-white/20'
                        : 'bg-white/5 text-[#9AA1AD] hover:text-white border border-transparent'
                    }`}
                  >
                    {m === 'personal_mix' ? 'Personal Mix' : m === 'artist_radio' ? 'Artist Radio' : 'Discovery'}
                  </button>
                ))}
              </div>
            )}

            {/* Autoplay Tracks List */}
            {autoplayEnabled ? (
              autoplayQueue.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#9AA1AD] border border-white/5 rounded-2xl bg-[#11141A]/50 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-ping" />
                  Curating personalized auto-next recommendations...
                </div>
              ) : (
                <div className="space-y-1">
                  {autoplayQueue.map((trk, idx) => (
                    <div
                      key={`auto_${trk.id}_${idx}`}
                      onClick={() => {
                        const newQueue = [...queue, trk];
                        removeFromAutoplayQueue(trk.id);
                        playTrack(trk, newQueue);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#11141A]/70 border border-[#DFFF00]/15 hover:border-[#DFFF00]/40 hover:bg-[#171A21] cursor-pointer transition-all group"
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
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-semibold text-white group-hover:text-[#DFFF00] truncate transition-colors">
                              {trk.title}
                            </h4>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#DFFF00]/10 text-[#DFFF00] shrink-0">
                              ✨ Smart
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9AA1AD] truncate">
                            {getArtistName(trk.artists || trk.artist)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Add to User Queue */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToQueue(trk);
                            removeFromAutoplayQueue(trk.id);
                            showToast(`Added "${trk.title}" to Up Next`);
                          }}
                          className="p-1.5 text-[#9AA1AD] hover:text-[#DFFF00] opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-white/5"
                          title="Add to Up Next"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        {/* Dismiss Recommendation */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromAutoplayQueue(trk.id);
                          }}
                          className="p-1.5 text-[#9AA1AD] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-white/5"
                          title="Dismiss recommendation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="p-4 text-center text-xs text-[#9AA1AD] border border-white/5 rounded-2xl bg-[#11141A]/40 flex flex-col items-center gap-2">
                <p>Autoplay is paused. Enable it to keep continuous music playing.</p>
                <button
                  onClick={() => {
                    setAutoplayEnabled(true);
                    showToast('Autoplay turned on');
                  }}
                  className="px-3.5 py-1 bg-[#DFFF00] text-black text-xs font-bold rounded-full hover:bg-[#cbe600] transition-colors"
                >
                  Enable Autoplay
                </button>
              </div>
            )}
          </div>
        )}

        {/* History List */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA1AD] block px-1">
              Played Earlier ({history.length})
            </span>

            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9AA1AD] border border-white/5 rounded-2xl bg-[#11141A]/50">
                No songs played yet this session.
              </div>
            ) : (
              <div className="space-y-1">
                {history.map((trk, idx) => (
                  <div
                    key={`${trk.id}_${idx}`}
                    onClick={() => playTrack(trk)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#11141A] border border-white/5 hover:border-white/15 hover:bg-[#171A21] cursor-pointer transition-all group"
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
                        <p className="text-[11px] text-[#9AA1AD] truncate">
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
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#11141A] border border-white/10 rounded-2xl p-5 w-full max-w-xs space-y-3 text-center">
            <h3 className="text-sm font-bold text-white">Clear Playback Queue?</h3>
            <p className="text-xs text-[#9AA1AD]">This will remove all upcoming tracks from the queue.</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <NeoButton variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="danger" size="sm" onClick={handleConfirmClear}>
                Clear
              </NeoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (inline) return drawerContent;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 shadow-2xl"
          >
            {drawerContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
