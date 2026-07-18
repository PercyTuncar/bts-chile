"use client";

// PillButton — botón pill primario/secundario/ghost con lift + scale (PRD §3.2.E/G).
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export type PillButtonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--brand)_35%,transparent)] hover:bg-brand-strong",
  secondary: "glass text-text hover:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)]",
  ghost: "bg-transparent text-brand hover:bg-brand-soft",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

export function PillButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  children,
  ...rest
}: PillButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-button font-semibold",
        "min-h-[44px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export default PillButton;
