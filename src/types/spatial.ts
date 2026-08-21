export type SpatialFormat = 'stereo' | 'multichannel' | 'spatial' | 'atmos' | 'unknown';

export type AudioOutputDevice = 
  | 'PHONE_SPEAKER'
  | 'WIRED_HEADPHONES'
  | 'BLUETOOTH_HEADPHONES'
  | 'BLUETOOTH_SPEAKER'
  | 'SOUNDBAR'
  | 'CAST'
  | 'HDMI'
  | 'UNKNOWN';

export type SpatialAudioMode = 'NATIVE' | 'SPATIAL' | 'IMMERSIVE' | 'STEREO' | 'OFF' | 'SMART';

export type EqualizerPresetId = 
  | 'neo_signature' 
  | 'pure' 
  | 'warm' 
  | 'deep_bass' 
  | 'vocal' 
  | 'cinematic' 
  | 'night' 
  | 'live' 
  | 'off'
  | 'custom';

export interface SpatialAudioState {
  supported: boolean;
  available: boolean;
  enabled: boolean;
  immersiveLevel: number; // 0 (none), 1 (multichannel/binaural), 2 (headtracking)
  canSpatializeCurrentTrack: boolean;
  headTrackingAvailable: boolean;
  headTrackingEnabled: boolean;
  isContentSpatialized: boolean;
  outputDevice: AudioOutputDevice;
  outputDeviceName: string;
  mode: SpatialAudioMode;
  activeFormat: SpatialFormat;
  dolbyAtmosReported: boolean;
  loudnessNormalizationEnabled: boolean;
  eqPreset: EqualizerPresetId;
  eqGains: number[]; // [60Hz, 150Hz, 400Hz, 1kHz, 2.5kHz, 6.3kHz, 12kHz] in dB
}
