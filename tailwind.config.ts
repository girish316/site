/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
      },

      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },

        accent: {
          violet: "#7c3aed",
          cyan: "#06b6d4",
          amber: "#f59e0b",
          green: "#10b981",
          rose: "#f43f5e",
        },

        surface: {
          0: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
        },
      },

      animation: {
        "pulse-dot": "pulseDot 1.5s ease-in-out infinite",
      },

      keyframes: {
        pulseDot: {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: ".5",
            transform: "scale(1.4)",
          },
        },
      },

      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#1e293b",

            "h1,h2,h3,h4": {
              color: "#0f172a",
            },

            a: {
              color: "#0ea5e9",
            },

            code: {
              backgroundColor: "#f1f5f9",
              borderRadius: "4px",
              padding: "2px 6px",
            },
          },
        },
      },
    },
  },

  plugins: [require("@tailwindcss/typography")],
};