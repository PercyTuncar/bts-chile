"use client";

// Contenido exclusivo gated ≥ Premium — PRD §10.2.
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { useAuth, useAuthStore } from "@/hooks/useAuth";

export function PremiumGate() {
  const { status, profile } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);

  const tier = profile?.membershipType;
  const hasAccess = tier === "premium" || tier === "vip";

  if (status === "loading") {
    return <p className="text-center text-text-muted">Cargando…</p>;
  }

  if (!hasAccess) {
    return (
      <GlassCard className="aurora mx-auto max-w-md text-center">
        <p className="text-4xl">🔒💜</p>
        <h2 className="mt-3 text-h3 font-semibold">Contenido exclusivo Premium</h2>
        <p className="mt-1 text-text-muted">
          Fotos HD, behind the scenes y más. Disponible para miembros ARMY Premium y VIP.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          {status === "authenticated" ? (
            <Link href="/membresia">
              <PillButton>Hazte Premium</PillButton>
            </Link>
          ) : (
            <PillButton onClick={openLogin}>Entrar</PillButton>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <GlassCard key={n} className="flex aspect-square items-center justify-center text-4xl">
          💜
        </GlassCard>
      ))}
    </div>
  );
}

export default PremiumGate;
