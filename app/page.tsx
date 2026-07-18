import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { HeartsBackground } from "@/components/layout/HeartsBackground";
import { HomeComposer } from "@/components/comunidad/HomeComposer";
import { PostFeed } from "@/components/comunidad/PostFeed";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { Reveal } from "@/components/ui/Reveal";
import { NAV_LINKS } from "@/lib/nav";
import { TIERS } from "@/lib/membership";
import { formatUSD } from "@/lib/utils/formatters";
import {
  buildBreadcrumbList,
  buildGraph,
  buildOrganization,
  buildWebsite,
  SITE_URL,
} from "@/lib/utils/seo";

// SEO — PRD §15.1.
export const metadata: Metadata = {
  title: {
    absolute: "BTS Chile — Comunidad ARMY & Noticias",
  },
  description:
    "💜 Comunidad oficial ARMY Chile. Entradas BTS WORLD TOUR ARIRANG en el Estadio Nacional, 16 y 17 oct 2026. Desde $299 USD. Pago en cuotas. Noticias, tienda y membresía ARMY Boom v4.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    title: "BTS Chile — Entradas Verificadas & Comunidad ARMY 💜",
    description:
      "La comunidad ARMY más grande de Chile. Entradas BTS 2026, noticias, merch y membresía exclusiva.",
    url: SITE_URL,
    siteName: "BTS Chile",
    locale: "es_CL",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const SECTIONS = [
  {
    href: "/entradas",
    emoji: "🎟",
    title: "Entradas BTS Chile 2026",
    text: "Estadio Nacional, 16 y 17 de octubre. Cancha Andes disponible desde $949 USD. Pago en cuotas.",
  },
  {
    href: "/comunidad",
    emoji: "🗣",
    title: "Comunidad ARMY",
    text: "Publica fan art, teorías y fotos. Reacciona y conecta con miles de ARMY chilenas.",
  },
  {
    href: "/tienda",
    emoji: "🛍",
    title: "Tienda oficial",
    text: "Camisetas, peluches, álbumes y más. Descuentos para miembros ARMY Boom v4.",
  },
  {
    href: "/noticias",
    emoji: "📰",
    title: "Noticias BTS",
    text: "Las últimas novedades de BTS en Chile y el mundo: conciertos, música y ARMY.",
  },
];

export default function Home() {
  const jsonLd = buildGraph([
    buildWebsite(),
    buildOrganization(),
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "BTS Chile — Entradas, Comunidad ARMY & Noticias Oficiales",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      description:
        "La comunidad oficial de BTS en Chile. Compra entradas verificadas, lee noticias, únete a la membresía ARMY Boom v4 y conecta con miles de fans.",
      inLanguage: "es-CL",
      breadcrumb: buildBreadcrumbList([{ name: "BTS Chile", path: "/" }]),
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#navigation`,
      name: "Menú principal de BTS Chile",
      description: "Navegación principal del sitio BTS Chile",
      itemListElement: NAV_LINKS.map((link, i) => ({
        "@type": "SiteNavigationElement",
        position: i + 1,
        name: link.anchor,
        description: link.description,
        url: `${SITE_URL}${link.href}`,
      })),
    },
    {
      "@type": "MusicEvent",
      "@id": `${SITE_URL}/#event-arirang-chile`,
      name: 'BTS WORLD TOUR "ARIRANG" IN SANTIAGO',
      startDate: "2026-10-16",
      endDate: "2026-10-17",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      image: `${SITE_URL}/images/bts-arirang-chile-2026.jpg`,
      location: {
        "@type": "Place",
        name: "Estadio Nacional Julio Martínez Prádanos",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Santiago",
          addressCountry: "CL",
        },
      },
      performer: {
        "@type": "MusicGroup",
        name: "BTS",
        sameAs: "https://www.wikidata.org/wiki/Q18123741",
      },
      url: `${SITE_URL}/entradas`,
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/entradas`,
        priceCurrency: "USD",
        lowPrice: "299",
        highPrice: "1784",
        availability: "https://schema.org/LimitedAvailability",
        validFrom: "2026-04-07T13:00:00-03:00",
      },
    },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* HERO compacto — H1 de SEO */}
      <section className="aurora relative overflow-hidden">
        <HeartsBackground />
        <div className="mx-auto max-w-[1120px] px-6 py-10 text-center sm:py-14">
          <h1 className="text-h1 font-bold tracking-tight sm:text-display">BTS Chile</h1>
          <p className="mx-auto mt-2 max-w-xl text-text-muted">
            La comunidad oficial de ARMY en Chile 💜 Entradas, noticias, tienda y comunidad.
          </p>
        </div>
      </section>

      {/* Composer estilo Facebook (crear publicación) */}
      <section className="mx-auto -mt-3 max-w-[1120px] px-6">
        <HomeComposer />
      </section>

      {/* FEED de la comunidad (scroll infinito) */}
      <section className="mx-auto mt-8 max-w-2xl px-6">
        <h2 className="sr-only">Publicaciones de la comunidad</h2>
        <PostFeed infinite />
      </section>

      {/* SECCIONES */}
      <section className="mx-auto max-w-[1120px] px-6 pb-16 pt-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.href} delay={i * 0.05}>
              <Link href={s.href}>
                <GlassCard hover className="h-full">
                  <span className="text-3xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <h2 className="mt-3 text-h3 font-semibold">{s.title}</h2>
                  <p className="mt-1 text-text-muted">{s.text}</p>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MINI PRICING */}
      <section className="mx-auto max-w-[1120px] px-6 pb-20">
        <Reveal>
          <GlassCard className="aurora flex flex-col items-center gap-6 rounded-card px-6 py-12 text-center">
            <div>
              <h2 className="text-h2 font-semibold">Membresía ARMY Boom v4</h2>
              <p className="mt-1 text-text-muted">
                1 mes gratis, luego desde $1 USD/mes. Publica en comunidad y accede a beneficios.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {TIERS.filter((t) => t.key !== "free").map((t) => (
                <div key={t.key} className="min-w-[120px] rounded-2xl glass px-5 py-4">
                  <p className="text-sm text-text-muted">{t.name}</p>
                  <p className="text-2xl font-bold tabular-nums">{formatUSD(t.monthlyUSD)}</p>
                  <p className="text-xs text-text-muted">/mes</p>
                </div>
              ))}
            </div>
            <Link href="/membresia">
              <PillButton>Ver planes 💜</PillButton>
            </Link>
          </GlassCard>
        </Reveal>
      </section>
    </>
  );
}
