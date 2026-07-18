// Badge — insignias de membresía y estado (PRD §3.2.G, §10.2).
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone =
  | "brand"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "accent";

const toneClasses: Record<BadgeTone, string> = {
  brand: "bg-brand-soft text-brand border border-[color-mix(in_srgb,var(--brand)_25%,transparent)]",
  neutral: "bg-[color-mix(in_srgb,var(--text)_8%,transparent)] text-text-muted",
  success: "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-success",
  warning: "bg-[color-mix(in_srgb,var(--warning)_15%,transparent)] text-warning",
  danger: "bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-danger",
  accent:
    "bg-[color-mix(in_srgb,var(--accent)_25%,transparent)] text-text border border-[color-mix(in_srgb,var(--accent)_40%,transparent)]",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Mapea el tier de membresía a su Badge (PRD §10.2).
 * VIP usa acento champagne; Premium morado; Basic morado suave.
 */
export function MembershipBadge({
  type,
  isTrial = false,
}: {
  type: "free" | "basic" | "premium" | "vip";
  isTrial?: boolean;
}) {
  const label =
    type === "vip"
      ? "💜 BOOM v4"
      : type === "premium"
        ? "PREMIUM"
        : type === "basic"
          ? "BASIC"
          : "FREE";
  const tone: BadgeTone =
    type === "vip" ? "accent" : type === "free" ? "neutral" : "brand";

  return (
    <Badge tone={tone}>
      {label}
      {isTrial && type !== "free" ? " · Prueba" : ""}
    </Badge>
  );
}

/** Insignia de administrador/moderador de la comunidad (§8.3, §11.1). */
export function AdminBadge({ className = "" }: { className?: string }) {
  return (
    <Badge
      tone="brand"
      className={cn("border border-[color-mix(in_srgb,var(--brand)_35%,transparent)] font-semibold", className)}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
      Admin
    </Badge>
  );
}

export default Badge;
