"use client";

// Selector de talla/color estilo iOS — PRD §7.5.
import { cn } from "@/lib/utils/cn";

export function SizeSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; disabled?: boolean; swatch?: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
              value === opt.value
                ? "border-brand bg-brand-soft text-brand"
                : "border-[color-mix(in_srgb,var(--text)_15%,transparent)] hover:border-brand",
              opt.disabled && "cursor-not-allowed opacity-40",
            )}
          >
            {opt.swatch && (
              <span className="h-4 w-4 rounded-full border" style={{ background: opt.swatch }} aria-hidden />
            )}
            {opt.value}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SizeSelector;
