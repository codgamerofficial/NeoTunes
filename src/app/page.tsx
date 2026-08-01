'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  Play, 
  Sparkles, 
  Flame, 
  Heart, 
  Compass, 
  ArrowRight, 
  ChevronRight, 
  Zap, 
  Dumbbell, 
  Moon, 
  Coffee, 
  PartyPopper, 
  Plane, 
  Smile
} from 'lucide-react';
import { motion } from 'framer-motion';

import SmartMoodWidget from '@/components/widgets/SmartMoodWidget';
import AudioDspWidget from '@/components/widgets/AudioDspWidget';
import EqualizerModal from '@/components/player/EqualizerModal';
import AudioQualityModal from '@/components/player/AudioQualityModal';

export default function HomePage() {
  const router = useRouter();
  const { playTrack } = usePlayerStore();
  const [selectedMood, setSelectedMood] = useState('All');
  const [showEqModal, setShowEqModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);

  const moodChips = [
    { label: 'All', icon: null },
    { label: 'Focus', icon: Zap },
    { label: 'Workout', icon: Dumbbell },
    { label: 'Sleep', icon: Moon },
    { label: 'Chill', icon: Coffee },
    { label: 'Party', icon: PartyPopper },
    { label: 'Travel', icon: Plane },
    { label: 'Romance', icon: Smile },
  ];

  const madeForYou = [
    { id: '1', title: 'Daily Mix 1', desc: 'Arijit Singh, Atif Aslam...', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
    { id: '2', title: 'Chill Vibes', desc: 'Lo-fi, Chillhop, Relax...', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
    { id: '3', title: 'Workout Mix', desc: 'Punjabi, Hip Hop, EDM...', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
    { id: '4', title: 'Romantic Mix', desc: 'Love, Soul, Soft Pop...', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
    { id: '5', title: 'Focus Flow', desc: 'Deep Focus, Ambient...', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
  ];

  const trendingHits = [
    { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
    { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
    { id: 'heat-waves', title: 'Heat Waves', artist: 'Glass Animals', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
    { id: 'tum-hi-ho', title: 'Tum Hi Ho', artist: 'Arijit Singh', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
    { id: 'flowers-miley', title: 'Flowers', artist: 'Miley Cyrus', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
    { id: 'i-aint-worried', title: 'I Ain\'t Worried', artist: 'OneRepublic', coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
  ];

  const getArtistName = (art: any) => {
    if (!art) return 'Artist';
    if (typeof art === 'string') return art;
    if (typeof art === 'object' && art.name) return art.name;
    return 'Artist';
  };

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#050505] text-white font-sans select-none pb-36">
      
      {/* ── 1. HERO FEATURED BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden bg-gradient-to-r from-[#0C0B18] via-[#140D26] to-[#0A0D14] border border-white/10 p-5 sm:p-8 md:p-10 flex items-center justify-between gap-6 shadow-2xl"
      >
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="text-[10px] sm:text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-widest flex items-center gap-2">
            <span>GOOD EVENING, SASWATA</span> 👋
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Music for Every{' '}
            <span className="bg-gradient-to-r from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] bg-clip-text text-transparent">
              Moment of You
            </span>
          </h1>

          <p className="text-white/60 text-xs sm:text-sm font-medium leading-relaxed hidden sm:block">
            Your music, reimagined. Play. Discover. Feel.
          </p>

          <div className="pt-1">
            <button
              onClick={() => playTrack({
                id: 'blinding-lights',
                title: 'Blinding Lights',
                artist: 'The Weeknd',
                durationMs: 200000,
                sourceType: 'youtube',
                coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
              })}
              className="px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,212,255,0.6)] hover:scale-105 transition-transform"
            >
              <Play className="h-4 w-4 fill-black" /> Play Now
            </button>
          </div>
        </div>

        {/* Hero Artwork */}
        <div className="relative z-10 flex-shrink-0 hidden md:block">
          <div className="relative h-44 w-44 lg:h-56 lg:w-56 rounded-[24px] overflow-hidden border border-white/20 shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80"
              alt="Hero"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </motion.div>

      {/* ── 2. CONTINUE LISTENING ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#00D4FF]" /> Continue Listening
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {trendingHits.slice(0, 6).map((song: any) => (
            <div
              key={`continue-${song.id}`}
              onClick={() => playTrack(song)}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0E1117] border border-white/8 hover:border-[#00D4FF]/30 cursor-pointer transition-all group min-w-0"
            >
              <img src={song.coverUrl} alt={song.title} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-white truncate group-hover:text-[#00D4FF] transition-colors">{song.title}</div>
                <div className="text-[10px] text-white/40 truncate">{getArtistName(song.artist)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. MOOD SPACE ── */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Mood Space</h2>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {moodChips.map((chip) => {
            const Icon = chip.icon;
            const isActive = selectedMood === chip.label;
            return (
              <button
                key={chip.label}
                onClick={() => setSelectedMood(chip.label)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7A3CFF] to-[#00D4FF] text-black shadow-[0_0_15px_#7A3CFF]'
                    : 'bg-[#121218] border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{chip.label}</span>
              </button>
            );
          })}
          <button className="p-2.5 rounded-full bg-[#121218] border border-white/10 text-white/70 hover:text-white flex-shrink-0">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── 2.5 SMART AI WIDGETS SUITE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SmartMoodWidget />
        </div>
        <div>
          <AudioDspWidget 
            onOpenEq={() => setShowEqModal(true)} 
            onOpenQuality={() => setShowQualityModal(true)} 
          />
        </div>
      </div>

      {/* ── 3. MADE FOR YOU ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Made For You</h2>
          <button onClick={() => router.push('/search')} className="text-xs font-bold text-white/40 hover:text-[#00D4FF] flex items-center gap-1 transition-colors">
            See All <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {madeForYou.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ y: -5 }}
              onClick={() => router.push('/playlists')}
              className="p-4 rounded-[24px] bg-[#121218] border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all space-y-3 group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img src={card.cover} alt={card.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 rounded-full bg-[#00D4FF] text-black shadow-[0_0_15px_#00D4FF]">
                    <Play className="h-5 w-5 fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              <div>
                <div className="font-bold text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{card.title}</div>
                <div className="text-xs text-white/50 truncate mt-0.5">{card.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 4. TRENDING HITS RIGHT NOW ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Trending Hits Right Now</h2>
          <button onClick={() => router.push('/search')} className="text-xs font-bold text-white/40 hover:text-[#00D4FF] flex items-center gap-1 transition-colors">
            See All <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
          {trendingHits.map((song) => (
            <motion.div
              key={song.id}
              whileHover={{ y: -5 }}
              onClick={() => playTrack({
                id: song.id,
                title: song.title,
                artist: song.artist,
                durationMs: 210000,
                sourceType: 'youtube',
                coverUrl: song.coverUrl,
              })}
              className="p-3.5 rounded-[24px] bg-[#121218] border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all space-y-3 group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 rounded-full bg-[#00D4FF] text-black shadow-[0_0_15px_#00D4FF]">
                    <Play className="h-5 w-5 fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              <div>
                <div className="font-bold text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{song.title}</div>
                <div className="text-xs text-white/50 truncate mt-0.5">{getArtistName(song.artist)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <EqualizerModal isOpen={showEqModal} onClose={() => setShowEqModal(false)} />
      <AudioQualityModal isOpen={showQualityModal} onClose={() => setShowQualityModal(false)} />
    </div>
  );
}
