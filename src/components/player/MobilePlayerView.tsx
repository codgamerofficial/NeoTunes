'use client';

import React, { useState, useEffect } from 'react';
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
  Cast,
  Headphones,
  Video,
  Check,
  ListMusic
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
  const [savedSource, setSavedSource] = useState(false);

  const currentTime = progress;
  const displayDuration = duration > 0 ? duration : (track.duration || 154);
  const progressPercent = displayDuration > 0 ? Math.min(100, Math.max(0, (currentTime / displayDuration) * 100)) : 0;

  const artworkUrl = resolveArtwork(track);
  const artistName = getArtistName(track.artists || track.artist);
  const albumTitle = typeof track.album === 'object' && track.album ? ((track.album as any).name || (track.album as any).title) : (track.album || 'Single');

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

  const nextQueueItems = queue.slice(1, 4);

  return (
    <div className="w-full min-h-screen bg-[#050608] text-[#F5F5F7] flex flex-col justify-between overflow-y-auto scrollbar-none select-none relative font-sans pt-safe pb-16">
      
      {/* ── 1. SUBTLE ATMOSPHERIC BACKDROP ── */}
      {artworkUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center filter blur-[70px] opacity-[0.12] scale-110 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
      )}

      {/* ── 2. TOP PLAYER BAR (Minimize, Audio/Video Switch, Cast, More) ── */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 shrink-0 max-w-2xl mx-auto w-full">
        {/* Left: Minimize button [ ⌄ ] */}
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Minimize player"
          title="Minimize player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Center: Media Output Switch Pill [ AUDIO | VIDEO ] */}
        <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/10">
          <button
            onClick={() => setMediaOutputMode('audio')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
              mediaOutputMode === 'audio'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-[#A1A1A6] hover:text-white'
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
                : 'text-[#A1A1A6] hover:text-white'
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
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Cast to device"
            title="Audio Devices"
          >
            <Cast className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowOptionsSheet(true)}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="More options"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── 3. MAIN NOW PLAYING STAGE ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 py-2 w-full max-w-md mx-auto min-h-0 space-y-4">
        
        {/* ── ARTWORK STAGE (Max 340-380dp, Rounded 24px, 1:1 Aspect Ratio) ── */}
        <div className="w-full flex items-center justify-center pt-2 pb-2 my-auto shrink-0">
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              setShowOptionsSheet(true);
            }}
            className="relative aspect-square w-full max-w-[340px] rounded-[24px] overflow-hidden border border-white/15 bg-white/5 transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.7)]"
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

        {/* ── TRACK IDENTITY & METADATA ── */}
        <div className="w-full text-left space-y-1 py-1 shrink-0 px-2">
          <div className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.2em]">
            PLAYING FROM · {albumTitle.toUpperCase()}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight line-clamp-2">
            {track.title}
          </h1>
          <p className="text-sm font-medium text-[#A1A1A6] truncate">
            {artistName}
          </p>
        </div>

        {/* ── NON-CLIPPED ACTION TOOLBAR (5 Responsive Actions) ── */}
        <div className="w-full flex items-center justify-between gap-2 py-1 shrink-0 px-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`px-3 py-2 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px] ${
              isLiked 
                ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00]' 
                : 'bg-white/5 border-white/10 text-[#A1A1A6] hover:text-white'
            }`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#DFFF00] text-[#DFFF00]' : ''}`} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          <button
            onClick={() => setShowLyricsSheet(true)}
            className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[#A1A1A6] hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px]"
            aria-label="Lyrics"
          >
            <Music2 className="w-4 h-4 text-[#DFFF00]" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setSavedSource(!savedSource)}
            className={`px-3 py-2 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px] ${
              savedSource 
                ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00]' 
                : 'bg-white/5 border-white/10 text-[#A1A1A6] hover:text-white'
            }`}
            aria-label={savedSource ? 'Saved to library' : 'Save to library'}
          >
            {savedSource ? <Check className="w-4 h-4 text-[#DFFF00]" /> : <Plus className="w-4 h-4" />}
            <span>{savedSource ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[#A1A1A6] hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px]"
            aria-label="Share track"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setShowOptionsSheet(true)}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-[#A1A1A6] hover:text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
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
            <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden relative">
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

          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#A1A1A6]">
            <span className="text-[#DFFF00]">{formatTime(currentTime)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>

        {/* ── HERO TRANSPORT CONTROLS ── */}
        <div className="w-full flex items-center justify-between py-2 px-4 shrink-0 max-w-sm mx-auto">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`p-3 rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
              shuffle ? 'text-[#DFFF00] bg-[#DFFF00]/15 border border-[#DFFF00]/40' : 'text-[#A1A1A6] hover:text-white'
            }`}
            aria-label="Shuffle"
            title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="p-3 text-white/80 hover:text-white transition-colors cursor-pointer min-w-[52px] min-h-[52px] flex items-center justify-center"
            aria-label="Previous track"
            title="Previous Track"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={() => setPlaying(!isPlaying)}
            className="h-16 w-16 rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black text-black" />
            ) : (
              <Play className="w-7 h-7 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-3 text-white/80 hover:text-white transition-colors cursor-pointer min-w-[52px] min-h-[52px] flex items-center justify-center"
            aria-label="Next track"
            title="Next Track"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
            className={`p-3 rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
              repeatMode !== 'off' ? 'text-[#DFFF00] bg-[#DFFF00]/15 border border-[#DFFF00]/40' : 'text-[#A1A1A6] hover:text-white'
            }`}
            aria-label="Repeat"
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* ── 4. LOWER EXPANDED DETAILS & QUEUE ENTRY ── */}
      <section className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 space-y-4 shrink-0 border-t border-white/10 bg-white/[0.03] rounded-3xl mt-4">
        
        {/* UP NEXT SECTION WITH VIEW QUEUE ACTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">UP NEXT</div>
              <div className="text-[11px] text-[#A1A1A6]">{queue.length > 1 ? `${queue.length - 1} tracks in queue` : 'No upcoming tracks'}</div>
            </div>

            <button
              onClick={() => setShowQueueSheet(true)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-bold text-[#DFFF00] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>View queue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2-3 Inline Queue Item Preview Cards */}
          {nextQueueItems.length > 0 && (
            <div className="space-y-2">
              {nextQueueItems.map((item, index) => (
                <div
                  key={item.id + '_' + index}
                  onClick={() => playTrack(item)}
                  className="h-[72px] p-2.5 rounded-2xl bg-white/[0.045] border border-white/10 hover:border-white/30 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Artwork
                      source={resolveArtwork(item)}
                      size="medium"
                      canonicalId={item.id}
                      type="track"
                      className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#A1A1A6] truncate">
                        {getArtistName(item.artists || item.artist)} • {formatTime(item.duration || 152)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold text-[#A1A1A6] px-3">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AUTOPLAY TOGGLE */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">AUTO-PLAY</div>
            <div className="text-[11px] text-[#A1A1A6]">Play similar music after queue finishes</div>
          </div>

          <button
            onClick={() => setAutoplayEnabled(!autoplayEnabled)}
            className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer ${
              autoplayEnabled 
                ? 'bg-[#DFFF00] text-black border-[#DFFF00] font-extrabold' 
                : 'bg-white/5 text-[#A1A1A6] border-white/10'
            }`}
            aria-label="Toggle autoplay"
          >
            {autoplayEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

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
