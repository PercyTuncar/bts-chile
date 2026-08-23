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
    absolute: "BTS Chile",
  },
  description:
    "BTS en Chile - Precios de las entradas disponible aqui, ARIRANG World Tour 2026 · Estadio Nacional Julio Martínez Prádanos",
  keywords: [
    "bts chile",
    "entradas bts chile",
    "bts chile 2026",
    "concierto bts chile",
    "bts santiago",
    "bts estadio nacional",
    "army chile",
    "entradas bts santiago",
    "bts world tour arirang chile",
    "comunidad army chile",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    title: "BTS Chile",
    description:
      "BTS en Chile - Precios de las entradas disponible aqui, ARIRANG World Tour 2026 · Estadio Nacional Julio Martínez Prádanos",
    url: SITE_URL,
    siteName: "BTS Chile",
    locale: "es_CL",
    images: [
      {
        url: `${SITE_URL}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: "BTS Chile 2026 - Comunidad Oficial ARMY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@btschile",
    title: "BTS Chile",
    description:
      "BTS en Chile - Precios de las entradas disponible aqui, ARIRANG World Tour 2026",
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
      name: "BTS Chile 2026 | Entradas 100% Seguras y Asistencia ARMY",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      description:
        "La comunidad oficial de BTS en Chile. Compra entradas verificadas para el concierto BTS Chile 2026, lee noticias K-pop, únete a la membresía ARMY Boom v4 y conecta con miles de fans.",
      inLanguage: "es-CL",
      breadcrumb: buildBreadcrumbList([{ name: "BTS Chile", path: "/" }]),
      primaryImageOfPage: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/og-home.jpg#primaryimage`,
        url: `${SITE_URL}/og-home.jpg`,
        width: 1200,
        height: 630,
        caption: "BTS Chile 2026 - Comunidad Oficial ARMY",
      },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".hero-description"],
      },
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
      description: "BTS llega a Chile con tres fechas en el Estadio Nacional de Santiago: 14, 16 y 17 de octubre de 2026. El grupo de K-pop más famoso del mundo regresa a Latinoamérica.",
      startDate: "2026-10-14T20:00:00-03:00",
      endDate: "2026-10-17T23:00:00-03:00",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      image: [
        `${SITE_URL}/images/bts-arirang-chile-2026.jpg`,
        `${SITE_URL}/og-entradas.jpg`,
      ],
      location: {
        "@type": "Place",
        "@id": `${SITE_URL}/#estadio-nacional`,
        name: "Estadio Nacional Julio Martínez Prádanos",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. Grecia 2001",
          addressLocality: "Ñuñoa",
          addressRegion: "Región Metropolitana",
          postalCode: "7750000",
          addressCountry: "CL",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: -33.4646,
          longitude: -70.6094,
        },
      },
      performer: {
        "@type": "MusicGroup",
        name: "BTS",
        alternateName: ["방탄소년단", "Bangtan Sonyeondan", "Beyond The Scene", "Bangtan Boys"],
        sameAs: [
          "https://www.wikidata.org/wiki/Q18123741",
          "https://en.wikipedia.org/wiki/BTS",
          "https://www.instagram.com/bts.bighitofficial/",
        ],
        genre: ["K-pop", "Pop", "Hip hop", "R&B"],
      },
      organizer: {
        "@id": `${SITE_URL}/#organization`,
      },
      url: `${SITE_URL}/entradas`,
      offers: {
        "@type": "AggregateOffer",
        url: `${SITE_URL}/entradas`,
        priceCurrency: "USD",
        lowPrice: "299",
        highPrice: "1784",
        offerCount: 8,
        availability: "https://schema.org/LimitedAvailability",
        validFrom: "2026-04-07T13:00:00-03:00",
        priceValidUntil: "2026-10-17T23:59:59-03:00",
        seller: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      inLanguage: "es-CL",
      isAccessibleForFree: false,
      typicalAgeRange: "13+",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Cuándo es el concierto de BTS en Chile 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "BTS se presentará en el Estadio Nacional de Santiago en tres fechas: 14, 16 y 17 de octubre de 2026. Las puertas abren a las 18:00 hrs y el show comienza a las 20:00 hrs.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuánto cuestan las entradas para BTS Chile 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Las entradas para BTS Chile 2026 van desde $299 USD (Cancha Andes) hasta $1,784 USD (Cancha VIP). Ofrecemos pago en cuotas y todas las entradas son 100% verificadas.",
          },
        },
        {
          "@type": "Question",
          name: "¿Dónde es el concierto de BTS en Santiago?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El concierto de BTS será en el Estadio Nacional Julio Martínez Prádanos, ubicado en Av. Grecia 2001, Ñuñoa, Santiago. Se puede llegar en Metro Línea 6 (estación Estadio Nacional).",
          },
        },
        {
          "@type": "Question",
          name: "¿Las entradas BTS Chile son seguras?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí, todas nuestras entradas son 100% verificadas y seguras. Somos vendedores oficiales certificados. Ofrecemos garantía de autenticidad, pago seguro y asistencia completa ARMY.",
          },
        },
      ],
    },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* HERO compacto — H1 de SEO */}
      <section className="aurora relative overflow-hidden" aria-label="Hero principal">
        <HeartsBackground />
        <div className="mx-auto max-w-[1120px] px-6 py-10 text-center sm:py-14">
          <h1 className="text-h1 font-bold tracking-tight sm:text-display">Entradas BTS Chile 2026 — Estadio Nacional</h1>
          <p className="mx-auto mt-2 max-w-xl text-text-muted">
            La comunidad oficial de ARMY en Chile. Compra entradas BTS Chile 2026 100% seguras para el concierto en el Estadio Nacional Santiago: 14, 16 y 17 de octubre. Desde $299 USD con pago en cuotas.
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
