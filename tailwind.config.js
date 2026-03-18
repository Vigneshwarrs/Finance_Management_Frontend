/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },

      colors: {
        // ✅ YOUR EXISTING COLORS (unchanged)
        primary: {
          DEFAULT: "#2563eb",
          light: "#3b82f6",
          dark: "#1e40af",
        },
        accent: {
          DEFAULT: "#f59e42",
        },
        background: "#f8fafc",
        surface: "#ffffff",
        error: "#ef4444",
        success: "#22c55e",
        warning: "#facc15",

        // ✅ ADD THESE (required for shadcn + your CSS variables)
        foreground: "oklch(var(--foreground))",

        card: "oklch(var(--card))",
        "card-foreground": "oklch(var(--card-foreground))",

        popover: "oklch(var(--popover))",
        "popover-foreground": "oklch(var(--popover-foreground))",

        secondary: "oklch(var(--secondary))",
        "secondary-foreground": "oklch(var(--secondary-foreground))",

        muted: "oklch(var(--muted))",
        "muted-foreground": "oklch(var(--muted-foreground))",

        destructive: "oklch(var(--destructive))",

        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};