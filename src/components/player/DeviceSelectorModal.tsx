'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tv, Smartphone, Laptop, Monitor, Cast, Check, Radio } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

interface DeviceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEVICES = [
  { id: 'phone', name: 'This Phone', type: 'Mobile Output', icon: Smartphone },
  { id: 'browser', name: 'Chrome Browser', type: 'Web Audio API', icon: Monitor },
  { id: 'laptop', name: 'MacBook Pro / Laptop', type: 'Hi-Fi Audio', icon: Laptop },
  { id: 'tv', name: 'Living Room Smart TV', type: '4K AirPlay', icon: Tv },
  { id: 'chromecast', name: 'Google Chromecast Ultra', type: 'Google Cast', icon: Cast },
  { id: 'desktop', name: 'NeoTunes Desktop App', type: 'Direct Hardware DSP', icon: Radio },
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
          className="relative w-full max-w-md bg-[#000000] border border-white/10 rounded-[28px] shadow-2xl flex flex-col overflow-hidden p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#AFC7FF] text-black shadow-lg">
                <Cast className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Play on...</h2>
                <p className="text-xs text-[#A8A7AF]">Select an active device for playback</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Device Options */}
          <div className="space-y-2">
            {DEVICES.map((dev) => {
              const IconComp = dev.icon;
              const isSelected = activeDeviceId === dev.id || (!activeDeviceId && dev.id === 'browser');
              return (
                <button
                  key={dev.id}
                  onClick={() => {
                    setActiveDeviceId(dev.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#AFC7FF]/15 border border-[#AFC7FF] text-white'
                      : 'bg-[#17181D] hover:bg-[#202127] border border-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#AFC7FF] text-black' : 'bg-white/5 text-white/40'}`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-white">{dev.name}</div>
                      <div className="text-[10px] text-[#A8A7AF] font-mono">{dev.type}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-[#AFC7FF]" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
