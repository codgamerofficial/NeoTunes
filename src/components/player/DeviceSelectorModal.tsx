'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tv, Speaker, Radio, Check, Cast } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

interface DeviceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEVICES = [
  { id: 'local', name: 'This Browser / Device', type: 'Local Output', icon: Speaker, active: true },
  { id: 'airplay', name: 'Apple AirPlay', type: 'AirPlay Ready', icon: Cast, active: false },
  { id: 'chromecast', name: 'Google Chromecast', type: 'Chromecast Ready', icon: Tv, active: false },
  { id: 'bluetooth', name: 'Bluetooth Headphones / Speaker', type: 'Bluetooth Audio', icon: Radio, active: false },
];

export default function DeviceSelectorModal({ isOpen, onClose }: DeviceSelectorModalProps) {
  const { activeDeviceId, setActiveDeviceId } = usePlaybackStore();

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
          className="relative w-full max-w-md bg-[#0A0A0F]/98 border border-white/10 rounded-[28px] shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7A3CFF] shadow-lg">
                <Cast className="h-5 w-5 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Connect to a Device</h2>
                <p className="text-xs text-white/40">AirPlay, Chromecast, and Bluetooth Ready</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Device Options */}
          <div className="space-y-2.5">
            {DEVICES.map((dev) => {
              const IconComp = dev.icon;
              const isSelected = activeDeviceId === dev.id;
              return (
                <button
                  key={dev.id}
                  onClick={() => {
                    setActiveDeviceId(dev.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#7A3CFF]/15 border border-[#00D4FF]/50 text-white'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-white/5 text-white/40'}`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-white">{dev.name}</div>
                      <div className="text-[10px] text-white/40 font-mono">{dev.type}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-[#00D4FF]" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
