'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Download, Trash2, HardDrive, Compass, X } from 'lucide-react';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { useToast } from '@/components/ui/NeoToast';
import { Track } from '@/types';

interface DownloadedTrackItem {
  id: string;
  track: Track;
  sizeBytes: number;
  downloadedAt: string;
}

export default function DownloadsPage() {
  const router = useRouter();
  const { playTrack } = usePlaybackStore();
  const { showToast } = useToast();

  const [downloadedItems, setDownloadedItems] = useState<DownloadedTrackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('neotunes_downloads');
      if (stored) {
        setDownloadedItems(JSON.parse(stored));
      } else {
        setDownloadedItems([]);
      }
    } catch {
      setDownloadedItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = downloadedItems.filter((item) => item.id !== id);
    setDownloadedItems(updated);
    try {
      localStorage.setItem('neotunes_downloads', JSON.stringify(updated));
    } catch {}
    showToast('Download removed from local cache');
  };

  const handleConfirmCleanup = () => {
    setDownloadedItems([]);
    try {
      localStorage.removeItem('neotunes_downloads');
    } catch {}
    setShowCleanupConfirm(false);
    showToast('All offline downloads cleared');
  };

  const totalSizeBytes = downloadedItems.reduce((sum, item) => sum + (item.sizeBytes || 0), 0);
  const formattedStorageUsed = totalSizeBytes > 0
    ? `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : '0 MB';

  const trackList = downloadedItems.map((item) => item.track);

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Download className="h-6 w-6 text-[#00E5FF]" /> Offline Downloads
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD]">
            Manage your cached audio tracks and local device storage.
          </p>
        </div>

        {downloadedItems.length > 0 && (
          <NeoButton
            variant="danger"
            size="sm"
            onClick={() => setShowCleanupConfirm(true)}
            className="self-start sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear All Downloads
          </NeoButton>
        )}
      </div>

      {/* Storage Analytics Card */}
      <NeoCard className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <HardDrive className="h-4 w-4 text-[#00E5FF]" /> Local Offline Cache
          </div>
          <span className="text-xs font-bold text-[#00E5FF]">
            {formattedStorageUsed} Used
          </span>
        </div>

        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-[#00E5FF] to-[#DFFF00] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(4, (totalSizeBytes / (500 * 1024 * 1024)) * 100))}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-[#9AA1AD] pt-0.5 font-medium">
          <span>{downloadedItems.length} {downloadedItems.length === 1 ? 'track' : 'tracks'} stored</span>
          <span>Adaptive client cache</span>
        </div>
      </NeoCard>

      {/* Downloaded Songs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Downloaded Tracks ({downloadedItems.length})
          </h2>
        </div>

        {isLoading ? (
          <NeoSkeleton variant="track" count={4} />
        ) : downloadedItems.length === 0 ? (
          <NeoEmptyState
            icon={Download}
            title="Take your music offline"
            description="Download your favorite tracks and playlists to keep listening anywhere without an internet connection."
            actionLabel="Discover Music"
            onAction={() => router.push('/browse')}
          />
        ) : (
          <div className="space-y-1">
            {downloadedItems.map((item, idx) => (
              <div key={item.id} className="relative group/dl flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <NeoTrackRow
                    track={item.track}
                    index={idx}
                    showIndex={true}
                    playlistContext={trackList}
                  />
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 mr-2 rounded-full text-[#9AA1AD] hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Remove from downloads"
                  aria-label="Remove download"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cleanup Confirmation Modal */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Clear All Downloads?</h3>
            <p className="text-xs text-[#9AA1AD] leading-relaxed">
              This will remove all downloaded offline tracks from your device cache ({formattedStorageUsed}). You will need an internet connection to stream them again.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <NeoButton
                variant="ghost"
                size="sm"
                onClick={() => setShowCleanupConfirm(false)}
              >
                Cancel
              </NeoButton>
              <NeoButton
                variant="danger"
                size="sm"
                onClick={handleConfirmCleanup}
              >
                Clear Downloads
              </NeoButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
