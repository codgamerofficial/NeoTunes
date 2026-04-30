import type { ThemeMode } from '../store/preferencesStore';

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  accent: string;
  accentStrong: string;
  secondary: string;
  accentGlow: string;
  dangerSurface: string;
}

const DARK_PALETTE: ThemePalette = {
  background: '#0B0B0F',
  surface: '#14141A',
  surfaceAlt: '#1B1B24',
  text: '#FFFFFF',
  textMuted: '#A0A0B0',
  textSubtle: 'rgba(255,255,255,0.55)',
  border: '#23232B',
  accent: '#FF2E63',
  accentStrong: '#6C5CE7',
  secondary: '#6C5CE7',
  accentGlow: '#00F5FF',
  dangerSurface: '#2A1016',
};

const LIGHT_PALETTE: ThemePalette = {
  background: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceAlt: '#E5E7EB',
  text: '#0A0A0A',
  textMuted: '#374151',
  textSubtle: '#6B7280',
  border: '#0A0A0A',
  accent: '#0A84FF',
  accentStrong: '#059669',
  secondary: '#2563EB',
  accentGlow: '#14B8A6',
  dangerSurface: '#FEE2E2',
};

const AMOLED_PALETTE: ThemePalette = {
  background: '#000000',
  surface: '#0F0F14',
  surfaceAlt: '#14141A',
  text: '#FFFFFF',
  textMuted: '#A0A0B0',
  textSubtle: 'rgba(255,255,255,0.55)',
  border: '#1F1F28',
  accent: '#FF2E63',
  accentStrong: '#6C5CE7',
  secondary: '#6C5CE7',
  accentGlow: '#00F5FF',
  dangerSurface: '#2A1016',
};

export function getThemePalette(themeMode: ThemeMode): ThemePalette {
  if (themeMode === 'amoled') return AMOLED_PALETTE;
  if (themeMode === 'light') return LIGHT_PALETTE;
  return DARK_PALETTE;
}
