import type { Metadata } from "next";
import { NoticiasView } from "@/components/noticias/NoticiasView";
import { toNewsCard, type NewsCardItem } from "@/components/noticias/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedNews } from "@/lib/firestore/news";
import { buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Noticias BTS Chile — Conciertos, Música y ARMY | btschile.com",
  },
  description:
    "💜 Las últimas noticias de BTS en Chile y el mundo: fechas de conciertos, nuevas canciones, novedades de los miembros y de ARMY Chile.",
  alternates: { canonical: `${SITE_URL}/noticias` },
  openGraph: {
    title: "Noticias BTS Chile 💜",
    url: `${SITE_URL}/noticias`,
    images: [`${SITE_URL}/og-noticias.jpg`],
    locale: "es_CL",
    type: "website",
  },
};

export default async function NoticiasPage() {
  let items: NewsCardItem[] = [];
  try {
    const news = await getPublishedNews({ max: 60 });
    items = news.map(toNewsCard);
  } catch (err) {
    console.warn("noticias: Firestore no disponible", err);
  }

  const jsonLd = buildGraph([
    {
      "@type": "Blog",
      "@id": `${SITE_URL}/noticias#blog`,
      url: `${SITE_URL}/noticias`,
      name: "Noticias BTS Chile",
      description:
        "Las últimas noticias de BTS en Chile y el mundo: actualizaciones oficiales, fechas de conciertos, nuevas canciones y más.",
      inLanguage: "es-CL",
      about: [
        { "@type": "Thing", name: "BTS" },
        { "@type": "Thing", name: "K-pop" },
        { "@type": "Thing", name: "Conciertos Chile" },
      ],
      publisher: {
        "@type": "Organization",
        name: "BTS Chile",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
      },
      breadcrumb: buildBreadcrumbList([
        { name: "Inicio", path: "/" },
        { name: "Noticias", path: "/noticias" },
      ]),
    },
  ]);

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <JsonLd data={jsonLd} />
      <header className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Noticias BTS Chile</h1>
        <p className="mt-1 text-text-muted">
          Conciertos, música, novedades de los miembros y de ARMY Chile 💜
        </p>
      </header>
      <NoticiasView items={items} />
    </main>
  );
}
