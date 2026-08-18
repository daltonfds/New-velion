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
        primary: "#4F46E5", // Índigo/Roxo dos botões
        secondary: "#F8F9FA", // Fundo claro
        dark: "#1A202C", // Texto escuro
        muted: "#64748B", // Texto secundário
        border: "#E2E8F0", // Bordas leves
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
