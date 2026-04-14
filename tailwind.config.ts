import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/tools/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D3D5E",    // Deep navy
        accent:  "#e94d71",    // Rose pink — CTA / active state
        sky:     "#b6dcef",    // Light sky blue
        "sky-soft": "#cbe0eb", // Softer sky — borders / dividers
        surface: "#f2f5fd",    // Near-white page background
        steel:   "#7B9098",    // Muted slate — secondary text
        gold:    "#9D8C56",    // Warm gold — featured marker
      },
      fontFamily: {
        // フォールバックは globals.css の --font-noto-sans-jp 変数で管理
        sans: ["var(--font-noto-sans-jp)"],
      },
    },
  },
  plugins: [],
};

export default config;
