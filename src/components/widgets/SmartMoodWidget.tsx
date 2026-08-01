'use client';

import React, { useState } from 'react';
import { Sparkles, Flame, Moon, Zap, Coffee, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlaybackStore } from '@/store/playback-store';

const MOOD_PRESETS = [
  {
    id: 'workout',
    label: 'Workout Hype',
    icon: Flame,
    color: 'from-[#FF2D95] to-[#FF7A00]',
    track: {
      id: 'blinding-lights-workout',
      title: 'Blinding Lights (Remix)',
      artist: 'The Weeknd',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      sourceId: '4NRXx6U8ABQ',
      sourceType: 'youtube',
    },
  },
  {
    id: 'chill',
    label: 'Chill Sunset',
    icon: Moon,
    color: 'from-[#7A3CFF] to-[#00D4FF]',
    track: {
      id: 'starboy-chill',
      title: 'Starboy (Slowed + Reverb)',
      artist: 'The Weeknd ft. Daft Punk',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
      sourceId: '34Na4j8AVgA',
      sourceType: 'youtube',
    },
  },
  {
    id: 'focus',
    label: 'Deep Focus',
    icon: Zap,
    color: 'from-[#00F5A0] to-[#00D4FF]',
    track: {
      id: 'lofi-study',
      title: 'Midnight Coding Beats',
      artist: 'NeoTunes Chill',
      coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
      sourceId: 'jfKfPfyJRdk',
      sourceType: 'youtube',
    },
  },
  {
    id: 'night',
    label: 'Late Night',
    icon: Coffee,
    color: 'from-[#FF2D95] to-[#7A3CFF]',
    track: {
      id: 'save-your-tears-night',
      title: 'Save Your Tears',
      artist: 'The Weeknd',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      sourceId: 'XXYlFuWEuKI',
      sourceType: 'youtube',
    },
  },
];

export default function SmartMoodWidget() {
  const [activeMood, setActiveMood] = useState('workout');
  const { setCurrentTrack, setPlaying } = usePlaybackStore();

  const handleMoodSelect = (mood: typeof MOOD_PRESETS[0]) => {
    setActiveMood(mood.id);
    setCurrentTrack(mood.track as any);
    setPlaying(true);
  };

  return (
    <div className="glass-card-v2 p-5 rounded-[28px] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">AI Smart Mood Selector</h3>
            <p className="text-[11px] text-white/50">Instant dynamic queue generation</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">
          NEO AI
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {MOOD_PRESETS.map((mood) => {
          const Icon = mood.icon;
          const isActive = activeMood === mood.id;
          return (
            <motion.button
              key={mood.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleMoodSelect(mood)}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all cursor-pointer border ${
                isActive
                  ? `bg-gradient-to-br ${mood.color} text-black border-transparent shadow-[0_0_20px_rgba(0,212,255,0.4)]`
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/20'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-black' : 'text-white/80'}`} />
              <span className="text-xs font-bold leading-none">{mood.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
