'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Laptop, Speaker, Bluetooth, Radio, Check, RefreshCw, Volume2, Shield } from 'lucide-react';
import { ContinuityEngine } from '@/services/continuity/ContinuityEngine';
import { AudioOutputManager } from '@/services/continuity/AudioOutputManager';
import { RegisteredDevice, AudioOutputRoute } from '@/types/continuity';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';

export default function DevicesPage() {
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [routes, setRoutes] = useState<AudioOutputRoute[]>([]);
  const [activeRoute, setActiveRoute] = useState<AudioOutputRoute | null>(null);

  useEffect(() => {
    setDevices(ContinuityEngine.getRegisteredDevices());
    setRoutes(AudioOutputManager.getAvailableRoutes());
    setActiveRoute(AudioOutputManager.getActiveRoute());
  }, []);

  const handleHandoff = (deviceId: string) => {
    ContinuityEngine.handoffToDevice(deviceId);
    alert(`Playback handoff initiated to device.`);
  };

  const handleSwitchOutput = (routeId: string) => {
    const updated = AudioOutputManager.switchRoute(routeId);
    setActiveRoute(updated);
  };

  return (
    <FeatureErrorBoundary featureName="Devices & Continuity">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Smartphone className="h-7 w-7 text-[#00D9FF]" /> Devices & Audio Continuity
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Seamless cross-device session handoff and hardware audio route manager.
          </p>
        </div>

        {/* Audio Output Routes (Section 23 & 24) */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Audio Output Routes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {routes.map((route) => {
              const isSelected = activeRoute?.id === route.id;
              return (
                <NeoCard
                  key={route.id}
                  glass
                  interactive
                  onClick={() => handleSwitchOutput(route.id)}
                  className={`space-y-2 border ${isSelected ? 'border-[#00D9FF] bg-[#00D9FF]/10' : 'border-white/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <Volume2 className={`h-5 w-5 ${isSelected ? 'text-[#00D9FF]' : 'text-white/60'}`} />
                    {isSelected && <span className="px-2 py-0.5 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] text-[9px] font-mono font-bold uppercase">ACTIVE</span>}
                  </div>
                  <h4 className="text-xs font-bold text-white">{route.name}</h4>
                  <p className="text-[10px] text-[#A1A1A6] font-mono">
                    {route.isSpatialSupported ? 'Spatial Audio Supported' : 'Standard Stereo'}
                  </p>
                </NeoCard>
              );
            })}
          </div>
        </div>

        {/* Registered Devices List (Section 7 & 9) */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Registered NeoTunes Devices</h3>
          <div className="space-y-3">
            {devices.map((device) => (
              <NeoCard key={device.deviceId} glass className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#00D9FF]/10 text-[#00D9FF]">
                    {device.platform === 'android' ? <Smartphone className="h-6 w-6" /> : <Laptop className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{device.name}</h4>
                      {device.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase border border-emerald-500/40">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#A1A1A6] font-mono">Platform: {device.platform} • Active session available</p>
                  </div>
                </div>

                {!device.isCurrent && (
                  <NeoButton variant="glass" size="sm" onClick={() => handleHandoff(device.deviceId)}>
                    Handoff Here
                  </NeoButton>
                )}
              </NeoCard>
            ))}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
