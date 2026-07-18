import type { Metadata } from "next";
import { GruposGrid } from "@/components/comunidad/GruposGrid";
import { getWhatsappGroups } from "@/lib/firestore/community";
import { SITE_URL } from "@/lib/utils/seo";
import type { WhatsappGroup, WithId } from "@/types";

export const metadata: Metadata = {
  title: "Grupos de WhatsApp ARMY Chile",
  description:
    "💜 Únete a los grupos de WhatsApp oficiales de ARMY Chile por región: Santiago, Valparaíso, Concepción y más.",
  alternates: { canonical: `${SITE_URL}/comunidad/grupos` },
};

export default async function GruposPage() {
  let groups: WithId<WhatsappGroup>[] = [];
  try {
    groups = await getWhatsappGroups();
  } catch (err) {
    console.warn("grupos: Firestore no disponible", err);
  }

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <header className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Grupos de WhatsApp ARMY Chile</h1>
        <p className="mt-1 text-text-muted">
          Grupos oficiales verificados por región. Únete y conecta con ARMY de tu ciudad 💜
        </p>
      </header>
      <GruposGrid groups={groups} />
    </main>
  );
}
