/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1c15",
        pine: "#173227",
        moss: "#2e5a44",
        ivory: "#f7f3e9",
        parchment: "#ece3cf",
        champagne: "#f0e4c9",
        rust: "#a24b2a",
        gold: { DEFAULT: "#c19a4b", deep: "#96712c", light: "#e3cd9b", pale: "#f5eedd" },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Jost"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxe: "0 24px 60px -24px rgba(15,28,21,.35)",
        card: "0 10px 30px -12px rgba(15,28,21,.18)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        breathe: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.045)" } },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        breathe: "breathe 16s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};