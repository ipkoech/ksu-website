import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        heri: { ink: "#082c2b", teal: "#006b62", lime: "#c7d900", cream: "#f6f4e8", blue: "#274881", green: "#47ad48" },
      },
    },
  },
  plugins: [],
};

export default config;
