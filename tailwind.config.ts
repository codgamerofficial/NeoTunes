import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/services/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/theme/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // NeoTunes Foundation & Surface Tokens
        "neo-bg": "#050608",
        "neo-sub": "#0B0D12",
        "neo-surface": "#11141A",
        "neo-elevated": "#171A21",
        "neo-highest": "#1E222B",
        "neo-hover": "#222733",
        "neo-text": "#F5F7FA",
        "neo-muted": "#9AA1AD",
        "neo-dim": "#6B7280",
        
        // NeoTunes Signature Accents
        "neo-lime": "#DFFF00",
        "neo-lime-hover": "#E8FF33",
        "neo-cyan": "#00E5FF",
        "neo-cyan-hover": "#33EAFF",
        "neo-magenta": "#FF2D95",
        "neo-violet": "#9D4EDD",
        
        // Borders
        "neo-border": "rgba(255, 255, 255, 0.08)",
        "neo-border-strong": "rgba(255, 255, 255, 0.16)",
        "neo-border-active": "rgba(223, 255, 0, 0.45)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        hero: "2rem",
      },
      spacing: {
        "4.5": "1.125rem", // 18px
        "13": "3.25rem",   // 52px
        "safe-top": "env(safe-area-inset-top, 0px)",
        "safe-bottom": "env(safe-area-inset-bottom, 16px)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        elevated: "0 12px 40px -10px rgba(0, 0, 0, 0.7)",
        brutal: "3px 3px 0px #DFFF00",
        "brutal-cyan": "3px 3px 0px #00E5FF",
        "brutal-dark": "4px 4px 0px rgba(0, 0, 0, 0.8)",
        glow: "0 0 24px -4px rgba(223, 255, 0, 0.4)",
        "glow-cyan": "0 0 24px -4px rgba(0, 229, 255, 0.4)",
      },
      backdropBlur: {
        xs: "4px",
        glass: "24px",
        strong: "32px",
      },
    },
  },
  plugins: [],
};
export default config;
