'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
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
import MobilePlayerView from '@/components/player/MobilePlayerView';
import AddToPlaylistModal from '@/components/player/AddToPlaylistModal';
import { resolveArtwork } from '@/utils/artwork';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

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

  const [activeTab, setActiveTab] = useState<ContextTab>('queue');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Synced Lyrics State
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : 180;

  // Canonical Track Fallback
  const track: Track = React.useMemo(() => currentTrack || {
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
  }, [currentTrack]);

  // Lock body/html scroll when Player is active and restore on unmount
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
    };
  }, []);

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
  }, [track, duration]);

  // Desktop Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setProgress(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setProgress(Math.min(displayDuration, currentTime + 5));
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          nextTrack();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          prevTrack();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          setActiveTab((prev) => (prev === 'lyrics' ? 'queue' : 'lyrics'));
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          setActiveTab((prev) => (prev === 'queue' ? 'lyrics' : 'queue'));
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
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSeek = (newTime: number) => {
    setProgress(newTime);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: newTime } }));
    }
  };

  const artworkUrl = resolveArtwork(track);

  return (
    <>
      {/* ── 1. MOBILE NOW PLAYING VIEW (< 768px) ── */}
      <div className="md:hidden w-full h-[100dvh] min-h-0 overflow-hidden">
        <MobilePlayerView
          track={track}
          lyrics={lyrics}
          lyricsLoading={lyricsLoading}
        />
      </div>

      {/* ── 2. DESKTOP NOW PLAYING VIEW (>= 768px) ── */}
      <div 
        className="hidden md:grid grid-rows-[68px_minmax(0,1fr)] w-full h-[100dvh] min-h-0 overflow-hidden text-white select-none relative font-sans bg-[#050608]"
      >
        {/* Dynamic Subtle Artwork Atmosphere */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 blur-3xl scale-110 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/80 via-transparent to-[#050608]/95 pointer-events-none" />

        {/* Top Header Bar (Fixed Row 1: 68px) */}
        <PlayerHeader
          track={track}
          activePanel={activeTab}
          onSelectPanel={(tab) => tab && setActiveTab(tab)}
          onMinimize={() => router.back()}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* Main Desktop Grid (Fixed Row 2: minmax(0, 1fr) - Zero Outer Scroll) */}
        <main className="relative z-10 min-h-0 h-full w-full px-4 sm:px-6 lg:px-8 py-2 overflow-hidden flex items-center justify-center">
          <div className="w-full max-w-6xl h-full min-h-0 grid grid-cols-12 gap-6 lg:gap-8 items-center overflow-hidden">
            
            {/* CENTER HERO PLAYER (7-8 Cols - Centered, Unclipped & Bounded) */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center h-full min-h-0 gap-[clamp(4px,1vh,12px)] max-w-xl mx-auto w-full overflow-hidden">
              
              {/* Artwork Stage (Hero 1:1 square dynamically sized to 45vh/480px) */}
              <ArtworkStage 
                track={track} 
                isPlaying={isPlaying} 
                className="w-full shrink-0"
                sizeClassName="w-[clamp(240px,45vh,480px)] aspect-square max-w-[480px] max-h-[480px]"
              />

              {/* Track Metadata (Title, Artist, Album, Actions) */}
              <TrackIdentity
                track={track}
                audioQuality={audioQuality}
                onShare={() => setShowShareModal(true)}
                onAddToPlaylist={() => setShowAddToPlaylistModal(true)}
                onOpenOptions={() => setShowOptionsSheet(true)}
                className="w-full shrink-0"
              />

              {/* Progress Timeline */}
              <ProgressTimeline
                currentTime={currentTime}
                duration={displayDuration}
                buffered={buffered}
                onSeek={handleSeek}
                className="w-full max-w-md shrink-0"
              />

              {/* Transport Playback Controls */}
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
                className="w-full max-w-md shrink-0"
              />
            </div>

            {/* RIGHT CONTEXT PANEL (4-5 Cols - Internally Scrollable Only) */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col h-full min-h-0 max-h-full w-full overflow-hidden">
              <PlayerContextPanel
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                track={track}
                isPlaying={isPlaying}
                currentTime={currentTime}
                lyrics={lyrics}
                lyricsLoading={lyricsLoading}
                onSeek={handleSeek}
                onOpenFullQueue={() => setShowQueueDrawer(true)}
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

        <PlayerOptionsSheet
          isOpen={showOptionsSheet}
          onClose={() => setShowOptionsSheet(false)}
          track={track}
          onShare={() => {
            setShowOptionsSheet(false);
            setShowShareModal(true);
          }}
        />

        <AddToPlaylistModal
          isOpen={showAddToPlaylistModal}
          onClose={() => setShowAddToPlaylistModal(false)}
          track={track}
        />
      </div>
    </>
  );
}

export default function PlayerPage() {
  return (
    <FeatureErrorBoundary featureName="Now Playing">
      <Suspense fallback={<div className="p-10 text-[#9AA1AD] text-xs animate-pulse">Loading Player...</div>}>
        <FullscreenPlayerPage />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
