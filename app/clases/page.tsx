import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { SITE_URL } from "@/lib/utils/seo";

// Clases y Workshops — Fase 2 (§12, §13.13). Placeholder cableado, flag-off.
export const metadata: Metadata = {
  title: "Clases y Workshops ARMY",
  description: "Coreano, danza K-pop y covers. Clases para ARMY Chile — próximamente.",
  alternates: { canonical: `${SITE_URL}/clases` },
};

export default function ClasesPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <p className="text-5xl">🎓💜</p>
      <h1 className="mt-4 text-h1 font-bold tracking-tight">Clases y Workshops ARMY</h1>
      <p className="mt-3 text-text-muted">
        Coreano, danza K-pop y covers con instructores de la comunidad. Estamos preparando esta
        sección — ¡pronto podrás inscribirte! 💜
      </p>
      <GlassCard className="mx-auto mt-8 max-w-sm">
        <p className="text-sm text-text-muted">
          Mientras tanto, únete a la comunidad para enterarte primero.
        </p>
        <Link href="/comunidad" className="mt-4 inline-block">
          <PillButton>Ir a la comunidad</PillButton>
        </Link>
      </GlassCard>
    </main>
  );
}
