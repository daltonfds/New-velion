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
        primary: "#4F46E5",
        secondary: "#F4F4F7",
        "light-card": "#FFFFFF",
        "light-border": "#E5E7EB",
        "light-text": "#1A1A1A",
        "light-muted": "#6B7280",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      fontSize: {
        'h1': ['20px', { lineHeight: '1.25', fontWeight: '700' }],
        'h2': ['17px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['15px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['12px', { lineHeight: '1.6', fontWeight: '400' }],
        'meta': ['9px', { lineHeight: '1.5', fontWeight: '500' }],
        'desktop-h1': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'desktop-h2': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'desktop-h3': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'desktop-body': ['13px', { lineHeight: '1.6', fontWeight: '400' }],
        'desktop-meta': ['10px', { lineHeight: '1.5', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
export default config;
