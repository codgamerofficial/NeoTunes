'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Signal } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

interface AudioQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUALITY_OPTIONS = [
  { id: 'auto', name: 'Automatic', desc: 'Adjusts based on your network speed (Recommended)', badge: 'Adaptive' },
  { id: 'normal', name: 'Normal', desc: 'Equivalent to 128 kbit/s AAC (Data Saver)', badge: '128 kbps' },
  { id: 'high', name: 'High', desc: 'Equivalent to 256 kbit/s AAC High Fidelity', badge: '256 kbps' },
  { id: 'very_high', name: 'Very High', desc: 'Equivalent to 320 kbit/s Opus / Ultra HD', badge: '320 kbps' },
  { id: 'lossless', name: 'Lossless Studio', desc: '24-bit / 96kHz FLAC Master Quality Audio', badge: 'FLAC 24-Bit' },
];

export default function AudioQualityModal({ isOpen, onClose }: AudioQualityModalProps) {
  const { audioQuality, setAudioQuality } = usePlaybackStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="audio-quality-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl" 
          onClick={onClose}
        >
          <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-[#0A0A0F]/98 border border-white/10 rounded-[28px] shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7A3CFF] shadow-lg">
                <Signal className="h-5 w-5 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Audio Quality</h2>
                <p className="text-xs text-white/40">Select streaming audio bitrate & resolution</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quality Options */}
          <div className="space-y-2.5">
            {QUALITY_OPTIONS.map((opt) => {
              const isSelected = audioQuality === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setAudioQuality(opt.id as any);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#7A3CFF]/15 border border-[#00D4FF]/50 text-white'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {opt.name}
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30">
                        {opt.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/40 mt-0.5">{opt.desc}</div>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-[#00D4FF] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
