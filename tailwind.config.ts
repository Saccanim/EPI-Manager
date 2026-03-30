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
        bg: {
          base: "#0d1117",
          surface: "#161b22",
          elevated: "#1c2230",
          overlay: "#212836",
        },
        border: {
          DEFAULT: "#2a3142",
          muted: "#1e2535",
          strong: "#3d4b63",
        },
        primary: {
          DEFAULT: "#0ea5e9",
          hover: "#0284c7",
          muted: "#0ea5e920",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#22c55e",
          muted: "#22c55e20",
          foreground: "#dcfce7",
        },
        warning: {
          DEFAULT: "#f59e0b",
          muted: "#f59e0b20",
          foreground: "#fef3c7",
        },
        danger: {
          DEFAULT: "#ef4444",
          muted: "#ef444420",
          foreground: "#fee2e2",
        },
        text: {
          primary: "#e2e8f0",
          secondary: "#94a3b8",
          muted: "#475569",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
