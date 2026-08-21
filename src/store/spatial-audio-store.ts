import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  SpatialFormat, 
  AudioOutputDevice, 
  SpatialAudioMode, 
  EqualizerPresetId, 
  SpatialAudioState 
} from '@/types/spatial';

export const NEO_SIGNATURE_GAINS = [1.5, 1.0, 0, 0, 0.5, 1.0, 1.0]; // 60Hz, 150Hz, 400Hz, 1kHz, 2.5kHz, 6.3kHz, 12kHz

export const EQ_PRESETS: Record<EqualizerPresetId, { name: string; gains: number[] }> = {
  neo_signature: { name: 'Neo Signature', gains: NEO_SIGNATURE_GAINS },
  pure: { name: 'Pure / Neutral', gains: [0, 0, 0, 0, 0, 0, 0] },
  warm: { name: 'Warm Analog', gains: [2.0, 1.5, 0.5, 0, -0.5, -1.0, -1.5] },
  deep_bass: { name: 'Deep Bass', gains: [3.5, 2.5, 1.0, 0, 0, 0.5, 0.5] },
  vocal: { name: 'Vocal Center', gains: [-1.0, -0.5, 1.0, 2.0, 1.5, 0.5, 0] },
  cinematic: { name: 'Cinematic Soundstage', gains: [2.0, 1.0, 0, 0.5, 1.5, 2.0, 1.5] },
  night: { name: 'Night Mode', gains: [-2.0, -1.0, 0, 1.0, 0.5, -1.5, -3.0] },
  live: { name: 'Live Acoustic', gains: [1.0, 0.5, 0, 1.0, 1.5, 2.0, 2.5] },
  off: { name: 'Equalizer Off', gains: [0, 0, 0, 0, 0, 0, 0] },
  custom: { name: 'Custom EQ', gains: [0, 0, 0, 0, 0, 0, 0] },
};

interface SpatialAudioStoreState extends SpatialAudioState {
  setMode: (mode: SpatialAudioMode) => void;
  toggleSpatialAudio: () => void;
  toggleHeadTracking: () => void;
  toggleLoudnessNormalization: () => void;
  setEqPreset: (preset: EqualizerPresetId) => void;
  setCustomEqGain: (bandIndex: number, gainDb: number) => void;
  updateTrackFormat: (format: SpatialFormat, isSpatialized?: boolean) => void;
  setOutputDevice: (device: AudioOutputDevice, deviceName: string) => void;
  refreshAudioEnvironment: () => void;
}

export const useSpatialAudioStore = create<SpatialAudioStoreState>()(
  persist(
    (set, get) => ({
      supported: true,
      available: true,
      enabled: true,
      immersiveLevel: 1, // 1 = Binaural/Spatializer Active
      canSpatializeCurrentTrack: true,
      headTrackingAvailable: false,
      headTrackingEnabled: false,
      isContentSpatialized: false,
      outputDevice: 'BLUETOOTH_HEADPHONES',
      outputDeviceName: 'Wireless Audio Output',
      mode: 'SMART',
      activeFormat: 'stereo',
      dolbyAtmosReported: false,
      loudnessNormalizationEnabled: true,
      eqPreset: 'neo_signature',
      eqGains: NEO_SIGNATURE_GAINS,

      setMode: (mode) => {
        set({ mode });
        get().refreshAudioEnvironment();
      },

      toggleSpatialAudio: () => {
        const nextState = !get().enabled;
        set({ enabled: nextState });
        get().refreshAudioEnvironment();
      },

      toggleHeadTracking: () => {
        if (!get().headTrackingAvailable) return;
        set({ headTrackingEnabled: !get().headTrackingEnabled });
      },

      toggleLoudnessNormalization: () => {
        set({ loudnessNormalizationEnabled: !get().loudnessNormalizationEnabled });
      },

      setEqPreset: (preset) => {
        const selected = EQ_PRESETS[preset] || EQ_PRESETS.off;
        set({ eqPreset: preset, eqGains: selected.gains });
      },

      setCustomEqGain: (index, value) => {
        const currentGains = [...get().eqGains];
        if (index >= 0 && index < currentGains.length) {
          currentGains[index] = Math.max(-6, Math.min(6, value));
          set({ eqPreset: 'custom', eqGains: currentGains });
        }
      },

      updateTrackFormat: (format, isSpatialized = false) => {
        set({ 
          activeFormat: format,
          isContentSpatialized: isSpatialized || format === 'atmos' || format === 'spatial'
        });
        get().refreshAudioEnvironment();
      },

      setOutputDevice: (device, deviceName) => {
        const isHeadphones = device === 'BLUETOOTH_HEADPHONES' || device === 'WIRED_HEADPHONES';
        const isSoundbar = device === 'SOUNDBAR' || device === 'HDMI';
        
        set({
          outputDevice: device,
          outputDeviceName: deviceName,
          // Headphones expose headtracking capability
          headTrackingAvailable: isHeadphones,
          // Soundbars don't use headtracking
          headTrackingEnabled: isHeadphones ? get().headTrackingEnabled : false,
        });

        get().refreshAudioEnvironment();
      },

      refreshAudioEnvironment: () => {
        const { enabled, mode, isContentSpatialized, outputDevice } = get();

        // 1. If content is already spatialized, prevent double spatialization
        if (isContentSpatialized) {
          set({
            canSpatializeCurrentTrack: false,
            immersiveLevel: 1, // Preserve native stream
          });
          return;
        }

        // 2. Output & Mode evaluation
        const isSupportedOutput = outputDevice !== 'UNKNOWN';
        const canSpatialize = enabled && isSupportedOutput && mode !== 'OFF' && mode !== 'STEREO';

        set({
          canSpatializeCurrentTrack: canSpatialize,
          immersiveLevel: canSpatialize ? (outputDevice === 'BLUETOOTH_HEADPHONES' ? 2 : 1) : 0,
        });
      },
    }),
    {
      name: 'neotunes_spatial_audio',
      partialize: (state) => ({
        enabled: state.enabled,
        mode: state.mode,
        headTrackingEnabled: state.headTrackingEnabled,
        loudnessNormalizationEnabled: state.loudnessNormalizationEnabled,
        eqPreset: state.eqPreset,
        eqGains: state.eqGains,
      }),
    }
  )
);
