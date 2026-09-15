import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { ink: "#09111f", paper: "#f5f6f3", teal: "#62e6c2", lavender: "#aa9cff" },
      fontFamily: { sans: ["ui-sans-serif", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Arial", "sans-serif"], mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"] },
      boxShadow: { glow: "0 0 70px rgba(98,230,194,.14)" }
    }
  },
  plugins: []
};
export default config;
