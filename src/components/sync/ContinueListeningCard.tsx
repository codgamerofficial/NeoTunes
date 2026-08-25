'use client';

import React, { useState, useEffect } from 'react';
import { Play, Laptop, Smartphone, X } from 'lucide-react';
import { CloudSyncEngine } from '@/services/sync/CloudSyncEngine';
import { SyncedPlaybackState } from '@/types/sync';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { getTrackArtwork } from '@/utils/artwork';
import { getArtistName } from '@/types';

export default function ContinueListeningCard() {
  const { playTrack, setProgress } = usePlaybackStore();
  const [syncState, setSyncState] = useState<SyncedPlaybackState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const state = CloudSyncEngine.getContinueListeningState();
    if (state) setSyncState(state);
  }, []);

  if (!syncState || !syncState.track || dismissed) return null;

  const handleContinue = () => {
    if (syncState.track) {
      playTrack(syncState.track);
      setTimeout(() => setProgress(syncState.position), 500);
      setDismissed(true);
    }
  };

  const coverUrl = getTrackArtwork(syncState.track);
  const artistStr = getArtistName(syncState.track.artists || syncState.track.artist);
  const mins = Math.floor(syncState.position / 60);
  const secs = Math.floor(syncState.position % 60);
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div className="p-4 rounded-3xl bg-[#090C14]/90 border border-[#00D9FF]/30 shadow-2xl flex items-center justify-between gap-4 max-w-md mx-auto my-4 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-white/10">
          <Artwork source={coverUrl} size="small" alt={syncState.track.title} type="track" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00D9FF] uppercase tracking-wider">
            <Smartphone className="h-3 w-3" /> Played on {syncState.deviceName} ({formattedTime})
          </div>
          <h4 className="text-xs font-bold text-white truncate">{syncState.track.title}</h4>
          <p className="text-[11px] text-[#A1A1A6] truncate">{artistStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleContinue}
          className="px-3.5 py-2 rounded-full bg-[#00D9FF] text-black font-mono font-extrabold text-[11px] uppercase tracking-wider hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,217,255,0.3)]"
        >
          <Play className="h-3.5 w-3.5 fill-black" /> Continue
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
