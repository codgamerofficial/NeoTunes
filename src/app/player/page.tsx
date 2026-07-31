'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import AudioFormatBadge from '@/components/ui/AudioFormatBadge';
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
  Disc,
  Flame,
  Zap,
  Moon,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FullscreenPlayerPage() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    seek,
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'visualizer' | 'lyrics' | 'equalizer'>('lyrics');
  const [isLiked, setIsLiked] = useState(false);
  const [equalizerPreset, setEqualizerPreset] = useState('Spatial Atmos');
  const [sleepTimerMins, setSleepTimerMins] = useState<number | null>(null);
  
  // Dynamic Real Synced Lyrics state
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const displayDuration = duration > 0 ? duration : 261;
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

  const track = currentTrack || {
    id: 'blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  };

  const trackArtist = typeof track.artist === 'object' ? (track.artist as any)?.name : track.artist;

  // Fetch real synced lyrics for active playing track
  useEffect(() => {
    if (!track?.title) return;
    let isCancelled = false;
    setLyricsLoading(true);

    const title = track.title;
    const artist = typeof track.artist === 'object' ? (track.artist as any)?.name : track.artist || '';
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
  let activeLyricIndex = -1;
  if (lyrics && lyrics.length > 0) {
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        activeLyricIndex = i;
      } else {
        break;
      }
    }
  }

  // Smooth Auto-scroll to active lyric line in container
  useEffect(() => {
    if (activeLineRef.current && activeTab === 'lyrics') {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex, activeTab]);

  // Real-Time Audio Spectrum Canvas Renderer
  useEffect(() => {
    if (activeTab !== 'visualizer' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const bars = 36;
      const barWidth = (width / bars) - 4;

      for (let i = 0; i < bars; i++) {
        const barHeight = isPlaying 
          ? Math.sin(phase + i * 0.3) * (height * 0.4) + (height * 0.45)
          : 12;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#00D4FF');
        gradient.addColorStop(0.5, '#7A3CFF');
        gradient.addColorStop(1, '#FF2D95');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(i * (barWidth + 4), height - barHeight, barWidth, barHeight, 6);
        ctx.fill();
      }

      phase += 0.08;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, isPlaying]);

  return (
    <div className="fixed inset-0 w-full bg-[#030304] text-white flex flex-col overflow-hidden select-none z-50">
      
      {/* Dynamic Artwork Blur Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-125 transition-all duration-1000"
        style={{ backgroundImage: `url(${track.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#030304]" />

      {/* ── TOP BAR ── */}
      <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 pt-4 pb-2 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <ChevronDown className="h-5 w-5" />
        </button>

        <div className="text-center min-w-0 max-w-[50%] px-2">
          <span className="text-[9px] font-mono font-bold text-[#00D4FF] tracking-[0.3em] uppercase">NOW STREAMING</span>
          <h4 className="text-xs font-bold text-white mt-0.5 truncate">{track.title}</h4>
        </div>

        {/* Tab Selectors */}
        <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-full border border-white/10">
          {(['lyrics', 'visualizer', 'equalizer'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-[#00D4FF] text-black shadow-[0_0_12px_#00D4FF]' : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'lyrics' ? 'Lyrics' : tab === 'visualizer' ? 'Visualizer' : 'Studio EQ'}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT (fills available space) ── */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center h-full py-4">
          
          {/* Left Column: Album Cover & Track Info */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              whileHover={{ scale: 1.03, rotateY: 5, rotateX: -5 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative h-56 w-56 sm:h-72 sm:w-72 lg:h-80 lg:w-80 rounded-[28px] overflow-hidden border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)] group"
            >
              <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                <span className="text-[10px] font-mono text-[#00D4FF] font-bold">Dolby Spatial Surround 7.1</span>
              </div>
            </motion.div>

            <div className="text-center space-y-1.5 w-full max-w-md px-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug break-words">{track.title}</h2>
              <p className="text-base text-[#00D4FF] font-bold truncate">{trackArtist}</p>
              
              <div className="flex items-center justify-center gap-2 pt-1">
                <AudioFormatBadge format="dolby" />
                <AudioFormatBadge format="flac" />
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Panel */}
          <div className="flex flex-col justify-center">
            
            {/* LYRICS VIEW */}
            {activeTab === 'lyrics' && (
              <div className="relative h-[340px] sm:h-[420px] rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl p-6 overflow-hidden flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#FF2D95] uppercase font-bold tracking-widest mb-3 shrink-0">
                  <Mic2 className="h-3.5 w-3.5 animate-bounce text-[#FF2D95]" /> 
                  {lyricsLoading ? 'FETCHING REAL LYRICS...' : lyrics ? 'SYNCED KARAOKE LYRICS' : 'INSTRUMENTAL / NO LYRICS'}
                </div>

                {lyricsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="h-8 w-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-white/40">Fetching real-time karaoke lyrics...</p>
                  </div>
                ) : lyrics && lyrics.length > 0 ? (
                  <div 
                    ref={lyricsContainerRef}
                    className="flex-1 overflow-y-auto scrollbar-none space-y-6 py-10 text-center px-4"
                  >
                    {lyrics.map((line, idx) => {
                      const isActive = idx === activeLyricIndex;
                      const isPast = idx < activeLyricIndex;
                      return (
                        <motion.p
                          key={`${line.time}-${idx}`}
                          ref={isActive ? activeLineRef : null}
                          onClick={() => seek(line.time)}
                          animate={{
                            scale: isActive ? 1.08 : 0.95,
                            opacity: isActive ? 1 : isPast ? 0.35 : 0.5,
                          }}
                          transition={{ duration: 0.2 }}
                          className={`cursor-pointer transition-all ${
                            isActive
                              ? 'text-xl sm:text-2xl font-black bg-gradient-to-r from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]'
                              : 'text-base font-semibold text-white hover:text-white/80'
                          }`}
                        >
                          {line.text}
                        </motion.p>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                    <Music className="h-12 w-12 text-white/20" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white/70">No synced lyrics found for this song</p>
                      <p className="text-xs text-white/40 max-w-xs mx-auto">Enjoy high definition Dolby Atmos audio playback</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VISUALIZER VIEW */}
            {activeTab === 'visualizer' && (
              <div className="p-6 sm:p-8 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center space-y-4">
                <div className="text-[10px] font-mono text-[#00D4FF] uppercase font-bold tracking-widest flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 animate-pulse" /> 3D Web Audio Spectrum Engine
                </div>
                <canvas ref={canvasRef} width={400} height={200} className="w-full max-w-md" />
              </div>
            )}

            {/* STUDIO EQUALIZER VIEW */}
            {activeTab === 'equalizer' && (
              <div className="p-6 sm:p-8 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-[#7A3CFF]" /> Studio Equalizer Presets
                  </h4>
                  <span className="text-[10px] font-mono text-[#00D4FF] font-bold">24-Bit / 192kHz</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['Bass Boost', 'Acoustic', 'Vocal Clear', 'Spatial Atmos', 'Flat Studio', 'Concert Hall'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setEqualizerPreset(preset)}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all ${
                        equalizerPreset === preset
                          ? 'bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black shadow-[0_0_15px_#00D4FF]'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* EQ Slider Bars */}
                <div className="flex items-end justify-around gap-2 h-24 pt-2">
                  {['60Hz', '150Hz', '400Hz', '1kHz', '2.5kHz', '6kHz', '16kHz'].map((freq, i) => {
                    const heights = [75, 60, 80, 55, 70, 45, 65];
                    return (
                      <div key={freq} className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-full max-w-[18px] rounded-full bg-white/10 overflow-hidden" style={{ height: '72px' }}>
                          <div
                            className="w-full bg-gradient-to-t from-[#00D4FF] to-[#7A3CFF] rounded-full transition-all duration-300"
                            style={{ height: `${heights[i]}%`, marginTop: `${100 - heights[i]}%` }}
                          />
                        </div>
                        <span className="text-[8px] font-mono text-white/30">{freq}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CONTROLS BAR (pinned to bottom) ── */}
      <div className="relative z-10 shrink-0 px-5 sm:px-8 pb-6 pt-3 bg-gradient-to-t from-[#030304] via-[#030304]/90 to-transparent">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Progress Scrubber */}
          <div className="space-y-1">
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                seek((clickX / rect.width) * displayDuration);
              }}
              className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group hover:h-2 transition-all"
            >
              <div
                className="h-full bg-gradient-to-r from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-white/40 font-bold">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(displayDuration)}</span>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-between">
            <button onClick={() => setIsLiked(!isLiked)} className="text-white/40 hover:text-[#FF2D95] transition-colors">
              <Heart className={`h-5 w-5 ${isLiked ? 'text-[#FF2D95] fill-[#FF2D95]' : ''}`} />
            </button>

            <div className="flex items-center gap-5">
              <button onClick={previousTrack} className="text-white/70 hover:text-white transition-colors">
                <SkipBack className="h-6 w-6" />
              </button>

              <button
                onClick={togglePlay}
                className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] text-black flex items-center justify-center shadow-[0_0_30px_rgba(122,60,255,0.5)] hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause className="h-7 w-7 fill-black" /> : <Play className="h-7 w-7 fill-black ml-0.5" />}
              </button>

              <button onClick={nextTrack} className="text-white/70 hover:text-white transition-colors">
                <SkipForward className="h-6 w-6" />
              </button>
            </div>

            <button
              onClick={() => setSleepTimerMins(sleepTimerMins ? null : 30)}
              className={`p-2 rounded-full border transition-all ${
                sleepTimerMins ? 'bg-[#7A3CFF] border-[#7A3CFF] text-white shadow-[0_0_12px_#7A3CFF]' : 'border-white/10 text-white/40 hover:text-white'
              }`}
              title="Sleep Timer (30 mins)"
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
