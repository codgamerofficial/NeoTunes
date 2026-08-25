'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
  UserPlus, 
  UserCheck, 
  ShieldAlert, 
  Share2, 
  ListMusic, 
  Heart, 
  Sparkles, 
  Lock, 
  Check, 
  Globe, 
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { SocialManager } from '@/services/SocialManager';
import { UserProfile, SocialPlaylist } from '@/types/social';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';

export default function UserProfilePage() {
  const router = useRouter();
  const rawParams = useParams();
  const rawUsername = (rawParams?.username as string || 'guest_listener').toLowerCase();

  const { playTrack } = usePlaybackStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlists' | 'artists' | 'activity'>('playlists');

  useEffect(() => {
    const prof = SocialManager.getProfile(rawUsername);
    setProfile(prof);
    setIsBlocked(SocialManager.isBlocked('guest', prof.userId));
  }, [rawUsername]);

  const handleFollowToggle = () => {
    if (!profile) return;
    if (isFollowing || isPending) {
      setIsFollowing(false);
      setIsPending(false);
    } else {
      const res = SocialManager.followUser('guest', profile);
      if (res.success) {
        if (res.isPending) setIsPending(true);
        else setIsFollowing(true);
      }
    }
  };

  const handleBlockUser = () => {
    if (!profile) return;
    SocialManager.blockUser('guest', profile.userId);
    setIsBlocked(true);
  };

  const handleReportUser = () => {
    if (!profile) return;
    SocialManager.reportContent('guest', profile.userId, 'profile', 'SPAM', 'Reported from profile view');
    alert('User reported. Thank you for keeping NeoTunes safe.');
  };

  if (!profile) {
    return (
      <div className="p-10 text-center text-xs font-mono text-white/50 animate-pulse min-h-screen bg-[#050505]">
        Loading profile...
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="p-10 text-center space-y-4 min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
        <ShieldAlert className="h-10 w-10 text-red-400" />
        <h2 className="text-xl font-bold">User Blocked</h2>
        <p className="text-xs text-white/50">You have blocked this profile.</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2 rounded-full bg-white/10 text-xs font-bold hover:bg-white/20"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <FeatureErrorBoundary featureName="User Profile">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header Profile Card */}
        <div className="relative p-6 rounded-3xl bg-[#090C12] border border-white/10 space-y-5 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D9FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#00D9FF] to-[#DFFF00] p-1 shadow-xl shrink-0">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-[#00D9FF]" />
                )}
              </div>
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{profile.displayName}</h1>
                <span className="text-xs font-mono text-[#DFFF00] bg-[#DFFF00]/10 px-2.5 py-0.5 rounded-full border border-[#DFFF00]/30 font-bold">
                  @{profile.username}
                </span>
              </div>
              <p className="text-xs text-[#A1A1A6] max-w-md">{profile.bio}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
              <button
                onClick={handleFollowToggle}
                className={`px-5 py-2.5 rounded-full text-xs font-mono font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  isFollowing
                    ? 'bg-white/10 text-white border border-white/20'
                    : isPending
                    ? 'bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/40'
                    : 'bg-[#DFFF00] text-black shadow-[0_0_20px_rgba(223,255,0,0.25)] hover:scale-105'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4" /> Following
                  </>
                ) : isPending ? (
                  <>
                    <Clock className="h-4 w-4" /> Requested
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Follow
                  </>
                )}
              </button>

              <button
                onClick={handleReportUser}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Report Profile"
              >
                <ShieldAlert className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center font-mono text-xs relative z-10">
            <div>
              <span className="block text-base font-black text-white">{profile.followersCount}</span>
              <span className="text-[10px] text-[#A1A1A6] uppercase">Followers</span>
            </div>
            <div>
              <span className="block text-base font-black text-white">{profile.followingCount}</span>
              <span className="text-[10px] text-[#A1A1A6] uppercase">Following</span>
            </div>
            <div>
              <span className="block text-base font-black text-white">3</span>
              <span className="text-[10px] text-[#A1A1A6] uppercase">Public Playlists</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'playlists' ? 'bg-[#00D9FF] text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Public Playlists
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'artists' ? 'bg-[#00D9FF] text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Favorite Artists
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#DFFF00] to-[#00D9FF] flex items-center justify-center text-black font-extrabold">
                <ListMusic className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Late Night Bengali Vibe</h4>
                <p className="text-xs text-[#A1A1A6]">Playlist • 14 tracks</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="flex flex-wrap gap-2">
            {profile.favoriteArtists.map((art) => (
              <span key={art} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-white">
                {art}
              </span>
            ))}
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
