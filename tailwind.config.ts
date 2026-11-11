import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Outfit", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        background: "var(--color-background)",
        "background-secondary": "var(--color-background-secondary)",
        "secondary-bg": "var(--color-background-secondary)",
        foreground: "var(--color-primary-text)",
        surface: {
          DEFAULT: "var(--color-card-bg)",
          secondary: "var(--color-background-secondary)",
          elevated: "var(--color-card-elevated)",
        },
        card: {
          DEFAULT: "var(--color-card-bg)",
          foreground: "var(--color-primary-text)",
          elevated: "var(--color-card-elevated)",
        },
        "hover-surface": "var(--color-hover-surface)",
        elevated: "var(--color-card-elevated)",
        input: {
          DEFAULT: "var(--color-input-bg)",
          border: "var(--color-border)",
          focus: "var(--color-primary)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "#FFFFFF",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          soft: "var(--color-primary-subtle)",
          subtle: "var(--color-primary-subtle)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary-accent)",
          foreground: "#FFFFFF",
          hover: "var(--color-secondary-hover)",
          active: "var(--color-secondary-active)",
          soft: "var(--color-secondary-subtle)",
          subtle: "var(--color-secondary-subtle)",
        },
        accent: {
          DEFAULT: "var(--color-secondary-accent)",
          foreground: "#FFFFFF",
          hover: "var(--color-secondary-hover)",
          soft: "var(--color-secondary-subtle)",
          subtle: "var(--color-secondary-subtle)",
        },
        "text-primary": "var(--color-primary-text)",
        "text-secondary": "var(--color-secondary-text)",
        "text-muted": "var(--color-text-muted)",
        "text-disabled": "var(--color-text-disabled)",
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
          strong: "var(--color-border-strong)",
        },
        "input-border": "var(--input-border)",
        ring: "var(--color-primary-ring)",
        success: {
          DEFAULT: "var(--color-success)",
          soft: "var(--color-success-subtle)",
          subtle: "var(--color-success-subtle)",
          border: "var(--color-success-border)",
          text: "var(--color-success-text)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          soft: "var(--color-warning-subtle)",
          subtle: "var(--color-warning-subtle)",
          border: "var(--color-warning-border)",
          text: "var(--color-warning-text)",
        },
        error: {
          DEFAULT: "var(--color-danger)",
          soft: "var(--color-danger-subtle)",
          subtle: "var(--color-danger-subtle)",
          border: "var(--color-danger-border)",
          text: "var(--color-danger-text)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          soft: "var(--color-danger-subtle)",
          subtle: "var(--color-danger-subtle)",
          border: "var(--color-danger-border)",
          text: "var(--color-danger-text)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          soft: "var(--color-info-subtle)",
          subtle: "var(--color-info-subtle)",
          border: "var(--color-info-border)",
          text: "var(--color-info-text)",
        },
      },
      backgroundImage: {
        "primary-gradient": "var(--gradient-primary)",
        "accent-gradient": "var(--gradient-accent)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
