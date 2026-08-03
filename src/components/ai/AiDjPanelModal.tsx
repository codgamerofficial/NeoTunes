'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Disc, Radio, RefreshCw } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface AiDjPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiDjPanelModal({ isOpen, onClose }: AiDjPanelModalProps) {
  const { playTrack } = usePlayerStore();
  const [activeMood, setActiveMood] = useState('Lo-Fi');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const moods = ['Lo-Fi', 'R&B', 'Indie', 'Hip Hop', 'EDM'];

  const handleStartDj = (mood: string) => {
    setActiveMood(mood);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      playTrack({
        id: 'after-hours-weeknd',
        title: 'After Hours',
        artist: 'The Weeknd',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        durationMs: 240000,
        sourceType: 'youtube',
      });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl cursor-pointer select-none"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#0F0B1E]/95 border border-white/15 rounded-[36px] p-6 space-y-6 shadow-[0_30px_90px_rgba(122,60,255,0.4)] overflow-hidden text-center cursor-default"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#7A3CFF] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> AI DJ
            </span>
            <button onClick={onClose} className="p-1 rounded-full text-white/40 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 3D Glowing Orb AI DJ Avatar with Smile */}
          <div className="relative h-44 w-full flex items-center justify-center">
            {/* Outer Orbiting Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="absolute w-40 h-40 rounded-full border-2 border-dashed border-[#7A3CFF]/40"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
              className="absolute w-48 h-48 rounded-full border border-dashed border-[#00D4FF]/30"
            />

            {/* Central Glowing Orb */}
            <motion.div
              animate={{
                scale: isAnalyzing ? [1, 1.1, 1] : [1, 1.05, 1],
                boxShadow: isAnalyzing
                  ? ['0 0 30px #7A3CFF', '0 0 60px #FF2D95', '0 0 30px #7A3CFF']
                  : ['0 0 30px #7A3CFF', '0 0 45px #00D4FF', '0 0 30px #7A3CFF'],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="h-28 w-28 rounded-full bg-gradient-to-tr from-[#7A3CFF] via-[#FF2D95] to-[#00D4FF] p-1 flex items-center justify-center relative shadow-[0_0_40px_#7A3CFF]"
            >
              {/* Smiling Face Features */}
              <div className="h-full w-full rounded-full bg-[#0F0B1E]/90 flex flex-col items-center justify-center space-y-2">
                <div className="flex gap-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#00D4FF] animate-ping" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#00D4FF] animate-ping" />
                </div>
                <div className="h-2.5 w-8 rounded-full border-b-2 border-[#00D4FF]" />
              </div>
            </motion.div>

            {/* Floating Mood Tags Around Orb */}
            {moods.map((m, idx) => {
              const angles = [0, 72, 144, 216, 288];
              const rad = (angles[idx] * Math.PI) / 180;
              const x = Math.cos(rad) * 90;
              const y = Math.sin(rad) * 65;
              const isActive = activeMood === m;

              return (
                <button
                  key={m}
                  onClick={() => handleStartDj(m)}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className={`absolute px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${
                    isActive
                      ? 'bg-[#7A3CFF] text-white border-[#7A3CFF] shadow-[0_0_12px_#7A3CFF]'
                      : 'bg-white/5 text-white/70 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Status Message */}
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white">
              {isAnalyzing ? 'Analyzing your taste...' : `AI DJ Curating ${activeMood} Vibe`}
            </h3>
            <p className="text-xs text-white/50">
              {isAnalyzing ? 'This might take a few seconds' : 'Personalized transitions & dynamic crossfade ready'}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (isAnalyzing) setIsAnalyzing(false);
              else handleStartDj(activeMood);
            }}
            className="btn-neo-primary w-full py-3 text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            {isAnalyzing ? 'Stop DJ' : 'Start AI DJ'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
