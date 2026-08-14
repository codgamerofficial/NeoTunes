'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Flame, Clock, Music, Crown, Edit2, Sparkles, ShieldCheck, ListMusic, Heart, Lock, Globe, Check, X, LogOut } from 'lucide-react';
import { createClientBrowser } from '@/lib/supabase-browser';
import { motion, AnimatePresence } from 'framer-motion';

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('Saswata Dey');
  const [username, setUsername] = useState('saswatadey');
  const [userBio, setUserBio] = useState('Music listener and sound enthusiast.');
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'playlists' | 'liked' | 'following' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(userName);
  const [editBio, setEditBio] = useState(userBio);
  const [isPublic, setIsPublic] = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  useEffect(() => {
    const supabase = createClientBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Saswata Dey';
        setUserName(name);
        setEditName(name);
      } else {
        const localUser = localStorage.getItem('neotunes_user');
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            setUser(parsed);
            setUserName(parsed.name || 'Saswata Dey');
            setEditName(parsed.name || 'Saswata Dey');
          } catch {}
        }
      }
    });
  }, []);

  const handleSaveProfile = () => {
    setUserName(editName);
    setUserBio(editBio);
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

  return (
    <FeatureErrorBoundary featureName="Profile">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-[#050507] text-[#F4F1F7] font-sans select-none pb-36 min-h-screen">
      
      {/* ── PROFILE HERO (Spec 16) ── */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-[#121318] border border-white/10 flex flex-col sm:flex-row items-center gap-6 shadow-2xl overflow-hidden">
        <div className="relative">
          <img
            src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80"}
            alt="User Avatar"
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-2 border-[#AFC7FF] shadow-lg"
          />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white truncate">{userName}</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-[#AFC7FF]/15 text-[#AFC7FF] border border-[#AFC7FF]/30">
              Listener
            </span>
          </div>

          <p className="text-xs font-mono text-[#A8A7AF]">@{username}</p>
          <p className="text-xs text-white/70 max-w-md line-clamp-2">{userBio}</p>

          <div className="pt-2 flex justify-center sm:justify-start gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-full bg-[#17181D] border border-white/10 hover:border-[#AFC7FF]/40 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5 text-[#AFC7FF]" /> Edit Profile
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-full bg-[#17181D] border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-red-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── PROFILE NAVIGATION TABS ── */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-[#AFC7FF] text-black shadow-[0_0_10px_rgba(175,199,255,0.4)]'
                : 'bg-[#121318] border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Honest Empty State for Insights */}
          <div className="p-8 rounded-3xl bg-[#121318] border border-white/10 space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="h-5 w-5 text-[#AFC7FF]" />
              <h3 className="text-base font-bold text-white">Your Listening Story Starts Here</h3>
            </div>
            <p className="text-xs text-[#A8A7AF] leading-relaxed max-w-lg">
              Listen to a few tracks, save playlists, and follow your favorite artists. NeoTunes will compile your personal listening insights right here.
            </p>
            <div className="pt-2 flex justify-center sm:justify-start gap-3">
              <button onClick={() => router.push('/search')} className="px-5 py-2.5 rounded-full bg-[#AFC7FF] text-black text-xs font-bold hover:scale-105 transition-transform cursor-pointer">
                Discover Music
              </button>
              <button onClick={() => router.push('/library')} className="px-5 py-2.5 rounded-full bg-[#17181D] border border-white/10 text-white text-xs font-bold hover:border-white/20 transition-all cursor-pointer">
                Open Library
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-[#121318] border border-white/10 space-y-6 max-w-2xl">
          <h3 className="text-base font-bold text-white">Privacy &amp; Preferences</h3>
          
          <div className="space-y-4 text-xs font-medium">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#17181D] border border-white/5">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-[#AFC7FF]" />
                <div>
                  <div className="font-bold text-white">Public Profile</div>
                  <div className="text-[#A8A7AF] text-[11px]">Allow others to find your listener profile</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 accent-[#AFC7FF] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#17181D] border border-white/5">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-[#AFC7FF]" />
                <div>
                  <div className="font-bold text-white">Listening Activity</div>
                  <div className="text-[#A8A7AF] text-[11px]">Show current listening status in Jam rooms</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showActivity}
                onChange={(e) => setShowActivity(e.target.checked)}
                className="h-4 w-4 accent-[#AFC7FF] cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-red-400 text-xs">Account Session</div>
                <div className="text-[#A8A7AF] text-[11px]">Sign out of your active NeoTunes session on this device</div>
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

      {/* ── EDIT PROFILE MODAL (Spec 18) ── */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={() => setIsEditing(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#121318] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-[#AFC7FF]" /> Edit Listener Profile
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#A8A7AF]">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#17181D] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#AFC7FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#A8A7AF]">Bio</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-[#17181D] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#AFC7FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2 rounded-full bg-[#AFC7FF] text-black text-xs font-bold hover:scale-105 transition-transform"
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
