'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Radio, 
  Users, 
  Play, 
  Pause, 
  SkipForward, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Activity,
  ArrowLeft
} from 'lucide-react';
import { jamSessionManager, JamSession } from '@/services/jamSessionManager';
import { usePlaybackStore } from '@/store/playback-store';
import { NeoButton } from '@/components/ui/NeoButton';
import { useToast } from '@/components/ui/NeoToast';
import { getArtistName } from '@/types';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

const REACTION_EMOJIS = ['🔥', '💖', '⚡', '🎉', '🎧', '🚀', '🙌', '💯'];

export default function JamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const roomId = (params?.id as string) || 'JAM-NEO-01';

  const { currentTrack, isPlaying, setPlaying, nextTrack } = usePlaybackStore();

  const [session, setSession] = useState<JamSession | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'queue' | 'members'>('chat');
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: string; emoji: string; x: number }>>([]);

  useEffect(() => {
    const active = jamSessionManager.joinSession(roomId, 'Saswata');
    setSession(active);
  }, [roomId]);

  const handleCopyCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.inviteCode);
      setCopied(true);
      showToast(`Invite Code ${session.inviteCode} copied!`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmoji = (emoji: string) => {
    if (!session) return;
    jamSessionManager.sendReaction(session.id, 'Saswata', emoji);

    // Trigger visual floating bubble
    const id = `fl_${Date.now()}_${Math.random()}`;
    const x = Math.floor(Math.random() * 60) + 20; // 20% to 80% width
    setFloatingReactions(prev => [...prev, { id, emoji, x }]);

    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !chatInput.trim()) return;
    jamSessionManager.sendChatMessage(session.id, 'Saswata', chatInput);
    setChatInput('');
    // Refresh local session ref
    const updated = jamSessionManager.getSession(session.id);
    if (updated) setSession({ ...updated });
  };

  const activeTrack = currentTrack || session?.currentTrack;
  const artistName = activeTrack ? getArtistName(activeTrack.artists || activeTrack.artist) : 'Nish';
  const albumName = activeTrack 
    ? (typeof activeTrack.album === 'object' && activeTrack.album ? (activeTrack.album.name || (activeTrack.album as any).title) : (activeTrack.album || 'Single'))
    : 'Acoustic Sessions';

  return (
    <FeatureErrorBoundary featureName="Jam Room">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-[#F5F7FA] font-sans select-none pb-44 md:pb-28 min-h-screen">
        
        {/* ── ROOM HEADER BAR ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#11141A] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => router.push('/jam')}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
              aria-label="Back to Lobby"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="p-2.5 rounded-2xl bg-[#DFFF00] text-black shadow-md shrink-0">
              <Radio className="h-5 w-5" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white truncate">
                  {session?.roomName || 'Live Jam Session'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/30 shrink-0">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-[#9AA1AD] truncate font-medium">
                Hosted by {session?.hostName || 'Host'} • {session?.genre || 'Music'}
              </p>
            </div>
          </div>

          {/* Right: Invite Code & Share */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#171A21] border border-white/10 hover:border-[#DFFF00]/50 text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-sm"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#DFFF00]" /> : <Copy className="h-3.5 w-3.5 text-[#DFFF00]" />}
              <span>CODE: {session?.inviteCode || 'JAM26'}</span>
            </button>
          </div>
        </div>

        {/* ── MAIN JAM GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── LEFT 2 COLS: SYNCHRONIZED PLAYER & REACTIONS ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Synchronized Now Playing Stage */}
            <div className="relative p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[#171A21] via-[#11141A] to-[#0B0D12] border border-white/10 shadow-2xl space-y-6 overflow-hidden">
              
              {/* Floating Reaction Bubbles Animation Layer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
                {floatingReactions.map((r) => (
                  <div
                    key={r.id}
                    style={{ left: `${r.x}%` }}
                    className="absolute bottom-10 text-3xl animate-bounce transition-all opacity-90 drop-shadow-md"
                  >
                    {r.emoji}
                  </div>
                ))}
              </div>

              {/* Live Audio Sync Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
                  <Activity className="h-3.5 w-3.5 text-[#DFFF00] animate-pulse" /> SYNCHRONIZED AUDIO STREAM
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono text-[#9AA1AD]">
                  <Users className="h-3.5 w-3.5 text-[#00E5FF]" />
                  <span>{session?.members.length || 1} tuned in</span>
                </div>
              </div>

              {/* Artwork + Track Identity + Transport Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-6 z-10 relative">
                <img
                  src={activeTrack?.artworkUrl || activeTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'}
                  alt="Current Track Artwork"
                  className="h-36 w-36 sm:h-44 sm:w-44 rounded-3xl object-cover shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/10 shrink-0"
                />

                <div className="space-y-3 text-center sm:text-left min-w-0 flex-1">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                      {activeTrack?.title || 'Maney Na (Acoustic Version)'}
                    </h2>
                    <p className="text-sm font-semibold text-[#DFFF00] truncate">
                      {artistName}
                    </p>
                    <p className="text-xs text-[#9AA1AD] truncate font-medium">
                      {albumName}
                    </p>
                  </div>

                  {/* Playback Transport Buttons */}
                  <div className="flex items-center justify-center sm:justify-start gap-4 pt-1">
                    <button
                      onClick={() => setPlaying(!isPlaying)}
                      className="h-12 w-12 rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-[0_4px_16px_rgba(223,255,0,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 fill-black text-black" />
                      ) : (
                        <Play className="h-5 w-5 fill-black text-black ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={nextTrack}
                      className="p-3 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Next track"
                    >
                      <SkipForward className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Emoji Reactions Dock */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2.5 z-10 relative">
                <div className="flex items-center justify-between text-xs text-[#9AA1AD] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#DFFF00]" /> Send Live Soundstage Reaction:
                  </span>
                  <span className="text-[10px] font-mono text-white/50">Tap to burst</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSendEmoji(emoji)}
                      className="p-3 rounded-2xl bg-[#171A21] hover:bg-[#DFFF00]/15 text-xl transition-all hover:scale-115 active:scale-95 cursor-pointer border border-white/5 hover:border-[#DFFF00]/40 shrink-0 shadow-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* ── RIGHT COL: CHAT, QUEUE & MEMBERS TABS ── */}
          <div className="p-5 sm:p-6 rounded-[32px] bg-[#11141A] border border-white/10 shadow-2xl flex flex-col justify-between space-y-4 min-h-[500px]">
            
            {/* Segmented Tab Headers */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0B0D12] border border-white/5 shrink-0">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-[#DFFF00] text-black shadow-sm'
                    : 'text-[#9AA1AD] hover:text-white'
                }`}
              >
                Chat &amp; Vibes
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'queue'
                    ? 'bg-[#DFFF00] text-black shadow-sm'
                    : 'text-[#9AA1AD] hover:text-white'
                }`}
              >
                Queue ({session?.queue.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'members'
                    ? 'bg-[#DFFF00] text-black shadow-sm'
                    : 'text-[#9AA1AD] hover:text-white'
                }`}
              >
                Listeners ({session?.members.length || 1})
              </button>
            </div>

            {/* TAB 1: LIVE CHAT */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between space-y-4 min-h-0">
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] scrollbar-none pr-1">
                  {(session?.chatMessages || []).map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${msg.userId === 'system' ? 'text-[#00E5FF]' : 'text-[#DFFF00]'}`}>
                          {msg.userName}
                        </span>
                        <span className="text-[9px] font-mono text-[#9AA1AD]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-[#171A21] border border-white/5 text-xs text-[#F5F7FA] leading-relaxed">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                  <input
                    type="text"
                    placeholder="Share a vibe or song thought..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-white/10 text-xs text-white placeholder-[#9AA1AD]/50 focus:outline-none focus:border-[#DFFF00]"
                  />
                  <NeoButton type="submit" variant="primary" size="sm" disabled={!chatInput.trim()}>
                    <Send className="h-3.5 w-3.5 fill-black text-black" />
                  </NeoButton>
                </form>
              </div>
            )}

            {/* TAB 2: ROOM QUEUE */}
            {activeTab === 'queue' && (
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] scrollbar-none">
                <div className="flex items-center justify-between text-xs text-[#9AA1AD] pb-1">
                  <span>Up Next in Room:</span>
                  <span className="font-mono text-[#DFFF00]">Auto-DJ Active</span>
                </div>

                {(session?.queue && session.queue.length > 0) ? (
                  session.queue.map((trk, idx) => (
                    <div key={trk.id || idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-[#171A21] border border-white/5">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-white truncate">{trk.title}</div>
                        <div className="text-[11px] text-[#9AA1AD] truncate">{getArtistName(trk.artists || trk.artist)}</div>
                      </div>
                      <span className="text-[10px] font-mono text-[#00E5FF] px-2 py-0.5 rounded-md bg-[#00E5FF]/10">
                        Queued
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center space-y-2 rounded-2xl bg-[#0B0D12] border border-white/5">
                    <Sparkles className="h-6 w-6 text-[#DFFF00] mx-auto opacity-60" />
                    <p className="text-xs text-[#9AA1AD]">No tracks in queue. Jam recommendations will play automatically.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LISTENERS */}
            {activeTab === 'members' && (
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[420px] scrollbar-none">
                {(session?.members || []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-[#171A21] border border-white/5">
                    <div className="flex items-center gap-3">
                      <img src={m.avatarUrl} alt={m.name} className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10" />
                      <div>
                        <div className="text-xs font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-[#9AA1AD]">Listening in sync</div>
                      </div>
                    </div>
                    {m.isHost && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/30">
                        HOST
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
