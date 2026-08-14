'use client';

import React, { useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { FolderDown, Play, Trash2, HardDrive, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DownloadsPage() {
  const { playTrack } = usePlayerStore();
  const [downloadedSongs, setDownloadedSongs] = useState([
    { id: 'itunes_1823748641', title: 'TE CONOCÍ', artist: 'bxkq & PXLWYSE', size: '12.4 MB', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
    { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh', size: '18.1 MB', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
    { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', size: '14.8 MB', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
  ]);

  const handleDelete = (id: string) => {
    setDownloadedSongs((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#050505] text-white font-sans select-none pb-28">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FolderDown className="h-8 w-8 text-[#00D4FF]" /> Offline Downloads &amp; Storage
          </h1>
          <p className="text-sm text-white/50 mt-1">Manage your downloaded high-resolution audio files and offline storage analytics.</p>
        </div>

        <button
          onClick={() => setDownloadedSongs([])}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:border-[#FF2D95] transition-all"
        >
          <Trash2 className="h-4 w-4 text-[#FF2D95]" /> Smart Cleanup
        </button>
      </div>

      {/* Storage Analytics Card */}
      <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <HardDrive className="h-4 w-4 text-[#00D4FF]" /> Device Offline Audio Storage
          </div>
          <span className="text-xs font-mono font-bold text-[#00D4FF]">45.3 MB / 10.0 GB Used</span>
        </div>

        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
          <div className="h-full w-[12%] bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] rounded-full" />
        </div>

        <div className="flex justify-between text-[11px] text-white/40 pt-1">
          <span>FLAC High-Res Downloads</span>
          <span>9.95 GB Free</span>
        </div>
      </div>

      {/* Downloaded Songs List */}
      <div className="space-y-3 max-w-5xl">
        <h3 className="text-lg font-bold text-white mb-2">Downloaded Tracks ({downloadedSongs.length})</h3>

        {downloadedSongs.length === 0 ? (
          <div className="text-center py-12 text-white/40 border border-white/10 rounded-3xl">No offline songs stored. Download tracks to listen offline!</div>
        ) : (
          downloadedSongs.map((song) => (
            <div
              key={song.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40 transition-all group"
            >
              <div
                onClick={() => playTrack({
                  id: `spotify:track:${song.id}`,
                  canonicalId: `spotify:track:${song.id}`,
                  source: 'spotify',
                  sourceId: song.id,
                  title: song.title,
                  artists: [song.artist],
                  artist: song.artist,
                  album: 'Downloaded',
                  artworkUrl: song.coverUrl,
                  coverUrl: song.coverUrl,
                  duration: 180,
                  durationMs: 180000,
                  playable: true,
                })}
                className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
              >
                <img src={song.coverUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0">
                  <div className="font-bold text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{song.title}</div>
                  <div className="text-xs text-white/50 truncate mt-0.5">{song.artist}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-[#00D4FF] bg-[#00D4FF]/10 px-2.5 py-1 rounded-full border border-[#00D4FF]/30">{song.size}</span>
                <button
                  onClick={() => handleDelete(song.id)}
                  className="p-2 rounded-full text-white/40 hover:text-[#FF2D95] hover:bg-white/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
