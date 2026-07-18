import type { Metadata } from "next";
import { PremiumGate } from "@/components/membresia/PremiumGate";

export const metadata: Metadata = {
  title: "Contenido Premium ARMY",
  description: "Contenido exclusivo para miembros ARMY Premium y VIP: fotos HD y behind the scenes.",
  robots: { index: false, follow: true },
};

export default function PremiumPage() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <h1 className="mb-2 text-h1 font-bold tracking-tight">Contenido Premium 💜</h1>
      <p className="mb-8 text-text-muted">Exclusivo para miembros ARMY Premium y VIP.</p>
      <PremiumGate />
    </main>
  );
}
