"use client";

// Toggle de tema claro/oscuro — PRD §3.2.A / §3.1.
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  // theme viene de useSyncExternalStore: seguro para hidratación (sin mismatch warning).
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full glass text-text transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}

export default ThemeToggle;
