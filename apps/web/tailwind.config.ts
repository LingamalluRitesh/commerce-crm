import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        brand: {
          dark: "#0b0f19",
          card: "#111827",
          cardHover: "#1f2937",
          border: "#1e293b",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "glow": {
          "0%, 100%": { opacity: "0.4", filter: "blur(8px)" },
          "50%": { opacity: "0.8", filter: "blur(12px)" },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "glow": "glow 2.5s ease-in-out infinite",
      },
      boxShadow: {
        "glow-primary": "0 0 20px -5px rgba(99, 102, 241, 0.5)",
        "glow-emerald": "0 0 20px -5px rgba(16, 185, 129, 0.5)",
        "glow-violet": "0 0 20px -5px rgba(139, 92, 246, 0.5)",
        "card-dark": "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "card-dark-hover": "0 10px 30px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(99, 102, 241, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
