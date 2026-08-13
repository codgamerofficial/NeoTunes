'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Radio, Users, Play, Pause, SkipForward, Copy, Check, MessageSquare, Send, Heart, Flame, Sparkles } from 'lucide-react';
import { jamSessionManager, JamSession } from '@/services/jamSessionManager';
import { usePlaybackStore } from '@/store/playback-store';

export default function JamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;
  const { currentTrack, isPlaying, setPlaying, nextTrack } = usePlaybackStore();

  const [session, setSession] = useState<JamSession | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [reactions, setReactions] = useState<Array<{ user: string; emoji: string }>>([]);

  useEffect(() => {
    const active = jamSessionManager.joinSession(roomId || 'JAM123', 'Saswata');
    setSession(active);
  }, [roomId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmoji = (emoji: string) => {
    jamSessionManager.sendReaction('Saswata', emoji);
    setReactions((prev) => [...prev, { user: 'Saswata', emoji }]);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#000000] text-[#F4F1F7] font-sans select-none min-h-screen pb-36">
      
      {/* Jam Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#AFC7FF] text-black flex items-center justify-center shadow-[0_0_20px_rgba(175,199,255,0.5)]">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              {session?.roomName || "Saswata's Jam"}
            </h1>
            <p className="text-xs text-[#A8A7AF]">Synchronized Real-Time Social Listening</p>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#17181D] border border-white/10 text-xs font-bold text-white hover:border-[#AFC7FF]/40 transition-all cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-[#AFC7FF]" /> : <Copy className="h-4 w-4 text-[#AFC7FF]" />}
          <span>{copied ? 'Link Copied!' : 'Invite Friends'}</span>
        </button>
      </div>

      {/* Main Grid: Active Player & Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Active Jam Track */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#121318] border border-white/10 space-y-6">
          <span className="text-xs font-mono font-bold text-[#AFC7FF] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Live Synchronized Audio
          </span>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'}
              alt="Track Artwork"
              className="h-40 w-40 rounded-2xl object-cover shadow-2xl border border-white/15"
            />
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-xl font-black text-white">{currentTrack?.title || 'Patar Bashori'}</h2>
              <p className="text-sm font-bold text-[#AFC7FF]">{typeof currentTrack?.artist === 'string' ? currentTrack.artist : currentTrack?.artist?.name || 'Ishaan, Sunidhi'}</p>
              
              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
                <button
                  onClick={() => setPlaying(!isPlaying)}
                  className="h-12 w-12 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center shadow-lg cursor-pointer"
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black ml-0.5" />}
                </button>
                <button
                  onClick={nextTrack}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Reaction Emojis */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-xs text-[#A8A7AF] font-bold">Send Live Reaction:</span>
            <div className="flex items-center gap-2">
              {['🔥', '💖', '⚡', '🎉', '🎧', '🙌'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendEmoji(emoji)}
                  className="p-2.5 rounded-2xl bg-[#17181D] hover:bg-white/10 text-lg transition-transform hover:scale-110 cursor-pointer border border-white/5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Connected Members & Chat */}
        <div className="p-6 rounded-3xl bg-[#121318] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-[#AFC7FF]" /> Room Members ({session?.members.length || 1})
            </h3>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-none">
            {(session?.members || []).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-[#17181D]">
                <div className="flex items-center gap-3">
                  <img src={m.avatarUrl} alt={m.name} className="h-8 w-8 rounded-full object-cover" />
                  <span className="text-xs font-bold text-white">{m.name}</span>
                </div>
                {m.isHost && <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#AFC7FF]/20 text-[#AFC7FF]">HOST</span>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
