'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  Headphones, 
  Volume2, 
  Radio, 
  Sliders, 
  Check, 
  Layers, 
  Activity, 
  Compass, 
  ShieldCheck 
} from 'lucide-react';
import { useSpatialAudio } from '@/hooks/useSpatialAudio';
import { EQ_PRESETS } from '@/store/spatial-audio-store';
import { EqualizerPresetId, AudioOutputDevice } from '@/types/spatial';

interface AudioOutputSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioOutputSheet({ isOpen, onClose }: AudioOutputSheetProps) {
  const {
    enabled,
    canSpatialize,
    headTrackingAvailable,
    headTrackingEnabled,
    outputDevice,
    outputDeviceName,
    activeFormat,
    dolbyAtmosReported,
    loudnessNormalizationEnabled,
    eqPreset,
    toggleSpatialAudio,
    toggleHeadTracking,
    toggleLoudnessNormalization,
    setEqPreset,
    setOutputDevice,
  } = useSpatialAudio();

  if (!isOpen) return null;

  const devices: { id: AudioOutputDevice; label: string; icon: React.ElementType }[] = [
    { id: 'BLUETOOTH_HEADPHONES', label: 'Bluetooth Headphones', icon: Headphones },
    { id: 'SOUNDBAR', label: 'Dolby / Soundbar System', icon: Radio },
    { id: 'PHONE_SPEAKER', label: 'Phone Speaker', icon: Volume2 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md select-none font-sans">
        
        {/* Backdrop click to dismiss */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 z-0" 
        />

        {/* Sheet Content Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg bg-[#0B0F17]/95 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D9FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#DFFF00]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#00D9FF]/15 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  N/O/S AUDIO
                </h3>
                <p className="text-[11px] text-[#A1A1A6]">
                  Spatial • Intelligent • Personal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A1A1A6] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="my-4 relative z-10">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${canSpatialize ? 'bg-[#00D9FF] shadow-[0_0_10px_#00D9FF]' : 'bg-[#A1A1A6]'}`} />
                <div>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {canSpatialize ? (dolbyAtmosReported ? 'Dolby Atmos Active' : 'Immersive Active') : 'Stereo Mode'}
                  </span>
                  <p className="text-[10px] text-[#A1A1A6]">
                    {outputDeviceName}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold text-[#DFFF00] bg-[#DFFF00]/10 px-2.5 py-1 rounded-full border border-[#DFFF00]/30">
                24-bit / 96kHz
              </span>
            </div>
          </div>

          {/* Core Controls */}
          <div className="space-y-4 relative z-10">
            
            {/* Spatial Audio Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-[#00D9FF]" />
                <div>
                  <div className="text-xs font-bold text-white">Spatial Soundstage</div>
                  <div className="text-[10px] text-[#A1A1A6]">Hardware acoustic spatialization</div>
                </div>
              </div>

              <button
                onClick={toggleSpatialAudio}
                className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-[#00D9FF]' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Head Tracking Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <Compass className="h-4 w-4 text-[#DFFF00]" />
                <div>
                  <div className="text-xs font-bold text-white">Head Tracking</div>
                  <div className="text-[10px] text-[#A1A1A6]">
                    {headTrackingAvailable ? 'Dynamic head positioning' : 'Not available on this device'}
                  </div>
                </div>
              </div>

              <button
                disabled={!headTrackingAvailable}
                onClick={toggleHeadTracking}
                className={`w-12 h-6 rounded-full transition-colors relative ${!headTrackingAvailable ? 'opacity-40 cursor-not-allowed' : ''} ${headTrackingEnabled ? 'bg-[#DFFF00]' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${headTrackingEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Loudness Normalization */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-[#A855F7]" />
                <div>
                  <div className="text-xs font-bold text-white">Adaptive Loudness</div>
                  <div className="text-[10px] text-[#A1A1A6]">Normalize volume across tracks</div>
                </div>
              </div>

              <button
                onClick={toggleLoudnessNormalization}
                className={`w-12 h-6 rounded-full transition-colors relative ${loudnessNormalizationEnabled ? 'bg-[#A855F7]' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${loudnessNormalizationEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Equalizer Presets */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[#00D9FF]" />
                  <span className="text-xs font-bold text-white">N/O/S Sound Signature EQ</span>
                </div>
                <span className="text-[10px] font-mono text-[#DFFF00] uppercase font-bold">
                  {EQ_PRESETS[eqPreset]?.name || 'Off'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {(Object.keys(EQ_PRESETS) as EqualizerPresetId[]).slice(0, 8).map((presetId) => (
                  <button
                    key={presetId}
                    onClick={() => setEqPreset(presetId)}
                    className={`py-2 px-2.5 rounded-xl text-[10px] font-mono font-bold transition-all text-center border truncate cursor-pointer ${eqPreset === presetId ? 'bg-[#00D9FF]/20 border-[#00D9FF] text-[#00D9FF]' : 'bg-white/5 border-white/10 text-[#A1A1A6] hover:bg-white/10'}`}
                  >
                    {EQ_PRESETS[presetId].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Selector */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-white">Active Audio Output</div>
              <div className="grid grid-cols-3 gap-2">
                {devices.map((dev) => {
                  const Icon = dev.icon;
                  const isActive = outputDevice === dev.id;
                  return (
                    <button
                      key={dev.id}
                      onClick={() => setOutputDevice(dev.id, dev.label)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${isActive ? 'bg-[#DFFF00]/15 border-[#DFFF00] text-[#DFFF00]' : 'bg-white/5 border-white/10 text-[#A1A1A6] hover:bg-white/10'}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[9px] font-mono font-bold truncate leading-tight w-full">
                        {dev.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
