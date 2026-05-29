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
          // Core brand
          blue:           "#2563EB",
          "blue-hover":   "#1D4ED8",
          "blue-light":   "#EFF6FF",
          "blue-mid":     "#BFDBFE",

          // Accent
          mint:        "#10B981",   // success / positive
          "mint-light":"#D1FAE5",

          amber:       "#F59E0B",   // warning / star
          "amber-light":"#FEF3C7",

          red:         "#EF4444",
          "red-light": "#FEE2E2",

          // Neutrals — full scale
          charcoal:    "#0F172A",   // headings
          "gray-900":  "#111827",
          "gray-800":  "#1F2937",
          "gray-700":  "#374151",
          "gray-600":  "#4B5563",
          "gray-500":  "#6B7280",
          "gray-400":  "#9CA3AF",
          "gray-300":  "#D1D5DB",
          "gray-200":  "#E5E7EB",
          "gray-100":  "#F3F4F6",
          "gray-50":   "#F9FAFB",

          // Surfaces
          soft:        "#F8FAFF",   // page bg
          surface:     "#FFFFFF",   // card bg
          "surface-2": "#F1F5F9",   // secondary surface

          // Ecosystem / product colors
          navy:        "#0F172A",   // sidebar / dark nav
          "navy-800":  "#1E293B",
          "navy-700":  "#334155",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      boxShadow: {
        "xs":    "0 1px 2px rgba(0,0,0,0.05)",
        "sm":    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "md":    "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)",
        "soft":  "0 8px 24px rgba(0,0,0,0.06)",
        "card":  "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "brand": "0 8px 24px rgba(37,99,235,0.28)",
        "brand-sm": "0 4px 12px rgba(37,99,235,0.22)",
        "up":    "0 -4px 16px rgba(0,0,0,0.06)",
        "inner-sm": "inset 0 1px 2px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        "2xs": "4px",
        "xs":  "6px",
        "sm":  "8px",
        "md":  "10px",
        "lg":  "12px",
        "xl":  "16px",
        "2xl": "20px",
        "3xl": "24px",
        "4xl": "32px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      animation: {
        "fade-in":       "fadeIn 0.2s ease-out",
        "slide-up":      "slideUp 0.25s ease-out",
        "slide-down":    "slideDown 0.25s ease-out",
        "slide-right":   "slideRight 0.25s ease-out",
        "scale-in":      "scaleIn 0.15s ease-out",
        "pulse-slow":    "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":     "spin 3s linear infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:       { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:      { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideDown:    { from: { opacity: "0", transform: "translateY(-8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideRight:   { from: { opacity: "0", transform: "translateX(16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn:      { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        bounceSubtle: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
      },
      backgroundImage: {
        "gradient-brand":   "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        "gradient-hero":    "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 50%, #F8FAFF 100%)",
        "gradient-dark":    "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        "gradient-surface": "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)",
        "dot-pattern":      "radial-gradient(circle, #2563EB18 1px, transparent 1px)",
        "grid-pattern":     "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-sm":  "20px 20px",
        "dot-md":  "32px 32px",
        "grid-sm": "40px 40px",
        "grid-md": "80px 80px",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
}
