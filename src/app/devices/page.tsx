'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Laptop, Headphones, Volume2, ShieldCheck, Check, Radio } from 'lucide-react';
import { realDeviceManager, RealAudioDevice, DEFAULT_DEVICE } from '@/services/realDeviceService';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { useToast } from '@/components/ui/NeoToast';

export default function DevicesPage() {
  const { showToast } = useToast();
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
  }, []);

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

  const handleSelectRoute = (dev: RealAudioDevice) => {
    realDeviceManager.selectAudioOutput(dev.id);
    setCurrentDevice(dev);
    showToast(`Audio output switched to ${dev.name}`);
  };

  const CurrentIcon = getDeviceIcon(currentDevice.type);

  return (
    <FeatureErrorBoundary featureName="Devices & Continuity">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-1 border-b border-white/[0.06] pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Smartphone className="h-6 w-6 text-[#00E5FF]" /> Audio Hardware &amp; Routes
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD]">
            Real-time audio output routing direct from your operating system sound engine.
          </p>
        </div>

        {/* Current Active Hardware Output */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#DFFF00]">
            Current Active Hardware Audio Route
          </h3>
          <NeoCard className="p-5 border-[#DFFF00]/30 bg-[#171A21] flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#DFFF00] text-black shrink-0">
                <CurrentIcon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">{currentDevice.name}</h4>
                <p className="text-xs text-[#DFFF00] font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse" />
                  {currentDevice.displayType || 'System Output • Connected'}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#DFFF00]/15 border border-[#DFFF00]/30 text-xs font-mono font-bold text-[#DFFF00]">
              ACTIVE ROUTE
            </span>
          </NeoCard>
        </div>

        {/* Detected Hardware Outputs */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD]">
            Detected System Audio Devices ({availableDevices.length})
          </h3>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#9AA1AD] animate-pulse">
              Scanning hardware sound routes...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableDevices.map((dev) => {
                const DevIcon = getDeviceIcon(dev.type);
                const isSelected = dev.id === currentDevice.id;

                return (
                  <NeoCard
                    key={dev.id}
                    interactive
                    onClick={() => handleSelectRoute(dev)}
                    className={`p-4 flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-white'
                        : 'border-white/5 bg-[#11141A] text-[#9AA1AD] hover:text-white hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <DevIcon className={`h-5 w-5 ${isSelected ? 'text-[#00E5FF]' : 'text-[#9AA1AD]'}`} />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{dev.name}</h5>
                        <p className="text-[10px] text-[#9AA1AD] mt-0.5">
                          {dev.displayType || 'Standard Route'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 text-[#00E5FF] shrink-0" />
                    )}
                  </NeoCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Security & Reliability Callout */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3 text-xs text-[#9AA1AD]">
          <ShieldCheck className="h-5 w-5 text-[#00E5FF] shrink-0" />
          <span>
            Audio endpoints are discovered securely via Web Audio &amp; MediaDevices system interfaces. No mock device identifiers are generated.
          </span>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
