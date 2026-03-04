/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canon: "#d97706",
        "audiobook-derived": "#0d9488",
        "fan-extended": "#64748b",
        "ai-extended": "#8b5cf6",
        rocky: {
          bg: "#0f172a",
          surface: "#1e293b",
          border: "#334155",
          warm: "#f59e0b",
          text: "#e2e8f0",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
