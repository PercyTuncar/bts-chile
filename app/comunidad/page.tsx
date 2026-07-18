import type { Metadata } from "next";
import { Timestamp, getCountFromServer, query, where } from "firebase/firestore";
import { ComunidadView } from "@/components/comunidad/ComunidadView";
import { JsonLd } from "@/components/seo/JsonLd";
import { postsCol, usersCol } from "@/lib/firestore/collections";
import { buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Comunidad ARMY Chile — Foro Fans BTS | btschile.com",
  },
  description:
    "💜 Únete a la comunidad ARMY más grande de Chile. Publica fan art, teorías y fotos de BTS. Reacciona y conecta con miles de fans. Publicar requiere membresía ARMY Boom.",
  alternates: { canonical: `${SITE_URL}/comunidad` },
  openGraph: {
    title: "Comunidad ARMY Chile — Foro Fans BTS 💜",
    url: `${SITE_URL}/comunidad`,
    images: [`${SITE_URL}/og-comunidad.jpg`],
    locale: "es_CL",
    type: "website",
  },
};

async function getStats(): Promise<{ members: number | null; weekly: number | null }> {
  try {
    const weekAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [membersSnap, weeklySnap] = await Promise.all([
      getCountFromServer(usersCol),
      getCountFromServer(
        query(postsCol, where("status", "==", "approved"), where("createdAt", ">=", weekAgo)),
      ),
    ]);
    return { members: membersSnap.data().count, weekly: weeklySnap.data().count };
  } catch {
    return { members: null, weekly: null };
  }
}

export default async function ComunidadPage() {
  const stats = await getStats();

  const jsonLd = buildGraph([
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/comunidad#page`,
      url: `${SITE_URL}/comunidad`,
      name: "Comunidad ARMY Chile — Foro Fans BTS | btschile.com",
      description:
        "El foro oficial de fans de BTS en Chile. Comparte fan art, teorías, fotos y opiniones con miles de ARMY chilenas.",
      inLanguage: "es-CL",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: [
        { "@type": "Thing", name: "BTS" },
        { "@type": "Thing", name: "ARMY Chile" },
        { "@type": "Thing", name: "Fan Art BTS" },
      ],
      breadcrumb: buildBreadcrumbList([
        { name: "Inicio", path: "/" },
        { name: "Comunidad", path: "/comunidad" },
      ]),
    },
  ]);

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <JsonLd data={jsonLd} />
      <header className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">
          Comunidad ARMY Chile — Foro de Fans de BTS
        </h1>
        <p className="mt-1 text-text-muted">
          Publica fan art, teorías y fotos. Reacciona y conecta con miles de ARMY 💜
        </p>
      </header>
      <ComunidadView memberCount={stats.members} weeklyPosts={stats.weekly} />
    </main>
  );
}
