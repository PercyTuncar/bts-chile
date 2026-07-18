"use client";

// Botón flotante de WhatsApp — invita a unirse a los grupos por región (§4.4).
// Círculo perfecto en la esquina inferior IZQUIERDA (la derecha la usa el carrito),
// por encima del BottomNav móvil. Comportamiento: al aparecer pulsa 3 veces y a los
// 4s se oculta; al detectar scroll reaparece (pulsa otra vez) y se oculta 4s después.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const VISIBLE_MS = 4000;

function WhatsappGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-7 w-7 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function WhatsappFAB() {
  const [visible, setVisible] = useState(true);
  const [pulseKey, setPulseKey] = useState(0); // cambia para reiniciar el pulso
  const visibleRef = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function scheduleHide() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        visibleRef.current = false;
        setVisible(false);
      }, VISIBLE_MS);
    }

    // Aparición inicial: pulsa y se oculta a los 4s.
    scheduleHide();

    function onScroll() {
      if (!visibleRef.current) {
        // Reaparece → repite el pulso (3 veces).
        visibleRef.current = true;
        setVisible(true);
        setPulseKey((k) => k + 1);
      }
      scheduleHide();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <Link
      href="/comunidad/grupos"
      aria-label="Únete a los grupos de WhatsApp de ARMY Chile por región"
      className={cn(
        "group fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#128C7E]/40 ring-1 ring-black/5 transition-all duration-500 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:bottom-6 md:left-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      {/* Pulso detrás (3 veces, se reinicia con la key al reaparecer) */}
      <span
        key={pulseKey}
        aria-hidden
        className="fab-pulse pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#25D366]"
      />
      <WhatsappGlyph />

      {/* Etiqueta tipo tooltip a la derecha (desktop, al hover) — no deforma el círculo */}
      <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#25D366] px-3 py-1.5 text-sm font-semibold text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 md:block">
        Únete al grupo 💚
      </span>
    </Link>
  );
}

export default WhatsappFAB;
