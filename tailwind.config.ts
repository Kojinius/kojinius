import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FCF0DE',
          deep: '#F5E8D0',
        },
        brown: {
          50: '#FCF0DE',
          100: '#F5E8D0',
          200: '#EDE3D8',
          300: '#C4A99B',
          400: '#A07888',
          500: '#8B7355',
          600: '#735763',
          700: '#5A4250',
          800: '#3D2B1F',
          900: '#2A1A12',
          950: '#1A1210',
        },
        accent: {
          DEFAULT: '#F79321',
          light: '#FFA94D',
          dark: '#E07800',
        },
        // 2026-04-22 claude-sonnet-4-6 セッションターン数：- OAS demo colors
        oas: {
          navy:    { DEFAULT: '#1B3664', light: '#2D5A8E', dark: '#0F2140' },
          gold:    { DEFAULT: '#C9A84C', light: '#E2C06A', dark: '#A8883A' },
          cream:   { DEFAULT: '#FAF8F3', 2: '#F0ECE3', 3: '#E4DDD2' },
          text1:   '#1C2E45',
          text2:   '#4E6073',
          text3:   '#8A9BAC',
        },
        // 2026-04-22 claude-sonnet-4-6 セッションターン数：3 AMS demo colors
        shu:    { DEFAULT: '#D02020', light: '#E84040', dark: '#A01010' },
        matsu:  { DEFAULT: '#1040C0', light: '#3060E0', dark: '#082880' },
        bauhaus: {
          yellow: '#F0C020', red: '#D02020', blue: '#1040C0',
          black: '#121212', canvas: '#F0F0F0', green: '#2D8A4E',
        },
        sumi: {
          50: '#F0F0F0', 100: '#E0E0E0', 200: '#C8C8C8', 300: '#A0A0A0',
          400: '#787878', 500: '#505050', 600: '#383838', 700: '#282828',
          800: '#1E1E1E', 900: '#141414', 950: '#121212',
        },
      },
      fontFamily: {
        display:  ['"Fraunces"', 'serif'],
        heading:  ['"Outfit"', '"Zen Kaku Gothic New"', 'sans-serif'],
        body:     ['"Zen Kaku Gothic New"', '"Hiragino Kaku Gothic ProN"', 'sans-serif'],
        mono:     ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'bauhaus':      '4px 4px 0px 0px #121212',
        'bauhaus-sm':   '2px 2px 0px 0px #121212',
        'bauhaus-lg':   '6px 6px 0px 0px #121212',
        'bauhaus-red':  '4px 4px 0px 0px #D02020',
        'bauhaus-blue': '4px 4px 0px 0px #1040C0',
      },
      borderWidth: { '3': '3px' },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) both',
        'slide-down': 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeInUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.94)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
