// Simple, reliable color hash & gradient generator from artwork URL / canonicalId
// Generates rich CSS gradient colors dynamically based on artwork URL

export interface ArtworkPalette {
  primary: string;
  secondary: string;
  darkAccent: string;
  backgroundGradient: string;
  glowColor: string;
}

export function extractPaletteFromUrl(url?: string, canonicalId?: string): ArtworkPalette {
  const seed = (url || canonicalId || 'default-music-seed').split('').reduce((acc, char) => {
    return (acc << 5) - acc + char.charCodeAt(0);
  }, 0);

  const hue1 = Math.abs(seed) % 360;
  const hue2 = (hue1 + 40 + (Math.abs(seed >> 3) % 80)) % 360;
  
  const primary = `hsl(${hue1}, 75%, 45%)`;
  const secondary = `hsl(${hue2}, 70%, 35%)`;
  const darkAccent = `hsl(${hue1}, 60%, 10%)`;
  const glowColor = `hsla(${hue1}, 85%, 55%, 0.3)`;

  const backgroundGradient = `radial-gradient(circle at 50% 20%, ${glowColor} 0%, ${darkAccent} 55%, #05060A 100%)`;

  return {
    primary,
    secondary,
    darkAccent,
    backgroundGradient,
    glowColor,
  };
}
