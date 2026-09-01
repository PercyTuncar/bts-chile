import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { HeartsBackground } from "@/components/layout/HeartsBackground";
import { HomeComposer } from "@/components/comunidad/HomeComposer";
import { PostFeed } from "@/components/comunidad/PostFeed";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { TrendingNews } from "@/components/home/TrendingNews";
import { BirthdayWidget } from "@/components/home/BirthdayWidget";
import { QuickLinks } from "@/components/home/QuickLinks";
import { NAV_LINKS } from "@/lib/nav";
import {
  buildBreadcrumbList,
  buildGraph,
  buildOrganization,
  buildWebsite,
  SITE_URL,
} from "@/lib/utils/seo";

// SEO — PRD §15.1.
export const metadata: Metadata = {
  title: "BTS Chile - Comunidad Oficial Kpop",
  description:
    "BTS Chile es la comunidad oficial de Kpop en el país. Compra entradas 100% seguras para el concierto BTS 2026 en el Estadio Nacional Santiago: 14, 16 y 17 de octubre. Únete a miles de ARMY chilenas.",
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
    "kpop chile",
    "fan club bts chile",
    "noticias bts",
    "tienda bts chile",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    title: "BTS Chile - Comunidad Oficial Kpop | Entradas 2026",
    description:
      "Comunidad oficial de Kpop en Chile. Entradas 100% seguras para BTS 2026 en Estadio Nacional Santiago. Noticias, tienda oficial y membresía ARMY.",
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
    title: "BTS Chile - Comunidad Oficial Kpop",
    description:
      "Comunidad oficial de Kpop en Chile. Entradas BTS 2026, noticias, tienda y membresía ARMY.",
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
    buildOrganization(),
    // Enhanced Website with SearchAction
    {
      ...buildWebsite(),
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/comunidad?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    // WebPage
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "BTS Chile - Comunidad Oficial Kpop | Entradas 2026 100% Seguras",
      description:
        "La comunidad oficial de Kpop en Chile. Compra entradas verificadas para BTS Chile 2026 en Estadio Nacional, noticias K-pop, membresía ARMY y conecta con miles de fans.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#event-arirang-chile` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/og-home.jpg#primaryimage`,
        url: `${SITE_URL}/og-home.jpg`,
        width: 1200,
        height: 630,
        caption: "BTS Chile 2026 - Comunidad Oficial ARMY",
      },
      breadcrumb: { "@id": `${SITE_URL}/#breadcrumb` },
      inLanguage: "es-CL",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    // Breadcrumb
    buildBreadcrumbList([
      { name: "Inicio", path: "/" },
    ]),
    // Performer - BTS with full details
    {
      "@type": "MusicGroup",
      "@id": `${SITE_URL}/#performer-bts`,
      name: "BTS",
      alternateName: ["방탄소년단", "Bangtan Sonyeondan", "Beyond The Scene", "Bangtan Boys"],
      genre: ["K-pop", "Pop", "Hip hop", "R&B"],
      url: "https://www.bts-official.com/",
      sameAs: [
        "https://www.wikidata.org/wiki/Q13580677",
        "https://en.wikipedia.org/wiki/BTS",
        "https://www.instagram.com/bts.bighitofficial/",
        "https://twitter.com/bts_bighit",
        "https://www.youtube.com/c/BANGTANTV",
        "https://open.spotify.com/artist/3Nrfpe0tUJi4K4DXYWgMUX",
      ],
      foundingDate: "2013-06-13",
      foundingLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: "KR",
          addressLocality: "Seoul",
        },
      },
    },
    // Event Venue
    {
      "@type": "EventVenue",
      "@id": `${SITE_URL}/#venue-estadio-nacional`,
      name: "Estadio Nacional Julio Martínez Prádanos",
      alternateName: ["Estadio Nacional", "Coloso de Ñuñoa"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. Grecia 2001",
        addressLocality: "Ñuñoa",
        addressRegion: "Región Metropolitana",
        postalCode: "7800003",
        addressCountry: "CL",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -33.465,
        longitude: -70.606,
      },
      maximumAttendeeCapacity: 47000,
      publicAccess: true,
      url: "https://www.estadionacional.cl/",
    },
    // Main Music Event
    {
      "@type": "MusicEvent",
      "@id": `${SITE_URL}/#event-arirang-chile`,
      name: 'BTS WORLD TOUR "ARIRANG" IN SANTIAGO',
      description: "BTS regresa a Chile con el BTS WORLD TOUR ARIRANG 2026 en el Estadio Nacional: 14, 16 y 17 de octubre. El grupo de K-pop más exitoso del mundo presenta su esperado concierto en Santiago.",
      startDate: "2026-10-14T20:00:00-03:00",
      endDate: "2026-10-17T23:00:00-03:00",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      image: [
        "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg",
        `${SITE_URL}/og-home.jpg`,
      ],
      location: { "@id": `${SITE_URL}/#venue-estadio-nacional` },
      performer: { "@id": `${SITE_URL}/#performer-bts` },
      organizer: { "@id": `${SITE_URL}/#organization` },
      url: `${SITE_URL}/entradas`,
      offers: {
        "@type": "AggregateOffer",
        url: `${SITE_URL}/entradas`,
        priceCurrency: "USD",
        lowPrice: 299,
        highPrice: 1784,
        offerCount: 16,
        availability: "https://schema.org/LimitedAvailability",
        validFrom: "2026-04-07T13:00:00-03:00",
        priceValidUntil: "2026-10-17T23:59:59-03:00",
        seller: { "@id": `${SITE_URL}/#organization` },
      },
      inLanguage: ["es-CL", "ko", "en"],
      isAccessibleForFree: false,
      typicalAgeRange: "13+",
      maximumAttendeeCapacity: 47000,
      audience: {
        "@type": "Audience",
        audienceType: "K-pop fans, BTS ARMY",
      },
    },
    // Site Navigation ItemList
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#site-sections`,
      name: "Secciones principales",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "WebPage",
            name: "Entradas BTS 2026",
            url: `${SITE_URL}/entradas`,
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "WebPage",
            name: "Comunidad ARMY",
            url: `${SITE_URL}/comunidad`,
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "WebPage",
            name: "Noticias K-pop",
            url: `${SITE_URL}/noticias`,
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@type": "WebPage",
            name: "Tienda Oficial",
            url: `${SITE_URL}/tienda`,
          },
        },
      ],
    },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* HERO estilo Netflix con imagen de fondo */}
      <section
        className="relative min-h-[85vh] flex items-end overflow-hidden"
        aria-label="Hero principal"
      >
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg"
            alt="BTS - ARIRANG World Tour 2026"
            className="w-full h-full object-cover object-center md:object-[center_30%]"
          />
          {/* Overlay con gradientes para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          {/* Overlay adicional para modo claro */}
          <div className="absolute inset-0 bg-black/20 dark:bg-black/0" />
        </div>

        {/* Contenido */}
        <div className="relative z-10 mx-auto w-full max-w-[1120px] px-6 pb-16 pt-32 sm:pb-20">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md px-4 py-2 text-sm font-medium text-white border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Entradas disponibles
          </div>

          {/* Título principal */}
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl max-w-3xl">
            BTS Chile
          </h1>

          {/* Descripción */}
          <p className="mt-4 max-w-2xl text-lg sm:text-xl text-white/90 leading-relaxed">
            BTS Chile es la comunidad oficial de Kpop en el país.
          </p>

          {/* Información adicional */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>Estadio Nacional, Santiago</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>14, 16 y 17 de octubre 2026</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/entradas">
              <button className="group relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-xl cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                </svg>
                Comprar Entradas
              </button>
            </Link>
            <Link href="/comunidad">
              <button className="group inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md px-8 py-4 text-base font-semibold text-white border border-white/20 transition-all hover:bg-white/20 hover:scale-105 cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Unirse a la Comunidad
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Espaciado entre hero y siguiente sección */}
      <div className="h-12 sm:h-16 bg-gradient-to-b from-black/5 to-transparent dark:from-black/20" />

      {/* LAYOUT DE 3 COLUMNAS tipo Facebook - Solo visible en desktop */}
      <div className="mx-auto max-w-[1400px] px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLUMNA IZQUIERDA - Sidebar (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="sticky top-20">
              <QuickLinks />
            </div>
          </aside>

          {/* COLUMNA CENTRAL - Feed Principal */}
          <main className="lg:col-span-6">
            {/* Composer estilo Facebook (crear publicación) */}
            <section className="mb-6">
              <HomeComposer />
            </section>

            {/* FEED de la comunidad (scroll infinito) */}
            <section>
              <h2 className="sr-only">Publicaciones de la comunidad</h2>
              <PostFeed infinite />
            </section>
          </main>

          {/* COLUMNA DERECHA - Widgets (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="sticky top-20 space-y-4">
              <BirthdayWidget />
              <UpcomingEvents />
              <TrendingNews />
            </div>
          </aside>
        </div>
      </div>

      {/* SECCIONES */}
      <section className="mx-auto max-w-[1120px] px-6 pb-20 pt-12">
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
    </>
  );
}
