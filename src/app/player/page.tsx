'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName, getCoverUrl } from '@/types';
import { audioDspEngine } from '@/services/audioDspEngine';
import VinylTurntableStage from '@/components/player/VinylTurntableStage';
import AiDjPanelModal from '@/components/ai/AiDjPanelModal';
import QueueDrawer from '@/components/player/QueueDrawer';
import EqualizerModal from '@/components/player/EqualizerModal';
import SleepTimerModal from '@/components/player/SleepTimerModal';
import DeviceSelectorModal from '@/components/player/DeviceSelectorModal';
import AudioQualityModal from '@/components/player/AudioQualityModal';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Heart,
  Shuffle,
  Repeat,
  ChevronDown,
  Sparkles,
  Sliders,
  Radio,
  Clock,
  Mic2,
  Zap,
  Moon,
  Music,
  Share2,
  Wifi,
  Signal,
  Cast,
  CheckCircle2,
  Headphones,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FullscreenPlayerPage() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    setPlaying,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    setProgress,
    shuffle,
    setShuffle,
    repeatMode,
    setRepeatMode,
    audioQuality,
  } = usePlaybackStore();

  const [activeTab, setActiveTab] = useState<'lyrics' | 'visualizer' | 'equalizer'>('lyrics');
  const [isLiked, setIsLiked] = useState(true);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showAiDjModal, setShowAiDjModal] = useState(false);
  
  // Synced Lyrics & Visualizer
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  const currentTime = progress;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const displayDuration = duration > 0 ? duration : 265;
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 38;

  const track: Track = currentTrack || {
    id: 'tere-pyaar-mein',
    title: 'Tere Pyaar Mein',
    artist: 'Pritam, Arijit Singh & Nikhita Gandhi',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    durationMs: 265000,
    sourceType: 'youtube',
  };

  const trackArtist = getArtistName(track.artist).replace(/\.\s+/g, ', ');
  const coverUrl = getCoverUrl(track);

  // Fetch real synced lyrics for active playing track
  useEffect(() => {
    if (!track?.title) return;
    let isCancelled = false;
    setLyricsLoading(true);

    const title = track.title;
    const artist = getArtistName(track.artist);
    const durationMs = (track as any).durationMs || (duration ? duration * 1000 : 0);

    fetch(`/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&durationMs=${durationMs}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          if (data && data.lyrics && data.lyrics.length > 0) {
            setLyrics(data.lyrics);
          } else {
            setLyrics(null);
          }
          setLyricsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLyrics(null);
          setLyricsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [track?.title, trackArtist]);

  const handleSeek = (newTime: number) => {
    setProgress(newTime);
    window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: newTime } }));
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#070512] text-white flex flex-col justify-between overflow-hidden select-none z-50 font-sans">
      
      {/* Ambient Glow Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 transition-all duration-1000 pointer-events-none"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#070512]/95 to-[#070512] pointer-events-none" />

      {/* ── 1. FIXED TOP HEADER BAR ── */}
      <div className="relative z-20 shrink-0 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-[#070512]/80 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          title="Minimize Player"
        >
          <ChevronDown className="h-5 w-5" />
        </button>

        <div className="text-center min-w-0 max-w-[50%] px-2">
          <span className="text-[9px] font-mono font-bold text-[#00D4FF] tracking-[0.2em] uppercase block">
            NOW STREAMING
          </span>
          <h2 className="text-xs font-black text-white truncate flex items-center justify-center gap-1">
            {track.title} <CheckCircle2 className="h-3.5 w-3.5 text-[#00D4FF] shrink-0" /> • <span className="text-white/70 truncate">{trackArtist}</span>
          </h2>
        </div>

        {/* Right Mode Switcher Pill */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full border border-white/10">
          {(['lyrics', 'visualizer', 'equalizer'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'equalizer') setShowEqModal(true);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-[#00D4FF] text-black shadow-[0_0_12px_#00D4FF]' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'lyrics' ? 'Lyrics' : tab === 'visualizer' ? 'Visualizer' : 'Studio EQ'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. SCROLLABLE CENTER MAIN STAGE ── */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 sm:px-6 py-3 space-y-4">
        
        {/* Main Grid: Info + Artwork + Context Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* LEFT: Metadata */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <div>
              <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest block mb-1">
                NOW PLAYING
              </span>
              <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-1.5">
                {track.title} <CheckCircle2 className="h-4 w-4 text-[#00D4FF] shrink-0" />
              </h1>
              <p className="text-xs font-bold text-[#00D4FF] pt-0.5">{trackArtist}</p>
              <p className="text-[11px] text-white/50 pt-0.5">After Hours (Deluxe)</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40">
                HI-RES
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#7A3CFF]/20 text-[#7A3CFF] border border-[#7A3CFF]/40">
                DOLBY ATMOS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40">
                LYRICS
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isLiked ? 'bg-[#FF2D95]/20 border-[#FF2D95] text-[#FF2D95]' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#FF2D95]' : ''}`} />
              </button>
              <button className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CENTER: Floating 3D Vinyl Turntable Stage */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <VinylTurntableStage
              coverUrl={coverUrl}
              title={track.title}
              artist={trackArtist}
              isPlaying={isPlaying}
            />
          </div>

          {/* RIGHT: Connected Cards */}
          <div className="lg:col-span-3 space-y-2">
            {/* Card 1 */}
            <div 
              onClick={() => setShowDevicesModal(true)}
              className="glass-card-v2 p-3 rounded-2xl border border-white/10 space-y-1.5 cursor-pointer hover:border-[#00D4FF]/40 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40 text-[9px] font-bold uppercase">PLAYING ON</span>
                <Headphones className="h-3.5 w-3.5 text-[#00D4FF]" />
              </div>
              <div className="text-xs font-black text-white truncate">Saswata&apos;s AirPods Max</div>
              
              {/* Spectrum bars */}
              <div className="flex items-center gap-1 h-2.5 pt-0.5">
                {[40, 70, 100, 60, 80, 50, 90, 30, 80, 60, 100, 40].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-[#7A3CFF] to-[#00D4FF] rounded-full transition-all"
                    style={{ height: `${isPlaying ? h : 20}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Card 2 */}
            <div 
              onClick={() => setShowQualityModal(true)}
              className="glass-card-v2 p-3 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-[#00D4FF]/40 transition-all"
            >
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase font-bold block">AUDIO QUALITY</span>
                <span className="text-xs font-black text-[#00D4FF] block">Lossless</span>
                <span className="text-[9px] font-mono text-white/50">24-bit / 96 kHz</span>
              </div>
              <button className="btn-neo-glass px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer">
                Change
              </button>
            </div>

            {/* Card 3 */}
            <div 
              onClick={() => setShowEqModal(true)}
              className="glass-card-v2 p-3 rounded-2xl border border-white/10 space-y-1 cursor-pointer hover:border-[#7A3CFF]/40 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[9px] font-mono text-white/40 font-bold uppercase">SOUNDSTAGE</span>
                <Sparkles className="h-3.5 w-3.5 text-[#7A3CFF]" />
              </div>
              <div className="text-xs font-black text-[#7A3CFF]">Concert Hall</div>
            </div>
          </div>

        </div>

        {/* Feature Cards Row (Cleanly placed below stage, no overlapping) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* AI DJ */}
          <div 
            onClick={() => setShowAiDjModal(true)}
            className="glass-card-v2 p-3 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-[#7A3CFF]/40 transition-all"
          >
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#7A3CFF]" /> AI DJ
              </div>
              <div className="text-[10px] text-white/50">Your personal music companion</div>
            </div>
            <button className="btn-neo-primary px-2.5 py-1 text-[10px] font-black cursor-pointer shrink-0">
              Start AI DJ
            </button>
          </div>

          {/* Smart Mix */}
          <div className="glass-card-v2 p-3 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-[#00D4FF]/40 transition-all">
            <div>
              <div className="text-xs font-black text-white">Smart Mix</div>
              <div className="text-[10px] text-white/50">Based on your mood</div>
              <div className="text-[10px] font-bold text-[#00D4FF]">Midnight Drive</div>
            </div>
            <button className="h-7 w-7 rounded-full bg-[#00D4FF] text-black flex items-center justify-center shrink-0">
              <Play className="h-3.5 w-3.5 fill-black ml-0.5" />
            </button>
          </div>

          {/* Vibe Room */}
          <div className="glass-card-v2 p-3 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-[#FF2D95]/40 transition-all">
            <div>
              <div className="text-xs font-black text-white">Vibe Room</div>
              <div className="text-[10px] text-white/50">23 people listening</div>
            </div>
            <div className="flex items-center -space-x-1.5">
              {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80'].map((src, i) => (
                <img key={i} src={src} alt="" className="h-5 w-5 rounded-full object-cover border border-black" />
              ))}
            </div>
          </div>

          {/* Discover */}
          <div className="glass-card-v2 p-3 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/30 transition-all">
            <div>
              <div className="text-xs font-black text-white">Discover</div>
              <div className="text-[10px] text-white/50">New music picked for you</div>
            </div>
            <span className="text-[10px] font-bold text-[#00D4FF]">More &gt;</span>
          </div>
        </div>

      </div>

      {/* ── 3. FIXED BOTTOM SCRUBBER & TRANSPORT BAR ── */}
      <div className="relative z-20 shrink-0 bg-[#070512]/95 border-t border-white/10 px-4 sm:px-6 py-3 space-y-2">
        {/* Scrubber Progress Bar */}
        <div className="space-y-1">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              handleSeek((clickX / rect.width) * displayDuration);
            }}
            className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group hover:h-2 transition-all relative"
          >
            <div
              className="h-full bg-gradient-to-r from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
            <span className="text-[#00D4FF]">{formatTime(currentTime)}</span>
            <span className="text-white/40 tracking-wider">Chapter 2</span>
            <span className="text-[#00D4FF]">{formatTime(displayDuration)}</span>
          </div>
        </div>

        {/* Transport Action Controls */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-white hover:bg-white/10 transition-colors text-xs"
          >
            N
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                shuffle 
                  ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button onClick={prevTrack} className="text-white/80 hover:text-white transition-colors cursor-pointer">
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={() => setPlaying(!isPlaying)}
              className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#7A3CFF] via-[#FF2D95] to-[#00D4FF] text-black flex items-center justify-center shadow-[0_0_20px_#00D4FF] hover:scale-105 transition-transform cursor-pointer"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black ml-0.5" />}
            </button>

            <button onClick={nextTrack} className="text-white/80 hover:text-white transition-colors cursor-pointer">
              <SkipForward className="h-5 w-5" />
            </button>

            <button
              onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
              className={`text-white/50 hover:text-white transition-colors cursor-pointer ${
                repeatMode !== 'off' ? 'text-[#00D4FF]' : ''
              }`}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowDevicesModal(true)} className="p-2 text-white/60 hover:text-white">
              <Cast className="h-4 w-4" />
            </button>
            <button onClick={() => setShowQueueDrawer(true)} className="p-2 text-white/60 hover:text-white">
              <Music className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <AiDjPanelModal isOpen={showAiDjModal} onClose={() => setShowAiDjModal(false)} />
      <QueueDrawer isOpen={showQueueDrawer} onClose={() => setShowQueueDrawer(false)} />
      <EqualizerModal isOpen={showEqModal} onClose={() => setShowEqModal(false)} />
      <SleepTimerModal isOpen={showSleepTimerModal} onClose={() => setShowSleepTimerModal(false)} />
      <DeviceSelectorModal isOpen={showDevicesModal} onClose={() => setShowDevicesModal(false)} />
      <AudioQualityModal isOpen={showQualityModal} onClose={() => setShowQualityModal(false)} />
    </div>
  );
}
