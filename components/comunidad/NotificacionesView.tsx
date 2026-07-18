"use client";

// Lista de notificaciones en tiempo real + marcar como leídas — Etapa 2.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Bell, Heart, MessageSquare, ThumbsDown, UserPlus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { markAllNotificationsRead } from "@/lib/firestore/notifications";
import { formatRelative } from "@/lib/utils/formatters";
import type { NotificationType } from "@/types";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<NotificationType, typeof Bell> = {
  reaction: Heart,
  comment: MessageSquare,
  post_approved: Bell,
  post_rejected: ThumbsDown,
  follow: UserPlus,
};

export function NotificacionesView() {
  const { status } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const { items } = useNotifications();
  const marked = useRef(false);

  // Marca todo como leído al abrir (una vez).
  useEffect(() => {
    if (!marked.current && items.some((n) => !n.read)) {
      marked.current = true;
      markAllNotificationsRead(items);
    }
  }, [items]);

  if (status !== "authenticated") {
    return (
      <GlassCard className="mx-auto max-w-md text-center">
        <p className="mb-4 text-text-muted">Inicia sesión para ver tus notificaciones 💜</p>
        <PillButton onClick={openLogin}>Entrar</PillButton>
      </GlassCard>
    );
  }

  if (items.length === 0) {
    return (
      <GlassCard className="text-center text-text-muted">
        <Bell className="mx-auto mb-2 h-8 w-8 text-brand" aria-hidden />
        <p>No tienes notificaciones todavía.</p>
      </GlassCard>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((n) => {
        const Icon = ICONS[n.type] ?? Bell;
        const href = n.postId
          ? `/comunidad/${n.postId}`
          : n.actorUsername
            ? `/perfil/${n.actorUsername}`
            : "#";
        const created = n.createdAt?.toDate ? n.createdAt.toDate() : new Date();
        const showsActor = n.type === "reaction" || n.type === "comment" || n.type === "follow";
        return (
          <li key={n.id}>
            <Link href={href}>
              <GlassCard
                hover
                className={cn(
                  "flex items-center gap-3",
                  !n.read && "ring-1 ring-brand",
                )}
              >
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft">
                  {showsActor && n.actorPhotoURL ? (
                    <Image src={n.actorPhotoURL} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <Icon className="h-5 w-5 text-brand" aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    {showsActor && n.actorNickname && (
                      <span className="font-semibold">{n.actorNickname} </span>
                    )}
                    {n.message}
                  </p>
                  <p className="text-xs text-text-muted">{formatRelative(created)}</p>
                </div>
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="No leída" />}
              </GlassCard>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default NotificacionesView;
