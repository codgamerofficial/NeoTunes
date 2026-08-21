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
  Share2,
  Settings as SettingsIcon,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientBrowser } from '@/lib/supabase-browser';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { useSettingsStore } from '@/store/settings-store';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeoAvatar } from '@/components/ui/NeoAvatar';
import { getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';

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

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'playlists' | 'liked' | 'followers'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(displayName || 'Saswata Dey');
  const [editUsername, setEditUsername] = useState(username || 'saswatadey');
  const [editBio, setEditBio] = useState(bio || 'Music listener & sound enthusiast');
  const [editAvatar, setEditAvatar] = useState(avatarUrl || '');

  useEffect(() => {
    setEditName(displayName || 'Saswata Dey');
    setEditUsername(username || 'saswatadey');
    setEditBio(bio || 'Music listener & sound enthusiast');
    setEditAvatar(avatarUrl || '');
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
      const { setPlaying } = usePlaybackStore.getState();
      setPlaying(false);
      const supabase = createClientBrowser();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout error:', e);
    }
    localStorage.removeItem('neotunes_user');
    router.push('/welcome');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'liked', label: 'Liked Music' },
    { id: 'followers', label: 'Followers' },
  ];

  const recentTracks = history.length > 0 ? history.slice(0, 6) : (currentTrack ? [currentTrack] : []);

  return (
    <FeatureErrorBoundary featureName="Profile">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 min-h-screen relative z-10 max-w-[1450px] mx-auto">
      
        {/* ── COMPACT PROFILE HERO PANEL (300-360px HEIGHT) ── */}
        <div className="relative p-6 sm:p-8 rounded-2xl bg-white/[0.045] border border-white/10 flex flex-col items-center text-center space-y-4 shadow-xl">
          
          {/* Avatar with resilient fallback & verified badge */}
          <div className="relative">
            <NeoAvatar
              source={avatarUrl}
              name={displayName || 'Saswata Dey'}
              size="lg"
              verified
            />
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#DFFF00] text-black shadow-md hover:scale-105 transition-transform cursor-pointer"
              title="Edit Profile"
            >
              <Edit2 className="w-3.5 h-3.5 fill-black text-black" />
            </button>
          </div>

          {/* User Names & Metadata Badges */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {displayName || 'Saswata Dey'}
              </h1>
            </div>
            <p className="text-xs font-mono text-[#A1A1A6]">
              @{username || 'saswatadey'}
            </p>
            <p className="text-xs text-[#A1A1A6] pt-1 max-w-md mx-auto">
              {bio || 'Music listener & sound enthusiast'}
            </p>
          </div>

          {/* Metadata Badges (Compact [ ● PRO ] [ ✓ VERIFIED ]) */}
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.055] border border-[#DFFF00]/40 text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00]" /> PRO
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.055] border border-white/10 text-[10px] font-mono font-bold text-[#A1A1A6] uppercase tracking-wider">
              ✓ VERIFIED
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 rounded-full bg-white/[0.09] text-white hover:bg-white/[0.15] border border-white/15 text-xs font-mono font-bold transition-all cursor-pointer min-h-[40px] flex items-center justify-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'NeoTunes Profile', url: window.location.href });
                }
              }}
              className="px-4 py-2 rounded-full bg-white/[0.045] text-[#A1A1A6] hover:text-white border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer min-h-[40px] flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {/* ── PROFILE TABS (HORIZONTAL SCROLLING WITHOUT CLIPPING) ── */}
        <div className="border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-1 min-h-[44px]">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-white/[0.09] text-[#DFFF00] border border-[#DFFF00] shadow-sm font-extrabold'
                      : 'bg-white/[0.045] text-[#A1A1A6] hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Listening Insights (2-Column Stat Grid Mobile) */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DFFF00]" /> Listening Insights
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <GlassCard className="p-4 space-y-1">
                  <span className="text-[10px] font-mono text-[#A1A1A6] uppercase tracking-wider">Tracks</span>
                  <div className="text-xl sm:text-2xl font-mono font-black text-white">6</div>
                </GlassCard>
                <GlassCard className="p-4 space-y-1">
                  <span className="text-[10px] font-mono text-[#A1A1A6] uppercase tracking-wider">Top Genre</span>
                  <div className="text-sm sm:text-base font-bold text-[#DFFF00] truncate">Bollywood Pop</div>
                </GlassCard>
                <GlassCard className="p-4 space-y-1">
                  <span className="text-[10px] font-mono text-[#A1A1A6] uppercase tracking-wider">Playlists</span>
                  <div className="text-xl sm:text-2xl font-mono font-black text-white">4</div>
                </GlassCard>
                <GlassCard className="p-4 space-y-1">
                  <span className="text-[10px] font-mono text-[#A1A1A6] uppercase tracking-wider">Quality</span>
                  <div className="text-sm sm:text-base font-bold text-white truncate">Very High</div>
                </GlassCard>
              </div>
            </div>

            {/* Recently Played Section */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-mono">
                Recently Played
              </h2>
              {recentTracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentTracks.map((track, idx) => (
                    <GlassCard
                      key={track.id || idx}
                      onClick={() => playTrack(track)}
                      className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Artwork
                          source={resolveArtwork(track)}
                          size="small"
                          canonicalId={track.id}
                          type="track"
                          className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] truncate transition-colors">
                            {track.title}
                          </div>
                          <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                            {getArtistName(track.artists || track.artist)}
                          </div>
                        </div>
                      </div>
                      <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#DFFF00] group-hover:text-black transition-all">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-8 text-center space-y-3">
                  <Music className="w-8 h-8 text-[#A1A1A6] mx-auto" />
                  <p className="text-xs text-[#A1A1A6]">No recent tracks played yet.</p>
                  <button
                    onClick={() => router.push('/search')}
                    className="px-4 py-2 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider"
                  >
                    Explore Music
                  </button>
                </GlassCard>
              )}
            </div>

          </div>
        )}

        {activeTab === 'playlists' && (
          <GlassCard className="p-8 text-center space-y-3">
            <ListMusic className="w-8 h-8 text-[#A1A1A6] mx-auto" />
            <p className="text-xs text-[#A1A1A6]">No playlists created yet.</p>
            <button
              onClick={() => router.push('/library')}
              className="px-4 py-2 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider"
            >
              Create Playlist
            </button>
          </GlassCard>
        )}

        {activeTab === 'liked' && (
          <GlassCard className="p-8 text-center space-y-3">
            <Heart className="w-8 h-8 text-[#DFFF00] mx-auto" />
            <p className="text-xs text-[#A1A1A6]">Saved tracks you love will appear here.</p>
            <button
              onClick={() => router.push('/browse')}
              className="px-4 py-2 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider"
            >
              Browse Music
            </button>
          </GlassCard>
        )}

        {(activeTab === 'activity' || activeTab === 'followers') && (
          <GlassCard className="p-8 text-center space-y-2">
            <p className="text-xs text-[#A1A1A6]">No recent activity to display.</p>
          </GlassCard>
        )}

        {/* ── INTERACTIVE EDIT PROFILE MODAL ── */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditing(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-[#090A0C] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 z-10"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white font-mono">Edit Profile</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-[#A1A1A6] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-[#A1A1A6] uppercase">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white/[0.055] border border-white/10 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none focus:border-[#DFFF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-[#A1A1A6] uppercase">Username</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-white/[0.055] border border-white/10 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none focus:border-[#DFFF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-[#A1A1A6] uppercase">Bio</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-white/[0.055] border border-white/10 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none focus:border-[#DFFF00] resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-[#A1A1A6] uppercase">Avatar Image URL</label>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/[0.055] border border-white/10 rounded-xl px-3 py-2 text-xs font-sans text-white outline-none focus:border-[#DFFF00]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-full bg-white/5 text-[#A1A1A6] hover:text-white text-xs font-mono font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider"
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
