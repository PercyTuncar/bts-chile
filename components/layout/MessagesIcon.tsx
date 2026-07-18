"use client";

// Icono de mensajes con badge de no leídos — Etapa 3.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
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

  return (
    <Link
      href="/mensajes"
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
    </Link>
  );
}

export default MessagesIcon;
