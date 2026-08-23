import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["22px", { lineHeight: "1.2", fontWeight: "700" }],
        "h1-desktop": ["26px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["18px", { lineHeight: "1.3", fontWeight: "600" }],
        "h2-desktop": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "1.3", fontWeight: "600" }],
        "h3-desktop": ["17px", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["13px", { lineHeight: "1.5" }],
        "body-desktop": ["14px", { lineHeight: "1.5" }],
        label: ["11px", { lineHeight: "1.4" }],
        "label-desktop": ["12px", { lineHeight: "1.4" }],
      },
      colors: {
        primary: "#4F46E5",
        bgmuted: "#F4F4F7",
        cardborder: "#E5E7EB",
        textmain: "#1A1A1A",
        textmuted: "#6B7280",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        gold: "#D4AF37",
      },
    },
  },
  plugins: [],
};
export default config;
