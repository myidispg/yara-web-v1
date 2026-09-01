/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
    "./src/context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FDFBF7",
        cream: "#F5EFE6",
        charcoal: "#1A2536",
        ink: "#1A2536",
        line: "rgba(229, 189, 176, 0.3)",
        blush: "#E5BDB0",
        gold: { DEFAULT: "#D4AF37", dark: "#C5A059" },
        navy: { DEFAULT: "#1A2536", darker: "#111A29" },
        rose: { DEFAULT: "#E5BDB0", accent: "#D88C7D" },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        cursive: ["'Alex Brush'", "cursive"],
      },
      boxShadow: {
        card: "0 20px 45px rgba(26, 37, 54, 0.08)",
        hero: "0 30px 60px rgba(17, 26, 41, 0.4)",
      },
    },
  },
  plugins: [],
};