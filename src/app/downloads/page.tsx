'use client';

import React, { useState, useEffect } from 'react';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Download, Play, Trash2, FolderDown, HardDrive, Disc } from 'lucide-react';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window is not defined'));
    const req = window.indexedDB.open('neotunes-offline', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('songs', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export default function DownloadsPage() {
  const { playTrack, currentTrack, isPlaying } = usePlaybackStore();
  const [downloadedSongs, setDownloadedSongs] = useState<any[]>([]);

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction('songs', 'readonly');
        const store = tx.objectStore('songs');
        const req = store.getAll();
        req.onsuccess = () => setDownloadedSongs(req.result || []);
      } catch {
        setDownloadedSongs([]);
      }
    };
    loadSongs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const db = await openDB();
      const tx = db.transaction('songs', 'readwrite');
      tx.objectStore('songs').delete(id);
      setDownloadedSongs(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#121212] text-white font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#181818]">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FolderDown className="h-8 w-8 text-[#29B6F6]" /> Downloaded Music
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1">Tracks available for offline listening without internet connection.</p>
        </div>

        {/* Offline Storage Indicator */}
        <div className="flex items-center gap-3 bg-[#181818] border border-[#282828] px-4 py-2.5 rounded-2xl">
          <HardDrive className="h-5 w-5 text-[#29B6F6]" />
          <div className="text-xs">
            <p className="font-bold text-white">Offline Storage</p>
            <p className="text-[10px] text-[#B3B3B3]">{downloadedSongs.length} Tracks • FLAC 24-bit</p>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      {downloadedSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-[#B3B3B3] space-y-3">
          <Disc className="h-12 w-12 text-[#282828]" />
          <p className="text-sm font-bold text-white">No Offline Downloads Yet</p>
          <p className="text-xs max-w-sm">Click the download button on any song or album to save it for offline playback.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {downloadedSongs.map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-11 w-11 rounded-xl overflow-hidden flex-shrink-0">
                  <ImageWithFallback src={track.coverUrl || '/images/default-cover.png'} alt={track.title} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-[#29B6F6] transition-colors">{track.title}</p>
                  <p className="text-[11px] text-[#B3B3B3] truncate">{track.artist?.name || 'Artist'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-[#29B6F6] bg-[#29B6F6]/10 px-2 py-0.5 rounded-full border border-[#29B6F6]/20">
                  Offline FLAC
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(track.id); }}
                  className="p-2 rounded-full text-[#B3B3B3] hover:text-rose-500 hover:bg-[#121212] transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
