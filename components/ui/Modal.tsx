"use client";

// Modal — glass centrado; en móvil admite variante bottom-sheet o centrada (PRD §3.2.G, §4.1).
// Cierre por backdrop y Esc, focus trap, animación spring. z-[60] para quedar sobre el BottomNav.
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
  align = "bottom",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  /** "bottom": sheet abajo en móvil / centrado en desktop. "center": centrado siempre. */
  align?: "bottom" | "center";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, onClose);

  const centered = align === "center";

  return (
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-[60] flex justify-center",
            centered ? "items-center p-4" : "items-end sm:items-center sm:p-4",
          )}
        >
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
            initial={{ opacity: 0, y: centered ? 24 : 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: centered ? 24 : 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className={cn(
              "glass-modal relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-y-auto p-6",
              centered ? "rounded-sheet" : "rounded-t-sheet sm:rounded-sheet",
              className,
            )}
          >
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

export default Modal;
