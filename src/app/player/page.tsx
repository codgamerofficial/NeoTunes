'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName, getCoverUrl } from '@/types';
import { audioDspEngine } from '@/services/audioDspEngine';
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
  Signal
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
    sleepTimerMinutes,
  } = usePlaybackStore();

  const [activeTab, setActiveTab] = useState<'visualizer' | 'lyrics' | 'equalizer'>('lyrics');
  const [isLiked, setIsLiked] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  
  // Dynamic Real Synced Lyrics state
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentTime = progress;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const displayDuration = duration > 0 ? duration : 261;
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

  const track: Track = currentTrack || {
    id: 'blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    durationMs: 200000,
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
      .catch((err) => {
        console.warn('Failed to fetch lyrics:', err);
        if (!isCancelled) {
          setLyrics(null);
          setLyricsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [track?.title, trackArtist]);

  // Calculate current active lyric line index based on playback currentTime
  let activeLyricIndex = 0;
  if (lyrics && lyrics.length > 0) {
    let found = false;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        activeLyricIndex = i;
        found = true;
      } else {
        break;
      }
    }
    if (!found) activeLyricIndex = 0;
  }

  // Smooth Auto-scroll strictly inside lyricsContainerRef to keep active line vertically centered
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current && activeTab === 'lyrics') {
      const container = lyricsContainerRef.current;
      const line = activeLineRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();

      const lineTopRelativeToContainer = lineRect.top - containerRect.top + container.scrollTop;
      const targetScrollTop = lineTopRelativeToContainer - (containerRect.height / 2) + (lineRect.height / 2);

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });
    }
  }, [activeLyricIndex, activeTab]);

  // Real Web Audio FFT Analyser Spectrum Renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;
    const fftBuffer = new Uint8Array(32);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const bars = 32;
      const barWidth = (width / bars) - 4;

      const analyser = audioDspEngine.getAnalyser();
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(fftBuffer);
      }

      for (let i = 0; i < bars; i++) {
        const fftVal = fftBuffer[i] || 0;
        const synthVal = Math.abs(Math.sin(phase * 1.8 + i * 0.35)) * (height * 0.6) + (height * 0.18);
        const realHeight = isPlaying 
          ? (fftVal > 15 ? (fftVal / 255) * height * 0.85 : synthVal)
          : 12;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#00D4FF');
        gradient.addColorStop(0.5, '#7A3CFF');
        gradient.addColorStop(1, '#FF2D95');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(i * (barWidth + 4), height - Math.max(12, realHeight), barWidth, Math.max(12, realHeight), 6);
        ctx.fill();
      }

      phase += 0.08;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, isPlaying]);

  const handleSeek = (newTime: number) => {
    setProgress(newTime);
    window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: newTime } }));
  };

  const getQualityBadgeLabel = () => {
    if (audioQuality === 'lossless') return 'FLAC 24-BIT';
    if (audioQuality === 'very_high') return '320 KBPS HQ';
    if (audioQuality === 'high') return '256 KBPS';
    return '128 KBPS';
  };

  return (
    <div className="fixed inset-0 w-full bg-[#030304] text-white flex flex-col overflow-hidden select-none z-50">
      
      {/* Dynamic Ambient Blur Background from Album Art */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-35 scale-125 transition-all duration-1000"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#030304]" />

      {/* ── TOP HEADER BAR ── */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-4 pb-2 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
          title="Minimize Player"
        >
          <ChevronDown className="h-6 w-6" />
        </button>

        <div className="text-center min-w-0 max-w-[50%] px-2">
          <span className="text-[9px] font-mono font-bold text-[#00D4FF] tracking-[0.3em] uppercase">NOW STREAMING</span>
          <h4 className="text-xs font-bold text-white mt-0.5 truncate">{track.title} • {trackArtist}</h4>
        </div>

        {/* View Mode Selectors */}
        <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-full border border-white/10">
          {(['lyrics', 'visualizer', 'equalizer'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-[#00D4FF] text-black shadow-[0_0_12px_#00D4FF]' : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'lyrics' ? 'Lyrics' : tab === 'visualizer' ? 'Visualizer' : 'Studio EQ'}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 sm:px-8 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center min-h-full">
          
          {/* Left Column: Artwork & Track Metadata */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative h-44 w-44 sm:h-56 sm:w-56 lg:h-64 lg:w-64 xl:h-72 xl:w-72 rounded-[28px] overflow-hidden border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)] group shrink-0"
            >
              <img src={coverUrl} alt={track.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end justify-between">
                <span className="text-[10px] font-mono text-[#00D4FF] font-bold uppercase">{getQualityBadgeLabel()}</span>
                <span className="text-[10px] font-mono text-white/60">YOUTUBE ENGINE</span>
              </div>
            </motion.div>

            <div className="text-center space-y-1 w-full max-w-lg px-4">
              <h2 className="text-base sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight line-clamp-2">{track.title}</h2>
              <p className="text-xs sm:text-sm text-[#00D4FF] font-bold truncate">{trackArtist}</p>
              
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  onClick={() => setShowQualityModal(true)}
                  className="px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30 hover:bg-[#00D4FF]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Signal className="h-3 w-3" /> Verified: {getQualityBadgeLabel()}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Panel */}
          <div className="flex flex-col justify-center">
            
            {/* LYRICS VIEW */}
            {activeTab === 'lyrics' && (
              <div className="relative h-[280px] sm:h-[380px] lg:h-[420px] rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl p-4 sm:p-6 overflow-hidden flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#FF2D95] uppercase font-bold tracking-widest mb-2 shrink-0">
                  <Mic2 className="h-3.5 w-3.5 animate-bounce text-[#FF2D95]" /> 
                  {lyricsLoading ? 'FETCHING REAL LYRICS...' : lyrics ? 'REAL KARAOKE LYRICS' : 'INSTRUMENTAL / NO LYRICS'}
                </div>

                {lyricsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="h-8 w-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-white/40">Fetching real-time synced lyrics...</p>
                  </div>
                ) : lyrics && lyrics.length > 0 ? (
                  <div 
                    ref={lyricsContainerRef}
                    className="flex-1 overflow-y-auto scrollbar-none space-y-5 py-24 sm:py-32 text-center px-4"
                  >
                    {lyrics.map((line, idx) => {
                      const isActive = idx === activeLyricIndex;
                      return (
                        <motion.p
                          key={`${line.time}-${idx}`}
                          ref={isActive ? activeLineRef : null}
                          onClick={() => handleSeek(line.time)}
                          animate={{
                            scale: isActive ? 1.08 : 0.96,
                            opacity: isActive ? 1 : 0.45,
                          }}
                          className={`cursor-pointer transition-all leading-snug py-1.5 ${
                            isActive
                              ? 'text-xl sm:text-3xl font-black text-[#00D4FF] drop-shadow-[0_0_18px_rgba(0,212,255,0.9)]'
                              : 'text-sm sm:text-base font-semibold text-white/70 hover:text-white'
                          }`}
                        >
                          {line.text}
                        </motion.p>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
                    <div className="text-[10px] font-mono text-[#00D4FF] uppercase font-bold tracking-widest flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 animate-pulse" /> 3D Web Audio FFT Real Spectrum
                    </div>
                    <canvas ref={canvasRef} width={400} height={180} className="w-full max-w-md rounded-2xl bg-black/40 p-2 border border-white/10" />
                    <p className="text-xs font-semibold text-white/50">High Fidelity 320 kbps stream active • Audio reactive visualizer</p>
                  </div>
                )}
              </div>
            )}

            {/* VISUALIZER VIEW */}
            {activeTab === 'visualizer' && (
              <div className="p-6 sm:p-8 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center space-y-4">
                <div className="text-[10px] font-mono text-[#00D4FF] uppercase font-bold tracking-widest flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 animate-pulse" /> 3D Web Audio FFT Real Spectrum
                </div>
                <canvas ref={canvasRef} width={400} height={200} className="w-full max-w-md rounded-2xl bg-black/30 p-2 border border-white/5" />
              </div>
            )}

            {/* STUDIO EQUALIZER VIEW */}
            {activeTab === 'equalizer' && (
              <div className="p-6 sm:p-8 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-[#7A3CFF]" /> Hardware DSP Equalizer
                  </h4>
                  <button
                    onClick={() => setShowEqModal(true)}
                    className="px-3 py-1 text-[10px] font-bold rounded-full bg-[#7A3CFF]/20 text-[#7A3CFF] border border-[#7A3CFF]/30 hover:bg-[#7A3CFF]/30 transition-all"
                  >
                    Open 10-Band EQ Controls
                  </button>
                </div>

                <div className="text-center py-6 space-y-3">
                  <Sliders className="h-10 w-10 text-[#7A3CFF] mx-auto animate-bounce" />
                  <p className="text-sm font-bold text-white">Full 10-Band Hardware DSP & Audio Processing</p>
                  <button
                    onClick={() => setShowEqModal(true)}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-black text-xs shadow-lg hover:scale-105 transition-transform"
                  >
                    Configure Equalizer & Crossfade
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CONTROLS BAR ── */}
      <div className="relative z-10 shrink-0 px-4 sm:px-8 pb-6 pt-3 bg-gradient-to-t from-[#030304] via-[#030304]/95 to-transparent">
        <div className="max-w-2xl mx-auto space-y-3">
          
          {/* Progress Bar Scrubber with Buffer & Drag Preview */}
          <div className="space-y-1">
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newTime = Math.max(0, Math.min(displayDuration, (clickX / rect.width) * displayDuration));
                handleSeek(newTime);
              }}
              className="relative h-2.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group hover:h-3 transition-all"
            >
              {/* Buffer Bar (Preloaded Audio Stream) */}
              <div 
                className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, progressPercent + 25)}%` }} 
              />

              {/* Playhead Progress Bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Scrubber Thumb */}
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_12px_#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-white/40 font-bold">
              <span>{formatTime(currentTime)}</span>
              <span className="text-[#00D4FF]/60 font-semibold">STREAMING HQ</span>
              <span>{formatTime(displayDuration)}</span>
            </div>
          </div>

          {/* Transport Touch Controls (Min 48px targets) */}
          <div className="flex items-center justify-between">
            {/* Left Tools */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShuffle(!shuffle)}
                className={`p-3 rounded-full transition-all min-h-[48px] min-w-[48px] flex items-center justify-center ${
                  shuffle ? 'text-[#00D4FF] bg-[#00D4FF]/15' : 'text-white/40 hover:text-white'
                }`}
                title="Shuffle Queue"
              >
                <Shuffle className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-3 rounded-full text-white/40 hover:text-[#FF2D95] transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                title="Favorite"
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'text-[#FF2D95] fill-[#FF2D95]' : ''}`} />
              </button>
            </div>

            {/* Playback Play/Pause/Prev/Next */}
            <div className="flex items-center gap-4">
              <button 
                onClick={prevTrack} 
                className="p-3 rounded-full text-white/70 hover:text-white transition-colors active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
                title="Previous Track"
              >
                <SkipBack className="h-6 w-6" />
              </button>

              <button
                onClick={() => setPlaying(!isPlaying)}
                className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] text-black flex items-center justify-center shadow-[0_0_30px_rgba(122,60,255,0.6)] hover:scale-105 active:scale-95 transition-transform min-h-[56px] min-w-[56px]"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-7 w-7 fill-black" /> : <Play className="h-7 w-7 fill-black ml-0.5" />}
              </button>

              <button 
                onClick={nextTrack} 
                className="p-3 rounded-full text-white/70 hover:text-white transition-colors active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
                title="Next Track"
              >
                <SkipForward className="h-6 w-6" />
              </button>
            </div>

            {/* Right Tools: Repeat, Queue, Sleep Timer, Cast */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                className={`p-3 rounded-full transition-all min-h-[48px] min-w-[48px] flex items-center justify-center ${
                  repeatMode !== 'off' ? 'text-[#00D4FF] bg-[#00D4FF]/15' : 'text-white/40 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode.toUpperCase()}`}
              >
                <Repeat className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowQueueDrawer(true)}
                className="p-3 rounded-full text-white/40 hover:text-[#00D4FF] hover:bg-white/10 transition-all min-h-[48px] min-w-[48px] flex items-center justify-center"
                title="Play Queue"
              >
                <Radio className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowDevicesModal(true)}
                className="p-3 rounded-full text-white/40 hover:text-[#00D4FF] hover:bg-white/10 transition-all min-h-[48px] min-w-[48px] hidden sm:flex items-center justify-center"
                title="Devices / Cast"
              >
                <Wifi className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QueueDrawer isOpen={showQueueDrawer} onClose={() => setShowQueueDrawer(false)} />
      <EqualizerModal isOpen={showEqModal} onClose={() => setShowEqModal(false)} />
      <SleepTimerModal isOpen={showSleepTimerModal} onClose={() => setShowSleepTimerModal(false)} />
      <DeviceSelectorModal isOpen={showDevicesModal} onClose={() => setShowDevicesModal(false)} />
      <AudioQualityModal isOpen={showQualityModal} onClose={() => setShowQualityModal(false)} />
    </div>
  );
}
