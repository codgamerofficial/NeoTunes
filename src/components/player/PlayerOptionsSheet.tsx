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
  Moon,
  Sparkles,
  Check,
  Volume2,
  Sliders,
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { resolveArtwork } from '@/utils/artwork';
import { getArtistName, Track } from '@/types';
import { BottomSheet } from '@/components/ui/BottomSheet';
import StudioEqPanel from './StudioEqPanel';
import AddToPlaylistModal from './AddToPlaylistModal';
import { likedSongsService } from '@/services/likedSongsService';
import { useToast } from '@/components/ui/NeoToast';
import { ListMusic } from 'lucide-react';

export interface PlayerOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  track?: Track | null;
  onShare?: () => void;
}

export default function PlayerOptionsSheet({ isOpen, onClose, track: customTrack, onShare }: PlayerOptionsSheetProps) {
  const router = useRouter();
  const { 
    currentTrack: storeTrack, 
    addNext, 
    addToQueue, 
    clearQueue, 
    sleepTimerMinutes, 
    setSleepTimer,
    setVolume,
    volume,
  } = usePlaybackStore();

  const { showToast } = useToast();

  const activeTrack = customTrack || storeTrack;

  const [isLiked, setIsLiked] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);

  React.useEffect(() => {
    if (!activeTrack?.id) return;
    setIsLiked(likedSongsService.isLiked(activeTrack.id));

    const handleLikedChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ trackId: string; isLiked: boolean }>;
      if (customEvent.detail && customEvent.detail.trackId === activeTrack.id) {
        setIsLiked(customEvent.detail.isLiked);
      }
    };

    window.addEventListener('neotunes_liked_change', handleLikedChange);
    return () => {
      window.removeEventListener('neotunes_liked_change', handleLikedChange);
    };
  }, [activeTrack?.id]);

  if (!activeTrack) return null;

  const artworkUrl = resolveArtwork(activeTrack);
  const artistName = getArtistName(activeTrack.artists || activeTrack.artist);
  
  const formatTime = (secs?: number) => {
    if (!secs || isNaN(secs)) return '3:20';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleGoToArtist = () => {
    onClose();
    const firstArtist = Array.isArray(activeTrack.artists) ? activeTrack.artists[0] : activeTrack.artist;
    const artistQuery = typeof firstArtist === 'string' ? firstArtist : (firstArtist as any)?.name || 'artist';
    router.push(`/search?q=${encodeURIComponent(artistQuery)}`);
  };

  const handleGoToAlbum = () => {
    onClose();
    const albumTitle = typeof activeTrack.album === 'object' ? (activeTrack.album as any)?.name : activeTrack.album;
    router.push(`/search?q=${encodeURIComponent(albumTitle || activeTrack.title)}`);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} maxHeight="max-h-[92vh]">
      <div className="p-5 space-y-5 select-none font-sans text-white">
        
        {/* Track Identity Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <img
              src={artworkUrl}
              alt={activeTrack.title}
              className="w-12 h-12 rounded-xl object-cover border border-white/15 shrink-0 shadow-md"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {activeTrack.title}
              </h2>
              <p className="text-xs text-[#9AA1AD] truncate font-medium">
                {artistName} · {formatTime(activeTrack.duration)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={async () => {
                const nextState = await likedSongsService.toggleLike(activeTrack);
                setIsLiked(nextState);
                showToast(nextState ? 'Saved to Liked Songs' : 'Removed from Liked Songs');
              }}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isLiked 
                  ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00]' 
                  : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white'
              }`}
              aria-label="Like song"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#DFFF00]' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              addNext(activeTrack);
              showToast('Added as next track in queue');
              onClose();
            }}
            className="p-3 rounded-2xl bg-[#171A21] border border-white/5 hover:border-white/20 hover:bg-[#1E222B] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#DFFF00]/10 text-[#DFFF00] transition-colors">
              <ListPlus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#F5F7FA]">Play next</span>
          </button>

          <button
            onClick={() => {
              addToQueue(activeTrack);
              showToast('Added to Queue');
              onClose();
            }}
            className="p-3 rounded-2xl bg-[#171A21] border border-white/5 hover:border-white/20 hover:bg-[#1E222B] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#00E5FF]/10 text-[#00E5FF] transition-colors">
              <PlusSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#F5F7FA]">Add to queue</span>
          </button>

          <button
            onClick={() => {
              if (onShare) {
                onShare();
              } else if (navigator.share) {
                navigator.share({
                  title: activeTrack.title,
                  text: `Listen to ${activeTrack.title} by ${artistName} on NeoTunes!`,
                  url: window.location.href,
                }).catch(() => {});
                onClose();
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!');
                onClose();
              }
            }}
            className="p-3 rounded-2xl bg-[#171A21] border border-white/5 hover:border-white/20 hover:bg-[#1E222B] flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group shadow-sm"
          >
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#F5F7FA]">Share</span>
          </button>
        </div>

        {/* Volume Level Control */}
        <div className="flex items-center gap-3 bg-[#11141A] p-3 rounded-2xl border border-white/5">
          <Volume2 className="w-4 h-4 text-[#DFFF00] shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#DFFF00]"
          />
          <span className="text-xs font-mono font-bold text-[#9AA1AD] w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Main Action Menu Items */}
        <div className="space-y-0.5 pt-1 border-t border-white/[0.06]">
          <button
            onClick={() => setShowAddToPlaylistModal(true)}
            className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer text-left text-[#F5F7FA]"
          >
            <ListMusic className="w-4 h-4 text-[#DFFF00] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Add to playlist</span>
          </button>

          <button
            onClick={handleGoToAlbum}
            className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer text-left text-[#F5F7FA]"
          >
            <Disc className="w-4 h-4 text-[#9AA1AD] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Go to album</span>
          </button>

          <button
            onClick={handleGoToArtist}
            className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer text-left text-[#F5F7FA]"
          >
            <User className="w-4 h-4 text-[#9AA1AD] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Go to artist</span>
          </button>

          <button
            onClick={() => setShowCreditsModal(true)}
            className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer text-left text-[#F5F7FA]"
          >
            <Users className="w-4 h-4 text-[#9AA1AD] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">View song credits</span>
          </button>

          <button
            onClick={() => setShowEqModal(true)}
            className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer text-left text-[#F5F7FA]"
          >
            <Sliders className="w-4 h-4 text-[#00E5FF] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Studio Equalizer</span>
          </button>

          <button
            onClick={() => setShowSleepTimerModal(true)}
            className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer text-left text-[#F5F7FA]"
          >
            <div className="flex items-center gap-3.5">
              <Moon className="w-4 h-4 text-[#9AA1AD] shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">Sleep timer</span>
            </div>
            {sleepTimerMinutes && (
              <span className="text-xs text-[#DFFF00] font-bold">{sleepTimerMinutes}m active</span>
            )}
          </button>

          <button
            onClick={() => {
              clearQueue();
              showToast('Queue cleared');
              onClose();
            }}
            className="w-full flex items-center gap-3.5 py-3 px-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer text-left text-red-400"
          >
            <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Clear queue</span>
          </button>
        </div>
      </div>

      {/* Studio Equalizer Sub-modal */}
      {showEqModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-4">
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
          <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 text-center">
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
                  className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#DFFF00] hover:bg-[#DFFF00]/10 text-white font-semibold text-sm transition-all cursor-pointer"
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
              className="w-full py-2.5 rounded-xl bg-red-500/15 text-red-400 font-bold text-xs hover:bg-red-500/25 transition-all cursor-pointer mt-2"
            >
              Turn Off Timer
            </button>
          </div>
        </div>
      )}

      {/* Song Credits Sub-modal */}
      {showCreditsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-base font-bold">Song Credits</span>
              <button 
                onClick={() => setShowCreditsModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs font-sans">
              <div>
                <div className="text-[#DFFF00] font-bold uppercase tracking-wider text-[10px]">Artist</div>
                <div className="text-sm font-bold pt-0.5">{artistName}</div>
              </div>
              <div>
                <div className="text-[#9AA1AD] font-bold uppercase tracking-wider text-[10px]">Track Title</div>
                <div className="text-sm font-semibold pt-0.5">{activeTrack.title}</div>
              </div>
              <div>
                <div className="text-[#9AA1AD] font-bold uppercase tracking-wider text-[10px]">Source & Platform</div>
                <div className="text-sm font-semibold pt-0.5">NeoTunes Music Engine</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddToPlaylistModal
        isOpen={showAddToPlaylistModal}
        onClose={() => setShowAddToPlaylistModal(false)}
        track={activeTrack}
      />
    </BottomSheet>
  );
}
