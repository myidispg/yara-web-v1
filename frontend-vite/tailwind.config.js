/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F6F6F7",
        cream: "#ECECF0",
        charcoal: "#2E3A4C",
        ink: "#2E3A4C",
        line: "#E4E4E7",
        blush: "#F2A7B3",
        gold: { DEFAULT: "#C89B3C", dark: "#A87F2C" },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 45px rgba(46,58,76,0.12)",
        hero: "0 30px 60px rgba(0,0,0,0.28)",
      },
    },
  },
  plugins: [],
};