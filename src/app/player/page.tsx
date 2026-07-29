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
  Brain,
  AlertCircle,
  Radio,
  RotateCcw,
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
    isPlaying,
    isLoadingStream,
    playbackStatus,
    playbackError,
    currentTrack,
    queue,
    volume,
    isMuted,
    progress,
    buffered,
    duration,
    shuffle,
    repeatMode,
    setPlaying,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    setShuffle,
    setRepeatMode,
    setProgress,
    playTrack,
    setCurrentTrack
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

  const progressPercent = duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;
  const bufferedPercent = duration > 0 ? Math.min((buffered / duration) * 100, 100) : 0;

  const isBufferingOrLoading = ['loading', 'preparing', 'connecting', 'buffering'].includes(playbackStatus) || isLoadingStream;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#0B0E14] text-white overflow-hidden select-none font-sans">
      
      {/* ═══ TOAST NOTIFICATION ═══ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-[#181818] border border-[#00D6FF]/40 text-[#00D6FF] px-5 py-2 text-xs font-mono font-bold shadow-xl flex items-center gap-2"
          >
            <Brain className="h-4 w-4 animate-pulse" />
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

          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-bold">
            {isBufferingOrLoading ? (
              <span className="text-[#00D6FF] bg-[#00D6FF]/10 px-3 py-1 rounded-full border border-[#00D6FF]/30 flex items-center gap-1.5 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{playbackStatus === 'buffering' ? 'BUFFERING STREAM' : 'CONNECTING AUDIO'}</span>
              </span>
            ) : isPlaying ? (
              <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>NOW PLAYING</span>
              </span>
            ) : playbackStatus === 'error' ? (
              <span className="text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>STREAM ERROR</span>
              </span>
            ) : (
              <span className="text-[#B3B3B3] uppercase tracking-widest">PAUSED</span>
            )}
          </div>

          <button onClick={handleLikeToggle} className="p-2 rounded-full hover:bg-[#282828] text-[#B3B3B3] hover:text-white">
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-[#00D6FF] text-[#00D6FF]' : ''}`} />
          </button>
        </div>

        {/* Actionable Error Alert Box if Error occurs */}
        {playbackStatus === 'error' && (
          <div className="w-full max-w-md my-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
              <span className="truncate">{playbackError || 'Unable to play audio stream for this track'}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => playTrack(activeTrack)}
                className="px-2.5 py-1 rounded-full bg-rose-500 text-black font-bold hover:bg-rose-400 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Retry
              </button>
              <button
                onClick={nextTrack}
                className="px-2.5 py-1 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ═══ MOBILE VIEW 1: PLAYER / DESKTOP ALWAYS VISIBLE ═══ */}
        <div className={`flex-1 flex flex-col items-center justify-center max-w-md w-full my-auto py-4 space-y-6 text-center ${
          activeMobileView !== 'player' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Large Square Album Artwork with Alive Pulsing Glow */}
          <div className={`relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden flex-shrink-0 border border-[#282828] transition-all duration-700 ${
            isPlaying && !isBufferingOrLoading
              ? 'scale-[1.03] shadow-[0_0_60px_rgba(0,214,255,0.35)] border-[#00D6FF]/40'
              : 'scale-100 shadow-2xl'
          }`}>
            <ImageWithFallback
              src={coverUrl}
              alt={activeTrack.title}
              fill
              sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
              priority
              className="object-cover"
            />

            {/* Live Equalizer Overlay on Artwork when PLAYING */}
            {isPlaying && !isBufferingOrLoading && (
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 flex items-center gap-2 shadow-xl">
                <span className="inline-flex items-end gap-[2px] h-4">
                  <span className="w-[3px] h-2.5 bg-[#00D6FF] rounded-full animate-bounce" />
                  <span className="w-[3px] h-4 bg-[#3B82F6] rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-[3px] h-3 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
                <span className="text-[10px] font-mono font-bold text-[#00D6FF]">LOSSLESS</span>
              </div>
            )}
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

          {/* Timeline Dual Progress Bar (Buffered + Played) */}
          <div className="w-full space-y-2 pt-2">
            <div className="relative h-2 w-full bg-[#282828] rounded-full overflow-hidden group cursor-pointer">
              {/* Buffered progress line */}
              <div
                className="absolute inset-y-0 left-0 bg-white/20 rounded-full transition-all"
                style={{ width: `${bufferedPercent}%` }}
              />
              {/* Played progress line */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00D6FF] via-[#3B82F6] to-[#8B5CF6] group-hover:brightness-125 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range" min={0} max={duration || 100} value={progress || 0} onChange={handleSeek}
                disabled={duration <= 0}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
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

            {/* SYNCHRONIZED Play/Pause/Spinner Button */}
            <button
              onClick={() => setPlaying(!isPlaying)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isBufferingOrLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-black" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6 fill-black text-black" />
              ) : (
                <Play className="h-6 w-6 fill-black text-black translate-x-0.5" />
              )}
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
            {isLoadingLyrics || isBufferingOrLoading ? (
              <div className="flex items-center justify-center py-20 text-[#B3B3B3]">
                <Loader2 className="h-6 w-6 animate-spin text-[#00D6FF]" />
                <span className="ml-2 text-xs font-mono">Syncing lyrics with audio...</span>
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
                          ? 'text-lg font-black text-[#00D6FF] scale-105 drop-shadow-[0_0_12px_rgba(0,214,255,0.6)]'
                          : 'text-sm font-semibold text-[#808A9D] hover:text-white'
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

        {/* ═══ MOBILE VIEW 3: QUEUE TAB (ON SMARTPHONES) ═══ */}
        <div className={`lg:hidden flex-1 w-full max-w-md my-auto py-4 overflow-y-auto ${
          activeMobileView !== 'queue' ? 'hidden' : 'block'
        }`}>
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-white">Up Next</h3>
            {queue.length === 0 ? (
              <p className="text-xs text-[#B3B3B3]">Queue is empty. Search and add songs!</p>
            ) : (
              <div className="space-y-2">
                {queue.map((t, idx) => (
                  <div
                    key={t.id + idx}
                    onClick={() => playTrack(t)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#181818] border border-[#282828] cursor-pointer hover:bg-[#222]"
                  >
                    <div className="relative h-10 w-10 rounded-xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback src={t.coverUrl || '/images/default-cover.png'} alt={t.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{t.title}</p>
                      <p className="text-[10px] text-[#B3B3B3] truncate">{t.artist.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Source Bar */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#B3B3B3] pt-2 border-t border-[#181818]">
          <span className="flex items-center gap-1.5 text-[#00D6FF]">
            <span className="h-2 w-2 rounded-full bg-[#00D6FF] animate-pulse" />
            <span>FLAC 24-bit / 96kHz Lossless</span>
          </span>

          <div className="hidden sm:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={toggleMute} className="text-[#B3B3B3] hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#282828] accent-[#00D6FF] rounded-full cursor-pointer"
            />
          </div>
        </div>
      </main>

      {/* ═══ DESKTOP RIGHT SIDE PANEL (LYRICS / QUEUE / RELATED) ═══ */}
      <aside className="hidden lg:flex flex-col w-96 h-full bg-[#0B0E14] border-l border-[#181818] p-6 space-y-6">
        
        {/* Right Panel Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-[#181818] pb-3">
          {(['Lyrics', 'Queue', 'Related'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRightTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                rightTab === tab ? 'bg-[#00D6FF] text-black shadow-md' : 'text-[#B3B3B3] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Live Synced Lyrics */}
        {rightTab === 'Lyrics' && (
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Mic2 className="h-4 w-4 text-[#00D6FF]" /> Live Synced Lyrics
            </h3>

            {isLoadingLyrics || isBufferingOrLoading ? (
              <div className="flex items-center justify-center py-24 text-[#B3B3B3]">
                <Loader2 className="h-6 w-6 animate-spin text-[#00D6FF]" />
                <span className="ml-2 text-xs font-mono">Syncing lyrics with audio...</span>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="text-center py-20 text-[#B3B3B3] space-y-2">
                <Music className="h-10 w-10 mx-auto text-[#282828]" />
                <p className="text-sm font-bold">No synced lyrics found</p>
              </div>
            ) : (
              <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto scrollbar-none space-y-4 pr-2">
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIdx;
                  return (
                    <p
                      key={idx}
                      onClick={() => { setProgress(line.time); window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: line.time } })); }}
                      className={`cursor-pointer transition-all ${
                        isActive
                          ? 'text-lg font-black text-[#00D6FF] scale-105 drop-shadow-[0_0_12px_rgba(0,214,255,0.6)]'
                          : 'text-sm font-semibold text-[#808A9D] hover:text-white'
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

        {/* Tab 2: Queue */}
        {rightTab === 'Queue' && (
          <div className="flex-1 flex flex-col space-y-3 min-h-0 overflow-y-auto">
            <h3 className="text-sm font-extrabold text-white">Up Next</h3>
            {queue.map((t, idx) => (
              <div
                key={t.id + idx}
                onClick={() => playTrack(t)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#141822] hover:bg-[#1C2232] border border-white/10 cursor-pointer transition-all"
              >
                <div className="relative h-10 w-10 rounded-xl overflow-hidden flex-shrink-0">
                  <ImageWithFallback src={t.coverUrl || '/images/default-cover.png'} alt={t.title} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{t.title}</p>
                  <p className="text-[10px] text-[#B3B3B3] truncate">{t.artist.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Related */}
        {rightTab === 'Related' && (
          <div className="flex-1 flex flex-col space-y-3 min-h-0 overflow-y-auto">
            <h3 className="text-sm font-extrabold text-white">Recommended For You</h3>
            <p className="text-xs text-[#B3B3B3]">Based on your listening history & AI preferences.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
