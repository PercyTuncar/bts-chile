"use client";

// Icono de mensajes con badge de no leídos — Etapa 3.
// Para usuarios no logueados, muestra un badge "+1" llamativo que desaparece al hacer clic.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useArmyChatNotifications } from "@/hooks/useArmyChatNotifications";
import { useConversations } from "@/hooks/useConversations";
import { cn } from "@/lib/utils/cn";

const GUEST_BADGE_KEY = "btschile:guest-messages-badge-dismissed";

export function MessagesIcon() {
  const pathname = usePathname();
  const { status } = useAuth();
  const { totalUnread: dmUnread } = useConversations();
  const { unread: chatUnread } = useArmyChatNotifications(); // 0 si el chat está silenciado
  const totalUnread = dmUnread + chatUnread;
  const active = pathname.startsWith("/mensajes");

  // Badge para invitados: muestra "+1" hasta que hagan clic, persiste en localStorage
  const [showGuestBadge, setShowGuestBadge] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      const dismissed = localStorage.getItem(GUEST_BADGE_KEY);
      setShowGuestBadge(!dismissed);
    } else {
      setShowGuestBadge(false);
    }
  }, [status]);

  function handleClick() {
    if (status === "unauthenticated" && showGuestBadge) {
      localStorage.setItem(GUEST_BADGE_KEY, "true");
      setShowGuestBadge(false);
    }
  }

  return (
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
      {status === "unauthenticated" && showGuestBadge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]">
          +1
        </span>
      )}
    </Link>
  );
}

export default MessagesIcon;
