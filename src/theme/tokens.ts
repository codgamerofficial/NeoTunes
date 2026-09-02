/**
 * Centralized NeoTunes Design Tokens System (2026)
 * Google Material 3 + Contextual Glassmorphism + Selective Neubrutalism
 */

export const tokens = {
  colors: {
    // Background Foundation (Near-black)
    bg: {
      primary: '#050608',
      sub: '#0B0D12',
      elevated: '#11141A',
      overlay: 'rgba(5, 6, 8, 0.85)',
    },
    // Material 3 Surface Hierarchy
    surface: {
      default: '#11141A',
      elevated: '#171A21',
      highest: '#1E222B',
      hover: '#222733',
      tonal: 'rgba(255, 255, 255, 0.05)',
      tonalHover: 'rgba(255, 255, 255, 0.08)',
      tonalActive: 'rgba(255, 255, 255, 0.12)',
    },
    // Glassmorphism Surfaces
    glass: {
      standard: 'rgba(17, 20, 26, 0.72)',
      elevated: 'rgba(23, 26, 33, 0.82)',
      modal: 'rgba(11, 13, 18, 0.90)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(255, 255, 255, 0.16)',
      borderActive: 'rgba(223, 255, 0, 0.40)',
    },
    // NeoTunes Signature Accents
    accent: {
      lime: '#DFFF00',         // Neo Electric Lime (Primary Brand CTA)
      limeHover: '#E8FF33',
      limeTonal: 'rgba(223, 255, 0, 0.12)',
      limeBorder: 'rgba(223, 255, 0, 0.35)',
      cyan: '#00E5FF',         // Secondary High-Fidelity Accent
      cyanHover: '#33EAFF',
      cyanTonal: 'rgba(0, 229, 255, 0.12)',
      magenta: '#FF2D95',      // Expressive Discovery Accent
      violet: '#9D4EDD',       // Intelligence Accent
    },
    // Typography Hierarchy
    text: {
      primary: '#F5F7FA',
      secondary: '#9AA1AD',
      muted: '#6B7280',
      inverse: '#050608',
      accent: '#DFFF00',
    },
    // Borders & Outlines
    border: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      default: 'rgba(255, 255, 255, 0.10)',
      strong: 'rgba(255, 255, 255, 0.18)',
      active: 'rgba(223, 255, 0, 0.50)',
      brutalist: '#DFFF00',
    },
    // Semantic Status
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#00E5FF',
    },
  },

  // Typography Scale (Inter / Geist Sans modern typography)
  typography: {
    display: {
      fontSize: 'clamp(2rem, 4vw, 3.25rem)',
      lineHeight: '1.1',
      fontWeight: '800',
      letterSpacing: '-0.03em',
    },
    headline: {
      fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)',
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    title: {
      fontSize: '1.125rem',
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    body: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontWeight: '400',
    },
    label: {
      fontSize: '0.75rem',
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: '1.4',
      fontWeight: '400',
    },
    mono: {
      fontSize: '0.6875rem',
      fontFamily: 'monospace',
      letterSpacing: '0.02em',
    },
  },

  // Spacing System (in px and rem equivalents)
  spacing: {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px',
    '4xl': '48px',
    '5xl': '64px',
    '6xl': '80px',
  },

  // Semantic Border Radii
  radius: {
    sm: '10px',
    md: '16px',
    lg: '24px',
    hero: '32px',
    full: '9999px',
  },

  // Depth Elevation & Glassmorphism Blur Levels
  elevation: {
    level0: 'none',
    level1: '0 2px 8px rgba(0, 0, 0, 0.4)',
    level2: '0 8px 24px rgba(0, 0, 0, 0.6)',
    level3: '0 16px 40px rgba(0, 0, 0, 0.8)',
    level4: '0 24px 60px rgba(0, 0, 0, 0.95)',
    brutalist: '4px 4px 0px rgba(223, 255, 0, 0.9)',
    brutalistCyan: '4px 4px 0px rgba(0, 229, 255, 0.9)',
  },

  // Blur Tokens
  blur: {
    subtle: '12px',
    standard: '24px',
    strong: '32px',
  },

  // Motion Design System
  motion: {
    duration: {
      fast: '140ms',
      normal: '200ms',
      emphasis: '300ms',
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.15)',
    },
  },

  // Responsive Breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    wide: 1440,
  },

  // Touch Target Standards
  touchTarget: {
    min: '44px',
    comfortable: '48px',
  },
} as const;

export type NeoTokens = typeof tokens;
export default tokens;
