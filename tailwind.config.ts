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
        primary: "#5946E6",
        secondary: "#F4F4F7",
        dark: "#1A1A1A",
        muted: "#6B7280",
        border: "#E5E7EB",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        // Nomes usados no seu design:
        'light-bg': "#F4F4F7",
        'light-text': "#1A1A1A",
        'light-textMuted': "#6B7280",
        'light-border': "#E5E7EB",
        'dark-bg': "#0D0D0D",
        'dark-text': "#FFFFFF",
        'dark-textMuted': "#9CA3AF",
        'dark-border': "#333333",
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
