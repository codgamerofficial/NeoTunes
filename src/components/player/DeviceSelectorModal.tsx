'use client';

import React from 'react';
import { Smartphone, Laptop, Tv, Headphones, Volume2, Check, Cast } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface DeviceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

const DEVICES = [
  { id: 'local', name: 'NeoTunes Web Player', type: 'This Device (Connected)', icon: Laptop },
  { id: 'airpods', name: "AirPods Max", type: 'Spatial Audio • Available', icon: Headphones },
  { id: 'phone', name: 'Mobile Output', type: 'Smartphone Speaker', icon: Smartphone },
  { id: 'tv', name: 'Living Room Smart TV', type: 'Chromecast / AirPlay 2', icon: Tv },
  { id: 'bluetooth', name: 'Bluetooth Speaker', type: 'Wireless Audio Output', icon: Volume2 },
];

export default function DeviceSelectorModal({ isOpen, onClose, inline = false }: DeviceSelectorModalProps) {
  const { activeDeviceId, setActiveDeviceId } = usePlaybackStore();

  const content = (
    <div className="w-full text-white select-none p-5 space-y-4 font-sans">
      {/* Active Device Banner */}
      <div className="space-y-1 pb-3 border-b border-white/10">
        <span className="text-[10px] font-mono font-black text-[#00D4FF] uppercase tracking-widest block">
          CURRENT DEVICE
        </span>
        <div className="p-3.5 rounded-2xl bg-[#00D4FF]/15 border border-[#00D4FF]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Laptop className="h-5 w-5 text-[#00D4FF]" />
            <div>
              <div className="text-sm font-bold text-white">NeoTunes Web Player</div>
              <div className="text-xs text-[#00D4FF] font-semibold">Connected • Master Lossless Output</div>
            </div>
          </div>
          <Check className="h-5 w-5 text-[#00D4FF]" />
        </div>
      </div>

      {/* Available Devices List */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider block">
          OTHER DEVICES
        </span>
        <div className="space-y-2">
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
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00D4FF]/15 border border-[#00D4FF]/50 text-white'
                    : 'bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#00D4FF] text-black' : 'bg-white/5 text-white/50'}`}>
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
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Cast className="w-5 h-5 text-[#00D4FF]" />
          <span>Connect to a Device</span>
        </div>
      }
    >
      {content}
    </BottomSheet>
  );
}
