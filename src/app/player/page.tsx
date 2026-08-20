'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import PlayerHeader, { ContextTab } from '@/components/player/PlayerHeader';
import TrackIdentity from '@/components/player/TrackIdentity';
import ArtworkStage from '@/components/player/ArtworkStage';
import ProgressTimeline from '@/components/player/ProgressTimeline';
import PlaybackControls from '@/components/player/PlaybackControls';
import PlayerContextPanel from '@/components/player/PlayerContextPanel';
import ImmersiveMode from '@/components/player/ImmersiveMode';
import ShareCardModal from '@/components/player/ShareCardModal';
import QueueDrawer from '@/components/player/QueueDrawer';
import PlayerOptionsSheet from '@/components/player/PlayerOptionsSheet';
import MobileNextUpSheet from '@/components/player/MobileNextUpSheet';
import { getTrackArtwork } from '@/utils/artwork';
import { extractColorAtmosphere } from '@/utils/colorAtmosphere';
import { 
  ChevronDown, 
  FileText, 
  Heart, 
  SkipBack, 
  SkipForward, 
  Play, 
  Pause, 
  Repeat, 
  Download, 
  MoreVertical,
  Volume2,
  VolumeX
} from 'lucide-react';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Suspense } from 'react';

function FullscreenPlayerPage() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    progress,
    buffered,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    audioQuality,
    setPlaying,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    setProgress,
    setShuffle,
    setRepeatMode,
  } = usePlaybackStore();

  const [activeTab, setActiveTab] = useState<ContextTab>('lyrics');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showNextUpSheet, setShowNextUpSheet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(true);

  // Synced Lyrics State
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : 196;

  // Canonical Track Fallback (Maney Na by Nish matching User Spec & Screenshots)
  const track: Track = currentTrack || {
    id: 'spotify:track:maney-na',
    canonicalId: 'spotify:track:maney-na',
    source: 'spotify',
    sourceId: 'maney-na',
    title: 'Maney Na',
    artists: ['Nish'],
    artist: 'Nish',
    album: 'The Homecoming - EP',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/10/8d/62/108d62ce-38b4-09ec-a9b0-994c502b4d99/8902894354222.jpg/600x600bb.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/10/8d/62/108d62ce-38b4-09ec-a9b0-994c502b4d99/8902894354222.jpg/600x600bb.jpg',
    duration: 196,
    durationMs: 196000,
    playable: true,
  };

  // Extract Dynamic Color Atmosphere for "NEO AURORA MUSIC" Design System
  const atmosphere = extractColorAtmosphere(track);

  // Fetch real synced lyrics for canonical track
  useEffect(() => {
    if (!track?.title) return;
    let isCancelled = false;
    setLyricsLoading(true);

    const title = track.title;
    const artist = getArtistName(track.artist);
    const durationMs = (track as any).durationMs || (duration ? duration * 1000 : 0);

    fetch(
      `/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(
        artist
      )}&durationMs=${durationMs}`
    )
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
  }, [track?.title, track?.artist, duration]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) prevTrack();
          else setProgress(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) nextTrack();
          else setProgress(Math.min(displayDuration, currentTime + 5));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            router.back();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, displayDuration, setPlaying, prevTrack, nextTrack, toggleMute, setProgress, router]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSeek = (newTime: number) => {
    setProgress(newTime);
    window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: newTime } }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const artworkUrl = getTrackArtwork(track);
  const artistName = getArtistName(track.artist);

  return (
    <div 
      className="w-full min-h-[100dvh] h-[100dvh] text-white flex flex-col justify-between overflow-hidden select-none relative font-sans transition-colors duration-700 pt-safe pb-safe"
      style={{ backgroundColor: atmosphere.darkBackground }}
    >
      {/* ── DYNAMIC ARTWORK ATMOSPHERE (NEO AURORA GLOW - Spec 125) ── */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-125 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${artworkUrl})` }}
      />
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${atmosphere.primary}33 0%, ${atmosphere.secondary}15 50%, transparent 80%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 pointer-events-none" />

      {/* 1. STICKY TOP HEADER BAR (DESKTOP & TABLET - Spec 108 & 109) */}
      <div className="hidden md:block">
        <PlayerHeader
          track={track}
          activePanel={activeTab}
          onSelectPanel={(tab) => tab && setActiveTab(tab)}
          onMinimize={() => router.back()}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      </div>

      {/* MOBILE TOP HEADER BAR */}
      <div className="md:hidden relative z-20 flex items-center justify-between px-5 pt-4 pb-2">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Minimize player"
        >
          <ChevronDown className="w-7 h-7" />
        </button>

        <span className="text-[10px] font-mono font-black text-[#00D4FF] tracking-[0.2em] uppercase">
          NOW PLAYING
        </span>

        <button 
          onClick={() => setActiveTab(activeTab === 'lyrics' ? 'queue' : 'lyrics')}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/90 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          aria-label="Open Synced Lyrics"
        >
          <FileText className="w-5 h-5 text-white/90" />
        </button>
      </div>

      {/* 2. MAIN PLAYER WORKSPACE (Spec 92 & 93) */}
      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden scrollbar-none p-4 sm:p-6 lg:p-8">
        
        {/* DESKTOP 2-COLUMN GRID (>= 1280px - Spec 93) */}
        <div className="hidden xl:grid grid-cols-[minmax(0,1fr)_minmax(340px,420px)] gap-10 items-center h-full max-w-[1500px] mx-auto">
          {/* COLUMN 1: MAIN PLAYER STAGE (ARTWORK + METADATA) */}
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-5 max-w-[540px] mx-auto w-full">
            <ArtworkStage track={track} isPlaying={isPlaying} />
            <TrackIdentity
              track={track}
              audioQuality={audioQuality}
              onShare={() => setShowShareModal(true)}
              onAddToPlaylist={() => setShowQueueDrawer(true)}
              className="text-center items-center flex flex-col"
            />
          </div>

          {/* COLUMN 2: RIGHT TABBED SIDE PANEL (Spec 94) */}
          <div className="flex flex-col h-full max-h-[580px] w-full">
            <PlayerContextPanel
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              track={track}
              isPlaying={isPlaying}
              currentTime={currentTime}
              lyrics={lyrics}
              lyricsLoading={lyricsLoading}
              onSeek={handleSeek}
            />
          </div>
        </div>

        {/* LAPTOP / TABLET LAYOUT (768px - 1279px - Spec 95) */}
        <div className="hidden md:grid xl:hidden grid-cols-12 gap-6 items-center h-full max-w-[1100px] mx-auto">
          <div className="col-span-6 flex flex-col items-center justify-center space-y-6">
            <ArtworkStage track={track} isPlaying={isPlaying} />
            <TrackIdentity
              track={track}
              audioQuality={audioQuality}
              onShare={() => setShowShareModal(true)}
              onAddToPlaylist={() => setShowQueueDrawer(true)}
            />
          </div>
          <div className="col-span-6 flex flex-col h-[480px]">
            <PlayerContextPanel
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              track={track}
              isPlaying={isPlaying}
              currentTime={currentTime}
              lyrics={lyrics}
              lyricsLoading={lyricsLoading}
              onSeek={handleSeek}
            />
          </div>
        </div>

        {/* MOBILE RESPONSIVE LAYOUT (< 768px - Spec 120, 121, 122) */}
        <div className="md:hidden flex flex-col items-center justify-between h-full max-w-[380px] mx-auto px-4 py-2 space-y-4">
          
          {/* MOBILE ALBUM COVER ARTWORK STAGE (Spec 121) */}
          <div className="w-full aspect-square max-w-[min(78vw,340px)] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/15 relative group bg-black/40 my-auto shrink-0">
            <Artwork 
              source={artworkUrl} 
              size="full"
              alt={track.title} 
              canonicalId={track.id}
              type="track"
              className="w-full h-full object-cover"
            />
          </div>

          {/* TRACK TITLE & ARTIST NAME */}
          <div className="w-full text-center space-y-1 pt-1">
            <h1 className="text-2xl font-black text-white tracking-wide truncate max-w-[340px] mx-auto">
              {track.title}
            </h1>
            <p className="text-sm font-semibold text-[#00D4FF] truncate">
              {artistName}
            </p>
          </div>

          {/* PROGRESS TIMELINE SCRUBBER (Spec 103 & 104) */}
          <div className="w-full space-y-2 pt-1">
            <input
              type="range"
              min="0"
              max={displayDuration}
              step="1"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
            />
            <div className="flex items-center justify-between text-xs font-mono text-white/70 font-semibold px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(displayDuration)}</span>
            </div>
          </div>

          {/* CENTERED PLAYBACK CONTROLS (Spec 105 & 106) */}
          <div className="w-full flex items-center justify-between px-2 pt-1">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Like track"
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'text-[#FF2E9A] fill-[#FF2E9A]' : ''}`} />
            </button>

            <button 
              onClick={prevTrack}
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous Track"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            {/* Play/Pause Button (56-68px Mobile - Spec 106) */}
            <button 
              onClick={() => setPlaying(!isPlaying)}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00D9FF] via-[#6D3BFF] to-[#FF2D9A] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white fill-white" />
              ) : (
                <Play className="w-7 h-7 text-white fill-white ml-0.5" />
              )}
            </button>

            <button 
              onClick={nextTrack}
              className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Next Track"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>

            <button 
              onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
              className={`p-2 transition-colors cursor-pointer ${repeatMode !== 'off' ? 'text-[#00D9FF]' : 'text-white/70 hover:text-white'}`}
              aria-label="Repeat mode"
            >
              <Repeat className="w-6 h-6" />
            </button>
          </div>

          {/* SECONDARY CONTROLS */}
          <div className="w-full flex items-center justify-between px-2 pt-1 pb-1">
            <button 
              className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Download song"
            >
              <Download className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setShowOptionsSheet(true)}
              className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Player Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* 3. MOBILE NEXT UP DRAG HANDLE BUTTON */}
      <div 
        onClick={() => setShowNextUpSheet(true)}
        className="md:hidden relative z-20 pb-4 pt-2 flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white cursor-pointer transition-colors border-t border-white/5"
      >
        <div className="w-10 h-1 bg-white/30 rounded-full" />
        <span className="text-xs font-bold tracking-wide">Next Up</span>
      </div>


      {/* 5. PLAYER OPTIONS BOTTOM SHEET */}
      <PlayerOptionsSheet 
        isOpen={showOptionsSheet}
        onClose={() => setShowOptionsSheet(false)}
      />

      {/* 6. NEXT UP QUEUE BOTTOM SHEET */}
      <MobileNextUpSheet 
        isOpen={showNextUpSheet}
        onClose={() => setShowNextUpSheet(false)}
      />

      {/* Modals & Overlays */}
      <ImmersiveMode
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />

      <ShareCardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        track={track}
      />

      <QueueDrawer
        isOpen={showQueueDrawer}
        onClose={() => setShowQueueDrawer(false)}
      />
    </div>
  );
}

export default function PlayerPage() {
  return (
    <FeatureErrorBoundary featureName="Now Playing">
      <Suspense fallback={<div className="p-10 text-[#9298A8] text-xs font-mono animate-pulse">Loading Player...</div>}>
        <FullscreenPlayerPage />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
