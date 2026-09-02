import { tokens } from './tokens';

export const NeoDesignTokens = {
  colors: {
    background: tokens.colors.bg.primary,
    backgroundSub: tokens.colors.bg.sub,
    surface: tokens.colors.surface.default,
    surfaceElevated: tokens.colors.surface.elevated,
    surfaceGlass: tokens.colors.glass.standard,
    textPrimary: tokens.colors.text.primary,
    textSecondary: tokens.colors.text.secondary,
    textTertiary: tokens.colors.text.muted,
    border: tokens.colors.border.default,
    borderHover: tokens.colors.border.strong,
    borderActive: tokens.colors.border.active,
    accent: tokens.colors.accent.lime,
    accentCyan: tokens.colors.accent.cyan,
    accentMagenta: tokens.colors.accent.magenta,
    playing: tokens.colors.accent.lime,
    error: tokens.colors.status.error,
    success: tokens.colors.status.success,
    warning: tokens.colors.status.warning,
  },
  typography: {
    display: 'text-3xl sm:text-4xl md:text-5xl font-black tracking-tight',
    heading: 'text-xl sm:text-2xl md:text-3xl font-bold tracking-tight',
    title: 'text-base sm:text-lg font-bold tracking-tight',
    subtitle: 'text-xs sm:text-sm font-semibold text-[#9AA1AD]',
    body: 'text-xs sm:text-sm leading-relaxed text-[#F5F7FA]',
    caption: 'text-[11px] text-[#9AA1AD]',
    label: 'text-[11px] font-bold uppercase tracking-wider text-[#9AA1AD]',
    mono: 'text-[11px] font-mono text-[#DFFF00]',
  },
  spacing: {
    xs: tokens.spacing.xxs,
    sm: tokens.spacing.xs,
    md: tokens.spacing.md,
    lg: tokens.spacing.xl,
    xl: tokens.spacing['2xl'],
  },
  radius: {
    sm: tokens.radius.sm,
    md: tokens.radius.md,
    lg: tokens.radius.lg,
    hero: tokens.radius.hero,
    full: tokens.radius.full,
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
  tokens,
};

export default NeoDesignTokens;
