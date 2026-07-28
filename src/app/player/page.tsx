'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { useQuery } from '@tanstack/react-query';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  Disc,
  Mic2,
  ListMusic,
  Maximize2,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Music,
} from 'lucide-react';

interface LyricLine { time: number; text: string; }

const DEFAULT_TRACK = {
  id: 'shayad-love-aaj-kal',
  title: 'Shayad - Love Aaj Kal',
  artist: { name: 'Arijit Singh' },
  album: { name: 'Love Aaj Kal', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80' },
  coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
  durationMs: 190000,
  sourceType: 'youtube' as const,
  sourceId: 'cbqMZW6ZfE0',
};

export default function NowPlayingPage() {
  const router = useRouter();
  const {
    isPlaying, currentTrack, queue, volume, isMuted,
    progress, duration, shuffle, repeatMode,
    setPlaying, setVolume, toggleMute, nextTrack, prevTrack,
    setShuffle, setRepeatMode, setProgress, playTrack, setCurrentTrack
  } = usePlaybackStore();

  /* Auto-initialize default track if none playing */
  useEffect(() => {
    if (!currentTrack) {
      setCurrentTrack(DEFAULT_TRACK);
    }
  }, [currentTrack, setCurrentTrack]);

  /* ── Mobile View Toggle: 'player' | 'lyrics' | 'queue' ── */
  const [activeMobileView, setActiveMobileView] = useState<'player' | 'lyrics' | 'queue'>('player');
  const [rightTab, setRightTab] = useState<'Lyrics' | 'Queue' | 'Related'>('Lyrics');
  const [isLiked, setIsLiked] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeTrack = currentTrack || DEFAULT_TRACK;

  // Clean title for lyrics search
  const cleanTitle = (title: string) => {
    if (!title) return 'Track';
    return title.split('_')[0].split('ft.')[0].split('(Official')[0].split('|')[0].trim();
  };

  /* ── Fetch Real Synced Lyrics from LRCLIB API ── */
  const { data: lyricsData, isLoading: isLoadingLyrics } = useQuery<LyricLine[]>({
    queryKey: ['real-lyrics', activeTrack.id, activeTrack.title, activeTrack.artist.name],
    queryFn: async () => {
      const titleClean = cleanTitle(activeTrack.title);
      const artistClean = activeTrack.artist.name || '';
      const res = await fetch(
        `/api/lyrics?title=${encodeURIComponent(titleClean)}&artist=${encodeURIComponent(artistClean)}&durationMs=${activeTrack.durationMs || 180000}`
      );
      if (!res.ok) return [];
      const json = await res.json();
      return json.lyrics || [];
    },
    enabled: !!activeTrack,
  });

  const lyrics: LyricLine[] = lyricsData || [];

  const activeLyricIdx = lyrics.findIndex(
    (line, idx) => progress >= line.time && (idx === lyrics.length - 1 || progress < lyrics[idx + 1].time)
  );

  const coverUrl = activeTrack.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /* ── Auto Scroll Lyrics ── */
  useEffect(() => {
    if (lyricsContainerRef.current && activeLyricIdx >= 0) {
      const el = lyricsContainerRef.current.children[activeLyricIdx] as HTMLElement;
      if (el) {
        lyricsContainerRef.current.scrollTo({
          top: el.offsetTop - lyricsContainerRef.current.clientHeight / 2 + el.clientHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [activeLyricIdx, activeMobileView, rightTab]);

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    showToast(!isLiked ? 'Saved to Liked Songs' : 'Removed from Liked Songs');
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setProgress(time);
    window.dispatchEvent(new CustomEvent('seek-track', { detail: { time } }));
  };

  const formatTime = (t: number) => {
    if (isNaN(t)) return '0:00';
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 30;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#0B0E14] text-white overflow-hidden select-none font-sans">
      
      {/* ═══ TOAST NOTIFICATION ═══ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-[#181818] border border-[#282828] px-5 py-2 text-xs font-semibold text-white shadow-xl flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00D6FF]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTAINER (SINGLE COLUMN ON SMARTPHONES, DUAL COLUMN ON DESKTOP) ═══ */}
      <main className="flex-1 flex flex-col items-center justify-between h-full bg-[#0B0E14] overflow-y-auto scrollbar-none p-4 sm:p-6 md:p-8">
        
        {/* Top Header & Navigation Tabs */}
        <div className="w-full flex items-center justify-between gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#282828] text-xs font-semibold text-[#B3B3B3] hover:text-white transition-all"
          >
            <ChevronLeft className="h-4 w-4" /> <span>Back</span>
          </button>

          {/* Smartphone Tab Switcher (Visible on Mobile Only) */}
          <div className="flex lg:hidden items-center bg-[#181818] p-1 rounded-full border border-[#282828]">
            <button
              onClick={() => setActiveMobileView('player')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeMobileView === 'player' ? 'bg-[#00D6FF] text-black shadow-md' : 'text-[#B3B3B3]'
              }`}
            >
              Player
            </button>
            <button
              onClick={() => setActiveMobileView('lyrics')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeMobileView === 'lyrics' ? 'bg-[#00D6FF] text-black shadow-md' : 'text-[#B3B3B3]'
              }`}
            >
              Lyrics
            </button>
            <button
              onClick={() => setActiveMobileView('queue')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeMobileView === 'queue' ? 'bg-[#00D6FF] text-black shadow-md' : 'text-[#B3B3B3]'
              }`}
            >
              Queue
            </button>
          </div>

          <span className="hidden lg:inline text-xs font-mono text-[#B3B3B3] uppercase tracking-widest">
            NOW PLAYING
          </span>

          <button onClick={handleLikeToggle} className="p-2 rounded-full hover:bg-[#282828] text-[#B3B3B3] hover:text-white">
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-[#00D6FF] text-[#00D6FF]' : ''}`} />
          </button>
        </div>

        {/* ═══ MOBILE VIEW 1: PLAYER / DESKTOP ALWAYS VISIBLE ═══ */}
        <div className={`flex-1 flex flex-col items-center justify-center max-w-md w-full my-auto py-4 space-y-6 text-center ${
          activeMobileView !== 'player' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Large Square Album Artwork */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-[#282828]">
            <ImageWithFallback
              src={coverUrl}
              alt={activeTrack.title}
              fill
              sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
              priority
              className="object-cover"
            />
          </div>

          {/* Song Title & Artist */}
          <div className="space-y-1 max-w-full px-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate max-w-xs sm:max-w-sm">
                {cleanTitle(activeTrack.title)}
              </h1>
              <CheckCircle2 className="h-5 w-5 text-[#00D6FF] flex-shrink-0" />
            </div>
            <p className="text-sm font-medium text-[#B3B3B3] truncate">{activeTrack.artist.name}</p>
          </div>

          {/* Timeline Progress Bar */}
          <div className="w-full space-y-2 pt-2">
            <div className="relative h-1.5 w-full bg-[#282828] rounded-full overflow-hidden group cursor-pointer">
              <div
                className="absolute inset-y-0 left-0 bg-[#00D6FF] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range" min={0} max={duration || 100} value={progress || 0} onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-[#B3B3B3]">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration || 190)}</span>
            </div>
          </div>

          {/* Playback Controls Row */}
          <div className="flex items-center justify-between w-full max-w-xs pt-2">
            <button onClick={() => setShuffle(!shuffle)} className={`transition-all ${shuffle ? 'text-[#00D6FF]' : 'text-[#B3B3B3] hover:text-white'}`}>
              <Shuffle className="h-5 w-5" />
            </button>
            <button onClick={prevTrack} className="text-[#B3B3B3] hover:text-white transition-all active:scale-95">
              <SkipBack className="h-6 w-6 fill-current" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={() => setPlaying(!isPlaying)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-black text-black" /> : <Play className="h-6 w-6 fill-black text-black translate-x-0.5" />}
            </button>

            <button onClick={nextTrack} className="text-[#B3B3B3] hover:text-white transition-all active:scale-95">
              <SkipForward className="h-6 w-6 fill-current" />
            </button>
            <button
              onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : 'off')}
              className={`transition-all ${repeatMode !== 'off' ? 'text-[#00D6FF]' : 'text-[#B3B3B3] hover:text-white'}`}
            >
              <Repeat className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ═══ MOBILE VIEW 2: LYRICS TAB (ON SMARTPHONES) ═══ */}
        <div className={`lg:hidden flex-1 w-full max-w-md my-auto py-4 overflow-y-auto ${
          activeMobileView !== 'lyrics' ? 'hidden' : 'block'
        }`}>
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-white text-center">Live Synced Lyrics</h3>
            {isLoadingLyrics ? (
              <div className="flex items-center justify-center py-20 text-[#B3B3B3]">
                <Loader2 className="h-6 w-6 animate-spin text-[#00D6FF]" />
                <span className="ml-2 text-xs font-mono">Fetching real lyrics...</span>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="text-center py-16 text-[#B3B3B3] space-y-2">
                <Music className="h-8 w-8 mx-auto text-[#282828]" />
                <p className="text-sm font-bold">No synced lyrics found</p>
              </div>
            ) : (
              <div ref={lyricsContainerRef} className="space-y-4 text-center max-h-[60vh] overflow-y-auto scrollbar-none px-4">
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIdx;
                  return (
                    <p
                      key={idx}
                      onClick={() => { setProgress(line.time); window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: line.time } })); }}
                      className={`cursor-pointer transition-all ${
                        isActive
                          ? 'text-xl font-black text-[#00D6FF] scale-105'
                          : 'text-sm font-semibold text-[#B3B3B3] hover:text-white'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar Details */}
        <div className="w-full flex items-center justify-between border-t border-[#181818] pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00D6FF] animate-pulse" />
            <span className="text-xs font-mono text-[#B3B3B3]">FLAC 24-bit / 96kHz Lossless</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button onClick={toggleMute} className="text-[#B3B3B3] hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#282828] rounded-full outline-none accent-[#00D6FF]"
            />
          </div>
        </div>
      </main>

      {/* ═══ DESKTOP RIGHT SIDEBAR: REAL SYNCED LYRICS (HIDDEN ON SMARTPHONES) ═══ */}
      <aside className="hidden lg:flex w-80 lg:w-96 flex-shrink-0 bg-[#000000] border-l border-[#181818] p-6 flex-col justify-between h-full">
        
        {/* Right Header Tabs */}
        <div className="flex items-center justify-between border-b border-[#181818] pb-4">
          <div className="flex items-center gap-4">
            {(['Lyrics', 'Queue', 'Related'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`text-xs font-bold transition-all relative pb-1 ${
                  rightTab === tab ? 'text-white font-extrabold' : 'text-[#B3B3B3] hover:text-white'
                }`}
              >
                {tab}
                {rightTab === tab && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D6FF] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: LYRICS */}
        {rightTab === 'Lyrics' && (
          <div className="flex-1 flex flex-col my-4 overflow-hidden">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white truncate">{cleanTitle(activeTrack.title)}</h2>
              <p className="text-xs text-[#B3B3B3] truncate">{activeTrack.artist.name}</p>
            </div>

            {isLoadingLyrics ? (
              <div className="flex items-center justify-center py-20 text-[#B3B3B3]">
                <Loader2 className="h-6 w-6 animate-spin text-[#00D6FF]" />
                <span className="ml-2 text-xs font-mono">Loading LRCLIB lyrics...</span>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Music className="h-8 w-8 text-[#282828]" />
                <p className="text-sm font-bold text-white">No Synced Lyrics Found</p>
                <p className="text-xs text-[#B3B3B3]">
                  Synced lyrics for &quot;{cleanTitle(activeTrack.title)}&quot; are not available.
                </p>
              </div>
            ) : (
              <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto scrollbar-none space-y-5 pr-2 py-4">
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIdx;
                  return (
                    <p
                      key={idx}
                      onClick={() => { setProgress(line.time); window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: line.time } })); }}
                      className={`cursor-pointer transition-all duration-300 ${
                        isActive
                          ? 'text-lg font-extrabold text-[#00D6FF] scale-105'
                          : 'text-xs font-semibold text-[#B3B3B3] hover:text-white'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUEUE */}
        {rightTab === 'Queue' && (
          <div className="flex-1 overflow-y-auto scrollbar-none py-4 space-y-2">
            <h3 className="text-xs font-mono font-bold text-[#B3B3B3] uppercase tracking-wider mb-3">Next In Queue</h3>
            {queue.length === 0 ? (
              <p className="text-xs text-[#B3B3B3] py-4 text-center">Queue is empty</p>
            ) : (
              queue.map((t, idx) => (
                <div
                  key={t.id + idx}
                  onClick={() => playTrack(t, queue)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#181818] cursor-pointer group"
                >
                  <span className="text-xs font-mono text-[#B3B3B3] w-4">{idx + 1}</span>
                  <div className="relative h-9 w-9 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={t.coverUrl || '/images/default-cover.png'} alt={t.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white group-hover:text-[#00D6FF] truncate">{t.title}</p>
                    <p className="text-[11px] text-[#B3B3B3] truncate">{t.artist.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
