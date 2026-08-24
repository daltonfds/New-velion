/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
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

        meta: ["11px", { lineHeight: "1.45", fontWeight: "500" }],
        "desktop-meta": ["12px", { lineHeight: "1.45", fontWeight: "500" }],
      },

      colors: {
        primary: "#4F46E5",
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
    },
  },
  plugins: [],
};

export default config;
