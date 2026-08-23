import type { Metadata } from "next";
import { NoticiasView } from "@/components/noticias/NoticiasView";
import { toNewsCard, type NewsCardItem } from "@/components/noticias/ArticleCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedNews } from "@/lib/firestore/news";
import { buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";

// Revalidar cada 60 segundos - ISR (Incremental Static Regeneration)
export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: "Noticias BTS Chile 2026 — Conciertos, Música y ARMY | btschile.com",
  },
  description:
    "💜 Las últimas noticias de BTS en Chile y el mundo: fechas de conciertos BTS Chile 2026, nuevas canciones, novedades de RM, Jin, Suga, J-Hope, Jimin, V, Jung Kook y de ARMY Chile.",
  keywords: [
    "noticias bts chile",
    "bts chile noticias",
    "concierto bts chile 2026",
    "bts noticias",
    "army chile",
    "noticias kpop chile",
    "bts actualizaciones",
    "bts santiago noticias",
  ],
  alternates: { canonical: `${SITE_URL}/noticias` },
  openGraph: {
    title: "Noticias BTS Chile 2026 💜",
    description: "Las últimas noticias de BTS en Chile: conciertos, música, ARMY y más.",
    url: `${SITE_URL}/noticias`,
    images: [
      {
        url: `${SITE_URL}/og-noticias.jpg`,
        width: 1200,
        height: 630,
        alt: "Noticias BTS Chile 2026",
      },
    ],
    locale: "es_CL",
    type: "website",
    siteName: "BTS Chile",
  },
  twitter: {
    card: "summary_large_image",
    site: "@btschile",
    title: "Noticias BTS Chile 2026",
    description: "Las últimas noticias de BTS en Chile: conciertos, música y ARMY.",
    images: [`${SITE_URL}/og-noticias.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
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
        "Las últimas noticias de BTS en Chile y el mundo: actualizaciones oficiales, fechas de conciertos, nuevas canciones, novedades de RM, Jin, Suga, J-Hope, Jimin, V y Jung Kook.",
      inLanguage: "es-CL",
      about: [
        { "@type": "Thing", name: "BTS", sameAs: "https://www.wikidata.org/wiki/Q18123741" },
        { "@type": "Thing", name: "K-pop", sameAs: "https://en.wikipedia.org/wiki/K-pop" },
        { "@type": "Thing", name: "Conciertos Chile" },
        { "@type": "Thing", name: "ARMY" },
        { "@type": "Thing", name: "Música K-pop" },
      ],
      publisher: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "BTS Chile",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
      },
      breadcrumb: buildBreadcrumbList([
        { name: "Inicio", path: "/" },
        { name: "Noticias", path: "/noticias" },
      ]),
      image: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-noticias.jpg`,
        width: 1200,
        height: 630,
      },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/noticias#webpage`,
      url: `${SITE_URL}/noticias`,
      name: "Noticias BTS Chile 2026",
      description: "Blog de noticias sobre BTS en Chile: conciertos, música, ARMY y actualizaciones.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/noticias#blog` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-noticias.jpg`,
        width: 1200,
        height: 630,
      },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "header p"],
      },
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
