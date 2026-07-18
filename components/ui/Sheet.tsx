"use client";

// Sheet — bottom sheet glass (composer/pickers en móvil) (PRD §3.2.G, §4.3, §8.4).
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils/cn";

export function Sheet({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className={cn(
              "glass-sheet relative z-10 max-h-[85vh] w-full overflow-y-auto p-6",
              "rounded-t-sheet sm:max-w-lg sm:rounded-sheet",
              className,
            )}
          >
            {/* Grabber iOS */}
            <div
              aria-hidden
              className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[color-mix(in_srgb,var(--text)_18%,transparent)] sm:hidden"
            />
            <div className="mb-4 flex items-center justify-between">
              {title ? (
                <h2 className="text-h3 font-semibold">{title}</h2>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-brand-soft hover:text-brand"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Sheet;
