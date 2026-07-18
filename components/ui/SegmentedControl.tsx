"use client";

// SegmentedControl — selector iOS con pill deslizante (PRD §3.2.G).
// Usado para fecha / cantidad / cuotas / tallas.
import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils/cn";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className = "",
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const groupId = useId();
  const heightClass = size === "sm" ? "min-h-[40px]" : "min-h-[44px]";

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex gap-1 rounded-full p-1 glass",
        className,
      )}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center rounded-full px-4 text-sm font-medium",
              heightClass,
              "transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              selected ? "text-white" : "text-text-muted hover:text-text",
            )}
          >
            {selected && (
              <motion.span
                layoutId={`segmented-${groupId}`}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="absolute inset-0 -z-10 rounded-full bg-brand"
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
