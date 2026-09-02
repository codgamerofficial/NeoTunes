'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { 
  History as HistoryIcon, 
  Trash2, 
  Search, 
  Clock,
  X
} from 'lucide-react';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { useToast } from '@/components/ui/NeoToast';
import { getArtistName } from '@/types';
import { normalizeTrack } from '@/services/normalizeTrack';

export default function HistoryPage() {
  const router = useRouter();
  const { history, clearHistory } = usePlaybackStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const normalizedHistory = history.map(normalizeTrack);

  const filteredHistory = normalizedHistory.filter((trk) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const title = (trk.title || '').toLowerCase();
    const artist = getArtistName(trk.artists || trk.artist).toLowerCase();
    return title.includes(query) || artist.includes(query);
  });

  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(false);
    showToast('Listening history cleared');
  };

  return (
    <FeatureErrorBoundary featureName="Listening History">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <HistoryIcon className="h-6 w-6 text-[#DFFF00]" /> Listening History
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA1AD]">
              Your stream timeline and recently played tracks.
            </p>
          </div>

          {history.length > 0 && (
            <NeoButton
              variant="danger"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="self-start sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear History
            </NeoButton>
          )}
        </div>

        {/* Filter Bar */}
        {history.length > 0 && (
          <div className="relative flex items-center bg-[#11141A] border border-white/10 rounded-2xl px-4 py-2.5">
            <Search className="h-4 w-4 text-[#9AA1AD] mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter your history by song or artist..."
              className="bg-transparent text-xs sm:text-sm text-white placeholder-[#9AA1AD] focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-[#9AA1AD] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* History List */}
        {history.length === 0 ? (
          <NeoEmptyState
            icon={Clock}
            title="Your listening story starts here"
            description="Tracks you play will automatically appear in your history so you can easily rediscover them."
            actionText="Explore Music"
            onAction={() => router.push('/browse')}
          />
        ) : filteredHistory.length === 0 ? (
          <NeoEmptyState
            icon={Search}
            title="No matches found"
            description={`No listening history items match "${searchQuery}".`}
            actionText="Clear Filter"
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#DFFF00] uppercase tracking-wider">
                Recent Streams ({filteredHistory.length})
              </span>
            </div>

            <div className="space-y-1">
              {filteredHistory.map((trk, idx) => (
                <NeoTrackRow
                  key={`${trk.id}_${idx}`}
                  track={trk}
                  index={idx}
                  showIndex={true}
                  playlistContext={filteredHistory}
                />
              ))}
            </div>
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white">Clear Listening History?</h3>
              <p className="text-xs text-[#9AA1AD] leading-relaxed">
                This will remove all recently played tracks from your stream log. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <NeoButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </NeoButton>
                <NeoButton
                  variant="danger"
                  size="sm"
                  onClick={handleClearHistory}
                >
                  Clear History
                </NeoButton>
              </div>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
