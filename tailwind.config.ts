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
        primary: "#0B3D91", // Azul escuro dos botões
        secondary: "#F4F4F7", // Fundo cinza clarinho
        "light-card": "#FFFFFF", // Cartões brancos
        "light-border": "#E5E7EB", // Bordas sutis
        "light-text": "#1A1A1A", // Texto preto/cinza escuro
        "light-muted": "#6B7280", // Texto secundário cinza
        gold: {
          DEFAULT: "#D4AF37",
          400: "#F2CB6B",
        },
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"General Sans"', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
