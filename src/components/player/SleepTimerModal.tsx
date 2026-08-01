'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Clock, Check } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIMER_OPTIONS = [
  { label: '5 Minutes', value: 5 },
  { label: '15 Minutes', value: 15 },
  { label: '30 Minutes', value: 30 },
  { label: '45 Minutes', value: 45 },
  { label: '1 Hour', value: 60 },
  { label: 'Turn Off Timer', value: null },
];

export default function SleepTimerModal({ isOpen, onClose }: SleepTimerModalProps) {
  const { sleepTimerMinutes, setSleepTimer } = usePlaybackStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl" 
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-[#0A0A0F]/98 border border-white/10 rounded-[28px] shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#7A3CFF] to-[#00D4FF] shadow-lg">
                <Moon className="h-5 w-5 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Sleep Timer</h2>
                <p className="text-xs text-white/40">Auto-pause playback when timer expires</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {TIMER_OPTIONS.map((opt) => {
              const isSelected = sleepTimerMinutes === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => {
                    setSleepTimer(opt.value);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#7A3CFF]/20 border border-[#00D4FF]/50 text-white'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Clock className={`h-4 w-4 ${isSelected ? 'text-[#00D4FF]' : 'text-white/40'}`} />
                    {opt.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-[#00D4FF]" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
