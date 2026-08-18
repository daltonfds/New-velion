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
        primary: "#3B82F6", // Azul claro das referências
        secondary: "#F4F4F7", // Fundo cinza clarinho
        "light-card": "#FFFFFF",
        "light-border": "#E5E7EB",
        "light-text": "#1A1A1A",
        "light-muted": "#6B7280",
        gold: {
          DEFAULT: "#D4AF37",
        },
      },
    },
  },
  plugins: [],
};
export default config;
