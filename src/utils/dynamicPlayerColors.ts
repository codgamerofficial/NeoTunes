// Dynamic color extraction & gradient generator for modern player UI
// Handles dynamic extraction from artwork images with instant smart fallbacks

export interface PlayerThemeColors {
  topDark: string;       // Dark vignette tone for top
  middleAmbient: string; // Vibrant atmospheric ambient tone (e.g. warm amber or cool slate)
  bottomBase: string;    // Deep rich base tone for controls
  accent: string;        // Accent highlight color
  isWarm: boolean;
}

// Preset themes for famous tracks to match references with 100% precision
const PRESET_THEMES: Record<string, PlayerThemeColors> = {
  // Karan Aujla & Jay Trak - Wavy (Warm golden amber / chocolate brown from Screenshot 1)
  wavy: {
    topDark: '#120904',
    middleAmbient: '#542609',
    bottomBase: '#2a1104',
    accent: '#F59E0B',
    isWarm: true,
  },
  // Yo Yo Honey Singh - Millionaire / Glory (Cool charcoal / smoky slate from Screenshot 2)
  millionaire: {
    topDark: '#111417',
    middleAmbient: '#2C343B',
    bottomBase: '#161A1E',
    accent: '#E2E8F0',
    isWarm: false,
  },
  glory: {
    topDark: '#111417',
    middleAmbient: '#2C343B',
    bottomBase: '#161A1E',
    accent: '#E2E8F0',
    isWarm: false,
  },
  // Diljit Dosanjh - Lemonade (Warm electric amber / gold)
  lemonade: {
    topDark: '#150E04',
    middleAmbient: '#4D360B',
    bottomBase: '#211604',
    accent: '#FBBF24',
    isWarm: true,
  },
  // Default rich dark aesthetic
  default: {
    topDark: '#0A0C10',
    middleAmbient: '#1B2433',
    bottomBase: '#0D1117',
    accent: '#38BDF8',
    isWarm: false,
  },
};

/**
 * Returns a fast theme based on track title / artist / id
 */
export function getTrackThemeColors(track?: { title?: string; artist?: any; id?: string } | null): PlayerThemeColors {
  if (!track) return PRESET_THEMES.default;

  const title = (track.title || '').toLowerCase();
  const artistStr = typeof track.artist === 'string' ? track.artist.toLowerCase() : '';
  const id = (track.id || '').toLowerCase();

  if (title.includes('wavy') || id.includes('wavy') || (artistStr.includes('aujla') && title.includes('wavy'))) {
    return PRESET_THEMES.wavy;
  }

  if (title.includes('millionaire') || id.includes('millionaire') || title.includes('glory') || artistStr.includes('honey singh')) {
    return PRESET_THEMES.millionaire;
  }

  if (title.includes('lemonade') || id.includes('lemonade') || artistStr.includes('diljit')) {
    return PRESET_THEMES.lemonade;
  }

  // Algorithmic extraction from track string hash
  const seed = `${title}_${artistStr}_${id}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const isWarm = (hue >= 15 && hue <= 80) || (hue >= 340 && hue <= 360);
  const saturation = 55 + (Math.abs(hash >> 3) % 25); // 55% - 80%

  return {
    topDark: `hsl(${hue}, ${saturation}%, 6%)`,
    middleAmbient: `hsl(${hue}, ${saturation}%, 18%)`,
    bottomBase: `hsl(${hue}, ${saturation}%, 9%)`,
    accent: `hsl(${hue}, 85%, 60%)`,
    isWarm,
  };
}

/**
 * Extracts dominant color from image URL asynchronously using an offscreen canvas
 */
export async function extractDominantColorFromImage(imageUrl: string): Promise<PlayerThemeColors | null> {
  if (typeof window === 'undefined' || !imageUrl) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, 0, 16, 16);

        const imgData = ctx.getImageData(0, 0, 16, 16).data;
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let count = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          // Filter out pure white or pure black
          const brightness = (r + g + b) / 3;
          if (brightness > 20 && brightness < 235) {
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }

        if (count === 0) {
          resolve(null);
          return;
        }

        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);

        // Convert RGB to HSL
        const rNorm = avgR / 255;
        const gNorm = avgG / 255;
        const bNorm = avgB / 255;
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case rNorm:
              h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
              break;
            case gNorm:
              h = (bNorm - rNorm) / d + 2;
              break;
            case bNorm:
              h = (rNorm - gNorm) / d + 4;
              break;
          }
          h = Math.round(h * 60);
        }

        const hue = h;
        const sat = Math.max(30, Math.min(80, Math.round(s * 100)));
        const isWarm = (hue >= 15 && hue <= 80) || (hue >= 340 && hue <= 360);

        resolve({
          topDark: `hsl(${hue}, ${sat}%, 7%)`,
          middleAmbient: `hsl(${hue}, ${sat}%, 20%)`,
          bottomBase: `hsl(${hue}, ${sat}%, 10%)`,
          accent: `hsl(${hue}, 85%, 65%)`,
          isWarm,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
