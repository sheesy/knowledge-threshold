/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink:   { DEFAULT: "#0D0F14", 50: "#F2F3F5", 100: "#E0E3E8", 200: "#B8BDC8", 400: "#6B7280", 700: "#1E2533", 900: "#0D0F14" },
        jade:  { DEFAULT: "#00C896", 50: "#E6FBF5", 100: "#CCFAEB", 400: "#00C896", 600: "#009E78", 900: "#004D3A" },
        amber: { DEFAULT: "#F5A623", 50: "#FEF8EC", 400: "#F5A623", 600: "#D4891A" },
        rose:  { DEFAULT: "#F04438", 50: "#FEF3F2", 400: "#F04438" },
      },
      animation: {
        "fade-up":    "fadeUp 0.4s ease forwards",
        "fade-in":    "fadeIn 0.3s ease forwards",
        "slide-in":   "slideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "spin-slow":  "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: "translateX(-20px)" }, to: { opacity: 1, transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};
