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
        primary: "#4F46E5", // Roxo principal dos botões
        secondary: "#F4F4F7", // Fundo cinza clarinho (como nas fotos)
        "light-card": "#FFFFFF", // Cartões brancos
        "light-border": "#E5E7EB", // Bordas sutis
        "light-text": "#1A1A1A", // Texto preto (quase cinza escuro)
        "light-muted": "#6B7280", // Texto secundário cinza
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
