'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Flame, 
  Clock, 
  Music, 
  Crown, 
  Edit2, 
  Sparkles, 
  ShieldCheck, 
  ListMusic, 
  Heart, 
  Lock, 
  Globe, 
  Check, 
  X, 
  LogOut,
  Play,
  Disc,
  Radio,
  Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientBrowser } from '@/lib/supabase-browser';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { useSettingsStore } from '@/store/settings-store';
import { Artwork } from '@/components/ui/Artwork';
import { getArtistName } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { history, currentTrack, playTrack } = usePlaybackStore();
  const { 
    displayName, 
    username, 
    bio, 
    avatarUrl, 
    updateProfile,
    privateSession,
    setPrivateSession
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'playlists' | 'liked' | 'following' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(displayName);
  const [editUsername, setEditUsername] = useState(username);
  const [editBio, setEditBio] = useState(bio);
  const [editAvatar, setEditAvatar] = useState(avatarUrl);

  useEffect(() => {
    setEditName(displayName);
    setEditUsername(username);
    setEditBio(bio);
    setEditAvatar(avatarUrl);
  }, [displayName, username, bio, avatarUrl]);

  const handleSaveProfile = () => {
    updateProfile({
      displayName: editName,
      username: editUsername,
      bio: editBio,
      avatarUrl: editAvatar,
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClientBrowser();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout error:', e);
    }
    localStorage.removeItem('neotunes_user');
    router.push('/auth');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'liked', label: 'Liked Music' },
    { id: 'following', label: 'Following' },
    { id: 'settings', label: 'Settings' },
  ];

  const recentTracks = history.length > 0 ? history.slice(0, 6) : (currentTrack ? [currentTrack] : []);

  return (
    <FeatureErrorBoundary featureName="Profile">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F4F1F7] font-sans select-none pb-36 min-h-screen relative z-10 max-w-[1650px] mx-auto">
      
        {/* ── PROFILE HERO (Specs 28-30) ── */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0D101C]/90 border border-white/10 flex flex-col sm:flex-row items-center gap-6 shadow-2xl overflow-hidden">
          <div className="relative shrink-0">
            <Artwork
              source={avatarUrl}
              size="large"
              aspectRatio="circle"
              alt={displayName}
              type="artist"
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-[#00D4FF] shadow-lg object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white truncate">{displayName}</h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30">
                Listener
              </span>
            </div>

            <p className="text-xs font-mono text-[#00D4FF]">@{username}</p>
            <p className="text-xs text-white/70 max-w-md line-clamp-2 font-medium">{bio}</p>

            <div className="pt-2 flex justify-center sm:justify-start gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-full bg-[#111524] border border-white/10 hover:border-[#00D4FF]/40 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Edit2 className="h-3.5 w-3.5 text-[#00D4FF]" /> Edit Profile
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-full bg-[#111524] border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-red-400 transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* ── PROFILE NAVIGATION TABS (Spec 31) ── */}
        <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#00D4FF] text-black shadow-[0_0_12px_rgba(0,214,255,0.4)]'
                  : 'bg-[#0D101C]/80 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {recentTracks.length > 0 ? (
              <div className="space-y-6">
                {/* Dynamic Listening Insights (Spec 33) */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#0D101C]/90 border border-white/10 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#00D4FF]" />
                    <h3 className="text-lg font-black text-white">Listening Insights</h3>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed max-w-xl">
                    You have listened to <span className="text-[#00D4FF] font-bold">{recentTracks.length} tracks</span> across your recent multiverse sessions.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-[#111524] border border-white/10 space-y-1">
                      <div className="text-xs font-mono font-bold text-white/50">TRACKS LISTENED</div>
                      <div className="text-xl font-black text-[#00D4FF]">{recentTracks.length}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#111524] border border-white/10 space-y-1">
                      <div className="text-xs font-mono font-bold text-white/50">TOP GENRE</div>
                      <div className="text-xl font-black text-[#FF9D00]">Bollywood Pop</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#111524] border border-white/10 space-y-1">
                      <div className="text-xs font-mono font-bold text-white/50">PLAYLISTS</div>
                      <div className="text-xl font-black text-[#FF2D9A]">4 Active</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#111524] border border-white/10 space-y-1">
                      <div className="text-xs font-mono font-bold text-white/50">STREAM QUALITY</div>
                      <div className="text-xl font-black text-[#10B981]">Very High</div>
                    </div>
                  </div>
                </div>

                {/* Recently Played List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-white">Recently Listened Tracks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentTracks.map((tr) => (
                      <div
                        key={tr.canonicalId || tr.id}
                        onClick={() => playTrack(tr)}
                        className="p-3.5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 flex items-center gap-3.5 cursor-pointer transition-all group shadow-md"
                      >
                        <Artwork
                          track={tr}
                          source={tr.artworkUrl || tr.coverUrl}
                          size="small"
                          canonicalId={tr.canonicalId || tr.id}
                          type="track"
                          className="h-12 w-12 rounded-xl flex-shrink-0 border border-white/15 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-white truncate group-hover:text-[#00D4FF] transition-colors">{tr.title}</div>
                          <div className="text-[11px] text-white/60 truncate font-semibold">{getArtistName(tr.artist || tr.artists)}</div>
                        </div>
                        <button className="h-8 w-8 rounded-full bg-[#00D4FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Play className="h-4 w-4 fill-black ml-0.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-[#0D101C]/90 border border-white/10 space-y-4 text-center sm:text-left shadow-xl">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="h-5 w-5 text-[#00D4FF]" />
                  <h3 className="text-base font-bold text-white">Your Listening Story Starts Here</h3>
                </div>
                <p className="text-xs text-white/60 leading-relaxed max-w-lg">
                  Listen to a few tracks, save playlists, and follow your favorite artists. NeoTunes will compile your personal listening insights right here.
                </p>
                <div className="pt-2 flex justify-center sm:justify-start gap-3">
                  <button onClick={() => router.push('/search')} className="px-5 py-2.5 rounded-full bg-[#00D4FF] text-black text-xs font-black uppercase tracking-wider hover:scale-105 transition-transform cursor-pointer shadow-md">
                    Discover Music
                  </button>
                  <button onClick={() => router.push('/library')} className="px-5 py-2.5 rounded-full bg-[#111524] border border-white/10 text-white text-xs font-bold hover:border-white/20 transition-all cursor-pointer">
                    Open Library
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 rounded-3xl bg-[#0D101C]/90 border border-white/10 space-y-6 max-w-2xl shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-[#00D4FF]" /> Privacy &amp; Quick Preferences
            </h3>
            
            <div className="space-y-4 text-xs font-medium">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#111524] border border-white/5">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-[#00D4FF]" />
                  <div>
                    <div className="font-bold text-white">Private Session Mode</div>
                    <div className="text-white/60 text-[11px]">Hide active listening from history and recommendations</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privateSession}
                  onChange={(e) => setPrivateSession(e.target.checked)}
                  className="h-4 w-4 accent-[#00D4FF] cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-red-400 text-xs">Account Session</div>
                  <div className="text-white/60 text-[11px]">Sign out of your active NeoTunes session on this device</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT PROFILE MODAL (Spec 30) ── */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setIsEditing(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#0D101C] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit2 className="h-5 w-5 text-[#00D4FF]" /> Edit Listener Profile
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-white/60">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#111524] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-white/60">Username</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-[#111524] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-white/60">Bio</label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-[#111524] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-white/60">Avatar Artwork URL</label>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full bg-[#111524] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2 rounded-full bg-[#00D4FF] text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:scale-105 transition-transform"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </FeatureErrorBoundary>
  );
}
