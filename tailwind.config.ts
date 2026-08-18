import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#061229',
          800: '#0A1A38',
        },
        meridian: {
          DEFAULT: '#0B3D91',
          700: '#082C6B',
          800: '#06214F',
        },
        gold: {
          DEFAULT: '#D4AF37',
          400: '#F2CB6B',
          600: '#B3901F',
        },
        pearl: '#F8F6F1',
        mist: '#93A5C9',
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"General Sans"', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      backgroundImage: {
        ascent: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(212,175,55,0.20), transparent 60%), linear-gradient(180deg, #061229 0%, #0B3D91 60%, #06214F 100%)',
        'gold-glow': 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.25), transparent 70%)',
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floatY: 'floatY 5s ease-in-out infinite',
        fadeUp: 'fadeUp 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
