'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { 
  History, 
  Trash2, 
  Search, 
  Play, 
  Plus, 
  Clock, 
  Music, 
  Compass, 
  ChevronRight 
} from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { resolveArtwork } from '@/utils/artwork';
import { getArtistName } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const { history, playTrack, addToQueue, clearHistory } = usePlaybackStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter((trk) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const title = (trk.title || '').toLowerCase();
    const artist = getArtistName(trk.artists || trk.artist).toLowerCase();
    return title.includes(query) || artist.includes(query);
  });

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '3:15';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <FeatureErrorBoundary featureName="Listening History">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-5xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <History className="h-7 w-7 text-[#DFFF00]" /> Listening History
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1A6] mt-0.5">
              Your recent stream activity and played tracks.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => clearHistory()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-[#A1A1A6] hover:text-red-400 hover:border-red-500/40 transition-all cursor-pointer shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear History
            </button>
          )}
        </div>

        {/* Search History Filter Bar */}
        {history.length > 0 && (
          <div className="relative flex items-center bg-white/[0.055] border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-md">
            <Search className="h-4 w-4 text-[#A1A1A6] mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter your history by song or artist..."
              className="bg-transparent text-xs sm:text-sm text-white placeholder-[#A1A1A6] focus:outline-none w-full"
            />
          </div>
        )}

        {/* Listening History List */}
        {history.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-4 my-8">
            <div className="p-4 rounded-full bg-white/5 text-[#DFFF00] w-14 h-14 mx-auto flex items-center justify-center">
              <Clock className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Your listening history is empty</h3>
              <p className="text-xs text-[#A1A1A6] max-w-sm mx-auto">
                Tracks you play will automatically appear here so you can re-discover your favorite music.
              </p>
            </div>
            <button
              onClick={() => router.push('/browse')}
              className="px-6 py-2.5 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-extrabold uppercase tracking-wider hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Compass className="h-4 w-4" /> Explore Music
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-[#A1A1A6] text-xs font-mono border border-white/10 rounded-2xl">
            No history results matching "{searchQuery}".
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-[#DFFF00] uppercase tracking-wider">
              Recent Activity ({filteredHistory.length})
            </span>

            <div className="space-y-2">
              {filteredHistory.map((trk, idx) => (
                <GlassCard
                  key={`${trk.id}_${idx}`}
                  onClick={() => playTrack(trk)}
                  className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <Artwork
                      source={resolveArtwork(trk)}
                      size="small"
                      canonicalId={trk.id}
                      type="track"
                      className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#DFFF00] truncate transition-colors">
                        {trk.title}
                      </div>
                      <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                        {getArtistName(trk.artists || trk.artist)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-[#A1A1A6]">
                      {formatTime(trk.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(trk);
                      }}
                      className="p-2 rounded-full bg-white/5 hover:bg-[#DFFF00] hover:text-black text-[#A1A1A6] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Add to queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
