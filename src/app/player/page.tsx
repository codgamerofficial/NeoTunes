'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
import PlayerHeader, { ContextTab } from '@/components/player/PlayerHeader';
import TrackIdentity from '@/components/player/TrackIdentity';
import ArtworkStage from '@/components/player/ArtworkStage';
import ProgressTimeline from '@/components/player/ProgressTimeline';
import PlaybackControls from '@/components/player/PlaybackControls';
import PlayerContextPanel from '@/components/player/PlayerContextPanel';
import MobileBottomSheet from '@/components/player/MobileBottomSheet';
import ImmersiveMode from '@/components/player/ImmersiveMode';
import ShareCardModal from '@/components/player/ShareCardModal';
import QueueDrawer from '@/components/player/QueueDrawer';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Synced Lyrics State
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : 260;

  // Single Canonical Track Fallback
  const track: Track = currentTrack || {
    id: 'high-rated-gabru',
    title: 'High Rated Gabru (From "Nawabzaade")',
    artist: 'Guru Randhawa',
    album: 'Bollywood Best Party Songs 2018',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    durationMs: 214000,
    sourceType: 'youtube',
  };

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
        case 'q':
        case 'Q':
          e.preventDefault();
          setActiveTab(activeTab === 'queue' ? 'lyrics' : 'queue');
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          setActiveTab(activeTab === 'equalizer' ? 'lyrics' : 'equalizer');
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
  }, [isPlaying, currentTime, displayDuration, activeTab, setPlaying, prevTrack, nextTrack, toggleMute, setProgress, router]);

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

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#05070B] text-white flex flex-col justify-between overflow-hidden select-none z-50 font-sans">
      {/* 1. STICKY TOP BAR */}
      <PlayerHeader
        track={track}
        activePanel={activeTab}
        onSelectPanel={(tab) => tab && setActiveTab(tab)}
        onMinimize={() => router.back()}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* 2. MAIN PLAYER STAGE */}
      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto scrollbar-none p-4 sm:p-6 lg:p-8 pb-36">
        
        {/* DESKTOP 3-COLUMN LAYOUT (1024px+) */}
        <div className="hidden lg:grid grid-cols-[minmax(260px,0.8fr)_minmax(420px,1.2fr)_minmax(360px,0.9fr)] gap-8 items-center h-full max-w-[1600px] mx-auto">
          {/* COLUMN 1: LEFT TRACK IDENTITY */}
          <div className="flex flex-col justify-center">
            <TrackIdentity
              track={track}
              audioQuality={audioQuality}
              onShare={() => setShowShareModal(true)}
              onAddToPlaylist={() => setShowQueueDrawer(true)}
            />
          </div>

          {/* COLUMN 2: CENTER ARTWORK */}
          <div className="flex flex-col items-center justify-center">
            <ArtworkStage track={track} isPlaying={isPlaying} />
          </div>

          {/* COLUMN 3: RIGHT TABBED CONTEXT PANEL */}
          <div className="flex flex-col h-[520px] xl:h-[600px]">
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

        {/* TABLET / LAPTOP LAYOUT (768px - 1023px) */}
        <div className="hidden md:grid lg:hidden grid-cols-12 gap-6 items-center h-full max-w-[1000px] mx-auto">
          <div className="col-span-5 flex flex-col items-center justify-center space-y-6">
            <ArtworkStage track={track} isPlaying={isPlaying} />
            <TrackIdentity
              track={track}
              audioQuality={audioQuality}
              onShare={() => setShowShareModal(true)}
              onAddToPlaylist={() => setShowQueueDrawer(true)}
            />
          </div>
          <div className="col-span-7 flex flex-col h-[500px]">
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

        {/* MOBILE DEDICATED LAYOUT (320px - 767px) */}
        <div className="md:hidden flex flex-col items-center justify-center space-y-6 text-center py-4">
          <ArtworkStage track={track} isPlaying={isPlaying} />

          <TrackIdentity
            track={track}
            audioQuality={audioQuality}
            onShare={() => setShowShareModal(true)}
            onAddToPlaylist={() => setShowQueueDrawer(true)}
            className="items-center"
          />

          <div className="w-full max-w-[340px] space-y-4 pt-2">
            <ProgressTimeline
              currentTime={currentTime}
              duration={displayDuration}
              buffered={buffered}
              onSeek={handleSeek}
            />

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
              onToggleRepeat={() =>
                setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')
              }
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
            />
          </div>
        </div>
      </main>

      {/* 3. FIXED BOTTOM PLAYER CONTROLS BAR (DESKTOP / TABLET) */}
      <footer className="hidden md:block fixed bottom-0 left-0 right-0 z-30 bg-[#07090E]/95 backdrop-blur-2xl border-t border-white/10 px-8 py-3 select-none pb-safe">
        <div className="max-w-[1600px] mx-auto flex flex-col space-y-2">
          <ProgressTimeline
            currentTime={currentTime}
            duration={displayDuration}
            buffered={buffered}
            onSeek={handleSeek}
          />

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
            onToggleRepeat={() =>
              setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')
            }
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />
        </div>
      </footer>

      {/* 4. MOBILE SWIPEABLE BOTTOM SHEET */}
      <MobileBottomSheet
        isOpen={isMobileSheetOpen}
        onToggle={() => setIsMobileSheetOpen(!isMobileSheetOpen)}
        track={track}
        isPlaying={isPlaying}
        currentTime={currentTime}
        lyrics={lyrics}
        lyricsLoading={lyricsLoading}
        onSeek={handleSeek}
      />

      {/* 5. FULLSCREEN THEATRE OVERLAY */}
      <ImmersiveMode
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />

      {/* Modals & Drawers */}
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

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Suspense } from 'react';

export default function PlayerPage() {
  return (
    <FeatureErrorBoundary featureName="Now Playing">
      <Suspense fallback={<div className="p-10 text-[#A8A7AF] text-xs font-mono animate-pulse">Loading Player...</div>}>
        <FullscreenPlayerPage />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
