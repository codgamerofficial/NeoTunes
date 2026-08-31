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
import { useToast } from '@/components/ui/NeoToast';
import { normalizeTrack } from '@/app/page';

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

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'playlists' | 'liked'>('overview');
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

  return (
    <FeatureErrorBoundary featureName="Profile">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* Profile Identity Card */}
        <NeoCard elevated className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative">
          <div className="relative shrink-0">
            <Artwork
              source={avatarUrl || editAvatar}
              size="large"
              aspectRatio="circle"
              alt={displayName || 'User Avatar'}
              type="artist"
              className="h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-[#DFFF00]/40 shadow-2xl"
            />
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#DFFF00] text-black shadow-lg hover:scale-105 transition-transform cursor-pointer"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4 fill-black text-black" />
            </button>
          </div>

          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {displayName || 'Music Listener'}
                </h1>
                <p className="text-xs text-[#9AA1AD] font-medium">
                  @{username || 'listener'}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/30 text-[10px] font-bold text-[#DFFF00] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00]" /> Neo Member
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#9AA1AD] leading-relaxed max-w-lg">
              {bio || 'Music listener & sound explorer on NeoTunes.'}
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <NeoButton
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </NeoButton>

              <NeoButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
              >
                <SettingsIcon className="w-3.5 h-3.5" /> Settings
              </NeoButton>

              <NeoButton
                variant="danger"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </NeoButton>
            </div>
          </div>
        </NeoCard>

        {/* Music Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NeoCard className="p-4 text-center space-y-1">
            <span className="text-[10px] font-bold text-[#9AA1AD] uppercase tracking-wider">Tracks Played</span>
            <div className="text-xl sm:text-2xl font-black text-white">{totalTracksPlayed}</div>
          </NeoCard>

          <NeoCard className="p-4 text-center space-y-1">
            <span className="text-[10px] font-bold text-[#9AA1AD] uppercase tracking-wider">Listening Time</span>
            <div className="text-xl sm:text-2xl font-black text-[#DFFF00]">{estimatedHours} hrs</div>
          </NeoCard>

          <NeoCard className="p-4 text-center space-y-1">
            <span className="text-[10px] font-bold text-[#9AA1AD] uppercase tracking-wider">Top Vibe</span>
            <div className="text-xl sm:text-2xl font-black text-[#00E5FF]">Bollywood</div>
          </NeoCard>

          <NeoCard className="p-4 text-center space-y-1">
            <span className="text-[10px] font-bold text-[#9AA1AD] uppercase tracking-wider">Soundstage</span>
            <div className="text-xl sm:text-2xl font-black text-white">Spatial</div>
          </NeoCard>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'activity', label: 'Recent Activity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#DFFF00] text-black font-bold shadow-sm'
                  : 'bg-[#11141A] text-[#9AA1AD] hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Continue Listening
              </h2>
              <button
                onClick={() => router.push('/history')}
                className="text-xs font-semibold text-[#9AA1AD] hover:text-white"
              >
                View all
              </button>
            </div>

            {normalizedHistory.length === 0 ? (
              <NeoEmptyState
                icon={Music}
                title="No recent streams"
                description="Songs you play will appear in your profile activity."
                actionLabel="Explore Music"
                onAction={() => router.push('/browse')}
              />
            ) : (
              <div className="space-y-1">
                {normalizedHistory.slice(0, 5).map((trk, idx) => (
                  <NeoTrackRow
                    key={`${trk.id}_${idx}`}
                    track={trk}
                    index={idx}
                    showIndex={false}
                    playlistContext={normalizedHistory}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {normalizedHistory.length === 0 ? (
              <NeoEmptyState
                icon={Clock}
                title="No listening history"
                description="Start listening to build your music timeline."
                actionLabel="Browse"
                onAction={() => router.push('/browse')}
              />
            ) : (
              <div className="space-y-1">
                {normalizedHistory.map((trk, idx) => (
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
        )}

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white">Edit Music Profile</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-full text-[#9AA1AD] hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Artwork
                    source={editAvatar}
                    size="medium"
                    aspectRatio="circle"
                    alt="Avatar preview"
                    className="h-16 w-16 rounded-full object-cover border border-white/10 shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <label className="text-xs font-semibold text-[#9AA1AD]">Avatar Image URL</label>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#171A21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#9AA1AD] focus:outline-none focus:border-[#DFFF00]/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9AA1AD]">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#171A21] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DFFF00]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9AA1AD]">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-[#171A21] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DFFF00]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9AA1AD]">Bio</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-[#171A21] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#DFFF00]/50 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <NeoButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </NeoButton>
                  <NeoButton
                    variant="primary"
                    size="sm"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </NeoButton>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
