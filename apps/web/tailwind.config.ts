import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Beamix primary tokens
        'beamix-primary': '#3370FF',
        'beamix-primary-dark': '#5A8FFF',
        'beamix-bg': '#FFFFFF',
        'beamix-bg-muted': '#F7F7F7',
        'beamix-text': '#0A0A0A',
        'beamix-text-muted': '#6B7280',
        'beamix-border': '#E5E7EB',
        'beamix-card': '#FFFFFF',
        // Score semantic tokens
        'score-excellent': '#06B6D4',
        'score-good': '#10B981',
        'score-fair': '#F59E0B',
        'score-critical': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Heebo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['InterDisplay', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        mono: ['GeistMono', 'Geist Mono', 'ui-monospace', 'monospace'],
        hebrew: ['Heebo', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'pill': '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
