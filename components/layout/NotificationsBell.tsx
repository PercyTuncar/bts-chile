"use client";

// Icono de notificaciones con badge de no leídas — Etapa 2.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils/cn";

export function NotificationsBell() {
  const pathname = usePathname();
  const { status } = useAuth();
  const { unread } = useNotifications();
  const active = pathname === "/notificaciones";

  return (
    <Link
      href="/notificaciones"
      aria-label={`Notificaciones${unread > 0 ? ` (${unread} sin leer)` : ""}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full glass transition-transform hover:scale-105",
        active ? "text-brand" : "hover:text-brand",
      )}
    >
      <Bell className="h-5 w-5" aria-hidden />
      {status === "authenticated" && unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}

export default NotificationsBell;
