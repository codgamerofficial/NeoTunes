import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AudioQuality = 'very_high' | 'high' | 'data_saver';
export type SoundstagePreset = 'studio' | 'concert' | 'acoustic' | 'bass';
export type EqualizerPreset = 'flat' | 'bass_boost' | 'vocal' | 'treble' | 'lofi' | 'custom';
export type AccentColor = 'cyan' | 'violet' | 'pink' | 'emerald';

export interface UserPreferences {
  audioQuality: AudioQuality;
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
  gaplessPlayback: boolean;
  autoplay: boolean;
  soundstagePreset: SoundstagePreset;
  equalizerPreset: EqualizerPreset;
  equalizerBands: number[]; // 60Hz, 150Hz, 400Hz, 1kHz, 2.4kHz, 6kHz, 15kHz
  accentColor: AccentColor;
  oledDarkMode: boolean;
  reduceMotion: boolean;
  compactLayout: boolean;
  downloadWifiOnly: boolean;
  privateSession: boolean;
  personalizedRecs: boolean;
  
  // User Profile Metadata
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;

  // Actions
  setAudioQuality: (quality: AudioQuality) => void;
  setCrossfadeEnabled: (enabled: boolean) => void;
  setCrossfadeDuration: (duration: number) => void;
  setGaplessPlayback: (enabled: boolean) => void;
  setAutoplay: (enabled: boolean) => void;
  setSoundstagePreset: (preset: SoundstagePreset) => void;
  setEqualizerPreset: (preset: EqualizerPreset) => void;
  setEqualizerBands: (bands: number[]) => void;
  setAccentColor: (color: AccentColor) => void;
  setOledDarkMode: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setCompactLayout: (enabled: boolean) => void;
  setDownloadWifiOnly: (enabled: boolean) => void;
  setPrivateSession: (enabled: boolean) => void;
  setPersonalizedRecs: (enabled: boolean) => void;
  updateProfile: (data: { displayName?: string; username?: string; bio?: string; avatarUrl?: string }) => void;
  resetSettings: () => void;
}

const DEFAULT_PREFERENCES = {
  audioQuality: 'very_high' as AudioQuality,
  crossfadeEnabled: true,
  crossfadeDuration: 3,
  gaplessPlayback: true,
  autoplay: true,
  soundstagePreset: 'concert' as SoundstagePreset,
  equalizerPreset: 'flat' as EqualizerPreset,
  equalizerBands: [0, 0, 0, 0, 0, 0, 0],
  accentColor: 'cyan' as AccentColor,
  oledDarkMode: true,
  reduceMotion: false,
  compactLayout: false,
  downloadWifiOnly: true,
  privateSession: false,
  personalizedRecs: true,
  displayName: 'Saswata Dey',
  username: 'saswatadey',
  bio: 'Music listener and sound enthusiast.',
  avatarUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/4a/01/5e/4a015e57-2292-6d2b-5e4d-bf7d1bdfecad/8902894363293.jpg/600x600bb.jpg',
};

export const useSettingsStore = create<UserPreferences>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,

      setAudioQuality: (audioQuality) => set({ audioQuality }),
      setCrossfadeEnabled: (crossfadeEnabled) => set({ crossfadeEnabled }),
      setCrossfadeDuration: (crossfadeDuration) => set({ crossfadeDuration }),
      setGaplessPlayback: (gaplessPlayback) => set({ gaplessPlayback }),
      setAutoplay: (autoplay) => set({ autoplay }),
      setSoundstagePreset: (soundstagePreset) => set({ soundstagePreset }),
      setEqualizerPreset: (equalizerPreset) => set({ equalizerPreset }),
      setEqualizerBands: (equalizerBands) => set({ equalizerBands }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setOledDarkMode: (oledDarkMode) => set({ oledDarkMode }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setCompactLayout: (compactLayout) => set({ compactLayout }),
      setDownloadWifiOnly: (downloadWifiOnly) => set({ downloadWifiOnly }),
      setPrivateSession: (privateSession) => set({ privateSession }),
      setPersonalizedRecs: (personalizedRecs) => set({ personalizedRecs }),
      
      updateProfile: (data) =>
        set((state) => ({
          displayName: data.displayName !== undefined ? data.displayName : state.displayName,
          username: data.username !== undefined ? data.username : state.username,
          bio: data.bio !== undefined ? data.bio : state.bio,
          avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : state.avatarUrl,
        })),

      resetSettings: () => set(DEFAULT_PREFERENCES),
    }),
    {
      name: 'neotunes_user_preferences',
    }
  )
);
