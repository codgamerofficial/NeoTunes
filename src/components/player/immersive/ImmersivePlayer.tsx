'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { useArtworkColorTheme } from '@/hooks/useArtworkColorTheme';

// Modular Immersive Components
import ArtworkAmbientBackground from './ArtworkAmbientBackground';
import ArtworkHero from './ArtworkHero';
import PlayerHeader from './PlayerHeader';
import TrackMeta from './TrackMeta';
import TrackActions from './TrackActions';
import ContextPreview from './ContextPreview';
import ProgressBar from './ProgressBar';
import PrimaryPlaybackControls from './PrimaryPlaybackControls';
import VolumeControl from './VolumeControl';
import SecondaryControls from './SecondaryControls';
import QueueSheet from './QueueSheet';
import LyricsSheet from './LyricsSheet';
import DeviceSheet from './DeviceSheet';

// Extra Modals
import PlayerOptionsSheet from '@/components/player/PlayerOptionsSheet';
import AudioQualityModal from '@/components/player/AudioQualityModal';
import ShareCardModal from '@/components/player/ShareCardModal';
import AddToPlaylistModal from '@/components/player/AddToPlaylistModal';
import { Music2, Compass, Search } from 'lucide-react';

interface ImmersivePlayerProps {
  initialTrack?: Track | null;
}

export default function ImmersivePlayer({ initialTrack }: ImmersivePlayerProps) {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    setPlaying,
    nextTrack,
    prevTrack,
    setProgress,
    toggleMute,
  } = usePlaybackStore();

  // Active track (from global store or fallback prop)
  const track = currentTrack || initialTrack || null;
  const artworkUrl = track ? resolveArtwork(track) : null;

  // Adaptive Ambient Theme
  const { theme } = useArtworkColorTheme(artworkUrl, track);

  // Sheets & Modals state
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  // Synced Lyrics State
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  // Desktop side panel mode ('queue' | 'lyrics' | 'devices' | null)
  const [desktopSidePanel, setDesktopSidePanel] = useState<'queue' | 'lyrics' | 'devices' | null>(null);

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

  // Fetch real synced lyrics whenever the current track changes
  useEffect(() => {
    if (!track?.title) {
      setLyrics(null);
      return;
    }

    let isCancelled = false;
    setLyricsLoading(true);

    const title = track.title;
    const artist = getArtistName(track.artists || track.artist);
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

  // Desktop Keyboard Shortcuts
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
          setProgress(Math.max(0, progress - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setProgress(Math.min(duration || 180, progress + 5));
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
          if (window.innerWidth >= 1024) {
            setDesktopSidePanel((prev) => (prev === 'lyrics' ? null : 'lyrics'));
          } else {
            setShowLyrics((prev) => !prev);
          }
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          if (window.innerWidth >= 1024) {
            setDesktopSidePanel((prev) => (prev === 'queue' ? null : 'queue'));
          } else {
            setShowQueue((prev) => !prev);
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          e.preventDefault();
          if (desktopSidePanel) {
            setDesktopSidePanel(null);
          } else if (showQueue || showLyrics || showDevices || showOptions) {
            setShowQueue(false);
            setShowLyrics(false);
            setShowDevices(false);
            setShowOptions(false);
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
  }, [isPlaying, progress, duration, desktopSidePanel, showQueue, showLyrics, showDevices, showOptions, setPlaying, prevTrack, nextTrack, toggleMute, setProgress, router]);

  // Handle Queue toggle on Desktop vs Mobile
  const handleQueueToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setDesktopSidePanel((prev) => (prev === 'queue' ? null : 'queue'));
    } else {
      setShowQueue(true);
    }
  };

  // Handle Lyrics toggle on Desktop vs Mobile
  const handleLyricsToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setDesktopSidePanel((prev) => (prev === 'lyrics' ? null : 'lyrics'));
    } else {
      setShowLyrics(true);
    }
  };

  // Handle Device toggle on Desktop vs Mobile
  const handleDeviceToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setDesktopSidePanel((prev) => (prev === 'devices' ? null : 'devices'));
    } else {
      setShowDevices(true);
    }
  };

  // Honest Empty State when no track is currently playing
  if (!track) {
    return (
      <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none relative bg-[#050608] text-white">
        <ArtworkAmbientBackground theme={theme} />

        <div className="relative z-10 max-w-sm w-full p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#DFFF00]/15 border border-[#DFFF00]/30 flex items-center justify-center mx-auto text-[#DFFF00]">
            <Music2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-white tracking-tight">No Track Playing</h2>
            <p className="text-xs text-white/60 leading-relaxed">
              Select a song from your library, search results, or home discovery to experience the immersive player.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 rounded-xl bg-[#DFFF00] text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#c9e600] active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <Compass className="w-4 h-4" /> Discover Music
            </button>
            <button
              onClick={() => router.push('/search')}
              className="w-full py-3 px-4 rounded-xl bg-white/[0.08] text-white hover:bg-white/[0.14] font-bold text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" /> Search Songs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden relative select-none font-sans text-white bg-[#050608]">
      {/* ── 1. DYNAMIC ARTWORK-DERIVED AMBIENT ATMOSPHERE ── */}
      <ArtworkAmbientBackground artworkUrl={artworkUrl} theme={theme} />

      {/* ── 2. MOBILE IMMERSIVE VIEW (< 1024px) ── */}
      <div className="lg:hidden w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden relative z-10 pt-safe pb-safe">
        {/* Header */}
        <PlayerHeader
          onOpenDevices={handleDeviceToggle}
          onOpenOptions={() => setShowOptions(true)}
          isDesktop={false}
        />

        {/* Square Hero Artwork with intelligent shrinkage */}
        <ArtworkHero track={track} theme={theme} isDesktop={false} />

        {/* Lower Control Stack (Fixed height budget) */}
        <div className="w-full max-w-md mx-auto px-6 pb-2 pt-1 flex flex-col gap-2.5 sm:gap-3 shrink-0">
          {/* Metadata Row: Title & Artist (Left) + Like & More (Right) */}
          <div className="flex items-center justify-between gap-3 w-full">
            <TrackMeta track={track} />
            <TrackActions
              track={track}
              onOpenOptions={() => setShowOptions(true)}
            />
          </div>

          {/* Context / Lyric Preview Banner */}
          <ContextPreview
            track={track}
            lyrics={lyrics}
            lyricsLoading={lyricsLoading}
            progress={progress}
            onOpenLyrics={handleLyricsToggle}
          />

          {/* Scrubber / Progress Section */}
          <ProgressBar
            duration={duration}
            progress={progress}
            onOpenQuality={() => setShowQuality(true)}
          />

          {/* Primary Transport Controls */}
          <PrimaryPlaybackControls />

          {/* Dedicated Volume Slider */}
          <VolumeControl />

          {/* Secondary Controls Toolbar */}
          <SecondaryControls onOpenQueue={handleQueueToggle} />

          {/* Bottom Gesture Bar Indicator */}
          <div className="w-32 h-1 bg-white/25 rounded-full mx-auto mt-0.5 shrink-0 pointer-events-none" />
        </div>
      </div>

      {/* ── 3. DESKTOP IMMERSIVE VIEW (>= 1024px) ── */}
      <div className="hidden lg:flex w-full h-[100dvh] max-h-[100dvh] overflow-hidden relative z-10 flex-col">
        {/* Desktop Top Header Bar */}
        <PlayerHeader
          onOpenDevices={handleDeviceToggle}
          onOpenOptions={() => setShowOptions(true)}
          isDesktop={true}
        />

        {/* Main Desktop Layout Grid (Fluid Central Player + Optional Right Context Panel) */}
        <div className="flex-1 min-h-0 w-full px-6 xl:px-12 py-3 flex items-center justify-center gap-8 xl:gap-12 overflow-hidden">
          
          {/* Central Hero Player Container */}
          <div className="flex-1 max-w-2xl h-full min-h-0 flex flex-col items-center justify-center gap-3 xl:gap-4 overflow-hidden">
            {/* Desktop Hero Artwork (420-520px) */}
            <ArtworkHero track={track} theme={theme} isDesktop={true} />

            {/* Desktop Track Meta & Actions */}
            <div className="w-full max-w-lg flex items-center justify-between gap-4 shrink-0 px-2">
              <TrackMeta track={track} />
              <TrackActions
                track={track}
                onOpenOptions={() => setShowOptions(true)}
              />
            </div>

            {/* Desktop Context / Lyric Snippet */}
            <div className="w-full max-w-lg shrink-0 px-2">
              <ContextPreview
                track={track}
                lyrics={lyrics}
                lyricsLoading={lyricsLoading}
                progress={progress}
                onOpenLyrics={handleLyricsToggle}
              />
            </div>

            {/* Desktop Progress Timeline */}
            <div className="w-full max-w-lg shrink-0 px-2">
              <ProgressBar
                duration={duration}
                progress={progress}
                onOpenQuality={() => setShowQuality(true)}
              />
            </div>

            {/* Desktop Primary Playback Controls */}
            <div className="w-full max-w-lg shrink-0">
              <PrimaryPlaybackControls />
            </div>

            {/* Desktop Volume Slider */}
            <div className="w-full max-w-md shrink-0">
              <VolumeControl />
            </div>

            {/* Desktop Secondary Controls */}
            <div className="w-full max-w-md shrink-0">
              <SecondaryControls onOpenQueue={handleQueueToggle} />
            </div>
          </div>

          {/* Optional Right Dockable Context Panel for Desktop */}
          {desktopSidePanel && (
            <div className="w-96 xl:w-[420px] h-[88%] min-h-0 shrink-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 backdrop-blur-2xl transition-all duration-300">
              {desktopSidePanel === 'queue' && (
                <QueueSheet
                  isOpen={true}
                  onClose={() => setDesktopSidePanel(null)}
                  inline={true}
                />
              )}
              {desktopSidePanel === 'lyrics' && (
                <LyricsSheet
                  isOpen={true}
                  onClose={() => setDesktopSidePanel(null)}
                  track={track}
                  lyrics={lyrics}
                  lyricsLoading={lyricsLoading}
                  currentTime={progress}
                  onSeek={(time) => setProgress(time)}
                  inline={true}
                />
              )}
              {desktopSidePanel === 'devices' && (
                <DeviceSheet
                  isOpen={true}
                  onClose={() => setDesktopSidePanel(null)}
                  inline={true}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. GLOBAL OVERLAY SHEETS (PORTALED OUTSIDE SIDEBAR) ── */}
      {/* Mobile Queue Sheet */}
      <QueueSheet
        isOpen={showQueue}
        onClose={() => setShowQueue(false)}
      />

      {/* Mobile Lyrics Sheet */}
      <LyricsSheet
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        track={track}
        lyrics={lyrics}
        lyricsLoading={lyricsLoading}
        currentTime={progress}
        onSeek={(time) => setProgress(time)}
      />

      {/* Mobile Device Selector Sheet */}
      <DeviceSheet
        isOpen={showDevices}
        onClose={() => setShowDevices(false)}
      />

      {/* Additional Overlays */}
      <PlayerOptionsSheet
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        track={track}
        onShare={() => {
          setShowOptions(false);
          setShowShare(true);
        }}
      />

      <AudioQualityModal
        isOpen={showQuality}
        onClose={() => setShowQuality(false)}
      />

      <ShareCardModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        track={track}
      />

      <AddToPlaylistModal
        isOpen={showAddToPlaylist}
        onClose={() => setShowAddToPlaylist(false)}
        track={track}
      />
    </div>
  );
}
