"use client";

// Bandeja de conversaciones — Etapa 3.
import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { formatRelative } from "@/lib/utils/formatters";

export function MensajesView() {
  const { status, firebaseUser } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const { items } = useConversations();

  if (status !== "authenticated" || !firebaseUser) {
    return (
      <GlassCard className="mx-auto max-w-md text-center">
        <p className="mb-4 text-text-muted">Inicia sesión para ver tus mensajes 💜</p>
        <PillButton onClick={openLogin}>Entrar</PillButton>
      </GlassCard>
    );
  }

  if (items.length === 0) {
    return (
      <GlassCard className="text-center text-text-muted">
        Aún no tienes conversaciones. Visita un perfil y toca <b>Mensaje</b> para empezar 💜
      </GlassCard>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((c) => {
        const otherUid = c.participants.find((p) => p !== firebaseUser.uid);
        const info = otherUid ? c.participantInfo?.[otherUid] : undefined;
        const unread = c.unread?.[firebaseUser.uid] ?? 0;
        const updated = c.updatedAt?.toDate ? c.updatedAt.toDate() : new Date();
        return (
          <li key={c.id}>
            <Link href={`/mensajes/${c.id}`}>
              <GlassCard hover className="flex items-center gap-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-brand">
                  {info?.photoURL ? (
                    <Image src={info.photoURL} alt={info.nickname} fill sizes="48px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-brand-soft">💜</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{info?.nickname ?? "ARMY"}</span>
                    <span className="shrink-0 text-xs text-text-muted">{formatRelative(updated)}</span>
                  </div>
                  <p className="truncate text-sm text-text-muted">
                    {c.lastSenderUid === firebaseUser.uid && "Tú: "}
                    {c.lastMessage || "Nueva conversación"}
                  </p>
                </div>
                {unread > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </GlassCard>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default MensajesView;
