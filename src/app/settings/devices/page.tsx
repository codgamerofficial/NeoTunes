'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Laptop, Monitor, Globe, ShieldAlert, LogOut, CheckCircle } from 'lucide-react';
import { DeviceManager } from '@/services/sync/DeviceManager';
import { RegisteredDevice } from '@/types/sync';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function AccountDevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);

  useEffect(() => {
    setDevices(DeviceManager.getRegisteredDevices());
  }, []);

  const handleRemoveDevice = (id: string) => {
    DeviceManager.removeDevice(id);
    setDevices(DeviceManager.getRegisteredDevices());
  };

  const currentDeviceId = DeviceManager.getCurrentDeviceId();

  return (
    <FeatureErrorBoundary featureName="Account Devices">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-3xl mx-auto min-h-screen">
        
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Smartphone className="h-7 w-7 text-[#00D9FF]" /> Account Devices
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Manage devices connected to your NeoTunes account for seamless listening continuity.
          </p>
        </div>

        <div className="space-y-3">
          {devices.map((dev) => {
            const isCurrent = dev.deviceId === currentDeviceId;
            return (
              <div key={dev.deviceId} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 text-[#00D9FF]">
                    {dev.platform === 'ANDROID' ? (
                      <Smartphone className="h-5 w-5" />
                    ) : dev.platform === 'WINDOWS' || dev.platform === 'MAC' ? (
                      <Laptop className="h-5 w-5" />
                    ) : (
                      <Globe className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{dev.name}</h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] text-[9px] font-mono font-bold border border-[#00D9FF]/40 uppercase">
                          This Device
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#A1A1A6]">
                      {dev.platform} • App v{dev.appVersion} • Active now
                    </p>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleRemoveDevice(dev.deviceId)}
                    className="p-2 rounded-full bg-white/5 text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Sign out device"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
