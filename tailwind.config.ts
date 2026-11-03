import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Orbitron"', '"Rajdhani"', 'sans-serif'],
        gamer: ['"Orbitron"', 'sans-serif'],
        sans: ['"Rajdhani"', '"Chakra Petch"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas: {
          dark: '#0B141E',
          light: '#F1F5F9',
        },
        surface: {
          dark: '#131F2E',
          elevated: '#1A2A3D',
          light: '#FFFFFF',
          elevatedLight: '#E2E8F0',
        },
        border: {
          dark: '#22354B',
          light: '#CBD5E1',
        },
        teal: {
          brand: '#00FFD1', // Electric bright teal
          brandHover: '#00E5BC',
          deep: '#0D9488',
          lightContrast: '#00A892',
        },
        accent: {
          primary: '#00FFD1',
          hover: '#00E5BC',
        },
      },
      boxShadow: {
        'card-hover': '0 14px 30px rgba(0, 0, 0, 0.4), 0 4px 4px rgba(0, 0, 0, 0.25)',
        'teal-glow': '0 10px 25px -5px rgba(0, 255, 209, 0.35)',
        'teal-glow-lg': '0 0 30px rgba(0, 255, 209, 0.5)',
      },
      aspectRatio: {
        'poster': '2 / 3',
      },
    },
  },
  plugins: [],
} satisfies Config;
