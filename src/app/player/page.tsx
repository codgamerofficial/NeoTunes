'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Share2,
  Disc,
  Mic2,
  ListMusic,
  Maximize2,
  X,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Smartphone,
  Maximize,
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
  const queryClient = useQueryClient();
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

  /* ── Right Panel Tab State ── */
  const [rightTab, setRightTab] = useState<'Lyrics' | 'Queue' | 'Related'>('Lyrics');
  const [isLiked, setIsLiked] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeTrack = currentTrack || DEFAULT_TRACK;

  // Clean title for lyrics search
  const cleanTitle = (title: string) => {
    if (!title) return 'Track';
    return title.split('_')[0].split('ft.')[0].split('(Official')[0].trim();
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
    if (rightTab === 'Lyrics' && lyricsContainerRef.current && activeLyricIdx >= 0) {
      const el = lyricsContainerRef.current.children[activeLyricIdx] as HTMLElement;
      if (el) {
        lyricsContainerRef.current.scrollTo({
          top: el.offsetTop - lyricsContainerRef.current.clientHeight / 2 + el.clientHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [activeLyricIdx, rightTab]);

  const handleLikeToggle = async () => {
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
    <div className="flex h-full w-full bg-[#121212] text-white overflow-hidden select-none font-sans">
      
      {/* ═══ TOAST NOTIFICATION ═══ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-[#181818] border border-[#282828] px-5 py-2 text-xs font-semibold text-white shadow-xl flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#29B6F6]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CENTER WORKSPACE ═══ */}
      <main className="flex-1 flex flex-col items-center justify-between h-full bg-[#121212] overflow-y-auto scrollbar-none p-6 md:p-8">
        
        {/* Top Navigation */}
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#282828] text-xs font-semibold text-[#B3B3B3] hover:text-white transition-all"
          >
            <ChevronLeft className="h-4 w-4" /> <span>Back</span>
          </button>

          <span className="text-xs font-mono text-[#B3B3B3] uppercase tracking-widest">NOW PLAYING</span>

          <button onClick={handleLikeToggle} className="p-2 rounded-full hover:bg-[#282828] text-[#B3B3B3] hover:text-white">
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-[#29B6F6] text-[#29B6F6]' : ''}`} />
          </button>
        </div>

        {/* HERO CENTER CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full my-auto py-4 space-y-6 text-center">
          
          {/* 1. Large Square Album Artwork */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-[#282828]">
            <ImageWithFallback
              src={coverUrl}
              alt={activeTrack.title}
              fill
              sizes="(max-width: 640px) 288px, (max-width: 768px) 320px, 384px"
              priority
              className="object-cover"
            />
          </div>

          {/* 2. Song Title & Artist */}
          <div className="space-y-1 max-w-full px-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate max-w-xs sm:max-w-sm">
                {cleanTitle(activeTrack.title)}
              </h1>
              <CheckCircle2 className="h-5 w-5 text-[#29B6F6] flex-shrink-0" />
            </div>
            <p className="text-sm font-medium text-[#B3B3B3] truncate">{activeTrack.artist.name}</p>
          </div>

          {/* 3. Timeline Progress Bar */}
          <div className="w-full space-y-2 pt-2">
            <div className="relative h-1.5 w-full bg-[#282828] rounded-full overflow-hidden group cursor-pointer">
              <div
                className="absolute inset-y-0 left-0 bg-[#29B6F6] rounded-full"
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

          {/* 4. Playback Controls Row */}
          <div className="flex items-center justify-between w-full max-w-xs pt-2">
            <button onClick={() => setShuffle(!shuffle)} className={`transition-all ${shuffle ? 'text-[#29B6F6]' : 'text-[#B3B3B3] hover:text-white'}`}>
              <Shuffle className="h-5 w-5" />
            </button>
            <button onClick={prevTrack} className="text-[#B3B3B3] hover:text-white transition-all active:scale-95">
              <SkipBack className="h-6 w-6 fill-current" />
            </button>

            {/* Solid White Circle Play/Pause Button */}
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
              className={`transition-all ${repeatMode !== 'off' ? 'text-[#29B6F6]' : 'text-[#B3B3B3] hover:text-white'}`}
            >
              <Repeat className="h-5 w-5" />
            </button>
          </div>

          {/* 5. Bottom Toolbar Icons */}
          <div className="flex items-center justify-between w-full text-[#B3B3B3] pt-2">
            <button className="hover:text-white"><Smartphone className="h-4 w-4" /></button>
            <button className="hover:text-white"><ListMusic className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="w-full h-4" />
      </main>

      {/* ═══ RIGHT PANEL (SYNCED REAL LYRICS) ═══ */}
      <aside className="w-80 lg:w-96 flex-shrink-0 bg-[#000000] border-l border-[#181818] p-5 flex flex-col justify-between overflow-hidden">
        
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          {/* Header Tabs */}
          <div className="flex items-center gap-6 border-b border-[#181818] pb-3">
            {(['Lyrics', 'Queue', 'Related'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`text-xs font-bold transition-all relative pb-1 ${
                  rightTab === tab ? 'text-white' : 'text-[#B3B3B3] hover:text-white'
                }`}
              >
                {tab}
                {rightTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#29B6F6] rounded-full" />}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: REAL SYNCED LYRICS */}
          {rightTab === 'Lyrics' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="space-y-1 mb-3">
                <h3 className="text-base font-bold text-white truncate">{cleanTitle(activeTrack.title)}</h3>
                <p className="text-xs text-[#B3B3B3] truncate">{activeTrack.artist.name}</p>
              </div>

              {/* Scrolling Lyrics List */}
              {isLoadingLyrics ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[#B3B3B3] space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#29B6F6]" />
                  <span className="text-xs font-mono">Fetching LRCLIB synced lyrics...</span>
                </div>
              ) : lyrics.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[#B3B3B3] text-center space-y-2 p-6">
                  <Music className="h-8 w-8 text-[#282828]" />
                  <p className="text-xs font-bold text-white">No Synced Lyrics Found</p>
                  <p className="text-[11px]">Synced lyrics for &quot;{cleanTitle(activeTrack.title)}&quot; are not available in LRCLIB database.</p>
                </div>
              ) : (
                <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-4 py-3">
                  {lyrics.map((line, idx) => {
                    const isActive = idx === activeLyricIdx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setProgress(line.time)}
                        className={`cursor-pointer transition-all pl-3 border-l-2 ${
                          isActive
                            ? 'border-[#29B6F6] text-white font-extrabold text-base'
                            : 'border-transparent text-[#B3B3B3] font-medium text-sm hover:text-white'
                        }`}
                      >
                        {line.text}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => showToast('Full lyrics view expanded')}
                className="mt-3 w-full py-2.5 rounded-xl bg-[#181818] hover:bg-[#282828] text-xs font-bold text-white transition-all border border-[#282828] flex items-center justify-center gap-1.5"
              >
                <span>Show full lyrics</span> <Maximize className="h-3.5 w-3.5 text-[#B3B3B3]" />
              </button>
            </div>
          )}

          {/* TAB CONTENT: QUEUE */}
          {rightTab === 'Queue' && (
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3">
              <p className="text-xs font-mono font-bold text-[#B3B3B3] uppercase">Up Next Queue ({queue.length})</p>
              <div className="space-y-2">
                {queue.map((t, idx) => (
                  <div key={t.id + idx} onClick={() => playTrack(t)} className="flex items-center gap-3 p-2 rounded-xl bg-[#181818] hover:bg-[#282828] cursor-pointer">
                    <div className="relative h-9 w-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#282828]">
                      <ImageWithFallback src={t.coverUrl || '/images/default-cover.png'} alt={t.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{cleanTitle(t.title)}</p>
                      <p className="text-[10px] text-[#B3B3B3] truncate">{t.artist.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: RELATED */}
          {rightTab === 'Related' && (
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3">
              <p className="text-xs font-mono font-bold text-[#B3B3B3] uppercase">Recommended Tracks</p>
              <div className="space-y-2">
                {queue.slice(0, 5).map((t, idx) => (
                  <div key={t.id + idx} onClick={() => playTrack(t)} className="flex items-center gap-3 p-2 rounded-xl bg-[#181818] hover:bg-[#282828] cursor-pointer">
                    <div className="relative h-9 w-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#282828]">
                      <ImageWithFallback src={t.coverUrl || '/images/default-cover.png'} alt={t.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{cleanTitle(t.title)}</p>
                      <p className="text-[10px] text-[#B3B3B3] truncate">{t.artist.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
