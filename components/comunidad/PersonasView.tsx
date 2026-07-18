"use client";

// Buscador de personas — ver perfiles, seguir/ser seguido. PRD (red social, Etapa 1).
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FollowButton } from "@/components/comunidad/FollowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { listUsers } from "@/lib/firestore/users";
import type { User, WithId } from "@/types";

export function PersonasView() {
  const { status } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [users, setUsers] = useState<WithId<User>[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    listUsers(100)
      .then((u) => {
        if (active) {
          setUsers(u);
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [status]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = users.filter((u) => u.username); // solo con username reclamado
    if (!needle) return list;
    return list.filter(
      (u) =>
        u.username?.toLowerCase().includes(needle) ||
        u.nickname?.toLowerCase().includes(needle),
    );
  }, [users, q]);

  if (status !== "authenticated") {
    return (
      <GlassCard className="mx-auto max-w-md text-center">
        <p className="mb-4 text-text-muted">Inicia sesión para buscar y seguir a otras ARMY 💜</p>
        <PillButton onClick={openLogin}>Entrar</PillButton>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por @usuario o apodo…"
          aria-label="Buscar personas"
          className="h-12 w-full rounded-full border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface pl-12 pr-4"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" rounded="rounded-card" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="text-text-muted">No se encontraron personas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {results.map((u) => {
            const avatar = u.customPhotoURL || u.photoURL || null;
            return (
              <GlassCard key={u.id} className="flex items-center gap-3">
                <Link
                  href={`/perfil/${u.username}`}
                  className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-brand"
                >
                  {avatar ? (
                    <Image src={avatar} alt={u.nickname} fill sizes="48px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-brand-soft">💜</span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/perfil/${u.username}`} className="block truncate font-semibold hover:text-brand">
                    {u.nickname}
                  </Link>
                  <p className="truncate text-sm text-brand">@{u.username}</p>
                </div>
                <FollowButton targetUid={u.uid} targetUsername={u.username} />
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PersonasView;
