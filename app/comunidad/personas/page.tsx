import type { Metadata } from "next";
import { PersonasView } from "@/components/comunidad/PersonasView";
import { SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: "Personas — Comunidad ARMY Chile",
  description: "Encuentra y sigue a otras ARMY de la comunidad BTS Chile.",
  alternates: { canonical: `${SITE_URL}/comunidad/personas` },
};

export default function PersonasPage() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <header className="mb-6">
        <h1 className="text-h1 font-bold tracking-tight">Personas</h1>
        <p className="mt-1 text-text-muted">Busca a otras ARMY, míralas y síguelas 💜</p>
      </header>
      <PersonasView />
    </main>
  );
}
