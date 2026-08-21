'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import MobileLyricsSheet from './MobileLyricsSheet';
import PlayerOptionsSheet from './PlayerOptionsSheet';
import DeviceSelectorModal from './DeviceSelectorModal';
import ShareCardModal from './ShareCardModal';
import QueueDrawer from './QueueDrawer';
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
  Cast,
  Headphones,
  Video,
  Check,
  Sparkles
} from 'lucide-react';

interface MobilePlayerViewProps {
  track: Track;
  lyrics: { time: number; text: string }[] | null;
  lyricsLoading: boolean;
}

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
    progress,
    duration,
    shuffle,
    repeatMode,
    autoplayEnabled,
    queue,
    setPlaying,
    nextTrack,
    prevTrack,
    setProgress,
    setShuffle,
    setRepeatMode,
    setAutoplayEnabled,
    playTrack,
    addToQueue,
  } = usePlaybackStore();

  const [isLiked, setIsLiked] = useState(false);
  const [mediaOutputMode, setMediaOutputMode] = useState<'audio' | 'video'>('audio');
  const [showLyricsSheet, setShowLyricsSheet] = useState(false);
  const [showQueueSheet, setShowQueueSheet] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
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
  const albumTitle = typeof track.album === 'object' && track.album ? ((track.album as any).name || (track.album as any).title) : (track.album || 'Drive Thru');

  // Handle Keyboard Escape key to dismiss full player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showQueueSheet) setShowQueueSheet(false);
        else if (showLyricsSheet) setShowLyricsSheet(false);
        else if (showOptionsSheet) setShowOptionsSheet(false);
        else if (showDeviceModal) setShowDeviceModal(false);
        else if (showShareModal) setShowShareModal(false);
        else router.back();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQueueSheet, showLyricsSheet, showOptionsSheet, showDeviceModal, showShareModal, router]);

  // Fetch recommendations based on current track
  useEffect(() => {
    if (!track?.title) return;
    let isCancelled = false;

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
            // Fallback canonical recommendations
            setRecommendations([
              {
                id: 'rec_belly',
                canonicalId: 'rec_belly',
                source: 'spotify',
                sourceId: 'rec_belly',
                title: 'Belly Dancer',
                artists: ['Imanbek', 'BYOR'],
                artist: 'Imanbek and BYOR',
                album: 'Belly Dancer Single',
                artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
                duration: 152,
                durationMs: 152000,
                playable: true,
              },
              {
                id: 'rec_fama',
                canonicalId: 'rec_fama',
                source: 'spotify',
                sourceId: 'rec_fama',
                title: 'FAMA',
                artists: ['HMWME'],
                artist: 'HMWME',
                album: 'FAMA Single',
                artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
                duration: 152,
                durationMs: 152000,
                playable: true,
              },
              {
                id: 'rec_softly',
                canonicalId: 'rec_softly',
                source: 'spotify',
                sourceId: 'rec_softly',
                title: 'Softly',
                artists: ['Karan Aujla', 'Ikky'],
                artist: 'Karan Aujla & Ikky',
                album: 'Making Memories',
                artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
                duration: 155,
                durationMs: 155000,
                playable: true,
              },
            ]);
          }
        }
      })
      .catch(() => {});

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

    if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) nextTrack();
      else prevTrack();
    } else if (deltaY > 110 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      router.back();
    }

    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
  };

  const nextQueueItems = queue.slice(1, 4);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col justify-between overflow-y-auto scrollbar-none select-none relative font-sans pt-safe pb-12"
    >
      {/* ── 1. SUBTLE ATMOSPHERIC BACKDROP ── */}
      {artworkUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center filter blur-[60px] opacity-[0.06] scale-110 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
      )}

      {/* ── 2. TOP PLAYER BAR (N/OS Monochromatic) ── */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 shrink-0 max-w-2xl mx-auto w-full">
        {/* Left: Real Minimize button [ ↓ ] */}
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-[#101010] border border-[#292929] text-[#F5F5F5] hover:bg-white/10 active:scale-95 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Minimize player"
          title="Minimize player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Center: Media Output Switch Pill [ AUDIO | VIDEO ] */}
        <div className="flex items-center p-1 rounded-full bg-[#101010] border border-[#292929]">
          <button
            onClick={() => setMediaOutputMode('audio')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
              mediaOutputMode === 'audio'
                ? 'bg-white/15 text-[#F5F5F5] border border-white/20'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-[#DFFF00]" />
            <span>AUDIO</span>
          </button>
          <button
            onClick={() => setMediaOutputMode('video')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
              mediaOutputMode === 'video'
                ? 'bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/40'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>VIDEO</span>
          </button>
        </div>

        {/* Right: Cast & More icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeviceModal(true)}
            className="p-2.5 rounded-full bg-[#101010] border border-[#292929] text-[#F5F5F5] hover:bg-white/10 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Cast to device"
          >
            <Cast className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowOptionsSheet(true)}
            className="p-2.5 rounded-full bg-[#101010] border border-[#292929] text-[#F5F5F5] hover:bg-white/10 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── 3. MAIN NOW PLAYING STAGE ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 py-2 w-full max-w-md mx-auto min-h-0 space-y-4">
        
        {/* ── ARTWORK STAGE (340px Max Width, 14px Border Radius, 1:1 Ratio) ── */}
        <div className="w-full flex items-center justify-center pt-2 pb-2 my-auto shrink-0">
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              setShowOptionsSheet(true);
            }}
            className="relative aspect-square w-full max-w-[340px] rounded-[14px] overflow-hidden border border-[#292929] bg-[#101010] transition-all duration-300 shadow-2xl"
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

        {/* ── TRACK IDENTITY & CANONICAL METADATA ── */}
        <div className="w-full text-left space-y-1 py-1 shrink-0 px-2">
          <div className="text-[10px] font-mono font-bold text-[#A0A0A0] uppercase tracking-[0.2em]">
            {track.source === 'youtube' ? 'SOURCE // YOUTUBE' : `PLAYING FROM // ${albumTitle.toUpperCase()}`}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] tracking-tight line-clamp-2">
            {track.title}
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#A0A0A0] truncate">
            {artistName}
          </p>
        </div>

        {/* ── COMPACT ACTION TOOLBAR ── */}
        <div className="w-full flex items-center gap-2 py-1 overflow-x-auto scrollbar-none shrink-0 px-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`px-3.5 py-2 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px] ${
              isLiked 
                ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00]' 
                : 'bg-[#101010] border-[#292929] text-[#A0A0A0] hover:text-white'
            }`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#DFFF00]' : ''}`} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          <button
            onClick={() => setShowLyricsSheet(true)}
            className="px-3.5 py-2 rounded-full bg-[#101010] border border-[#292929] text-[#A0A0A0] hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px]"
            aria-label="Lyrics"
          >
            <Music2 className="w-4 h-4 text-[#DFFF00]" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setSavedSource(!savedSource)}
            className={`px-3.5 py-2 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px] ${
              savedSource 
                ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00]' 
                : 'bg-[#101010] border-[#292929] text-[#A0A0A0] hover:text-white'
            }`}
            aria-label={savedSource ? 'Saved to library' : 'Save to library'}
          >
            {savedSource ? <Check className="w-4 h-4 text-[#DFFF00]" /> : <Plus className="w-4 h-4" />}
            <span>{savedSource ? 'Saved ✓' : 'Save'}</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-2 rounded-full bg-[#101010] border border-[#292929] text-[#A0A0A0] hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px]"
            aria-label="Share track"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setShowOptionsSheet(true)}
            className="px-3.5 py-2 rounded-full bg-[#101010] border border-[#292929] text-[#A0A0A0] hover:text-white text-xs font-mono font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer min-h-[44px]"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* ── PLAYBACK PROGRESS SCRUBBER ── */}
        <div className="w-full space-y-1 py-1 shrink-0 px-2">
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
            <div className="h-1 w-full bg-[#292929] rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[#DFFF00] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md pointer-events-none transition-transform scale-100 group-hover:scale-125"
              style={{ left: `calc(${progressPercent}% - 7px)` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#A0A0A0]">
            <span className="text-[#DFFF00]">{formatTime(currentTime)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>

        {/* ── HERO TRANSPORT CONTROLS ── */}
        <div className="w-full flex items-center justify-between py-2 px-4 shrink-0 max-w-sm mx-auto">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`p-3 rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
              shuffle ? 'text-[#DFFF00] bg-[#DFFF00]/15 border border-[#DFFF00]/40' : 'text-[#A0A0A0] hover:text-white'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="p-3 text-[#F5F5F5] hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Previous track"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={() => setPlaying(!isPlaying)}
            className="h-16 w-16 rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-black text-black" />
            ) : (
              <Play className="w-6 h-6 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-3 text-[#F5F5F5] hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Next track"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
            className={`p-3 rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
              repeatMode !== 'off' ? 'text-[#DFFF00] bg-[#DFFF00]/15 border border-[#DFFF00]/40' : 'text-[#A0A0A0] hover:text-white'
            }`}
            aria-label="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* ── 4. LOWER EXPANDED DETAILS & QUEUE ENTRY ── */}
      <section className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-6 shrink-0 border-t border-[#292929] bg-[#0A0A0A] mt-4">
        
        {/* PLAYING FROM HEADER */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-mono font-bold text-[#A0A0A0] uppercase tracking-[0.2em]">
              PLAYING FROM
            </div>
            <div className="text-sm font-bold text-[#F5F5F5] truncate">
              {albumTitle}
            </div>
          </div>

          <button
            onClick={() => setSavedSource(!savedSource)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
              savedSource 
                ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00]' 
                : 'bg-[#101010] border-[#292929] text-[#A0A0A0] hover:text-white'
            }`}
          >
            {savedSource ? <Check className="w-3.5 h-3.5 text-[#DFFF00]" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{savedSource ? 'Saved ✓' : 'Save'}</span>
          </button>
        </div>

        {/* UP NEXT SECTION WITH VIEW QUEUE ACTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-[#F5F5F5] uppercase tracking-wider">UP NEXT</div>
              <div className="text-[11px] text-[#A0A0A0]">{queue.length > 1 ? `${queue.length - 1} tracks in queue` : 'No upcoming tracks'}</div>
            </div>

            <button
              onClick={() => setShowQueueSheet(true)}
              className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-mono font-bold text-[#DFFF00] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>View queue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {nextQueueItems.length > 0 && (
            <div className="space-y-2">
              {nextQueueItems.map((item, index) => (
                <div
                  key={item.id + '_' + index}
                  onClick={() => playTrack(item)}
                  className="h-[72px] p-2 rounded-xl bg-[#101010] border border-[#292929] hover:border-white/30 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Artwork
                      source={resolveArtwork(item)}
                      size="medium"
                      canonicalId={item.id}
                      type="track"
                      className="h-12 w-12 rounded-lg object-cover border border-[#292929] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#DFFF00] transition-colors truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#A0A0A0] truncate">
                        {getArtistName(item.artists || item.artist)} • {formatTime(item.duration || 152)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold text-[#A0A0A0] px-2">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AUTOPLAY TOGGLE */}
        <div className="flex items-center justify-between pt-2 border-t border-[#292929]">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-[#F5F5F5] uppercase tracking-wider">AUTO-PLAY</div>
            <div className="text-[11px] text-[#A0A0A0]">Similar music after queue</div>
          </div>

          <button
            onClick={() => setAutoplayEnabled(!autoplayEnabled)}
            className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer ${
              autoplayEnabled 
                ? 'bg-[#DFFF00] text-black border-[#DFFF00] font-extrabold' 
                : 'bg-[#101010] text-[#A0A0A0] border-[#292929]'
            }`}
            aria-label="Toggle autoplay"
          >
            {autoplayEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* MORE LIKE THIS / RECOMMENDATIONS (72-80px COMPACT ROWS) */}
        {recommendations.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-[#292929]">
            <h3 className="text-xs font-mono font-bold text-[#F5F5F5] uppercase tracking-wider">
              MORE LIKE THIS
            </h3>

            <div className="space-y-2">
              {recommendations.slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  className="h-[76px] p-2 rounded-xl bg-[#101010] border border-[#292929] hover:border-white/20 flex items-center justify-between transition-all group"
                >
                  <div 
                    onClick={() => playTrack(rec)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <Artwork
                      source={resolveArtwork(rec)}
                      size="medium"
                      canonicalId={rec.id}
                      type="track"
                      className="h-12 w-12 rounded-lg object-cover border border-[#292929] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#DFFF00] transition-colors truncate">
                        {rec.title}
                      </div>
                      <div className="text-[11px] text-[#A0A0A0] truncate">
                        {getArtistName(rec.artists || rec.artist)} • {formatTime(rec.duration || 152)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addToQueue(rec)}
                    className="p-2 rounded-full bg-white/5 hover:bg-[#DFFF00] hover:text-black text-[#A0A0A0] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Add to queue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* ── MODALS & SHEETS ── */}
      <QueueDrawer isOpen={showQueueSheet} onClose={() => setShowQueueSheet(false)} />
      <MobileLyricsSheet isOpen={showLyricsSheet} onClose={() => setShowLyricsSheet(false)} track={track} lyrics={lyrics} lyricsLoading={lyricsLoading} currentTime={currentTime} onSeek={handleSeek} />
      <PlayerOptionsSheet isOpen={showOptionsSheet} onClose={() => setShowOptionsSheet(false)} />
      <DeviceSelectorModal isOpen={showDeviceModal} onClose={() => setShowDeviceModal(false)} />
      <ShareCardModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} track={track} />

    </div>
  );
}
