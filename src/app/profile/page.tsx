'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Clock, 
  Music, 
  Edit2, 
  Sparkles, 
  Heart, 
  Check, 
  X, 
  LogOut, 
  Share2, 
  Settings as SettingsIcon, 
  Disc3, 
  TrendingUp
} from 'lucide-react';
import { createClientBrowser } from '@/lib/supabase-browser';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { useSettingsStore } from '@/store/settings-store';
import { Artwork } from '@/components/ui/Artwork';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { NeoTabs, TabItem } from '@/components/ui/NeoTabs';
import { useToast } from '@/components/ui/NeoToast';
import { normalizeTrack } from '@/services/normalizeTrack';

export default function ProfilePage() {
  const router = useRouter();
  const { history, currentTrack, playTrack } = usePlaybackStore();
  const { showToast } = useToast();
  const { 
    displayName, 
    username, 
    bio, 
    avatarUrl, 
    updateProfile,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'liked'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(displayName || 'Music Listener');
  const [editUsername, setEditUsername] = useState(username || 'listener');
  const [editBio, setEditBio] = useState(bio || 'Music listener & sound explorer');
  const [editAvatar, setEditAvatar] = useState(avatarUrl || '');

  useEffect(() => {
    setEditName(displayName || 'Music Listener');
    setEditUsername(username || 'listener');
    setEditBio(bio || 'Music listener & sound explorer');
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
    showToast('Profile updated successfully!');
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

  const normalizedHistory = history.map(normalizeTrack);
  const totalTracksPlayed = history.length;
  const estimatedHours = ((totalTracksPlayed * 3.5) / 60).toFixed(1);

  const profileTabs: TabItem<'overview' | 'history' | 'liked'>[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'History', count: history.length },
    { id: 'liked', label: 'Liked Songs' },
  ];

  return (
    <FeatureErrorBoundary featureName="Profile">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* ── 1. PROFILE IDENTITY HERO CARD ── */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#171A21] via-[#11141A] to-[#0B0D12] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <Artwork
            source={avatarUrl || editAvatar}
            size="large"
            aspectRatio="circle"
            alt={displayName || 'User Avatar'}
            type="artist"
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-white/15 shadow-2xl shrink-0"
          />

          <div className="space-y-2 min-w-0 flex-1">
            <span className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/25 inline-block">
              LISTENER PROFILE
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {displayName || 'Music Listener'}
            </h1>

            <p className="text-xs font-mono text-[#00E5FF]">
              @{username || 'listener'}
            </p>

            <p className="text-xs sm:text-sm text-[#9AA1AD] leading-relaxed max-w-md">
              {bio || 'Sound enthusiast discovering music on NeoTunes.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <NeoButton
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit Profile
              </NeoButton>

              <NeoButton
                variant="secondary"
                size="sm"
                onClick={() => router.push('/settings')}
              >
                <SettingsIcon className="h-3.5 w-3.5" /> Settings
              </NeoButton>

              <NeoButton
                variant="danger"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </NeoButton>
            </div>
          </div>
        </div>

        {/* ── 2. EDIT PROFILE FORM DRAWER/CARD (If Editing) ── */}
        {isEditing && (
          <NeoCard className="p-6 space-y-4 bg-[#11141A] border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-[#DFFF00]" /> Edit Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9AA1AD]">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[#DFFF00]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9AA1AD]">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[#DFFF00]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-[#9AA1AD]">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[#DFFF00] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <NeoButton variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="primary" size="sm" onClick={handleSaveProfile}>
                Save Changes
              </NeoButton>
            </div>
          </NeoCard>
        )}

        {/* ── 3. REAL LISTENING STATISTICS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NeoCard className="p-4 space-y-1 text-center">
            <div className="text-xl sm:text-2xl font-black text-[#DFFF00] font-mono">
              {totalTracksPlayed}
            </div>
            <div className="text-xs text-[#9AA1AD] font-semibold">Tracks Played</div>
          </NeoCard>

          <NeoCard className="p-4 space-y-1 text-center">
            <div className="text-xl sm:text-2xl font-black text-[#00E5FF] font-mono">
              {estimatedHours}h
            </div>
            <div className="text-xs text-[#9AA1AD] font-semibold">Estimated Listening</div>
          </NeoCard>

          <NeoCard className="p-4 space-y-1 text-center col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              Active
            </div>
            <div className="text-xs text-[#9AA1AD] font-semibold">Session Status</div>
          </NeoCard>
        </div>

        {/* ── 4. PROFILE TABS & RECENT HISTORY ── */}
        <div className="space-y-4 pt-2">
          <NeoTabs
            tabs={profileTabs}
            activeTab={activeTab}
            onChange={(tab) => {
              if (tab === 'liked') router.push('/liked');
              else setActiveTab(tab);
            }}
          />

          {activeTab === 'history' || activeTab === 'overview' ? (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD]">
                Recent Listening History ({history.length})
              </h3>

              {history.length === 0 ? (
                <NeoEmptyState
                  icon={Clock}
                  title="No listening history yet"
                  description="Tracks you listen to will automatically appear here."
                  actionText="Explore Music"
                  onAction={() => router.push('/browse')}
                />
              ) : (
                <div className="space-y-1">
                  {normalizedHistory.slice(0, 10).map((trk, idx) => (
                    <NeoTrackRow
                      key={`${trk.id}_${idx}`}
                      track={trk}
                      index={idx}
                      showIndex={true}
                      playlistContext={normalizedHistory}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
