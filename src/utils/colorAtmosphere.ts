import { getTrackArtwork } from './artwork';

export interface ColorPalette {
  primary: string;       // Accent glow color (e.g. #00D9FF, #7657FF, #FF2E9A)
  secondary: string;     // Complementary atmosphere color
  darkBackground: string;// Rich dark backdrop
  textColor: string;     // High contrast text
  glowOpacity: number;
}

const PRESET_PALETTES: Record<string, ColorPalette> = {
  'dai-dai': {
    primary: '#00D9FF',      // Electric Cyan (Screenshot 2)
    secondary: '#7657FF',    // Neo Violet
    darkBackground: '#0B0E17',
    textColor: '#FFFFFF',
    glowOpacity: 0.35,
  },
  'bhulbo': {
    primary: '#FF2E9A',      // Pulse Magenta (Screenshot 1)
    secondary: '#4D8DFF',    // Aurora Blue
    darkBackground: '#0F131D',
    textColor: '#FFFFFF',
    glowOpacity: 0.3,
  },
  'freaked': {
    primary: '#1F2B42',      // Deep Sapphire (Screenshot 3 & 4)
    secondary: '#00D9FF',
    darkBackground: '#0B0E14',
    textColor: '#FFFFFF',
    glowOpacity: 0.25,
  },
  'kesariya': {
    primary: '#FF7A00',      // Warm Saffron
    secondary: '#FF2E9A',
    darkBackground: '#140A07',
    textColor: '#FFFFFF',
    glowOpacity: 0.35,
  },
  'blinding': {
    primary: '#E11D48',      // Neon Red / Crimson
    secondary: '#7657FF',
    darkBackground: '#12070A',
    textColor: '#FFFFFF',
    glowOpacity: 0.3,
  },
  'default': {
    primary: '#00D9FF',
    secondary: '#7657FF',
    darkBackground: '#05060A',
    textColor: '#FFFFFF',
    glowOpacity: 0.25,
  },
};

export function extractColorAtmosphere(track: any): ColorPalette {
  if (!track) return PRESET_PALETTES.default;

  const title = (track.title || '').toLowerCase();
  const id = (track.id || '').toLowerCase();

  if (title.includes('dai') || id.includes('dai')) {
    return PRESET_PALETTES['dai-dai'];
  }
  if (title.includes('bhulbo') || id.includes('bhulbo')) {
    return PRESET_PALETTES['bhulbo'];
  }
  if (title.includes('freak') || id.includes('freak')) {
    return PRESET_PALETTES['freaked'];
  }
  if (title.includes('kesariya') || id.includes('kesariya')) {
    return PRESET_PALETTES['kesariya'];
  }
  if (title.includes('blinding') || id.includes('blinding')) {
    return PRESET_PALETTES['blinding'];
  }

  return PRESET_PALETTES.default;
}
