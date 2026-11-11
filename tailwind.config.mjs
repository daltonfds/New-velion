/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },

      fontSize: {
        h1: ["24px", { lineHeight: "1.25", fontWeight: "700" }],
        "desktop-h1": ["28px", { lineHeight: "1.2", fontWeight: "700" }],

        h2: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "desktop-h2": ["22px", { lineHeight: "1.3", fontWeight: "600" }],

        h3: ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "desktop-h3": ["20px", { lineHeight: "1.4", fontWeight: "600" }],

        body: ["14px", { lineHeight: "1.55", fontWeight: "400" }],
        "desktop-body": ["15px", { lineHeight: "1.55", fontWeight: "400" }],

        meta: ["12px", { lineHeight: "1.45", fontWeight: "500" }],
        "desktop-meta": ["12px", { lineHeight: "1.45", fontWeight: "500" }],
      },

      colors: {
        brand: {
          50: "#F4F3FD", 100: "#E8E6FA", 200: "#CFCBF4", 300: "#A9A2EA", 400: "#6F63D6",
          500: "#3A2DB8", 600: "#10069F", 700: "#0D0580", 800: "#08035A", 900: "#0A0440",
        },
        ink: {
          50: "#F6F6FA", 100: "#EEEFF4", 200: "#E6E7EE", 300: "#D1D3DF", 400: "#8A8EA3",
          500: "#5B5F76", 600: "#4A4E66", 700: "#3C405A", 800: "#23253D", 900: "#12132B",
        },
        // slate e gray usam a escala neutra da marca (substitui os remaps com !important)
        slate: {
          50: "#F6F6FA", 100: "#EEEFF4", 200: "#E6E7EE", 300: "#D1D3DF", 400: "#6B6F86",
          500: "#5B5F76", 600: "#4A4E66", 700: "#3C405A", 800: "#23253D", 900: "#12132B", 950: "#0B0C1C",
        },
        gray: {
          50: "#F6F6FA", 100: "#EEEFF4", 200: "#E6E7EE", 300: "#D1D3DF", 400: "#6B6F86",
          500: "#5B5F76", 600: "#4A4E66", 700: "#3C405A", 800: "#23253D", 900: "#12132B", 950: "#0B0C1C",
        },
        // indigo foi remapeado para a escala da marca: as 77 classes indigo-* existentes passam a usar #10069F
        indigo: {
          50: "#F4F3FD", 100: "#E8E6FA", 200: "#CFCBF4", 300: "#A9A2EA", 400: "#6F63D6",
          500: "#3A2DB8", 600: "#10069F", 700: "#0D0580", 800: "#08035A", 900: "#0A0440",
        },
        primary: "#10069F",
        "light-bg": "#F4F4F7",
        "light-border": "#E5E7EB",
        "light-text": "#1A1A1A",
        "light-muted": "#6B7280",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        gold: "#D4AF37",
        secondary: "#F4F4F7",
      },
      // Radius 8-10px em toda a app: 2xl/3xl deixam de existir como "bolha"
      borderRadius: {
        DEFAULT: "8px", md: "8px", lg: "8px", xl: "10px", "2xl": "10px", "3xl": "10px",
      },
      // Sombras neutras, sem cor
      boxShadow: {
        sm: "0 1px 2px rgba(15,17,26,0.06)",
        DEFAULT: "0 1px 3px rgba(15,17,26,0.08)",
        md: "0 2px 8px rgba(15,17,26,0.07)",
        lg: "0 8px 24px rgba(15,17,26,0.09)",
        xl: "0 12px 32px rgba(15,17,26,0.10)",
        "2xl": "0 16px 40px rgba(15,17,26,0.12)",
      },
      keyframes: {
        "nv-slide": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(300%)" } },
      },
      animation: { "nv-slide": "nv-slide 1.1s ease-in-out infinite" },
    },
  },
  plugins: [],
};

export default config;
