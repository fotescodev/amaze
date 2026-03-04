/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canon: "#f59e0b",
        "audiobook-derived": "#14b8a6",
        "fan-extended": "#94a3b8",
        "ai-extended": "#a78bfa",
        rocky: {
          bg: "#0a0e1a",
          surface: "#111827",
          elevated: "#1a2235",
          inset: "#060a12",
          border: "rgba(55, 65, 81, 0.50)",
          "border-subtle": "rgba(55, 65, 81, 0.30)",
          warm: "#f59e0b",
          "warm-hover": "#fbbf24",
          "warm-glow": "rgba(245, 158, 11, 0.15)",
          text: "#e2e8f0",
          muted: "#94a3b8",
          dim: "#64748b",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"SF Mono"', '"Cascadia Code"', "monospace"],
      },
      animation: {
        "gentle-pulse": "gentle-pulse 4s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        "gentle-pulse": {
          "0%, 100%": {
            opacity: "0.7",
            textShadow: "0 0 20px rgba(245, 158, 11, 0.20)",
          },
          "50%": {
            opacity: "1",
            textShadow: "0 0 30px rgba(245, 158, 11, 0.40)",
          },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
