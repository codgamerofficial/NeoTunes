import { tokens } from './tokens';

export * from './tokens';
export * from './NeoDesignSystem';

export const colors = {
  background: tokens.colors.bg.primary,
  backgroundSecondary: tokens.colors.bg.sub,
  surface: tokens.colors.surface.tonal,
  surfaceStrong: tokens.colors.surface.tonalHover,
  surfaceHover: tokens.colors.surface.tonalActive,
  border: tokens.colors.border.default,
  borderStrong: tokens.colors.border.strong,
  text: tokens.colors.text.primary,
  secondaryText: tokens.colors.text.secondary,
  mutedText: tokens.colors.text.muted,
  neo: tokens.colors.accent.lime,
  cyan: tokens.colors.accent.cyan,
  magenta: tokens.colors.accent.magenta,
  danger: tokens.colors.status.error,
  success: tokens.colors.status.success,
  warning: tokens.colors.status.warning,
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const radius = {
  trackRow: 14,
  contentCard: 18,
  featured: 24,
  modal: 28,
  navigation: 20,
  hero: 32,
};

export const typography = {
  display: 'font-sans text-3xl md:text-5xl font-extrabold text-[#F5F7FA] tracking-tight',
  title: 'font-sans text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight',
  headline: 'font-sans text-base sm:text-lg font-bold text-[#F5F7FA]',
  body: 'font-sans text-sm text-[#F5F7FA]',
  label: 'font-sans text-xs font-bold text-[#9AA1AD] uppercase tracking-wider',
  caption: 'font-sans text-xs text-[#9AA1AD]',
  mono: 'font-mono text-xs text-[#DFFF00]',
};
