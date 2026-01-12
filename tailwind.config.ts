import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'SF Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Custom dark theme colors
        background: '#08090c',
        surface: {
          DEFAULT: '#0e0f14',
          elevated: '#12131a',
          hover: '#1a1b23',
        },
        border: {
          DEFAULT: '#1e1f25',
          hover: '#2a2b35',
          active: '#3f4049',
        }
      },
    },
  },
  plugins: [],
};

export default config;