import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // DS1 Silver Empire — uses CSS variables so dark mode swaps automatically
        empire: {
          DEFAULT: '#0D1829',   // --empire (navy dark — sidebar, dark sections) — never changes
          void:     '#070C14',  // deepest dark — never changes
          // These resolve to CSS vars, so they auto-swap in dark mode
          bone:     'var(--bone)',
          ink:      'var(--ink)',
          ghost:    'var(--ghost)',
          mist:     'var(--mist)',
          steel:    'var(--steel)',
          danger:   'var(--danger)',
          // These are constant across light/dark
          platinum: '#BFC5CC',
          gold:     '#C9A240',
          // Surface: card/panel bg — swaps via CSS var
          surface:  'var(--surface)',
          // Semantic status — swap in dark mode
          success:  'var(--success)',
        },
        // shadcn/ui tokens mapeados para DS1 Silver Empire
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        lg: '12px',   // DS1 --radius-lg: cards, panels, table wrappers
        md: '6px',    // DS1 --radius-md: small cards, swatches, toast
        sm: '3px',    // DS1 --radius-sm: buttons, badges, inputs
      },
      boxShadow: {
        'empire-sm': '0 1px 3px rgba(7,12,20,0.08), 0 1px 2px rgba(7,12,20,0.04)',
        'empire-md': '0 4px 16px rgba(7,12,20,0.10), 0 2px 6px rgba(7,12,20,0.06)',
        'empire-lg': '0 16px 48px rgba(7,12,20,0.14), 0 6px 16px rgba(7,12,20,0.08)',
        'empire-xl': '0 32px 80px rgba(7,12,20,0.20), 0 12px 32px rgba(7,12,20,0.12)',
        'gold-glow': '0 8px 24px rgba(201,162,64,0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
