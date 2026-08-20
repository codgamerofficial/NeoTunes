'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tv, Smartphone, Laptop, Headphones, Cast, Check, Volume2 } from 'lucide-react';

interface DeviceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

const DEVICES = [
  { id: 'airpods', name: "Saswata's AirPods Max", type: 'Spatial Audio • Active', icon: Headphones },
  { id: 'phone', name: 'This Phone', type: 'Mobile Output', icon: Smartphone },
  { id: 'laptop', name: 'MacBook Pro / Laptop', type: 'Hi-Res Lossless Audio', icon: Laptop },
  { id: 'chrome', name: 'Chrome Browser', type: 'Web Audio Engine', icon: Laptop },
  { id: 'tv', name: 'Living Room Smart TV', type: 'AirPlay 2', icon: Tv },
  { id: 'bluetooth', name: 'Bluetooth Speaker', type: 'Wireless Output', icon: Volume2 },
];

export default function DeviceSelectorModal({ isOpen, onClose, inline = false }: DeviceSelectorModalProps) {
  const [activeDeviceId, setActiveDeviceId] = useState<string>('airpods');

  const content = (
    <div className={`w-full bg-[#07090E]/95 backdrop-blur-2xl rounded-3xl border border-white/10 text-white select-none overflow-y-auto scrollbar-none p-5 space-y-4 ${inline ? 'h-full' : ''}`}>
      {/* Active Device Banner */}
      <div className="space-y-1 pb-3 border-b border-white/10">
        <span className="text-[10px] font-mono font-black text-[#00D4FF] uppercase tracking-widest block">
          PLAYING ON
        </span>
        <div className="p-3.5 rounded-2xl bg-[#00D4FF]/15 border border-[#00D4FF]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Headphones className="h-5 w-5 text-[#00D4FF]" />
            <div>
              <div className="text-sm font-bold text-white">Saswata&apos;s AirPods Max</div>
              <div className="text-xs text-[#00D4FF] font-medium">Spatial Audio • Active</div>
            </div>
          </div>
          <Check className="h-5 w-5 text-[#00D4FF]" />
        </div>
      </div>

      {/* Available Devices List */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider block">
          OTHER DEVICES
        </span>
        <div className="space-y-1.5">
          {DEVICES.map((dev) => {
            const IconComp = dev.icon;
            const isSelected = activeDeviceId === dev.id;
            return (
              <button
                key={dev.id}
                onClick={() => setActiveDeviceId(dev.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/40 text-white'
                    : 'bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#00D4FF] text-black' : 'bg-white/5 text-white/40'}`}>
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs text-white">{dev.name}</div>
                    <div className="text-[10px] text-white/50 font-mono">{dev.type}</div>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-[#00D4FF]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="device-selector-modal"
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
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
