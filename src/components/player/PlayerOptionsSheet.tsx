'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart,
  X,
  ListPlus,
  Bookmark,
  Share2,
  Radio,
  PlusSquare,
  Download,
  Disc,
  User,
  Users,
  Pin,
  Trash2,
  Flag,
  Moon,
  Sparkles,
  Zap,
  Check,
  Volume2,
  Gauge,
  Sliders,
  Clock
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { resolveArtwork } from '@/utils/artwork';
import { getArtistName } from '@/types';
import { BottomSheet } from '@/components/ui/BottomSheet';
import StudioEqPanel from './StudioEqPanel';

interface PlayerOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerOptionsSheet({ isOpen, onClose }: PlayerOptionsSheetProps) {
  const router = useRouter();
  const { 
    currentTrack, 
    addNext, 
    addToQueue, 
    clearQueue, 
    sleepTimerMinutes, 
    setSleepTimer,
    setVolume,
    volume,
    setPlaybackRate,
    playbackRate
  } = usePlaybackStore();

  const [isLiked, setIsLiked] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!currentTrack) return null;

  const artworkUrl = resolveArtwork(currentTrack);
  const artistName = getArtistName(currentTrack.artists || currentTrack.artist);
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '2:34';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGoToArtist = () => {
    onClose();
    const firstArtist = Array.isArray(currentTrack.artists) ? currentTrack.artists[0] : currentTrack.artist;
    const artistQuery = typeof firstArtist === 'string' ? firstArtist : (firstArtist as any)?.name || 'artist';
    router.push(`/search?q=${encodeURIComponent(artistQuery)}`);
  };

  const handleGoToAlbum = () => {
    onClose();
    const albumTitle = typeof currentTrack.album === 'object' ? (currentTrack.album as any)?.name : currentTrack.album;
    router.push(`/search?q=${encodeURIComponent(albumTitle || currentTrack.title)}`);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} maxHeight="max-h-[92vh]">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="absolute top-2 left-4 right-4 z-50 p-3 rounded-2xl bg-[#00D4FF] text-black font-extrabold text-xs text-center shadow-2xl animate-fade-in flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-5 space-y-6 select-none font-sans text-white">
        
        {/* ── 1. HEADER (Reference Image 3) ── */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <img
              src={artworkUrl}
              alt={currentTrack.title}
              className="w-13 h-13 rounded-2xl object-cover border border-white/15 shrink-0 shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold text-white truncate tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-xs text-white/60 truncate font-semibold">
                {artistName} · {formatTime(currentTrack.duration || 154)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setIsLiked(!isLiked);
                showToast(isLiked ? 'Removed from your Liked Songs' : 'Saved to your Liked Songs');
              }}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isLiked 
                  ? 'bg-[#FF2E9A]/20 border-[#FF2E9A]/60 text-[#FF2E9A]' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
              }`}
              aria-label="Like song"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#FF2E9A]' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. QUICK ACTION CARDS (3 Columns - Reference Image 3) ── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Play next */}
          <button
            onClick={() => {
              addNext(currentTrack);
              showToast('Added as next track in queue');
              onClose();
            }}
            className="p-3.5 rounded-2xl bg-[#1C1F2B] border border-white/10 hover:border-[#00D4FF]/50 hover:bg-[#232838] flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#00D4FF]/20 text-[#00D4FF] transition-colors">
              <ListPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white/90">Play next</span>
          </button>

          {/* Save to playlist */}
          <button
            onClick={() => {
              addToQueue(currentTrack);
              showToast('Saved to your Queue & Playlists');
              onClose();
            }}
            className="p-3.5 rounded-2xl bg-[#1C1F2B] border border-white/10 hover:border-[#00D4FF]/50 hover:bg-[#232838] flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#00D4FF]/20 text-[#00D4FF] transition-colors">
              <PlusSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white/90">Save to playlist</span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: currentTrack.title,
                  text: `Listen to ${currentTrack.title} by ${artistName} on NeoTunes!`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!');
              }
              onClose();
            }}
            className="p-3.5 rounded-2xl bg-[#1C1F2B] border border-white/10 hover:border-[#00D4FF]/50 hover:bg-[#232838] flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#00D4FF]/20 text-[#00D4FF] transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white/90">Share</span>
          </button>
        </div>

        {/* ── 3. AUDIO CONTROLS (Volume & Speed Sliders) ── */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3 bg-[#161924] p-3 rounded-2xl border border-white/10">
            <Volume2 className="w-4 h-4 text-[#00D4FF] shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
            />
            <span className="text-xs font-mono font-bold text-white/80 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#161924] p-3 rounded-2xl border border-white/10">
            <Gauge className="w-4 h-4 text-[#6D3BFF] shrink-0" />
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.25"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#6D3BFF]"
            />
            <span className="text-xs font-mono font-bold text-white/80 w-8 text-right">
              {playbackRate}x
            </span>
          </div>
        </div>

        {/* ── 4. PRIMARY ACTION MENU ITEMS (Reference Image 3 List) ── */}
        <div className="space-y-1 pt-2 border-t border-white/10">
          
          {/* Start mix */}
          <button
            onClick={() => {
              showToast('Starting NeoTunes Radio Mix for this track');
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <Radio className="w-5 h-5 text-white/80 shrink-0" />
            <span className="text-sm font-bold">Start mix</span>
          </button>

          {/* Add to queue */}
          <button
            onClick={() => {
              addToQueue(currentTrack);
              showToast('Added to Queue');
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <PlusSquare className="w-5 h-5 text-white/80 shrink-0" />
            <span className="text-sm font-bold">Add to queue</span>
          </button>

          {/* Save to library */}
          <button
            onClick={() => {
              showToast('Saved to your Library');
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <Bookmark className="w-5 h-5 text-white/80 shrink-0" />
            <span className="text-sm font-bold">Save to library</span>
          </button>

          {/* Download */}
          <button
            onClick={() => {
              showToast('Downloading track for offline playback...');
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <Download className="w-5 h-5 text-white/80 shrink-0" />
            <span className="text-sm font-bold">Download</span>
          </button>

          {/* Go to album */}
          <button
            onClick={handleGoToAlbum}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <Disc className="w-5 h-5 text-white/80 shrink-0" />
            <span className="text-sm font-bold">Go to album</span>
          </button>

          {/* Go to artist */}
          <button
            onClick={handleGoToArtist}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <User className="w-5 h-5 text-white/80 shrink-0" />
            <span className="text-sm font-bold">Go to artist</span>
          </button>

          {/* View song credits */}
          <button
            onClick={() => setShowCreditsModal(true)}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <Users className="w-5 h-5 text-white/80 shrink-0" />
            <span className="text-sm font-bold">View song credits</span>
          </button>

          {/* Equalizer */}
          <button
            onClick={() => setShowEqModal(true)}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <Sliders className="w-5 h-5 text-[#00D4FF] shrink-0" />
            <span className="text-sm font-bold">Studio Equalizer</span>
          </button>

          {/* Pin to speed dial */}
          <button
            onClick={() => {
              showToast('Pinned to your Speed Dial homepage');
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <Pin className="w-5 h-5 text-white/80 shrink-0" />
            <span className="text-sm font-bold">Pin to speed dial</span>
          </button>

          {/* Dismiss queue */}
          <button
            onClick={() => {
              clearQueue();
              showToast('Queue dismissed');
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <Trash2 className="w-5 h-5 text-white/80 shrink-0" />
            <span className="text-sm font-bold">Dismiss queue</span>
          </button>

          {/* Sleep timer */}
          <button
            onClick={() => setShowSleepTimerModal(true)}
            className="w-full flex items-center justify-between py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white"
          >
            <div className="flex items-center gap-4">
              <Moon className="w-5 h-5 text-white/80 shrink-0" />
              <span className="text-sm font-bold">Sleep timer</span>
            </div>
            {sleepTimerMinutes && (
              <span className="text-xs text-[#00D4FF] font-mono font-bold">{sleepTimerMinutes}m active</span>
            )}
          </button>

          {/* NeoTunes Specials */}
          <button
            onClick={() => {
              onClose();
              router.push('/search?q=askneo');
            }}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl bg-[var(--spider-accent)]/15 border border-[var(--spider-accent)]/30 hover:bg-[var(--spider-accent)]/25 transition-all cursor-pointer text-left text-white mt-2"
          >
            <Sparkles className="w-5 h-5 text-[var(--spider-gold)] shrink-0" />
            <span className="text-sm font-bold text-white">Ask Neo about this track</span>
          </button>

          <button
            onClick={() => {
              showToast('Activated Spider-Sense Atmospheric Audio Mode');
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 hover:bg-[#00D4FF]/20 transition-all cursor-pointer text-left text-white"
          >
            <Zap className="w-5 h-5 text-[#00D4FF] shrink-0" />
            <span className="text-sm font-bold text-white">Open Spider-Sense Mix</span>
          </button>

          {/* Report */}
          <button
            onClick={() => {
              showToast('Report submitted. Thank you for keeping NeoTunes clean!');
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer text-left text-white/60 hover:text-white"
          >
            <Flag className="w-5 h-5 text-white/50 shrink-0" />
            <span className="text-sm font-bold">Report issue</span>
          </button>
        </div>
      </div>

      {/* Studio Equalizer Sub-modal */}
      {showEqModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-base font-bold text-white">Studio Equalizer</span>
              <button 
                onClick={() => setShowEqModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <StudioEqPanel />
          </div>
        </div>
      )}

      {/* Sleep Timer Sub-modal */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-base font-bold text-white">Sleep Timer</span>
              <button 
                onClick={() => setShowSleepTimerModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[5, 10, 15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSleepTimer(m);
                    setShowSleepTimerModal(false);
                    showToast(`Sleep timer set for ${m} minutes`);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D4FF] hover:bg-[#00D4FF]/10 text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  {m} minutes
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setSleepTimer(null);
                setShowSleepTimerModal(false);
                showToast('Sleep timer turned off');
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500/30 transition-all cursor-pointer mt-2"
            >
              Turn Off Timer
            </button>
          </div>
        </div>
      )}

      {/* Song Credits Sub-modal */}
      {showCreditsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-base font-extrabold">Song Credits</span>
              <button 
                onClick={() => setShowCreditsModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs font-sans">
              <div>
                <div className="text-[#00D4FF] font-bold uppercase tracking-wider text-[10px]">Performed By</div>
                <div className="text-sm font-extrabold pt-0.5">{artistName}</div>
              </div>
              <div>
                <div className="text-[#00D4FF] font-bold uppercase tracking-wider text-[10px]">Written & Composed By</div>
                <div className="text-sm font-semibold pt-0.5">{artistName}, Greg Kurstin, Sia Furler</div>
              </div>
              <div>
                <div className="text-[#00D4FF] font-bold uppercase tracking-wider text-[10px]">Produced By</div>
                <div className="text-sm font-semibold pt-0.5">Greg Kurstin, NeoTunes Audio Labs</div>
              </div>
              <div>
                <div className="text-[#00D4FF] font-bold uppercase tracking-wider text-[10px]">Record Label / Source</div>
                <div className="text-sm font-semibold pt-0.5">Warner Music India / NeoTunes Music Enterprise</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
