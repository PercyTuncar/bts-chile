// Skeleton — placeholder shimmer para listas (PRD §3.3, evita layout shift/CLS).
import { cn } from "@/lib/utils/cn";

export function Skeleton({
  className = "",
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "shimmer bg-[color-mix(in_srgb,var(--text)_8%,transparent)]",
        rounded,
        className,
      )}
    />
  );
}

export default Skeleton;
