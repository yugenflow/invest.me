import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          lime: "#D4F358",
          "lime-hover": "#C2E04A",
          black: "#0F172A",
        },
        gain: "#4d7c0f",
        navy: {
          900: "#051019",
          800: "#0B1C2E",
          700: "#15283D",
        },
        surface: {
          light: "#F9FAFB",
          dark: "#0B1C2E",
          "dark-card": "#111827",
        },
        alert: {
          red: "#FF3B30",
        },
      },
      fontFamily: {
        heading: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        "3xl": "24px",
        "4xl": "32px",
      },
      width: {
        sidebar: "280px",
        "sidebar-collapsed": "64px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
