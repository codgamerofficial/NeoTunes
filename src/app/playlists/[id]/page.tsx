'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Heart, Share2, Download, Users, Clock, ArrowLeft, Disc, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_PLAYLISTS_DB: Record<string, {
  name: string;
  description: string;
  coverUrl: string;
  owner: string;
  isCollaborative?: boolean;
  tracks: Array<{
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: string;
    durationMs: number;
    sourceType: 'youtube' | 'cloud';
    coverUrl: string;
  }>;
}> = {
  'chill-hits': {
    name: 'Chill Hits',
    description: 'Kick back with soft pop, ambient acoustic tones, and smooth lo-fi beats.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    owner: 'NeoTunes Editors',
    tracks: [
      { id: 'itunes_1823748641', title: 'TE CONOCÍ', artist: 'bxkq & PXLWYSE', album: 'TE CONOCÍ Single', duration: '2:49', durationMs: 169000, sourceType: 'youtube', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
      { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh', album: 'Love Aaj Kal', duration: '4:07', durationMs: 247000, sourceType: 'youtube', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
      { id: 'heat-waves', title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: '3:58', durationMs: 238000, sourceType: 'youtube', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80' },
    ],
  },
  'workout-mix': {
    name: 'Workout Mix',
    description: '140+ BPM driving electronic & hip-hop beats to push your athletic limits.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
    owner: 'Neo Fitness AI',
    tracks: [
      { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', durationMs: 200000, sourceType: 'youtube', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
      { id: 'starboy', title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: '3:50', durationMs: 230000, sourceType: 'youtube', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
    ],
  },
  'lo-fi-vibes': {
    name: 'Lo-Fi Vibes',
    description: 'Ambient instrumental study beats for deep flow state coding.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    owner: 'Ask Neo AI',
    isCollaborative: true,
    tracks: [
      { id: 'itunes_1823748641', title: 'TE CONOCÍ (Lo-Fi Edit)', artist: 'bxkq & PXLWYSE', album: 'TE CONOCÍ', duration: '2:49', durationMs: 169000, sourceType: 'youtube', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
    ],
  },
};

export default function SinglePlaylistPage() {
  const router = useRouter();
  const rawParams = useParams();
  const id = (rawParams?.id as string) || 'chill-hits';
  const { playTrack, currentTrack } = usePlayerStore();

  const [isLiked, setIsLiked] = useState(false);

  const playlist = MOCK_PLAYLISTS_DB[id] || {
    name: id.replace(/-/g, ' ').toUpperCase(),
    description: 'Curated audio compilation on NeoTunes OS.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    owner: 'Saswata Dey',
    tracks: [
      { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', durationMs: 200000, sourceType: 'youtube' as const, coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
      { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh', album: 'Love Aaj Kal', duration: '4:07', durationMs: 247000, sourceType: 'youtube' as const, coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
    ],
  };

  const formattedTracks = playlist.tracks.map((tr) => ({
    ...tr,
    artist: { id: 'a-1', name: tr.artist },
  }));

  const handlePlayAll = () => {
    if (formattedTracks.length === 0) return;
    playTrack(formattedTracks[0], formattedTracks);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans select-none pb-36">
      
      {/* Dynamic Header Backdrop */}
      <div className="relative p-6 md:p-10 bg-gradient-to-b from-[#151226] via-[#0A0A0A] to-[#050505] border-b border-white/10 space-y-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <motion.img
            whileHover={{ scale: 1.02 }}
            src={playlist.coverUrl}
            alt={playlist.name}
            className="h-52 w-52 sm:h-64 sm:w-64 rounded-[32px] object-cover border border-white/20 shadow-[0_20px_60px_rgba(0,212,255,0.25)]"
          />

          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40">
                PLAYLIST
              </span>
              {playlist.isCollaborative && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Collaborative
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white capitalize">{playlist.name}</h1>
            <p className="text-sm text-white/60 max-w-xl">{playlist.description}</p>

            <div className="flex items-center justify-center md:justify-start gap-3 text-xs font-medium text-white/50 pt-1">
              <span className="font-bold text-white">{playlist.owner}</span>
              <span>•</span>
              <span>{playlist.tracks.length} songs</span>
            </div>
          </div>
        </div>

        {/* Sticky Actions Bar */}
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handlePlayAll}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black flex items-center justify-center shadow-[0_0_25px_rgba(0,212,255,0.6)] hover:scale-105 transition-transform"
          >
            <Play className="h-6 w-6 fill-black ml-0.5" />
          </button>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-[#FF2D95] transition-all"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'text-[#FF2D95] fill-[#FF2D95]' : ''}`} />
          </button>

          <button className="p-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all">
            <Download className="h-5 w-5" />
          </button>

          <button className="p-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* TRACKS TABLE */}
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-2">
        <div className="grid grid-cols-12 text-xs font-bold text-white/40 uppercase tracking-widest pb-3 px-4 border-b border-white/10">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Title</div>
          <div className="col-span-4 hidden md:block">Album</div>
          <div className="col-span-1 text-right"><Clock className="h-4 w-4 inline" /></div>
        </div>

        {formattedTracks.map((tr, idx) => {
          const isCurrent = currentTrack?.id === tr.id;
          return (
            <motion.div
              key={tr.id + idx}
              onClick={() => playTrack(tr, formattedTracks)}
              whileHover={{ x: 2 }}
              className={`grid grid-cols-12 items-center p-3.5 rounded-2xl cursor-pointer transition-all group ${
                isCurrent ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/30' : 'bg-[#101010] border border-white/5 hover:border-[#00D4FF]/40'
              }`}
            >
              <div className="col-span-1 text-xs font-mono font-bold text-white/40">{idx + 1}</div>
              <div className="col-span-6 flex items-center gap-3 min-w-0">
                <img src={tr.coverUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className={`font-bold text-sm truncate transition-colors ${isCurrent ? 'text-[#00D4FF]' : 'text-white group-hover:text-[#00D4FF]'}`}>{tr.title}</div>
                  <div className="text-xs text-white/50 truncate">{tr.artist.name}</div>
                </div>
              </div>
              <div className="col-span-4 hidden md:block text-xs text-white/50 truncate">{tr.album}</div>
              <div className="col-span-1 text-right text-xs font-mono text-white/40">{tr.duration}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
