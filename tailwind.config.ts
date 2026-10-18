import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Colors resolve to CSS variables in globals.css so light and dark
// themes switch automatically with prefers-color-scheme.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "media",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: {
          DEFAULT: token("surface"),
          raised: token("surface-raised"),
        },
        line: token("line"),
        ink: {
          DEFAULT: token("ink"),
          muted: token("ink-muted"),
        },
        accent: {
          DEFAULT: token("accent"),
          ink: token("accent-ink"),
        },
        danger: token("danger"),
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        panel: "1rem",
        field: "0.75rem",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
