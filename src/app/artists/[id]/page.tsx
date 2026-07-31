'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, CheckCircle2, Heart, ArrowLeft, Users, Sparkles, Disc } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ARTISTS_DB: Record<string, {
  name: string;
  listeners: string;
  bio: string;
  coverUrl: string;
  topTracks: Array<{
    id: string;
    title: string;
    plays: string;
    duration: string;
    durationMs: number;
    coverUrl: string;
  }>;
}> = {
  'the-weeknd': {
    name: 'The Weeknd',
    listeners: '105,420,192 monthly listeners',
    bio: 'Canadian singer, songwriter, and record producer known for his sonic versatility, dark lyricism, and cinematic R&B electro-pop synthwave productions.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    topTracks: [
      { id: 'blinding-lights', title: 'Blinding Lights', plays: '3,842,109,240', duration: '3:20', durationMs: 200000, coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
      { id: 'starboy', title: 'Starboy', plays: '2,912,480,102', duration: '3:50', durationMs: 230000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
      { id: 'save-your-tears', title: 'Save Your Tears', plays: '2,410,920,830', duration: '3:35', durationMs: 215000, coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
    ],
  },
  'arijit-singh': {
    name: 'Arijit Singh',
    listeners: '42,500,000 monthly listeners',
    bio: 'Indian playback singer and music composer. Regarded as one of the most successful and versatile vocalists in Hindi cinema history.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    topTracks: [
      { id: 'shayad-love-aaj-kal', title: 'Shayad', plays: '540,120,300', duration: '4:07', durationMs: 247000, coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
      { id: 'kesariya', title: 'Kesariya', plays: '480,910,200', duration: '3:47', durationMs: 227000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
    ],
  },
};

export default function SingleArtistPage() {
  const router = useRouter();
  const rawParams = useParams();
  const id = (rawParams?.id as string) || 'the-weeknd';
  const { playTrack, currentTrack } = usePlayerStore();
  const [isFollowing, setIsFollowing] = useState(false);

  const artist = MOCK_ARTISTS_DB[id] || {
    name: id.replace(/-/g, ' ').toUpperCase(),
    listeners: '50,000,000 monthly listeners',
    bio: 'Renowned recording artist featured on NeoTunes OS.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    topTracks: [
      { id: 'blinding-lights', title: 'Featured Track One', plays: '1,200,000', duration: '3:20', durationMs: 200000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
    ],
  };

  const formattedTracks = artist.topTracks.map((tr) => ({
    id: tr.id,
    title: tr.title,
    artist: { id: 'a-1', name: artist.name },
    durationMs: tr.durationMs,
    coverUrl: tr.coverUrl,
    sourceType: 'youtube' as const,
  }));

  const handlePlayPopular = () => {
    if (formattedTracks.length === 0) return;
    playTrack(formattedTracks[0], formattedTracks);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans select-none pb-36">
      {/* Hero Banner */}
      <div className="relative h-96 w-full overflow-hidden">
        <img src={artist.coverUrl} alt={artist.name} className="h-full w-full object-cover filter brightness-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-all z-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="absolute bottom-8 left-8 right-8 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#00D4FF]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D4FF]">VERIFIED ARTIST</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight">{artist.name}</h1>
          <p className="text-sm font-medium text-white/70">{artist.listeners}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
        {/* Actions Bar */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPopular}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,212,255,0.6)] hover:scale-105 transition-transform"
          >
            <Play className="h-4 w-4 fill-black" /> Play Popular
          </button>

          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-6 py-3.5 rounded-full text-xs font-bold border transition-all ${
              isFollowing
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-transparent border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Popular Tracks Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Popular Tracks</h2>

          <div className="space-y-2">
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
                    <img src={tr.coverUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <div className={`font-bold text-sm truncate transition-colors ${isCurrent ? 'text-[#00D4FF]' : 'text-white group-hover:text-[#00D4FF]'}`}>{tr.title}</div>
                      <div className="text-xs text-white/40">{artist.topTracks[idx]?.plays || '1.2M'} plays</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-white/40">{artist.topTracks[idx]?.duration || '3:30'}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* AI Artist Insights */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#00D4FF]/10 to-[#7A3CFF]/10 border border-[#00D4FF]/30 space-y-2">
          <h3 className="text-sm font-bold text-[#00D4FF] flex items-center gap-2 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> AI Sound Breakdown
          </h3>
          <p className="text-sm text-white/80 leading-relaxed">{artist.bio}</p>
        </div>
      </div>
    </div>
  );
}
