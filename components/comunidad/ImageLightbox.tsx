"use client";

// Visor de imagen a pantalla completa con descarga — §8.1.
// La descarga solo funciona con sesión iniciada; sin sesión, abre el login.
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";

export function ImageLightbox({
  src,
  onClose,
}: {
  src: string | null;
  onClose: () => void;
}) {
  const { firebaseUser } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [downloading, setDownloading] = useState(false);
  // Guarda qué src ya cargó → el skeleton se resetea solo al cambiar de imagen.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = !!src && loadedSrc === src;

  async function download() {
    if (!src) return;
    if (!firebaseUser) {
      onClose();
      openLogin();
      return;
    }
    setDownloading(true);
    try {
      // fetch → blob fuerza la descarga (Storage es cross-origin).
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = src.split("/").pop()?.split("?")[0] || "imagen-btschile.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toastSuccess("Descargando imagen 💜");
    } catch (err) {
      console.error(err);
      // Fallback si el navegador bloquea el fetch cross-origin: abre la imagen para guardarla.
      window.open(src, "_blank", "noopener,noreferrer");
      toastError("Abre la imagen y guárdala manualmente si la descarga no inició.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AnimatePresence>
      {src && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Imagen"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="relative z-10 flex max-h-[90vh] max-w-[92vw] flex-col items-center gap-3"
          >
            <span className="relative flex items-center justify-center">
              {!loaded && (
                <Skeleton className="h-[60vh] w-[80vw] max-w-3xl" rounded="rounded-2xl" />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Imagen del álbum"
                onLoad={() => setLoadedSrc(src)}
                className={`max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl transition-opacity duration-500 ${
                  loaded ? "opacity-100" : "absolute opacity-0"
                }`}
              />
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={download}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-white/90 disabled:opacity-60"
              >
                <Download className="h-4 w-4" aria-hidden />
                {downloading ? "Descargando…" : firebaseUser ? "Descargar" : "Entra para descargar"}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ImageLightbox;
