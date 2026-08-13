'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Disc } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

interface AiDjPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiDjPanelModal({ isOpen, onClose }: AiDjPanelModalProps) {
  const { playTrack } = usePlaybackStore();
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
    }, 1500);
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#121318] border border-white/15 rounded-[32px] p-6 space-y-6 shadow-2xl overflow-hidden text-center cursor-default"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#AFC7FF] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Neo AI DJ
            </span>
            <button onClick={onClose} className="p-1 rounded-full text-white/40 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Glowing Orb AI DJ Avatar */}
          <div className="relative h-44 w-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="absolute w-40 h-40 rounded-full border-2 border-dashed border-[#AFC7FF]/30"
            />

            <motion.div
              animate={{
                scale: isAnalyzing ? [1, 1.08, 1] : [1, 1.04, 1],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="h-28 w-28 rounded-full bg-gradient-to-tr from-[#AFC7FF] via-[#7A3CFF] to-[#FF2D95] p-1 flex items-center justify-center relative shadow-[0_0_30px_rgba(175,199,255,0.4)]"
            >
              <div className="h-full w-full rounded-full bg-[#121318] flex items-center justify-center">
                <Disc className="h-10 w-10 text-[#AFC7FF] animate-spin" />
              </div>
            </motion.div>
          </div>

          {/* Status Message */}
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white">
              {isAnalyzing ? 'Curating live mix...' : `Neo AI DJ — ${activeMood} Vibe`}
            </h3>
            <p className="text-xs text-[#A8A7AF]">
              Dynamic transitions and soundstage filtering
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleStartDj(activeMood)}
            className="w-full py-3 rounded-full bg-[#AFC7FF] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(175,199,255,0.4)] hover:scale-105 transition-transform cursor-pointer"
          >
            {isAnalyzing ? 'Curating...' : 'Start AI DJ'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
