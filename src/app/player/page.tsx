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
import MobilePlayerView from '@/components/player/MobilePlayerView';
import { resolveArtwork, getTrackArtwork } from '@/utils/artwork';
import { extractColorAtmosphere } from '@/utils/colorAtmosphere';
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

  const [activeTab, setActiveTab] = useState<ContextTab>('recs');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showNextUpSheet, setShowNextUpSheet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Synced Lyrics State
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : 166;

  // Canonical Track Fallback (Lemonade by Diljit Dosanjh matching User Spec & Reference)
  const track: Track = currentTrack || {
    id: 'spotify:track:lemonade-diljit',
    canonicalId: 'spotify:track:lemonade-diljit',
    source: 'spotify',
    sourceId: 'lemonade-diljit',
    title: 'Lemonade',
    artists: ['Diljit Dosanjh'],
    artist: 'Diljit Dosanjh',
    album: 'Roar',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/36/45/413645b2-bc08-b0a6-96ec-c5d0f6225b68/8902894354222.jpg/600x600bb.jpg',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/36/45/413645b2-bc08-b0a6-96ec-c5d0f6225b68/8902894354222.jpg/600x600bb.jpg',
    duration: 166,
    durationMs: 166000,
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

  const artworkUrl = resolveArtwork(track);

  return (
    <>
      {/* ── 1. MOBILE NOW PLAYING VIEW (< 768px - MUTUALLY EXCLUSIVE STATE B) ── */}
      <div className="md:hidden w-full h-[100dvh]">
        <MobilePlayerView
          track={track}
          lyrics={lyrics}
          lyricsLoading={lyricsLoading}
        />
      </div>

      {/* ── 2. DESKTOP & TABLET PLAYER VIEW (>= 768px) ── */}
      <div 
        className="hidden md:flex w-full min-h-[100dvh] h-[100dvh] text-white flex-col justify-between overflow-hidden select-none relative font-sans transition-colors duration-700 pt-safe pb-safe"
        style={{ backgroundColor: atmosphere.darkBackground }}
      >
        {/* DYNAMIC ARTWORK ATMOSPHERE */}
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

        {/* STICKY TOP HEADER BAR */}
        <PlayerHeader
          track={track}
          activePanel={activeTab}
          onSelectPanel={(tab) => tab && setActiveTab(tab)}
          onMinimize={() => router.back()}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* MAIN DESKTOP PLAYER WORKSPACE (Spacious 2-Column Desktop Grid) */}
        <main className="relative z-10 flex-1 min-h-0 overflow-y-auto scrollbar-none p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          
          {/* DESKTOP 2-COLUMN GRID (>= 768px - Max Width 1600px) */}
          <div className="w-full max-w-[1550px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
            
            {/* LEFT COLUMN: ARTWORK, TRACK INFO, SCRUBBER & HERO CONTROLS (7 Cols / 58% width) */}
            <div className="md:col-span-7 flex flex-col items-center justify-center space-y-5 max-w-[620px] mx-auto w-full">
              {/* N/OS System Header Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#292929] text-[10px] font-mono font-bold text-[#A0A0A0] uppercase tracking-[0.2em]">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                NEOTUNES N/OS • AUDIO ENGINE • HIGH-RES
              </div>

              {/* Artwork Stage */}
              <ArtworkStage track={track} isPlaying={isPlaying} className="w-full max-w-[420px] sm:max-w-[440px]" />

              {/* Track Identity (Title, Artist, Badges) */}
              <TrackIdentity
                track={track}
                audioQuality={audioQuality}
                onShare={() => setShowShareModal(true)}
                onAddToPlaylist={() => setShowQueueDrawer(true)}
                className="text-center items-center flex flex-col w-full"
              />

              {/* Real Audio Scrub Timeline */}
              <ProgressTimeline
                currentTime={currentTime}
                duration={displayDuration}
                buffered={buffered}
                onSeek={handleSeek}
                className="w-full max-w-[540px] px-2"
              />

              {/* Full Transport Playback Controls */}
              <PlaybackControls
                isPlaying={isPlaying}
                shuffle={shuffle}
                repeatMode={repeatMode}
                volume={volume}
                isMuted={isMuted}
                onTogglePlay={() => setPlaying(!isPlaying)}
                onPrev={prevTrack}
                onNext={nextTrack}
                onToggleShuffle={() => setShuffle(!shuffle)}
                onToggleRepeat={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                onVolumeChange={setVolume}
                onToggleMute={toggleMute}
                className="w-full max-w-[540px]"
              />
            </div>

            {/* RIGHT COLUMN: QUEUE, LYRICS & RECOMMENDATIONS PANEL (5 Cols / 42% width) */}
            <div className="md:col-span-5 flex flex-col h-full max-h-[640px] w-full bg-[#111111]/90 border border-[#292929] rounded-2xl overflow-hidden p-2 shadow-2xl">
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
        </main>

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
    </>
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
