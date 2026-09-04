'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Headphones, Volume2, Check, Laptop, ShieldCheck, X } from 'lucide-react';
import { realDeviceManager, RealAudioDevice, DEFAULT_DEVICE } from '@/services/realDeviceService';
import OverlayLayer from '@/components/navigation/OverlayLayer';

interface DeviceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

export default function DeviceSheet({
  isOpen,
  onClose,
  inline = false,
}: DeviceSheetProps) {
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
    <div
      className={`w-full h-full bg-[#0B0D12]/98 backdrop-blur-2xl text-white flex flex-col overflow-hidden font-sans ${
        inline
          ? 'rounded-3xl border border-white/10 shadow-2xl'
          : 'border-t sm:border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)]'
      }`}
    >
      {/* Mobile Top Drag Handle */}
      {!inline && (
        <div className="w-full pt-2.5 pb-1 flex justify-center sm:hidden shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-white/25" />
        </div>
      )}

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-white/[0.02]">
        <div className="min-w-0 pr-3">
          <h2 className="text-base font-bold text-white tracking-tight">Audio Output Devices</h2>
          <p className="text-[11px] text-white/50">System-detected output routing</p>
        </div>

        {!inline && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close device selector"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 select-none scrollbar-none">
        {/* Active Audio Route Banner */}
        <div className="space-y-1.5 pb-3 border-b border-white/[0.06]">
          <span className="text-[10px] font-black text-[#DFFF00] uppercase tracking-wider block">
            ACTIVE HARDWARE ROUTE
          </span>
          <div className="p-4 rounded-2xl bg-[#DFFF00]/10 border border-[#DFFF00]/30 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 rounded-xl bg-[#DFFF00] text-black shrink-0">
                <CurrentIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-white truncate">
                  {currentDevice.name || 'Device information unavailable'}
                </div>
                <div className="text-xs text-[#DFFF00] font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                  {currentDevice.displayType || 'System Output • Connected'}
                </div>
              </div>
            </div>
            <Check className="h-5 w-5 text-[#DFFF00] shrink-0 ml-2" />
          </div>
        </div>

        {/* Available System Outputs */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] text-white/50 font-black uppercase tracking-wider block">
            DETECTED SYSTEM ROUTES ({availableDevices.length})
          </span>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-white/50 animate-pulse">
              Querying OS audio routes...
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
                        ? 'bg-white/[0.08] border-[#DFFF00]/40 text-white'
                        : 'bg-white/[0.03] border-white/5 hover:border-white/15 text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <DevIcon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#DFFF00]' : 'text-white/60'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {dev.name || 'Device information unavailable'}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {dev.displayType || 'Standard Route'}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#DFFF00] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real Hardware Verification Notice */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5 text-[11px] text-white/50">
          <ShieldCheck className="h-4 w-4 text-[#DFFF00] shrink-0" />
          <span>Real hardware detection streams directly from the active OS audio pipeline.</span>
        </div>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <OverlayLayer>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:flex-row sm:justify-end select-none font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
            />

            {/* Sheet Panel */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full sm:max-w-md h-[75vh] sm:h-full rounded-t-[28px] sm:rounded-t-none overflow-hidden"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </OverlayLayer>
  );
}
