module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        primary: { 500: "#2B628C" },
        secondary: { 500: "#E57C56" },
        accent: { 500: "#F7C873" },
      },
    },
  },
  plugins: [],
}
