'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Play, CheckCircle2, Heart, ArrowLeft, Users, Sparkles, Disc, ListPlus, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTrackArtwork } from '@/utils/artwork';

const MOCK_ARTISTS_DB: Record<string, {
  name: string;
  listeners: string;
  bio: string;
  coverUrl: string;
  topTracks: Array<{
    id: string;
    title: string;
    artist: string;
    album: string;
    plays: string;
    duration: string;
    durationMs: number;
    coverUrl: string;
  }>;
}> = {
  'shakira': {
    name: 'Shakira',
    listeners: '50,000,000 monthly listeners',
    bio: 'Colombian singer, songwriter, and global Latin pop icon known for her hit singles Dai Dai, Hips Don\'t Lie, and Waka Waka.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    topTracks: [
      { id: 'dai-dai-shakira', title: 'Dai Dai', artist: 'Shakira x Burna Boy', album: 'Dai Dai - Single', plays: '2,200,000 plays', duration: '3:45', durationMs: 225000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
      { id: 'hips-dont-lie', title: "Hips Don't Lie", artist: 'Shakira ft. Wyclef Jean', album: 'Oral Fixation Vol. 2', plays: '850,000,000 plays', duration: '3:38', durationMs: 218000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
      { id: 'waka-waka', title: 'Waka Waka (This Time for Africa)', artist: 'Shakira', album: 'Listen Up!', plays: '1,200,000,000 plays', duration: '3:22', durationMs: 202000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
      { id: 'chantaje', title: 'Chantaje', artist: 'Shakira ft. Maluma', album: 'El Dorado', plays: '940,000,000 plays', duration: '3:15', durationMs: 195000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
      { id: 'bzrp-53', title: 'BZRP Music Sessions #53', artist: 'Bizarrap & Shakira', album: 'BZRP Music Sessions', plays: '780,000,000 plays', duration: '3:33', durationMs: 213000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
    ],
  },
  'nish': {
    name: 'Nish',
    listeners: '12,400,000 monthly listeners',
    bio: 'British-Bengali singer, songwriter, and urban music pioneer known for Bhulbo Kemony and soulful R&B fusion tracks.',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    topTracks: [
      { id: 'bhulbo-kemony', title: 'Bhulbo Kemony', artist: 'Nish', album: 'THE HOMECOMING', plays: '4,500,000 plays', duration: '2:40', durationMs: 160000, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
      { id: 'manush', title: 'Manush', artist: 'Nish', album: 'THE HOMECOMING', plays: '1,800,000 plays', duration: '3:10', durationMs: 190000, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
      { id: 'ki-koresh', title: 'Ki Koresh', artist: 'Nish', album: 'Single', plays: '2,400,000 plays', duration: '2:55', durationMs: 175000, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
    ],
  },
  'fat-papi': {
    name: 'Fat Papi,prodshushy',
    listeners: '25,000,000 monthly listeners',
    bio: 'Underground phonk and trap collective known for FREAKED OUT and viral high-energy synthwave anthems.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    topTracks: [
      { id: 'freaked-out-main', title: 'FREAKED OUT', artist: 'Fat Papi,prodshushy', album: 'FREAKED OUT Single', plays: '40,000,000 plays', duration: '2:38', durationMs: 158000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
      { id: 'freaked-out-after-hours', title: 'FREAKED OUT (AFTER HOURS)', artist: 'Fat Papi,prodshushy', album: 'FREAKED OUT After Hours', plays: '5,400,000 plays', duration: '3:04', durationMs: 184000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
    ],
  },
  'the-weeknd': {
    name: 'The Weeknd',
    listeners: '105,420,192 monthly listeners',
    bio: 'Canadian singer, songwriter, and record producer known for his sonic versatility, dark lyricism, and cinematic R&B electro-pop synthwave productions.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    topTracks: [
      { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', plays: '3,842,109,240 plays', duration: '3:20', durationMs: 200000, coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
      { id: 'starboy', title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', plays: '2,912,480,102 plays', duration: '3:50', durationMs: 230000, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
      { id: 'save-your-tears', title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', plays: '2,410,920,830 plays', duration: '3:35', durationMs: 215000, coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
    ],
  },
  'arijit-singh': {
    name: 'Arijit Singh',
    listeners: '42,500,000 monthly listeners',
    bio: 'Indian playback singer and music composer. Regarded as one of the most successful and versatile vocalists in Hindi cinema history.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    topTracks: [
      { id: 'kesariya', title: 'Kesariya', artist: 'Arijit Singh, Pritam', album: 'Brahmāstra', plays: '850,000,000 plays', duration: '4:28', durationMs: 268000, coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
      { id: 'chaleya', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao', album: 'Jawan', plays: '620,000,000 plays', duration: '3:20', durationMs: 200000, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
      { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh, Pritam', album: 'Love Aaj Kal', plays: '540,120,300 plays', duration: '4:07', durationMs: 247000, coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
    ],
  },
};

function SingleArtistPage() {
  const router = useRouter();
  const rawParams = useParams();
  const id = (rawParams?.id as string || 'shakira').toLowerCase();
  const { playTrack, addToQueue, currentTrack } = usePlaybackStore();
  const [isFollowing, setIsFollowing] = useState(false);

  const artistKey = Object.keys(MOCK_ARTISTS_DB).find((k) => id.includes(k) || k.includes(id)) || 'shakira';
  const artist = MOCK_ARTISTS_DB[artistKey] || MOCK_ARTISTS_DB['shakira'];

  const formattedTracks = artist.topTracks.map((tr) => ({
    id: tr.id,
    title: tr.title,
    artist: tr.artist || artist.name,
    album: tr.album || 'Single',
    durationMs: tr.durationMs,
    coverUrl: tr.coverUrl,
    sourceType: 'stream' as const,
  }));

  const handlePlayPopular = () => {
    if (formattedTracks.length === 0) return;
    playTrack(formattedTracks[0] as any);
  };

  return (
    <div className="relative min-h-screen bg-[#05060A] text-white font-sans select-none pb-36">
      {/* Hero Banner */}
      <div className="relative h-96 w-full overflow-hidden">
        <img src={artist.coverUrl} alt={artist.name} className="h-full w-full object-cover filter brightness-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-[#05060A]/50 to-transparent" />

        <div className="absolute bottom-8 left-6 right-6 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#00D9FF]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D9FF]">VERIFIED ARTIST</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">{artist.name}</h1>
          <p className="text-sm font-semibold text-white/70">{artist.listeners}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPopular}
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#7657FF] to-[#FF2E9A] text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,217,255,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="h-5 w-5 fill-black ml-0.5" />
            <span>Play Popular</span>
          </button>

          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-6 py-3 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              isFollowing 
                ? 'bg-white/20 border-white text-white' 
                : 'border-white/20 hover:border-white text-white/80 hover:text-white'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Popular Tracks Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-white tracking-wide">Popular Tracks</h2>

          <div className="space-y-2">
            {artist.topTracks.map((tr, idx) => {
              const isCurrent = currentTrack?.id === tr.id;
              return (
                <div
                  key={tr.id}
                  onClick={() => playTrack(formattedTracks[idx] as any)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                    isCurrent 
                      ? 'bg-[#171B26] border-[#00D9FF]/40 shadow-lg' 
                      : 'bg-[#121620] border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="text-xs font-mono font-bold text-white/40 w-5 text-right shrink-0">{idx + 1}</span>
                    <img 
                      src={getTrackArtwork(tr)} 
                      alt={tr.title} 
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 bg-black/40"
                    />
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className={`font-bold text-sm truncate ${isCurrent ? 'text-[#00D9FF]' : 'text-white group-hover:text-[#00D9FF]'}`}>
                        {tr.title}
                      </h3>
                      <p className="text-xs text-white/50 truncate mt-0.5 font-medium">
                        {tr.plays}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-white/40 hidden sm:block">{tr.duration}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(formattedTracks[idx] as any);
                      }}
                      className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      <ListPlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Sound Breakdown Box */}
        <div className="p-5 rounded-3xl bg-[#121620] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-[#00D9FF]">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Sound Breakdown</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed font-medium">
            {artist.bio}
          </p>
        </div>
      </div>
    </div>
  );
}

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Suspense } from 'react';

export default function ArtistPage() {
  return (
    <FeatureErrorBoundary featureName="Artist">
      <Suspense fallback={<div className="p-10 text-[#9298A8] text-xs font-mono animate-pulse">Loading Artist...</div>}>
        <SingleArtistPage />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
