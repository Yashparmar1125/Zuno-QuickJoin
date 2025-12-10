/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zuno: {
          blue: "#2d81c9",
          blueStrong: "#2465a0",
          mint: "#4EF2C9",
          charcoal: "#1A202C",
          soft: "#F8FAFF",
          navy: "#0A1A33",
          amber: "#FFB84D",
        },
      },
      fontFamily: {
        sans: ["Inter", "Open Sans", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        "soft": "0 10px 30px rgba(0,0,0,0.08)",
        "brand": "0 14px 30px rgba(39,107,250,0.25)",
      },
      borderRadius: {
        "xl": "16px",
      },
    },
  },
  plugins: [],
}

