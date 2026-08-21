'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { FolderDown, Play, Trash2, HardDrive, Compass, CheckCircle2, Music2 } from 'lucide-react';
import { Track, getArtistName } from '@/types';

interface DownloadedTrackItem {
  id: string;
  track: Track;
  sizeBytes: number;
  downloadedAt: string;
}

export default function DownloadsPage() {
  const router = useRouter();
  const { playTrack } = usePlaybackStore();
  const [downloadedItems, setDownloadedItems] = useState<DownloadedTrackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real offline downloaded items from storage
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
  };

  const handleSmartCleanup = () => {
    setDownloadedItems([]);
    try {
      localStorage.removeItem('neotunes_downloads');
    } catch {}
  };

  // Calculate real storage consumption in bytes
  const totalSizeBytes = downloadedItems.reduce((sum, item) => sum + (item.sizeBytes || 0), 0);
  const formattedStorageUsed = totalSizeBytes > 0
    ? `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : '0 B';

  const storagePercentage = Math.min(100, Math.max(0, (totalSizeBytes / (10 * 1024 * 1024 * 1024)) * 100));

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 bg-[#050608] text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-5xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FolderDown className="h-7 w-7 text-[#00D9FF]" /> Offline Downloads &amp; Storage
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A6] mt-1">
            Manage your downloaded high-resolution audio files and offline storage analytics.
          </p>
        </div>

        {downloadedItems.length > 0 && (
          <button
            onClick={handleSmartCleanup}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-white/70 hover:text-white hover:border-red-500/50 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <Trash2 className="h-4 w-4 text-red-400" /> Smart Cleanup
          </button>
        )}
      </div>

      {/* Storage Analytics Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#08090C] border border-white/10 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <HardDrive className="h-4 w-4 text-[#00D9FF]" /> Device Offline Audio Storage
          </div>
          <span className="text-xs font-mono font-bold text-[#00D9FF]">
            {formattedStorageUsed} / 10.0 GB Used
          </span>
        </div>

        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-[#00D9FF] to-[#DFFF00] rounded-full transition-all duration-500"
            style={{ width: `${Math.max(2, storagePercentage)}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-[#A1A1A6] pt-1">
          <span>High-Res Offline Audio</span>
          <span>10.0 GB Max Allocated</span>
        </div>
      </div>

      {/* Downloaded Songs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            Downloaded Tracks ({downloadedItems.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-[#A1A1A6]">
            Loading offline storage...
          </div>
        ) : downloadedItems.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-4 max-w-md mx-auto my-6">
            <div className="p-3.5 rounded-full bg-white/5 text-[#00D9FF] w-12 h-12 mx-auto flex items-center justify-center border border-white/10">
              <Music2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No offline music stored</h3>
              <p className="text-xs text-[#A1A1A6] leading-relaxed">
                Tracks you download for offline playback will appear here. Enjoy your high-resolution music anywhere without internet.
              </p>
            </div>
            <button
              onClick={() => router.push('/browse')}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#00D9FF] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-105 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <Compass className="h-4 w-4" /> Browse Music
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {downloadedItems.map((item) => {
              const track = item.track;
              const formattedSize = item.sizeBytes
                ? `${(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                : '14.2 MB';

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#08090C] border border-white/10 hover:border-[#00D9FF]/40 transition-all group"
                >
                  <div
                    onClick={() => playTrack(track)}
                    className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <img
                      src={track.artworkUrl || track.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                      alt=""
                      className="h-11 w-11 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-white group-hover:text-[#00D9FF] truncate transition-colors">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                        {getArtistName(track.artists || track.artist)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-[#00D9FF] bg-[#00D9FF]/10 px-2.5 py-1 rounded-full border border-[#00D9FF]/30">
                      {formattedSize}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-full text-[#A1A1A6] hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Remove Download"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
