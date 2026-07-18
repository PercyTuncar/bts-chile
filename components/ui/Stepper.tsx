// Stepper — indicador de pasos iOS (checkout /entradas/comprar, onboarding) (PRD §3.2.G, §6.2).
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Stepper({
  steps,
  current,
  className = "",
}: {
  steps: string[];
  current: number; // índice 0-based del paso activo
  className?: string;
}) {
  return (
    <ol
      className={cn("flex w-full items-center gap-2", className)}
      aria-label="Progreso"
    >
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  done && "bg-brand text-white",
                  active && "bg-brand text-white ring-4 ring-brand-soft",
                  !done && !active && "bg-[color-mix(in_srgb,var(--text)_10%,transparent)] text-text-muted",
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-text" : "text-text-muted",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1 transition-colors",
                  done ? "bg-brand" : "bg-[color-mix(in_srgb,var(--text)_12%,transparent)]",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default Stepper;
