'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Headphones, Volume2, Check, Cast, Radio, Laptop } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { realDeviceManager, RealAudioDevice, DEFAULT_DEVICE } from '@/services/realDeviceService';

interface DeviceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

export default function DeviceSelectorModal({ isOpen, onClose, inline = false }: DeviceSelectorModalProps) {
  const [currentDevice, setCurrentDevice] = useState<RealAudioDevice>(DEFAULT_DEVICE);
  const [availableDevices, setAvailableDevices] = useState<RealAudioDevice[]>([DEFAULT_DEVICE]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    realDeviceManager.getCurrentAudioOutput().then((dev) => {
      if (isMounted) setCurrentDevice(dev);
    });

    realDeviceManager.getAvailableAudioOutputs().then((devs) => {
      if (isMounted) {
        setAvailableDevices(devs);
        setIsLoading(false);
      }
    });

    const unsubscribe = realDeviceManager.subscribeToAudioOutputChanges((dev) => {
      if (isMounted) {
        setCurrentDevice(dev);
        realDeviceManager.getAvailableAudioOutputs().then((devs) => {
          if (isMounted) setAvailableDevices(devs);
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen]);

  const getDeviceIcon = (type: RealAudioDevice['type']) => {
    switch (type) {
      case 'bluetooth':
      case 'ble':
        return Volume2;
      case 'wired':
      case 'usb':
        return Headphones;
      case 'internal':
        return Smartphone;
      default:
        return Laptop;
    }
  };

  const CurrentIcon = getDeviceIcon(currentDevice.type);

  const content = (
    <div className="w-full text-white select-none p-4 space-y-4 font-sans">
      {/* Active Hardware Device Banner */}
      <div className="space-y-1 pb-3 border-b border-white/[0.06]">
        <span className="text-[10px] font-bold text-[#DFFF00] uppercase tracking-wider block">
          CURRENT ACTIVE OUTPUT
        </span>
        <div className="p-3.5 rounded-2xl bg-[#DFFF00]/10 border border-[#DFFF00]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#DFFF00] text-black">
              <CurrentIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">
                {currentDevice.name}
              </div>
              <div className="text-xs text-[#DFFF00] font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                {currentDevice.displayType || 'System Audio • Active'}
              </div>
            </div>
          </div>
          <Check className="h-5 w-5 text-[#DFFF00]" />
        </div>
      </div>

      {/* Available System Outputs */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">
          DETECTED SYSTEM AUDIO ROUTES
        </span>
        
        {isLoading ? (
          <div className="py-6 text-center text-xs text-[#9AA1AD] animate-pulse">
            Scanning connected hardware audio outputs...
          </div>
        ) : availableDevices.length <= 1 ? (
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-xs text-[#9AA1AD] space-y-1">
            <p className="font-semibold text-white/80">No external Bluetooth or wired outputs detected.</p>
            <p className="text-[11px] text-[#9AA1AD]/70">
              Audio is routing through your device&apos;s primary system speaker. Connect Bluetooth headphones or a soundbar to route automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableDevices.map((dev, idx) => {
              const DevIcon = getDeviceIcon(dev.type);
              const isSelected = dev.id === currentDevice.id || (dev.name === currentDevice.name);

              return (
                <div
                  key={`${dev.id}_${idx}`}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-[#DFFF00]/10 border border-[#DFFF00]/40 text-white'
                      : 'bg-white/[0.03] border border-white/[0.05] text-white/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#DFFF00] text-black' : 'bg-white/5 text-white/50'}`}>
                      <DevIcon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs text-white">{dev.name}</div>
                      <div className="text-[10px] text-[#9AA1AD] font-medium">{dev.displayType}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[#DFFF00]" />}
                </div>
              );
            })}
          </div>
        )}
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
          <Cast className="w-5 h-5 text-[#DFFF00]" />
          <span>Audio Output Devices</span>
        </div>
      }
    >
      {content}
    </BottomSheet>
  );
}
