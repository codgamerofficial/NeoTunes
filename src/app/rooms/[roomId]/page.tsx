'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Radio, Play, Pause, Heart, Flame, Music, Sparkles, Shield, Share2 } from 'lucide-react';
import { ListeningRoomEngine } from '@/services/social/ListeningRoomEngine';
import { ListeningRoom } from '@/types/social-ecosystem';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { getTrackArtwork } from '@/utils/artwork';
import { getArtistName } from '@/types';

export default function ListeningRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;

  const [room, setRoom] = useState<ListeningRoom | null>(null);
  const { currentTrack, isPlaying, setPlaying } = usePlaybackStore();

  useEffect(() => {
    if (roomId) {
      const r = ListeningRoomEngine.getRoom(roomId) || ListeningRoomEngine.createRoom('Late Night Vibe Session');
      setRoom(r);
    }
  }, [roomId]);

  if (!room) return null;

  const activeTrack = currentTrack || room.currentTrack;
  const coverUrl = activeTrack ? getTrackArtwork(activeTrack) : '';
  const artistStr = activeTrack ? getArtistName(activeTrack.artists || activeTrack.artist) : 'Unknown Artist';

  return (
    <FeatureErrorBoundary featureName="Listening Room">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="p-6 rounded-3xl bg-[#090C14] border border-white/10 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#00D9FF]/10 text-[#00D9FF]">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">{room.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase border border-emerald-500/40">
                  LIVE SESSION
                </span>
              </div>
              <p className="text-xs text-[#A1A1A6]">Hosted by {room.hostName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#00D9FF]" /> {room.participants.length}
            </span>
          </div>
        </div>

        {/* Player Stage */}
        {activeTrack ? (
          <div className="p-8 rounded-3xl bg-[#0A0D14] border border-white/10 flex flex-col items-center text-center space-y-6 shadow-2xl">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <Artwork source={coverUrl} size="large" alt={activeTrack.title} type="track" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">{activeTrack.title}</h2>
              <p className="text-sm text-[#A1A1A6] font-medium">{artistStr}</p>
            </div>

            {/* Room Reactions */}
            <div className="flex items-center gap-3 pt-2">
              {['❤️', '🔥', '🎵', '✨'].map((emoji, i) => (
                <button
                  key={i}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center text-white/50 font-mono text-xs uppercase">
            No track currently playing in room
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
