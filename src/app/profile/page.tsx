'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientBrowser } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  BarChart3, 
  Compass, 
  Sparkles, 
  Disc, 
  Radio, 
  Music, 
  Edit3, 
  Award, 
  Calendar, 
  Users, 
  Play, 
  Flame, 
  MapPin, 
  UserCheck,
  TrendingUp,
  Activity,
  Layers,
  Volume2,
  Loader2,
  X,
  Check,
  Camera,
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import PremiumTrackCard, { Track } from '@/components/ui/PremiumTrackCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileStats {
  totalLikes: number;
  totalPlays: number;
  topTracks: {
    id: string;
    title: string;
    artist: { name: string };
    durationMs: number;
    coverUrl?: string;
    playCount: number;
  }[];
  favoriteGenre: string;
}

export default function ProfilePage() {
  const supabase = createClientBrowser();
  const { playTrack } = usePlaybackStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('Music Enthusiast');
  const [bio, setBio] = useState('Full-Stack Architect & AI Music Curator. Building desktop audio spaces while listening to low-tempo lofi and high-BPM synthwave.');
  const [location, setLocation] = useState('Global');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [joinedAt, setJoinedAt] = useState('July 2026');

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch authenticated user profile
  useEffect(() => {
    const fetchUser = async () => {
      // 1. Load local profile overrides if present
      const savedName = localStorage.getItem('neotunes_user_name');
      const savedBio = localStorage.getItem('neotunes_user_bio');
      const savedLoc = localStorage.getItem('neotunes_user_location');
      const savedAvatar = localStorage.getItem('neotunes_user_avatar');

      if (savedName) setDisplayName(savedName);
      if (savedBio) setBio(savedBio);
      if (savedLoc) setLocation(savedLoc);
      if (savedAvatar) setAvatarUrl(savedAvatar);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setEmail(user.email || '');
          if (user.created_at) {
            setJoinedAt(new Date(user.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' }));
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, bio, location')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.display_name) setDisplayName(profile.display_name);
            if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
            if (profile.bio) setBio(profile.bio);
            if (profile.location) setLocation(profile.location);
          }
        }
      } catch (err) {
        console.warn('Profile fetch handled:', err);
      }
    };
    fetchUser();
  }, []);

  // Fetch real user statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery<ProfileStats>({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const res = await fetch('/api/user/stats');
      if (!res.ok) {
        return {
          totalLikes: 0,
          totalPlays: 0,
          topTracks: [],
          favoriteGenre: 'Lofi & Electronic',
        };
      }
      return res.json();
    },
  });

  // Open Edit Profile Modal
  const handleOpenEdit = () => {
    setEditName(displayName);
    setEditBio(bio);
    setEditLocation(location);
    setEditAvatar(avatarUrl);
    setIsEditing(true);
  };

  // Save Profile Changes to Supabase & Local Storage
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      localStorage.setItem('neotunes_user_name', editName);
      localStorage.setItem('neotunes_user_bio', editBio);
      localStorage.setItem('neotunes_user_location', editLocation);
      localStorage.setItem('neotunes_user_avatar', editAvatar);

      setDisplayName(editName);
      setBio(editBio);
      setLocation(editLocation);
      setAvatarUrl(editAvatar);

      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          display_name: editName,
          bio: editBio,
          location: editLocation,
          avatar_url: editAvatar,
          updated_at: new Date().toISOString(),
        });
      }

      setIsEditing(false);
      showToast('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Profile saved locally.');
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayTrack = (track: any, list: any[]) => {
    const trackObj: Track = {
      id: track.id,
      title: track.title,
      artist: track.artist || { name: 'Unknown' },
      durationMs: track.durationMs || 180000,
      coverUrl: track.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
      sourceType: 'youtube'
    };
    const listObj = list.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist || { name: 'Unknown' },
      durationMs: t.durationMs || 180000,
      coverUrl: t.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
      sourceType: 'youtube' as const
    }));
    playTrack(trackObj, listObj);
  };

  const totalPlays = stats?.totalPlays || 0;
  const totalLikes = stats?.totalLikes || 0;

  return (
    <div className="space-y-10 text-white pb-36 sm:pb-20 text-left select-none font-sans w-full relative p-6 sm:p-8">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-[#181818] border border-[#282828] px-5 py-2 text-xs font-semibold text-white shadow-xl flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00D6FF]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 h-[350px] w-[350px] rounded-full bg-[#8B5CF6]/10 blur-[120px] pointer-events-none -z-10" />

      {/* A. USER PROFILE HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-[#282828] bg-[#0E121B] p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          
          {/* Avatar Image / Fallback Initials */}
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden p-[3px] bg-gradient-to-tr from-[#18D8FF] via-[#8B5CF6] to-[#FF4FD8] flex-shrink-0 shadow-xl">
            <div className="h-full w-full rounded-full bg-[#0A0D14] flex items-center justify-center relative overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="object-cover w-full h-full rounded-full" />
              ) : (
                <span className="text-3xl font-black bg-gradient-to-br from-[#18D8FF] to-[#FF4FD8] bg-clip-text text-transparent uppercase tracking-wider">
                  {displayName ? displayName.slice(0, 2) : 'NT'}
                </span>
              )}
            </div>
            
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#18D8FF] to-[#8B5CF6] px-3 py-0.5 text-[9px] font-black text-black uppercase tracking-widest shadow-md">
              PRO MEMBER
            </span>
          </div>

          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18D8FF]/10 border border-[#18D8FF]/20 px-3.5 py-1 text-[10px] font-bold text-[#18D8FF] uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-[#18D8FF]" />
                <span>FLAC 24-bit Lossless</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4FD8]/10 border border-[#FF4FD8]/20 px-3.5 py-1 text-[10px] font-bold text-[#FF4FD8] uppercase tracking-wider">
                <Calendar className="h-3 w-3 text-[#FF4FD8]" />
                <span>Joined {joinedAt}</span>
              </span>
            </div>
            
            <h1 className="text-3xl font-black text-white tracking-tight">{displayName}</h1>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#B3B3B3] font-semibold">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#18D8FF]" /> {location}</span>
              {email && (
                <>
                  <span>•</span>
                  <span>{email}</span>
                </>
              )}
            </div>

            <p className="text-xs text-[#B3B3B3] max-w-lg leading-relaxed font-medium">
              {bio}
            </p>
          </div>
        </div>

        {/* Edit Profile Trigger */}
        <button
          onClick={handleOpenEdit}
          className="rounded-full border border-[#282828] bg-[#181818] hover:bg-[#282828] px-5 py-2.5 text-xs font-bold text-white transition-all flex items-center gap-2 active:scale-95 shadow-md"
        >
          <Edit3 className="h-4 w-4 text-[#18D8FF]" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* B. REAL LISTENING STATISTICS */}
      <section className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B3B3B3] border-b border-[#181818] pb-2">
          REAL PLAYBACK STATISTICS
        </h3>
        
        {isLoadingStats ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#18D8FF]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Total Plays Logged', value: totalPlays, icon: BarChart3, desc: 'Real track play records' },
              { label: 'Liked Tracks', value: totalLikes, icon: Heart, desc: 'Saved in your library' },
              { label: 'Audio Quality', value: 'FLAC 24-bit', icon: Volume2, desc: '96kHz Lossless Audio' },
              { label: 'Connected Sources', value: '4 Providers', icon: Compass, desc: 'YouTube, Spotify, Deezer, Local' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#282828] bg-[#181818] p-5 flex items-center justify-between shadow-lg hover:border-[#18D8FF]/30 transition-all"
                >
                  <div className="text-left space-y-1 min-w-0">
                    <p className="text-[10px] text-[#B3B3B3] font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] text-[#B3B3B3] font-medium">{stat.desc}</p>
                  </div>
                  <Icon className="h-7 w-7 text-[#00D6FF] opacity-40 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* C. TOP PLAYED TRACKS */}
      <div className="space-y-4 pt-4 border-t border-[#181818]">
        <div className="flex items-center justify-between border-b border-[#181818] pb-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B3B3B3]">
            MOST PLAYED TRACKS
          </h3>
          <span className="text-xs font-mono text-[#18D8FF] font-bold">Real Activity History</span>
        </div>

        {!stats || stats.topTracks.length === 0 ? (
          <div className="rounded-2xl border border-[#282828] bg-[#181818] py-12 text-center text-xs text-[#B3B3B3] font-semibold space-y-2">
            <Music className="h-8 w-8 mx-auto text-[#282828]" />
            <p>No listening history logged yet.</p>
            <p className="text-[11px] text-[#B3B3B3]">Play songs across NeoTunes to automatically log real listening stats!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.topTracks.map((track, idx) => (
              <div
                key={track.id + idx}
                onClick={() => handlePlayTrack(track, stats.topTracks)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] border border-[#282828] cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-5 text-center text-xs font-mono text-[#B3B3B3] font-bold">{idx + 1}</span>
                  <div className="relative h-11 w-11 rounded-xl overflow-hidden flex-shrink-0 border border-[#282828]">
                    <ImageWithFallback src={track.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'} alt={track.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white group-hover:text-[#18D8FF] truncate">{track.title}</p>
                    <p className="text-[11px] text-[#B3B3B3] truncate">{track.artist?.name || 'Artist'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-[#18D8FF] bg-[#18D8FF]/10 px-2.5 py-0.5 rounded-full border border-[#18D8FF]/20">
                    {track.playCount} plays
                  </span>
                  <Play className="h-4 w-4 text-white group-hover:text-[#18D8FF]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[#0E121B] border border-[#282828] p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#181818] pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-[#18D8FF]" />
                  <span>Edit Profile</span>
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-full text-[#B3B3B3] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#B3B3B3] uppercase">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-[#181818] border border-[#282828] rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#18D8FF]"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#B3B3B3] uppercase">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-[#181818] border border-[#282828] rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#18D8FF]"
                    placeholder="e.g. Mumbai, India"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#B3B3B3] uppercase">Avatar Image URL</label>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full bg-[#181818] border border-[#282828] rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#18D8FF]"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#B3B3B3] uppercase">Bio</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-[#181818] border border-[#282828] rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:border-[#18D8FF] resize-none"
                    placeholder="Tell the community about your music taste..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#181818]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-[#B3B3B3] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 rounded-full bg-[#18D8FF] text-black text-xs font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
