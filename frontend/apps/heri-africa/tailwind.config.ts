import type { Config } from "tailwindcss";

/* HERI Africa is a deliberately separate brand (own palette, Outfit face)
   and does not import @ksu/ui/globals.css, so it cannot use the shared
   @ksu/ui/tailwind-preset: the preset's fontSize/boxShadow/color scales
   reference CSS variables defined only in that stylesheet. If HERI ever
   adopts the shared tokens, switch this config to the preset. */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        heri: { ink: "#082c2b", teal: "#006b62", lime: "#c7d900", cream: "#f6f4e8", blue: "#274881", green: "#47ad48" },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
