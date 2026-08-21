'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import MobileLyricsSheet from './MobileLyricsSheet';
import MobileNextUpSheet from './MobileNextUpSheet';
import PlayerOptionsSheet from './PlayerOptionsSheet';
import DeviceSelectorModal from './DeviceSelectorModal';
import ShareCardModal from './ShareCardModal';
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Plus,
  Share2,
  MoreHorizontal,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Music2,
  ListMusic,
  Disc,
  Loader2,
  AlertCircle,
  Cast,
  Headphones,
  Video,
  Sparkles,
  Bookmark,
  Check,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ListPlus,
  Flame
} from 'lucide-react';

interface MobilePlayerViewProps {
  track: Track;
  lyrics: { time: number; text: string }[] | null;
  lyricsLoading: boolean;
}

const AUTOPLAY_FILTERS = ['All', 'Familiar', 'Popular', 'Discover', 'Deep cuts'];

export default function MobilePlayerView({
  track,
  lyrics,
  lyricsLoading,
}: MobilePlayerViewProps) {
  const router = useRouter();
  const {
    isPlaying,
    isLoadingStream,
    playbackStatus,
    playbackError,
    progress,
    duration,
    shuffle,
    repeatMode,
    autoplayEnabled,
    autoplayFilter,
    queue,
    setPlaying,
    nextTrack,
    prevTrack,
    setProgress,
    setShuffle,
    setRepeatMode,
    setAutoplayEnabled,
    setAutoplayFilter,
    playTrack,
    addToQueue,
  } = usePlaybackStore();

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [mediaOutputMode, setMediaOutputMode] = useState<'audio' | 'video'>('audio');
  const [showLyricsSheet, setShowLyricsSheet] = useState(false);
  const [showQueueSheet, setShowQueueSheet] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [savedSource, setSavedSource] = useState(false);

  // Touch gesture refs
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : (track.duration || 154);
  const progressPercent = displayDuration > 0 ? Math.min(100, Math.max(0, (currentTime / displayDuration) * 100)) : 0;

  const artworkUrl = resolveArtwork(track);
  const artistName = getArtistName(track.artists || track.artist);
  const albumTitle = typeof track.album === 'object' && track.album ? ((track.album as any).name || (track.album as any).title) : (track.album || 'Mi Chico');

  // Detect small screens
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerHeight <= 720);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch real recommendations based on current track
  useEffect(() => {
    if (!track?.title) return;
    let isCancelled = false;
    setLoadingRecs(true);

    const query = `${track.title} ${artistName}`;
    fetch(`/api/recommendations?query=${encodeURIComponent(query)}&genre=pop&limit=8`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          if (Array.isArray(data.tracks) && data.tracks.length > 0) {
            setRecommendations(data.tracks);
          } else if (Array.isArray(data) && data.length > 0) {
            setRecommendations(data);
          } else {
            // Fallback real tracks matching canonical music
            setRecommendations([
              {
                id: 'rec_1',
                canonicalId: 'rec_1',
                source: 'spotify',
                sourceId: 'rec_1',
                title: 'Belly Dancer',
                artists: ['Imanbek', 'BYOR'],
                artist: 'Imanbek and BYOR',
                album: 'Belly Dancer Single',
                artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
                coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
                duration: 152,
                durationMs: 152000,
                playable: true,
              },
              {
                id: 'rec_2',
                canonicalId: 'rec_2',
                source: 'spotify',
                sourceId: 'rec_2',
                title: 'FAMA',
                artists: ['HMWME'],
                artist: 'HMWME',
                album: 'FAMA Single',
                artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
                coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
                duration: 152,
                durationMs: 152000,
                playable: true,
              },
              {
                id: 'rec_3',
                canonicalId: 'rec_3',
                source: 'spotify',
                sourceId: 'rec_3',
                title: 'Softly',
                artists: ['Karan Aujla', 'Ikky'],
                artist: 'Karan Aujla & Ikky',
                album: 'Making Memories',
                artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
                coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
                duration: 155,
                durationMs: 155000,
                playable: true,
              },
            ]);
          }
          setLoadingRecs(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLoadingRecs(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [track?.title, artistName]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (newTime: number) => {
    setProgress(newTime);
    window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: newTime } }));
  };

  // Touch Gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;

    if (touchStartX.current === 0 && touchStartY.current === 0) return;

    // Horizontal Swipe (Next/Prev Track)
    if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) nextTrack();
      else prevTrack();
    }
    // Vertical Swipe Down (Collapse Now Playing)
    else if (deltaY > 110 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      router.back();
    }

    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
  };

  const isErrorState = playbackStatus === 'error';

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full min-h-[100dvh] h-[100dvh] bg-[#220408] text-white flex flex-col justify-between overflow-y-auto scrollbar-none select-none relative font-sans pt-safe pb-safe"
    >
      {/* ── 1. DYNAMIC DEEP BURGUNDY ATMOSPHERIC BACKGROUND ── */}
      {artworkUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center filter blur-[90px] opacity-25 scale-125 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-[#280509]/85 via-[#1A0306]/95 to-[#100204] pointer-events-none" />

      {/* ── 2. TOP PLAYER BAR ── */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        {/* Left: Collapse icon */}
        <button
          onClick={() => router.back()}
          className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
          aria-label="Collapse Now Playing"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Center: Media Output Switch Pill [ Headphones | Video ] */}
        <div className="flex items-center p-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setMediaOutputMode('audio')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mediaOutputMode === 'audio'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setMediaOutputMode('video')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mediaOutputMode === 'video'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Right: Cast & More icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeviceModal(true)}
            className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Cast to device"
          >
            <Cast className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowOptionsSheet(true)}
            className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── 3. MAIN NOW PLAYING STAGE ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-5 py-2 w-full max-w-[430px] mx-auto min-h-0">
        
        {/* ── CANONICAL ARTWORK STAGE (Rounded 20px, 1:1 Aspect Ratio) ── */}
        <div className="w-full flex items-center justify-center pt-2 pb-2 my-auto shrink-0">
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              setShowOptionsSheet(true);
            }}
            className="relative aspect-square w-[calc(100%-16px)] max-w-[350px] mx-auto rounded-[20px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-black/40 transition-all duration-300"
          >
            <Artwork
              source={artworkUrl}
              size="full"
              alt={track.title}
              canonicalId={track.id}
              type="track"
              className="w-full h-full object-cover select-none"
            />
          </div>
        </div>

        {/* ── TRACK IDENTITY (Title + ChevronRight + Artist) ── */}
        <div className="w-full text-left space-y-0.5 py-1 shrink-0 px-1">
          <button
            onClick={() => router.push(`/search?q=${encodeURIComponent(track.title)}`)}
            className="flex items-center gap-1.5 group text-left max-w-full"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight line-clamp-1">
              {track.title}
            </h1>
            <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
          </button>
          <p className="text-sm font-semibold text-white/70 truncate">
            {artistName}
          </p>
        </div>

        {/* ── ACTION PILL ROW ([ 👍 1.4K | 👎 ] [ 💬 9 ] [ 📑+ Save ] [ ↗ 162 ]) ── */}
        <div className="w-full flex items-center gap-2 py-2 overflow-x-auto scrollbar-none shrink-0 px-1">
          {/* Like / Dislike Combined Pill */}
          <div className="flex items-center rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold shrink-0">
            <button
              onClick={() => {
                setIsLiked(!isLiked);
                if (!isLiked) setIsDisliked(false);
              }}
              className={`px-3 py-2 flex items-center gap-1.5 rounded-l-full hover:bg-white/10 transition-colors ${
                isLiked ? 'text-[#DFFF00]' : 'text-white'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#DFFF00]' : ''}`} />
              <span>1.4K</span>
            </button>
            <span className="h-4 w-[1px] bg-white/20" />
            <button
              onClick={() => {
                setIsDisliked(!isDisliked);
                if (!isDisliked) setIsLiked(false);
              }}
              className={`px-3 py-2 rounded-r-full hover:bg-white/10 transition-colors ${
                isDisliked ? 'text-red-400' : 'text-white/80'
              }`}
            >
              <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-red-400' : ''}`} />
            </button>
          </div>

          {/* Comments */}
          <button
            onClick={() => setShowLyricsSheet(true)}
            className="px-3.5 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 hover:bg-white/15 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>9</span>
          </button>

          {/* Save */}
          <button
            onClick={() => setSavedSource(!savedSource)}
            className={`px-3.5 py-2 rounded-full border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              savedSource 
                ? 'bg-[#DFFF00]/20 border-[#DFFF00]/50 text-[#DFFF00]' 
                : 'bg-white/10 border-white/10 text-white hover:bg-white/15'
            }`}
          >
            <ListPlus className="w-4 h-4" />
            <span>Save</span>
          </button>

          {/* Share */}
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 hover:bg-white/15 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>162</span>
          </button>
        </div>

        {/* ── PLAYBACK PROGRESS SCRUBBER & TIMESTAMPS ── */}
        <div className="w-full space-y-1 py-1 shrink-0 px-1">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
              handleSeek(newPercent * displayDuration);
            }}
            className="relative py-2 cursor-pointer group"
            role="slider"
            aria-label="Seek timeline"
            aria-valuenow={currentTime}
            aria-valuemax={displayDuration}
          >
            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md pointer-events-none transition-transform scale-100 group-hover:scale-125"
              style={{ left: `calc(${progressPercent}% - 7px)` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/70 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>

        {/* ── HERO TRANSPORT PLAYBACK CONTROLS (Solid White Hero Button + Filled Skip Icons) ── */}
        <div className="w-full flex items-center justify-between py-2 px-2 shrink-0">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              shuffle ? 'text-[#DFFF00]' : 'text-white/80 hover:text-white'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-2 text-white hover:scale-105 transition-transform cursor-pointer"
            aria-label="Previous track"
          >
            <SkipBack className="w-7 h-7 fill-white text-white" />
          </button>

          <button
            onClick={() => setPlaying(!isPlaying)}
            className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black text-black" />
            ) : (
              <Play className="w-7 h-7 fill-black text-black ml-1" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-2 text-white hover:scale-105 transition-transform cursor-pointer"
            aria-label="Next track"
          >
            <SkipForward className="w-7 h-7 fill-white text-white" />
          </button>

          <button
            onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              repeatMode !== 'off' ? 'text-[#DFFF00]' : 'text-white/80 hover:text-white'
            }`}
            aria-label="Repeat"
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* ── BOTTOM DRAG HANDLE BAR & TRACK TITLE SUBTITLE ── */}
        <div
          onClick={() => setShowQueueSheet(true)}
          className="w-full pt-1 pb-2 flex flex-col items-center justify-center cursor-pointer group shrink-0"
        >
          <div className="w-10 h-1 rounded-full bg-white/40 group-hover:bg-white/60 mb-2 transition-colors" />
          <div className="text-xs font-semibold text-white/90 text-center truncate max-w-[280px]">
            {track.title}
          </div>
        </div>
      </main>

      {/* ── 4. EXPANDED / SCROLLED SECTION ── */}
      <section className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-5 shrink-0 border-t border-[#2A2A2A] bg-[#090909]">
        {/* ── PLAYING FROM HEADER ── */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold text-[#999999] uppercase tracking-[0.2em]">
              PLAYING FROM
            </div>
            <div className="text-sm font-bold text-[#F5F5F5] truncate">
              {albumTitle}
            </div>
          </div>

          <button
            onClick={() => setSavedSource(!savedSource)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              savedSource 
                ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00]' 
                : 'bg-[#161616] border-[#2A2A2A] text-[#999999] hover:text-white'
            }`}
          >
            {savedSource ? <Check className="w-3.5 h-3.5 text-[#DFFF00]" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{savedSource ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* ── CURRENT QUEUE ITEM CARD WITH ANIMATED WAVEFORM ── */}
        <div className="p-3 rounded-xl bg-[#111111] border border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-[#2A2A2A]">
              <img src={artworkUrl} alt={track.title} className="w-full h-full object-cover" />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="flex items-end gap-0.5 h-4 px-1">
                    <span className="w-0.5 bg-[#DFFF00] h-full animate-bounce rounded-full" />
                    <span className="w-0.5 bg-[#DFFF00] h-2/3 animate-bounce rounded-full delay-75" />
                    <span className="w-0.5 bg-[#DFFF00] h-4/5 animate-bounce rounded-full delay-150" />
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#F5F5F5] truncate">{track.title}</div>
              <div className="text-[11px] text-[#999999] truncate">
                {artistName} • {formatTime(displayDuration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-[#999999]">
            {isPlaying ? (
              <span className="text-[10px] font-mono font-bold text-[#DFFF00]">PLAYING</span>
            ) : (
              <Play className="w-4 h-4 text-[#999999]" />
            )}
          </div>
        </div>

        {/* ── AUTO-PLAY CONTROLS ── */}
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-[#F5F5F5] uppercase tracking-wider">AUTO-PLAY</div>
            <div className="text-[11px] text-[#999999]">Add similar music for continuous listening</div>
          </div>

          <button
            onClick={() => setAutoplayEnabled(!autoplayEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer ${
              autoplayEnabled ? 'bg-[#DFFF00]' : 'bg-[#2A2A2A]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black shadow-md transition-transform duration-300 ${
                autoplayEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* ── AUTOPLAY FILTER CHIPS ── */}
        {autoplayEnabled && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {AUTOPLAY_FILTERS.map((chip) => {
              const isSelected = autoplayFilter === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setAutoplayFilter(chip)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'bg-[#161616] text-[#999999] hover:text-white border border-[#2A2A2A]'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        )}

        {/* ── COMPACT RECOMMENDATIONS LIST ── */}
        {autoplayEnabled && (
          <div className="space-y-3 pt-2">
            <div className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.2em]">
              MORE LIKE THIS
            </div>

            <div className="space-y-2">
              {recommendations.map((rec) => {
                const recArtwork = resolveArtwork(rec);
                const recArtist = getArtistName(rec.artists || rec.artist);

                return (
                  <div
                    key={rec.id}
                    onClick={() => playTrack(rec)}
                    className="h-[76px] p-2 rounded-xl bg-[#111111] border border-[#2A2A2A] hover:border-white/30 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Artwork
                        source={recArtwork}
                        size="medium"
                        canonicalId={rec.id}
                        type="track"
                        className="h-14 w-14 rounded-lg object-cover border border-[#2A2A2A] shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#DFFF00] transition-colors truncate">
                          {rec.title}
                        </div>
                        <div className="text-[11px] text-[#999999] truncate">
                          {recArtist} • {formatTime(rec.duration || 152)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(rec);
                      }}
                      className="p-3.5 text-[#999999] hover:text-[#DFFF00] transition-colors cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Add to queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── 5. BOTTOM SHEETS & MODALS ── */}
      <MobileLyricsSheet
        isOpen={showLyricsSheet}
        onClose={() => setShowLyricsSheet(false)}
        track={track}
        lyrics={lyrics}
        lyricsLoading={lyricsLoading}
        currentTime={currentTime}
        onSeek={handleSeek}
      />

      <MobileNextUpSheet
        isOpen={showQueueSheet}
        onClose={() => setShowQueueSheet(false)}
      />

      <PlayerOptionsSheet
        isOpen={showOptionsSheet}
        onClose={() => setShowOptionsSheet(false)}
      />

      <DeviceSelectorModal
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
      />

      <ShareCardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        track={track}
      />
    </div>
  );
}
