'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Award, Flame, Clock, Music, Crown, Edit2, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Saswata Dey');
  const [userBio, setUserBio] = useState('Music producer, audiophile, and AI sound enthusiast.');
  const [isEditing, setIsEditing] = useState(false);

  const stats = [
    { label: 'Hours Listened', value: '428 hrs', icon: Clock, color: 'text-[#00D4FF]' },
    { label: 'Saved Tracks', value: '512 songs', icon: Music, color: 'text-[#7A3CFF]' },
    { label: 'Top Artist', value: 'The Weeknd', icon: Flame, color: 'text-[#FF2D95]' },
    { label: 'Audio Quality', value: 'Hi-Res Lossless', icon: ShieldCheck, color: 'text-[#10B981]' },
  ];

  const badges = [
    { title: 'Night Owl Listener', desc: 'Streamed 50+ midnight sessions', icon: '🌙' },
    { title: 'Audio Perfectionist', desc: 'Enabled Hi-Res Lossless Spatial Audio', icon: '🎧' },
    { title: 'AI Explorer', desc: 'Generated 20+ custom playlists with Ask Neo', icon: '✨' },
  ];

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#050505] text-white font-sans select-none pb-28">
      
      {/* Profile Header */}
      <div className="relative p-8 rounded-[32px] bg-gradient-to-r from-[#101010] via-[#151226] to-[#0A0D14] border border-white/10 flex flex-col sm:flex-row items-center gap-8 shadow-[0_20px_50px_rgba(0,212,255,0.15)] overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#00D4FF]/20 blur-3xl pointer-events-none" />

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80"
            alt="User Avatar"
            className="h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-[#00D4FF] shadow-[0_0_20px_#00D4FF]"
          />
          <span className="absolute bottom-1 right-1 p-2 rounded-full bg-[#00D4FF] text-black shadow-lg">
            <Crown className="h-4 w-4" />
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <h1 className="text-3xl font-black text-white">{userName}</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40 flex items-center gap-1">
              <Crown className="h-3 w-3" /> PRO MEMBER
            </span>
          </div>

          <p className="text-sm text-white/60 max-w-md">{userBio}</p>

          <div className="pt-2 flex justify-center sm:justify-start gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-2"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Listening Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-5 rounded-3xl bg-[#101010] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/40 uppercase">{stat.label}</span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Year In Music & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Year In Music Card */}
        <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#00D4FF]/10 via-[#7A3CFF]/10 to-[#FF2D95]/10 border border-[#00D4FF]/30 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#00D4FF]" />
            <h3 className="text-lg font-bold text-white">Year in Music Analytics 2026</h3>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Your top genre was <strong className="text-[#00D4FF]">Pop &amp; Lo-Fi Electronic</strong>. You streamed music for <strong>428 hours</strong> across 34 countries.
          </p>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-[78%] bg-gradient-to-r from-[#00D4FF] to-[#FF2D95] rounded-full" />
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="p-8 rounded-[32px] bg-[#101010] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#FF2D95]" />
            <h3 className="text-lg font-bold text-white">Earned Badges</h3>
          </div>
          <div className="space-y-3">
            {badges.map((b) => (
              <div key={b.title} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <div className="font-bold text-xs text-white">{b.title}</div>
                  <div className="text-[11px] text-white/50">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
