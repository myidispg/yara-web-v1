/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FFFFFF",
        cream: "#F7F5F0",
        charcoal: "#141414",
        line: "#E7E4DE",
        gold: { DEFAULT: "#C6A15B", dark: "#A9853F" },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 40px rgba(20,20,20,0.08)",
      },
    },
  },
  plugins: [],
};