'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Radio, 
  Users, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Play, 
  Globe, 
  Volume2, 
  Lock, 
  Unlock, 
  X, 
  Activity
} from 'lucide-react';
import { jamSessionManager, JamSession } from '@/services/jamSessionManager';
import { usePlaybackStore } from '@/store/playback-store';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoChip } from '@/components/ui/NeoChip';
import { useToast } from '@/components/ui/NeoToast';
import { getArtistName } from '@/types';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

const GENRE_CATEGORIES = [
  'All Rooms',
  'Lo-Fi & Ambient',
  'Bollywood & Hindi',
  'Electronic & Synth',
  'Pop & Dance',
  'Acoustic & Folk',
];

export default function JamLobbyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { playTrack } = usePlaybackStore();

  const [sessions, setSessions] = useState<JamSession[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All Rooms');
  const [jamCode, setJamCode] = useState('');

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newHostName, setNewHostName] = useState('Saswata');
  const [newGenre, setNewGenre] = useState('Lo-Fi & Ambient');
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowGuestQueue, setAllowGuestQueue] = useState(true);

  useEffect(() => {
    setSessions(jamSessionManager.getPublicSessions());
  }, []);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      showToast('Please enter a room name', 'error');
      return;
    }

    const session = jamSessionManager.createSession(
      newRoomName.trim(),
      newHostName.trim() || 'Host',
      newGenre,
      isPrivate,
      allowGuestQueue
    );

    showToast(`Jam room "${session.roomName}" created!`);
    setShowCreateModal(false);
    router.push(`/jam/${session.id}`);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = jamCode.trim().toUpperCase();
    if (!code) return;

    const existing = jamSessionManager.getSession(code);
    if (existing) {
      router.push(`/jam/${existing.id}`);
    } else {
      router.push(`/jam/${encodeURIComponent(code)}`);
    }
  };

  const handleTuneIn = (session: JamSession) => {
    if (session.currentTrack) {
      playTrack(session.currentTrack, session.queue);
    }
    showToast(`Connected to ${session.roomName}`);
    router.push(`/jam/${session.id}`);
  };

  const filteredSessions = selectedGenre === 'All Rooms'
    ? sessions
    : sessions.filter(s => s.genre.toLowerCase() === selectedGenre.toLowerCase());

  const totalListeners = sessions.reduce((acc, s) => acc + s.members.length, 0);

  return (
    <FeatureErrorBoundary featureName="Live Jam Sessions">
      <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-[#F5F7FA] font-sans select-none pb-44 md:pb-28 min-h-screen">
        
        {/* ── HERO BANNER ── */}
        <div className="relative p-6 sm:p-10 md:p-12 rounded-[32px] bg-gradient-to-br from-[#171A21] via-[#11141A] to-[#0B0D12] border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#DFFF00]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />

          {/* Left Hero Content */}
          <div className="space-y-4 max-w-2xl text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/25 text-[11px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-ping inline-block" />
              <span>REAL-TIME MULTIVERSE JAM SESSIONS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Listen Together In Perfect Sync.
            </h1>
            
            <p className="text-xs sm:text-sm text-[#9AA1AD] leading-relaxed max-w-xl">
              Broadcast your listening stream or join live public rooms with synchronized playback, collaborative real-time queues, and live soundstage reactions.
            </p>

            {/* Live Stats Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 font-mono text-xs text-[#9AA1AD]">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <Users className="h-3.5 w-3.5 text-[#00E5FF]" />
                <span className="text-white font-bold">{totalListeners + 140}</span> Listeners Live
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <Radio className="h-3.5 w-3.5 text-[#DFFF00]" />
                <span className="text-white font-bold">{sessions.length}</span> Active Rooms
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>&lt; 15ms Latency</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <NeoButton
                variant="primary"
                size="md"
                onClick={() => setShowCreateModal(true)}
                className="shadow-[0_4px_20px_rgba(223,255,0,0.35)] hover:scale-105 transition-all"
              >
                <Plus className="h-4 w-4 fill-black text-black mr-1" /> Start a Jam Room
              </NeoButton>
            </div>
          </div>

          {/* Right Hero: Quick Join Box */}
          <div className="p-6 rounded-3xl bg-[#11141A]/90 backdrop-blur-xl border border-white/10 w-full lg:w-96 space-y-4 shadow-2xl z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#00E5FF]" /> Quick Code Join
              </h3>
              <span className="text-[10px] font-mono text-[#9AA1AD] uppercase">Instant Connect</span>
            </div>

            <p className="text-xs text-[#9AA1AD]">
              Have an invite code from a friend? Enter it below to join their private or public session immediately.
            </p>

            <form onSubmit={handleJoinByCode} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. CHILL26 or SYNTH88"
                  value={jamCode}
                  onChange={(e) => setJamCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-xs font-mono uppercase text-white placeholder-[#9AA1AD]/50 focus:outline-none focus:border-[#DFFF00] transition-colors"
                />
              </div>
              <NeoButton
                type="submit"
                variant="secondary"
                size="sm"
                className="w-full font-bold"
                disabled={!jamCode.trim()}
              >
                <span>Join Room</span> <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </NeoButton>
            </form>
          </div>
        </div>

        {/* ── CATEGORY FILTER CHIPS ── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {GENRE_CATEGORIES.map((genre) => (
            <NeoChip
              key={genre}
              selected={selectedGenre === genre}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </NeoChip>
          ))}
        </div>

        {/* ── ACTIVE LIVE ROOMS GRID ── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Globe className="h-5 w-5 text-[#00E5FF]" /> Active Listening Rooms
              </h2>
              <p className="text-xs text-[#9AA1AD]">
                Drop in, tune your soundstage, and enjoy music with other listeners in real-time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSessions.map((session) => (
              <NeoCard
                key={session.id}
                interactive
                onClick={() => handleTuneIn(session)}
                className="p-5 flex flex-col justify-between gap-5 group bg-[#11141A] border-white/10 hover:border-[#DFFF00]/40 transition-all shadow-xl relative overflow-hidden"
              >
                {/* Top Row: Live Pulse & Member Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                      LIVE
                    </span>
                    <span className="text-[10px] font-mono text-[#00E5FF] px-2 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                      {session.genre}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#9AA1AD]">
                    <Users className="h-3.5 w-3.5 text-[#00E5FF]" />
                    <span>{session.members.length} listening</span>
                  </div>
                </div>

                {/* Room Title & Host */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-[#DFFF00] transition-colors line-clamp-1">
                    {session.roomName}
                  </h3>
                  <p className="text-xs text-[#9AA1AD] flex items-center gap-1.5">
                    <span>Hosted by</span>
                    <span className="text-white font-medium">{session.hostName}</span>
                  </p>
                </div>

                {/* Currently Playing Card Snippet */}
                {session.currentTrack && (
                  <div className="p-3 rounded-2xl bg-[#0B0D12] border border-white/5 flex items-center gap-3">
                    <img
                      src={session.currentTrack.artworkUrl || session.currentTrack.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80'}
                      alt={session.currentTrack.title}
                      className="h-12 w-12 rounded-xl object-cover shrink-0 shadow-md"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="text-[10px] font-mono text-[#DFFF00] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Volume2 className="h-3 w-3 animate-bounce" /> CURRENTLY PLAYING
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {session.currentTrack.title}
                      </div>
                      <div className="text-[11px] text-[#9AA1AD] truncate">
                        {getArtistName(session.currentTrack.artists || session.currentTrack.artist)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Participants Avatars Pile & Tune In Button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  {/* Avatar Pile */}
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    {session.members.slice(0, 4).map((member) => (
                      <img
                        key={member.id}
                        src={member.avatarUrl}
                        alt={member.name}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-[#11141A] object-cover"
                      />
                    ))}
                    {session.members.length > 4 && (
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-white/10 ring-2 ring-[#11141A] text-[10px] font-bold text-white">
                        +{session.members.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Tune In Action */}
                  <NeoButton
                    variant="glass"
                    size="sm"
                    className="group-hover:bg-[#DFFF00] group-hover:text-black group-hover:border-[#DFFF00] font-bold"
                  >
                    <Play className="h-3.5 w-3.5 fill-current mr-1" /> Tune In
                  </NeoButton>
                </div>
              </NeoCard>
            ))}
          </div>
        </div>

        {/* ── HOST JAM ROOM MODAL ── */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl select-none">
            <div className="w-full max-w-lg p-6 sm:p-7 rounded-[32px] bg-[#11141A] border border-white/10 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#DFFF00] text-black">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">Host a Live Jam Room</h2>
                    <p className="text-xs text-[#9AA1AD]">Configure your real-time social listening broadcast</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#9AA1AD] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Room Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midnight Ambient & Lo-Fi Lounge"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-white/10 text-xs text-white placeholder-[#9AA1AD]/50 focus:outline-none focus:border-[#DFFF00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">Host Display Name</label>
                    <input
                      type="text"
                      value={newHostName}
                      onChange={(e) => setNewHostName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-white/10 text-xs text-white focus:outline-none focus:border-[#DFFF00]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white">Genre Theme</label>
                    <select
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-white/10 text-xs text-white focus:outline-none focus:border-[#DFFF00] cursor-pointer"
                    >
                      {GENRE_CATEGORIES.filter(g => g !== 'All Rooms').map((g) => (
                        <option key={g} value={g} className="bg-[#11141A] text-white">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="p-3.5 rounded-2xl bg-[#0B0D12] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {allowGuestQueue ? <Unlock className="h-3.5 w-3.5 text-[#DFFF00]" /> : <Lock className="h-3.5 w-3.5 text-[#9AA1AD]" />}
                        Collaborative Queue
                      </div>
                      <div className="text-[10px] text-[#9AA1AD]">Allow connected listeners to request &amp; add songs</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowGuestQueue}
                      onChange={(e) => setAllowGuestQueue(e.target.checked)}
                      className="w-4 h-4 accent-[#DFFF00] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <div className="text-xs font-bold text-white">Private Session</div>
                      <div className="text-[10px] text-[#9AA1AD]">Only users with the invite code can enter</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 accent-[#DFFF00] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <NeoButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </NeoButton>
                  <NeoButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="font-bold shadow-md"
                  >
                    <Radio className="h-3.5 w-3.5 mr-1" /> Launch Jam Room
                  </NeoButton>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
