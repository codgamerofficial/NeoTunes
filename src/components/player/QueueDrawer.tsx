'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Trash2, ArrowUp, ArrowDown, Music, History } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { getArtistName, getCoverUrl } from '@/types';
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

  if (!isOpen && !inline) return null;

  const currentTrackIndex = currentTrack
    ? queue.findIndex((t) => t.id === currentTrack.id)
    : -1;

  const nextUpTracks = currentTrackIndex >= 0 ? queue.slice(currentTrackIndex + 1) : queue;

  const drawerContent = (
    <div className={`w-full h-full bg-[#07090E]/95 flex flex-col overflow-hidden ${inline ? 'rounded-2xl border border-white/5' : 'border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-[#00D9FF]/10 via-[#6D3BFF]/5 to-transparent shrink-0">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            Play Queue
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/30">
              {queue.length} Tracks
            </span>
          </h2>
          <p className="text-[10px] text-white/50 font-medium">Manage your active playback queue</p>
        </div>

        {!inline && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Mode Tabs (Queue vs History) */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/40 shrink-0">
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'queue' ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]' : 'text-white/60 hover:text-white'
            }`}
          >
            <Music className="h-3.5 w-3.5" /> Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history' ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]' : 'text-white/60 hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" /> History ({history.length})
          </button>
        </div>

        {queue.length > 0 && activeTab === 'queue' && (
          <button
            onClick={clearQueue}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Main Track List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
        {/* NOW PLAYING SECTION */}
        {currentTrack && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00D9FF] block px-1">
              NOW PLAYING
            </span>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#00D9FF]/20 to-[#6D3BFF]/20 border border-[#00D9FF]/40 shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <Artwork
                  track={currentTrack}
                  size="small"
                  alt={currentTrack.title}
                  className="h-10 w-10 rounded-xl object-cover border border-white/20 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-white truncate">{currentTrack.title}</h4>
                  <p className="text-[11px] text-white/70 truncate">{getArtistName(currentTrack.artist)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#00D9FF] text-black">
                  PLAYING
                </span>
              </div>
            </div>
          </div>
        )}

        {/* UP NEXT SECTION */}
        {activeTab === 'queue' && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block px-1">
              UP NEXT ({nextUpTracks.length})
            </span>
            {nextUpTracks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-white/40 space-y-2">
                <Music className="h-6 w-6 mx-auto opacity-50" />
                <p className="text-xs font-bold">Queue is empty</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {nextUpTracks.map((t, idx) => (
                  <div
                    key={t.id + idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                  >
                    <div
                      onClick={() => playTrack(t)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <Artwork
                        track={t}
                        size="small"
                        alt={t.title}
                        className="h-9 w-9 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#00D9FF] transition-colors">
                          {t.title}
                        </h4>
                        <p className="text-[10px] text-white/50 truncate">{getArtistName(t.artist)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {idx > 0 && (
                        <button
                          onClick={() => reorderQueue(currentTrackIndex + 1 + idx, currentTrackIndex + idx)}
                          className="p-1 text-white/60 hover:text-white"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {idx < nextUpTracks.length - 1 && (
                        <button
                          onClick={() => reorderQueue(currentTrackIndex + 1 + idx, currentTrackIndex + 2 + idx)}
                          className="p-1 text-white/60 hover:text-white"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromQueue(t.id)}
                        className="p-1 text-red-400/70 hover:text-red-400"
                        title="Remove"
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

        {/* HISTORY SECTION */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block px-1">
              RECENTLY PLAYED ({history.length})
            </span>
            {history.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-white/40 space-y-2">
                <History className="h-6 w-6 mx-auto opacity-50" />
                <p className="text-xs font-bold">History is empty</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {history.map((t, idx) => (
                  <div
                    key={t.id + idx}
                    onClick={() => playTrack(t)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Artwork
                        track={t}
                        size="small"
                        alt={t.title}
                        className="h-9 w-9 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#00D9FF] transition-colors">
                          {t.title}
                        </h4>
                        <p className="text-[10px] text-white/50 truncate">{getArtistName(t.artist)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (inline) {
    return drawerContent;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="queue-drawer-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md" 
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full"
          >
            {drawerContent}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
