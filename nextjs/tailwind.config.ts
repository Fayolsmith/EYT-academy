import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#D4A017",
          "gold-hover": "#A9790A",
          "gold-light": "#FDF7E7",
          "gold-muted": "#F3E7C4",
          blue: "#1E4E8C",
          "blue-dark": "#153763",
          "blue-tint": "#E8F0FA",
          "blue-subtle": "#F3F7FD",
          navy: "#14263F",
          warmgray: "#6B7280",
          cream: "#FCFBF7",
        },
        primary: {
          50: '#FDF8EC',
          100: '#FBF0D3',
          200: '#F6E0A6',
          300: '#F0CE78',
          400: '#E4B83C',
          500: '#D4A017',
          600: '#A9790A',
          700: '#875E06',
          800: '#674607',
          900: '#4D3409',
          DEFAULT: '#D4A017',
          foreground: '#FFFFFF',
        },
        secondary: {
          50: '#F3F7FD',
          100: '#E8F0FA',
          200: '#C7DAF3',
          300: '#94BAE7',
          400: '#548FD6',
          500: '#1E4E8C',
          600: '#153763',
          700: '#112D52',
          800: '#0E223D',
          900: '#14263F',
          DEFAULT: '#1E4E8C',
          foreground: '#FFFFFF',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        heading: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-karla)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-karla)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;