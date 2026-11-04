import type { Config } from 'tailwindcss';

// Colors read the CSS variables in src/index.css — change a token there, not here.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Orbitron is the GEEKBOND wordmark only; everything else is Rubik
        display: ['"Orbitron"', 'system-ui', 'sans-serif'],
        sans: ['"Rubik"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        elevated: token('elevated'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
