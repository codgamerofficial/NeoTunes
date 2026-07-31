/**
 * Dynamic Color Extraction & Gradient Synthesizer for Album Artworks
 * Creates custom Aurora gradients and RGB color sets for 2027 OLED dark mode.
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  gradientBg: string;
}

const DEFAULT_PALETTES: ColorPalette[] = [
  {
    primary: '#00D4FF',
    secondary: '#7A3CFF',
    accent: '#FF2D95',
    glow: 'rgba(0, 212, 255, 0.25)',
    gradientBg: 'radial-gradient(circle at 50% -20%, rgba(0, 212, 255, 0.25), rgba(122, 60, 255, 0.15), rgba(5, 5, 5, 1))',
  },
  {
    primary: '#FF2D95',
    secondary: '#FF7A00',
    accent: '#00D4FF',
    glow: 'rgba(255, 45, 149, 0.25)',
    gradientBg: 'radial-gradient(circle at 50% -20%, rgba(255, 45, 149, 0.25), rgba(255, 122, 0, 0.15), rgba(5, 5, 5, 1))',
  },
  {
    primary: '#10B981',
    secondary: '#00D4FF',
    accent: '#7A3CFF',
    glow: 'rgba(16, 185, 129, 0.25)',
    gradientBg: 'radial-gradient(circle at 50% -20%, rgba(16, 185, 129, 0.25), rgba(0, 212, 255, 0.15), rgba(5, 5, 5, 1))',
  },
  {
    primary: '#7A3CFF',
    secondary: '#FF2D95',
    accent: '#00D4FF',
    glow: 'rgba(122, 60, 255, 0.25)',
    gradientBg: 'radial-gradient(circle at 50% -20%, rgba(122, 60, 255, 0.25), rgba(255, 45, 149, 0.15), rgba(5, 5, 5, 1))',
  },
];

export function getPaletteForTrackId(trackId?: string): ColorPalette {
  if (!trackId) return DEFAULT_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < trackId.length; i++) {
    hash = trackId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_PALETTES.length;
  return DEFAULT_PALETTES[index];
}
