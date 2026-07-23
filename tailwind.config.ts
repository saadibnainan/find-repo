import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        concrete: "#0d0d0d",
        slab: "#161616",
        bone: "#f2f2f2",
        acid: "#aaff00",
        alarm: "#ff2222",
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Black", "sans-serif"],
        mono: ["var(--font-mono)", "Courier New", "monospace"],
      },
      boxShadow: {
        brutal: "8px 8px 0 0 #aaff00",
        "brutal-white": "8px 8px 0 0 #f2f2f2",
        "brutal-sm": "4px 4px 0 0 #aaff00",
        "brutal-alarm": "8px 8px 0 0 #ff2222",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        scan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100vh" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        scan: "scan 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
