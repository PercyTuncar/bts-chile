"use client";

/**
 * Botón de compartir con menú desplegable.
 * Opciones: WhatsApp, Twitter/X, Copiar enlace
 */

import { Share2, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toastSuccess } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

interface ShareButtonProps {
  url: string;
  text: string;
}

export function ShareButton({ url, text }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toastSuccess("Enlace copiado al portapapeles");
      setOpen(false);
    } catch {
      toastSuccess("No se pudo copiar el enlace");
    }
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(whatsappUrl, "_blank");
    setOpen(false);
  };

  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand transition-colors"
        aria-label="Compartir"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-2 z-50 glass-modal rounded-2xl overflow-hidden shadow-xl min-w-[180px]">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-brand-soft transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleTwitter}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-brand-soft transition-colors"
          >
            <X className="h-5 w-5" />
            <span>Twitter/X</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-brand-soft transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            <span>Copiar enlace</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ShareButton;
