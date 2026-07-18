"use client";

// Vista de /comunidad: header con gate de publicación + feed + sidebar — PRD §8.1.
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreatePostSheet } from "@/components/comunidad/CreatePostSheet";
import { PostFeed } from "@/components/comunidad/PostFeed";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { useAuth, useAuthStore } from "@/hooks/useAuth";

export function ComunidadView({
  memberCount,
  weeklyPosts,
}: {
  memberCount: number | null;
  weeklyPosts: number | null;
}) {
  const { isAuthenticated, canPublish } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            {memberCount !== null && <>{memberCount.toLocaleString("es-CL")} miembros ARMY · </>}
            {weeklyPosts !== null && <>{weeklyPosts} posts esta semana</>}
          </p>
          {canPublish ? (
            <PillButton onClick={() => setComposerOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Publicar
            </PillButton>
          ) : isAuthenticated ? (
            <Link href="/membresia">
              <PillButton variant="secondary">Hazte miembro para publicar</PillButton>
            </Link>
          ) : (
            <PillButton variant="secondary" onClick={openLogin}>
              Entrar para participar
            </PillButton>
          )}
        </div>

        <PostFeed />
      </div>

      {/* Sidebar */}
      <aside className="hidden flex-col gap-4 lg:flex">
        <GlassCard className="aurora">
          <h2 className="text-h3 font-semibold">Membresía ARMY Boom v4</h2>
          <p className="mt-1 text-sm text-text-muted">
            1 mes gratis para publicar. Luego desde $1 USD/mes.
          </p>
          <Link href="/membresia" className="mt-3 inline-block">
            <PillButton size="sm">Ver planes 💜</PillButton>
          </Link>
        </GlassCard>

        <GlassCard>
          <h2 className="text-h3 font-semibold">Personas ARMY</h2>
          <p className="mt-1 text-sm text-text-muted">
            Busca a otras ARMY y síguelas para ver sus publicaciones.
          </p>
          <Link href="/comunidad/personas" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
            Buscar personas →
          </Link>
        </GlassCard>

        <GlassCard>
          <h2 className="text-h3 font-semibold">Grupos de WhatsApp</h2>
          <p className="mt-1 text-sm text-text-muted">
            Únete a los grupos oficiales verificados por región.
          </p>
          <Link href="/comunidad/grupos" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
            Ver grupos →
          </Link>
        </GlassCard>

        <GlassCard>
          <h2 className="text-h3 font-semibold">Próximo evento</h2>
          <p className="mt-1 text-sm text-text-muted">
            BTS WORLD TOUR ARIRANG · Estadio Nacional · 16-17 oct 2026.
          </p>
          <Link href="/entradas" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
            Ver entradas →
          </Link>
        </GlassCard>

        <GlassCard>
          <h2 className="text-h3 font-semibold">Newsletter ARMY</h2>
          <p className="mt-1 mb-3 text-sm text-text-muted">
            Recibe lo mejor de la comunidad en tu correo 💜
          </p>
          <NewsletterForm source="comunidad" />
        </GlassCard>
      </aside>

      {canPublish && (
        <CreatePostSheet open={composerOpen} onClose={() => setComposerOpen(false)} />
      )}
    </div>
  );
}

export default ComunidadView;
