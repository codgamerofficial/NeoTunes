'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';
import PlayerHeader from '@/components/player/PlayerHeader';
import TrackIdentity from '@/components/player/TrackIdentity';
import ArtworkStage from '@/components/player/ArtworkStage';
import ProgressTimeline from '@/components/player/ProgressTimeline';
import PlaybackControls from '@/components/player/PlaybackControls';
import PlayerContextPanel, { ContextTab } from '@/components/player/PlayerContextPanel';
import ShareCardModal from '@/components/player/ShareCardModal';
import QueueDrawer from '@/components/player/QueueDrawer';

export default function FullscreenPlayerPage() {
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

  // Synced Lyrics State
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : 260;

  // Single Canonical Track Fallback
  const track: Track = currentTrack || {
    id: 'tere-pyaar-mein',
    title: 'Tere Pyaar Mein',
    artist: 'Pritam, Arijit Singh & Nikhita Gandhi',
    album: 'Tu Jhoothi Main Makkaar',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    durationMs: 265000,
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
      // Ignore if user is typing in an input or textarea
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
    <div className="fixed inset-0 w-full h-screen bg-[#07090E] text-white flex flex-col justify-between overflow-hidden select-none z-50 font-sans">
      {/* Floating Header */}
      <PlayerHeader
        track={track}
        activePanel={activeTab}
        onSelectPanel={(tab) => tab && setActiveTab(tab)}
        onMinimize={() => router.back()}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* Main Three-Zone Stage */}
      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto scrollbar-none p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full max-w-[1600px] mx-auto">
          {/* ZONE 1: LEFT TRACK IDENTITY (Desktop) */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col justify-center">
            <TrackIdentity
              track={track}
              audioQuality={audioQuality}
              onShare={() => setShowShareModal(true)}
              onAddToPlaylist={() => setShowQueueDrawer(true)}
            />
          </div>

          {/* ZONE 2: CENTER ARTWORK & PLAYBACK CONTROLS */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-center justify-center space-y-6">
            <ArtworkStage track={track} isPlaying={isPlaying} />

            <div className="w-full max-w-[500px] space-y-4">
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

          {/* ZONE 3: RIGHT CONTEXT PANEL SYSTEM */}
          <div className="lg:col-span-4 order-3 flex flex-col h-[480px] lg:h-[580px]">
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
