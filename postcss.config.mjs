/**
 * Tailwind CSS v4 is a PostCSS plugin (`@tailwindcss/postcss`).
 *
 * Without this file Tailwind never runs: `@import "tailwindcss"` is left
 * unresolved and every utility class in the app (`bg-paper`, `text-ink`,
 * `grid`, …) is silently dropped from the build — the page still renders, but
 * completely unstyled. This config is what makes the design system real.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
