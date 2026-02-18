/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#050814",
        foreground: "#E5F0FF",
        navy: {
          900: "#020617",
          800: "#02081F",
          700: "#020A2A"
        },
        charcoal: {
          900: "#050814",
          800: "#0B1020",
          700: "#111827"
        },
        accent: {
          green: "#22c55e",
          yellow: "#eab308",
          red: "#f97373"
        },
        card: "#0B1020",
        border: "#1f2933"
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem"
      },
      boxShadow: {
        "glow-green": "0 0 25px rgba(34,197,94,0.35)",
        "glow-yellow": "0 0 25px rgba(234,179,8,0.35)",
        "glow-red": "0 0 25px rgba(248,113,113,0.5)"
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)"
      },
      backgroundSize: {
        grid: "40px 40px"
      },
      fontFamily: {
        sans: ["system-ui", "SF Pro Text", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

