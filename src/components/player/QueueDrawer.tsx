'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Trash2, ArrowUp, ArrowDown, Sparkles, Music, History, Plus } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { getArtistName, getCoverUrl } from '@/types';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QueueDrawer({ isOpen, onClose }: QueueDrawerProps) {
  const {
    currentTrack,
    queue,
    history,
    isPlaying,
    playTrack,
    removeFromQueue,
    clearQueue,
    reorderQueue,
    smartQueueEnabled,
    setSmartQueueEnabled,
  } = usePlaybackStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  if (!isOpen) return null;

  const currentTrackIndex = currentTrack
    ? queue.findIndex((t) => t.id === currentTrack.id)
    : -1;

  const nextUpTracks = currentTrackIndex >= 0 ? queue.slice(currentTrackIndex + 1) : queue;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md" 
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md h-full bg-[#0A0A0F]/98 border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-[#00D4FF]/10 via-[#7A3CFF]/5 to-transparent shrink-0">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Play Queue
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">
                  {queue.length} Tracks
                </span>
              </h2>
              <p className="text-xs text-white/40 mt-0.5">Spotify-grade Queue Management</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs & Actions */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/[0.02] shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'queue'
                    ? 'bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-black'
                    : 'text-white/50 hover:text-white bg-white/5'
                }`}
              >
                <Music className="h-3.5 w-3.5" /> Next Up ({nextUpTracks.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-black'
                    : 'text-white/50 hover:text-white bg-white/5'
                }`}
              >
                <History className="h-3.5 w-3.5" /> History ({history.length})
              </button>
            </div>

            {activeTab === 'queue' && queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs font-bold text-white/40 hover:text-[#FF2D95] transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Queue Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none">
            {activeTab === 'queue' ? (
              <>
                {/* Now Playing Section */}
                {currentTrack && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00D4FF] flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#00D4FF] animate-ping" />
                      Now Playing
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#00D4FF]/15 via-[#7A3CFF]/10 to-transparent border border-[#00D4FF]/30 shadow-[0_0_20px_rgba(0,212,255,0.15)]">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={getCoverUrl(currentTrack)} 
                          alt={currentTrack.title}
                          className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0 shadow-md"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate">{currentTrack.title}</div>
                          <div className="text-xs text-[#00D4FF] font-semibold truncate">{getArtistName(currentTrack.artist)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#00D4FF]">
                        <span className="text-xs font-mono font-bold">{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Up Next List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">
                    <span>Next In Queue</span>
                    <button
                      onClick={() => setSmartQueueEnabled(!smartQueueEnabled)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] transition-all ${
                        smartQueueEnabled
                          ? 'border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF]'
                          : 'border-white/10 text-white/40'
                      }`}
                    >
                      <Sparkles className="h-3 w-3" /> Auto-Queue: {smartQueueEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {nextUpTracks.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                      <Music className="h-8 w-8 text-white/20 mx-auto mb-2" />
                      <p className="text-xs font-bold text-white/50">Queue is empty</p>
                      <p className="text-[11px] text-white/30 mt-1">Play any album, playlist, or song to populate your queue.</p>
                    </div>
                  ) : (
                    nextUpTracks.map((track, relativeIdx) => {
                      const actualIdx = currentTrackIndex + 1 + relativeIdx;
                      return (
                        <div
                          key={`${track.id}-${actualIdx}`}
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all"
                        >
                          <div 
                            onClick={() => playTrack(track, queue)}
                            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                          >
                            <img 
                              src={getCoverUrl(track)} 
                              alt={track.title}
                              className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white group-hover:text-[#00D4FF] transition-colors truncate">
                                {track.title}
                              </div>
                              <div className="text-[10px] text-white/40 truncate">
                                {getArtistName(track.artist)}
                              </div>
                            </div>
                          </div>

                          {/* Reorder & Action Buttons */}
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            {actualIdx > currentTrackIndex + 1 && (
                              <button
                                onClick={() => reorderQueue(actualIdx, actualIdx - 1)}
                                className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10"
                                title="Move Up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {actualIdx < queue.length - 1 && (
                              <button
                                onClick={() => reorderQueue(actualIdx, actualIdx + 1)}
                                className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10"
                                title="Move Down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => removeFromQueue(track.id)}
                              className="p-1 rounded text-white/40 hover:text-[#FF2D95] hover:bg-white/10"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* History Tab */
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">
                  Recently Played History
                </div>
                {history.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <History className="h-8 w-8 text-white/20 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white/50">No listening history yet</p>
                  </div>
                ) : (
                  history.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00D4FF]/10 border border-white/5 hover:border-[#00D4FF]/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={getCoverUrl(track)} 
                          alt={track.title}
                          className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white group-hover:text-[#00D4FF] transition-colors truncate">
                            {track.title}
                          </div>
                          <div className="text-[10px] text-white/40 truncate">
                            {getArtistName(track.artist)}
                          </div>
                        </div>
                      </div>
                      <Play className="h-3.5 w-3.5 text-[#00D4FF] fill-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
