"use client";

// Badge de prueba activa con CTA a suscribirse — PRD §10.3.
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { daysRemaining } from "@/lib/membership";

export function TrialBadge() {
  const { profile } = useAuth();
  if (!profile?.isTrial || !profile.membershipExpiry) return null;

  const days = daysRemaining(profile.membershipExpiry.toMillis());

  return (
    <div className="glass-card flex flex-col items-start gap-3 rounded-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium">
        🎁 Prueba ARMY Basic — quedan <b>{days}</b> {days === 1 ? "día" : "días"}
      </p>
      <Link
        href="/membresia"
        className="inline-flex h-10 items-center rounded-button bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
      >
        Mantener mi acceso por $1/mes
      </Link>
    </div>
  );
}

export default TrialBadge;
