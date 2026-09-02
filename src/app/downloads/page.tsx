'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Download, Trash2, HardDrive, Compass, X, Play, Music } from 'lucide-react';
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
    showToast('Download removed from local storage');
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Download className="h-6 w-6 text-[#00E5FF]" /> Offline Downloads
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD] font-medium">
            Listen to your cached audio tracks offline without an internet connection.
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
      <NeoCard className="p-5 space-y-3 bg-[#11141A] border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <HardDrive className="h-4 w-4 text-[#00E5FF]" /> Device Audio Storage
          </div>
          <span className="text-xs font-mono font-bold text-[#00E5FF]">{formattedStorageUsed} Used</span>
        </div>
        
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00E5FF] rounded-full transition-all duration-500"
            style={{ width: downloadedItems.length > 0 ? `${Math.min(100, (downloadedItems.length / 50) * 100)}%` : '0%' }}
          />
        </div>
        
        <div className="flex items-center justify-between text-[11px] text-[#9AA1AD]">
          <span>{downloadedItems.length} cached tracks</span>
          <span>Target storage budget: 500 MB</span>
        </div>
      </NeoCard>

      {/* Downloads List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD] px-1">
          Downloaded Tracks ({downloadedItems.length})
        </h3>

        {isLoading ? (
          <NeoSkeleton variant="track" count={4} />
        ) : downloadedItems.length === 0 ? (
          <NeoEmptyState
            icon={Download}
            title="No offline tracks saved"
            description="Songs you download while listening will appear here for offline access."
            actionText="Explore Music"
            onAction={() => router.push('/browse')}
          />
        ) : (
          <div className="space-y-1">
            {downloadedItems.map((item, idx) => (
              <div key={item.id} className="relative group">
                <NeoTrackRow
                  track={item.track}
                  index={idx}
                  showIndex={true}
                  playlistContext={trackList}
                />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-full text-[#9AA1AD] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete download"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cleanup Confirmation Dialog */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#11141A] border border-white/10 shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold text-white">Clear All Downloads?</h3>
            <p className="text-xs text-[#9AA1AD]">
              This will remove all offline cached music tracks from your local device storage.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <NeoButton variant="ghost" size="sm" onClick={() => setShowCleanupConfirm(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="danger" size="sm" onClick={handleConfirmCleanup}>
                Delete All
              </NeoButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
