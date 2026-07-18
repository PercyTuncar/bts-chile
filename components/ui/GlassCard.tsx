// GlassCard — superficie glass base del Design System (PRD §3.2.G).
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type GlassCardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  hover?: boolean;
  children?: ReactNode;
};

export function GlassCard({
  as: Tag = "div",
  hover = false,
  className = "",
  children,
  ...props
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        "glass-card rounded-card p-5",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.16)]",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default GlassCard;
