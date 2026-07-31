'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Heart, ArrowLeft, Disc, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ALBUMS_DB: Record<string, {
  title: string;
  artist: string;
  year: string;
  tracksCount: number;
  duration: string;
  coverUrl: string;
  tracks: Array<{
    id: string;
    title: string;
    duration: string;
    durationMs: number;
  }>;
}> = {
  'after-hours': {
    title: 'After Hours',
    artist: 'The Weeknd',
    year: '2020',
    tracksCount: 14,
    duration: '56 mins',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
    tracks: [
      { id: 'blinding-lights', title: 'Blinding Lights', duration: '3:20', durationMs: 200000 },
      { id: 'save-your-tears', title: 'Save Your Tears', duration: '3:35', durationMs: 215000 },
      { id: 'in-your-eyes', title: 'In Your Eyes', duration: '3:57', durationMs: 237000 },
      { id: 'starboy', title: 'Starboy', duration: '3:50', durationMs: 230000 },
    ],
  },
  'love-aaj-kal': {
    title: 'Love Aaj Kal',
    artist: 'Pritam & Arijit Singh',
    year: '2020',
    tracksCount: 10,
    duration: '42 mins',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    tracks: [
      { id: 'shayad-love-aaj-kal', title: 'Shayad', duration: '4:07', durationMs: 247000 },
      { id: 'haan-main-galat', title: 'Haan Main Galat', duration: '3:38', durationMs: 218000 },
      { id: 'rahogi-meri', title: 'Rahogi Meri', duration: '4:12', durationMs: 252000 },
    ],
  },
};

export default function SingleAlbumPage() {
  const router = useRouter();
  const rawParams = useParams();
  const id = (rawParams?.id as string) || 'after-hours';
  const { playTrack, currentTrack } = usePlayerStore();

  const album = MOCK_ALBUMS_DB[id] || {
    title: id.replace(/-/g, ' ').toUpperCase(),
    artist: 'Featured Artist',
    year: '2024',
    tracksCount: 8,
    duration: '35 mins',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    tracks: [
      { id: 'blinding-lights', title: 'Track One', duration: '3:20', durationMs: 200000 },
      { id: 'save-your-tears', title: 'Track Two', duration: '3:35', durationMs: 215000 },
    ],
  };

  const formattedTracks = album.tracks.map((tr) => ({
    id: tr.id,
    title: tr.title,
    artist: { id: 'art-id', name: album.artist },
    album: { name: album.title, coverUrl: album.coverUrl },
    durationMs: tr.durationMs,
    coverUrl: album.coverUrl,
    sourceType: 'youtube' as const,
  }));

  const handlePlayAlbum = () => {
    if (formattedTracks.length === 0) return;
    playTrack(formattedTracks[0], formattedTracks);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans select-none pb-36">
      {/* Header Backdrop */}
      <div className="relative p-6 md:p-10 bg-gradient-to-b from-[#1A1026] via-[#0A0A0A] to-[#050505] border-b border-white/10 space-y-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <motion.img
            whileHover={{ scale: 1.02 }}
            src={album.coverUrl}
            alt={album.title}
            className="h-56 w-56 sm:h-64 sm:w-64 rounded-[32px] object-cover border border-white/20 shadow-[0_20px_60px_rgba(122,60,255,0.25)]"
          />

          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40">
                ALBUM
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#7A3CFF]/20 text-[#7A3CFF] border border-[#7A3CFF]/40 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Hi-Res Lossless • Dolby Atmos
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">{album.title}</h1>
            <p className="text-base font-medium text-[#00D4FF]">{album.artist}</p>

            <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-white/50 pt-1">
              <span>{album.year}</span>
              <span>•</span>
              <span>{album.tracksCount} tracks</span>
              <span>•</span>
              <span>{album.duration}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handlePlayAlbum}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,212,255,0.6)] hover:scale-105 transition-transform"
          >
            <Play className="h-4 w-4 fill-black" /> Play Album
          </button>
        </div>
      </div>

      {/* Tracklist */}
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-3">
        <h3 className="text-lg font-bold text-white mb-4">Tracklist</h3>

        {formattedTracks.map((tr, idx) => {
          const isCurrent = currentTrack?.id === tr.id;
          return (
            <motion.div
              key={tr.id}
              onClick={() => playTrack(tr, formattedTracks)}
              whileHover={{ x: 2 }}
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all group ${
                isCurrent ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/30' : 'bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-xs font-mono font-bold text-white/40 w-5">{idx + 1}</span>
                <div>
                  <div className={`font-bold text-sm truncate transition-colors ${isCurrent ? 'text-[#00D4FF]' : 'text-white group-hover:text-[#00D4FF]'}`}>{tr.title}</div>
                  <div className="text-xs text-white/40">{album.artist}</div>
                </div>
              </div>
              <div className="text-xs font-mono text-white/40">{album.tracks[idx]?.duration || '3:30'}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
