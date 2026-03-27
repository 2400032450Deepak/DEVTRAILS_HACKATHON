/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#030712",
        card: "#0f1a31",
        soft: "#17253f",
        accent: "#2dd4bf",
        warn: "#f59e0b",
        danger: "#ef4444",
        safe: "#22c55e"
      },
      boxShadow: {
        glow: "0 0 24px rgba(45, 212, 191, 0.38)",
        cyan: "0 12px 40px rgba(34, 211, 238, 0.2)",
        deep: "0 26px 55px rgba(2, 10, 26, 0.6)"
      },
      animation: {
        pulseSlow: "pulse 2.4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite"
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-7px)" }
        },
        shimmer: {
          "100%": { transform: "translateX(140%)" }
        }
      }
    }
  },
  plugins: []
};
