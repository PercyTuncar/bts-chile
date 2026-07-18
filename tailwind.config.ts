import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 — la configuración principal (tokens, tema, plugins) vive en
 * `styles/globals.css` con las directivas `@theme` / `@plugin` (CSS-first).
 * Este archivo se conserva para compatibilidad de tooling y para declarar
 * explícitamente la estrategia de dark mode por clase (PRD §3.2.A, §16).
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
};

export default config;
