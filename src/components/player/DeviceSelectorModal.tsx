'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Headphones, Volume2, Check, Radio, Laptop, ShieldCheck } from 'lucide-react';
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
          CURRENT ACTIVE AUDIO ROUTE
        </span>
        <div className="p-4 rounded-2xl bg-[#DFFF00]/10 border border-[#DFFF00]/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#DFFF00] text-black shrink-0">
              <CurrentIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">
                {currentDevice.name}
              </div>
              <div className="text-xs text-[#DFFF00] font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                {currentDevice.displayType || 'System Output • Connected'}
              </div>
            </div>
          </div>
          <Check className="h-5 w-5 text-[#DFFF00] shrink-0" />
        </div>
      </div>

      {/* Available System Outputs */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] text-[#9AA1AD] font-bold uppercase tracking-wider block">
          DETECTED HARDWARE ROUTES ({availableDevices.length})
        </span>
        
        {isLoading ? (
          <div className="py-6 text-center text-xs text-[#9AA1AD] animate-pulse">
            Scanning system audio routes...
          </div>
        ) : (
          <div className="space-y-1.5">
            {availableDevices.map((dev) => {
              const DevIcon = getDeviceIcon(dev.type);
              const isSelected = dev.id === currentDevice.id;

              return (
                <div
                  key={dev.id}
                  onClick={() => {
                    realDeviceManager.selectAudioOutput(dev.id);
                    setCurrentDevice(dev);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#171A21] border-[#DFFF00]/40 text-white'
                      : 'bg-[#11141A] border-white/5 hover:border-white/15 text-[#9AA1AD] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <DevIcon className={`h-4 w-4 ${isSelected ? 'text-[#DFFF00]' : 'text-[#9AA1AD]'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {dev.name}
                      </div>
                      <div className="text-[10px] text-[#9AA1AD]">
                        {dev.displayType || 'Standard Route'}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#DFFF00]" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real Capability Notice */}
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5 text-[11px] text-[#9AA1AD]">
        <ShieldCheck className="h-4 w-4 text-[#00E5FF] shrink-0" />
        <span>Hardware detection streams directly from the operating system audio pipeline.</span>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Audio Output Devices">
      {content}
    </BottomSheet>
  );
}
