"use client";

// Icono de mensajes con badge de no leídos — Etapa 3.
// Para usuarios no logueados, muestra un badge "+1" llamativo que desaparece al hacer clic
// y reaparece al recargar la página (incentivo para registrarse).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useArmyChatNotifications } from "@/hooks/useArmyChatNotifications";
import { useConversations } from "@/hooks/useConversations";
import { cn } from "@/lib/utils/cn";

export function MessagesIcon() {
  const pathname = usePathname();
  const { status } = useAuth();
  const { totalUnread: dmUnread } = useConversations();
  const { unread: chatUnread } = useArmyChatNotifications(); // 0 si el chat está silenciado
  const totalUnread = dmUnread + chatUnread;
  const active = pathname.startsWith("/mensajes");

  // Badge para invitados: muestra "+1" hasta que hagan clic
  // Se resetea en cada recarga de página (no persiste en storage)
  const [dismissed, setDismissed] = useState(false); // Nueva variable para controlar si fue descartado
  const [showTooltip, setShowTooltip] = useState(false);

  // Determinar si se debe mostrar el badge
  const shouldShowBadge =
    (status === "unauthenticated" || status === "loading") &&
    !pathname.startsWith("/mensajes") &&
    !dismissed;

  useEffect(() => {
    // Mostrar tooltip por 3 segundos solo cuando el badge aparece por primera vez
    if (shouldShowBadge && status === "unauthenticated") {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowTooltip(false);
    }
  }, [shouldShowBadge, status]);

  function handleClick() {
    // Descartar el badge al hacer clic (persiste durante la navegación hasta recargar)
    if (shouldShowBadge) {
      setDismissed(true);
      setShowTooltip(false);
    }
  }

  return (
    <div className="relative">
      <Link
        href="/mensajes"
        onClick={handleClick}
        aria-label={`Mensajes${totalUnread > 0 ? ` (${totalUnread} sin leer)` : ""}`}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative inline-flex h-11 w-11 items-center justify-center rounded-full glass transition-transform hover:scale-105",
          active ? "text-brand" : "hover:text-brand",
        )}
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        {status === "authenticated" && totalUnread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
        {shouldShowBadge && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]">
            +1
          </span>
        )}
      </Link>

      {/* Tooltip temporal "+1 nuevo mensaje" */}
      {shouldShowBadge && showTooltip && (
        <div className="pointer-events-none absolute -bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 max-w-[calc(100vw-2rem)] text-center whitespace-normal sm:whitespace-nowrap">
          +1 nuevo mensaje
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-danger" />
        </div>
      )}
    </div>
  );
}

export default MessagesIcon;
