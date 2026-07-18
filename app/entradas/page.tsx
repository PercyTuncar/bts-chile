import type { Metadata } from "next";
import { EntradasView } from "@/components/entradas/EntradasView";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { GlassCard } from "@/components/ui/GlassCard";
import { SmartImage } from "@/components/ui/SmartImage";
import { getZones } from "@/lib/firestore/tickets";
import { DEFAULT_ZONES, zoneStatus, type ZoneData } from "@/lib/entradas/zones";
import { ENTRADAS_FAQ } from "@/lib/entradas/faq";
import {
  buildBreadcrumbList,
  buildGraph,
  buildOrganization,
  buildWebsite,
  SITE_URL,
} from "@/lib/utils/seo";

const OG_IMAGE = `${SITE_URL}/og-entradas.jpg`;
const EVENT_IMAGE = `${SITE_URL}/images/bts-arirang-chile-2026.jpg`;
const MAP_IMAGE =
  "https://res.cloudinary.com/dz1qivt7m/image/upload/v1775645342/mapa_chile_taxr0b.jpg";
const DATE_PUBLISHED = "2026-04-07T13:00:00-03:00"; // salida a la venta
const DATE_MODIFIED = "2026-07-18T12:00:00-03:00";

export const metadata: Metadata = {
  title: { absolute: "BTS Chile — Entradas disponibles aquí" },
  description:
    "💜 Compra entradas BTS WORLD TOUR ARIRANG en Chile. Estadio Nacional Santiago, 16 y 17 oct 2026. Cancha Andes disponible desde $949 USD. Pago en 3 cuotas. Entrega por email. 100% seguro.",
  alternates: { canonical: `${SITE_URL}/entradas` },
  openGraph: {
    type: "website",
    siteName: "BTS Chile",
    title: "BTS Chile — Entradas disponibles aquí",
    description:
      "Cancha Andes disponible $949 USD. Estadio Nacional, 16 y 17 oct 2026. Pago en cuotas. Entrega por email en 24-48h.",
    url: `${SITE_URL}/entradas`,
    locale: "es_CL",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Entradas BTS Chile 2026 — Estadio Nacional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BTS Chile — Entradas disponibles aquí",
    description:
      "Cancha Andes disponible $949 USD. Estadio Nacional, 16 y 17 oct 2026. Pago en cuotas.",
    images: [OG_IMAGE],
  },
};

const EVENT_DATE = "2026-10-16T20:00:00-03:00";

function categoryOf(name: string): string {
  if (name.includes("Medio")) return "VIP";
  if (name.includes("Cancha")) return "Cancha";
  if (name.includes("Galería")) return "Galería";
  if (name.includes("Lateral")) return "Lateral";
  if (name.includes("Movilidad")) return "Accesibilidad";
  return "Tribuna";
}

function offersFor(zones: ZoneData[], priceValidUntil: string) {
  return zones.map((z) => ({
    "@type": "Offer",
    name: z.zoneName,
    price: String(z.priceUSD),
    priceCurrency: "USD",
    availability:
      zoneStatus(z) === "soldout"
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    url: `${SITE_URL}/entradas`,
    category: categoryOf(z.zoneName),
    validFrom: DATE_PUBLISHED,
    priceValidUntil,
    availabilityStarts: DATE_PUBLISHED,
    seller: { "@id": `${SITE_URL}/#organization` },
  }));
}

export default async function EntradasPage() {
  let zones: ZoneData[] = DEFAULT_ZONES;
  try {
    const fromDb = await getZones();
    if (fromDb.length > 0) {
      zones = fromDb.map((z) => ({
        zoneId: z.zoneId || z.id,
        zoneName: z.zoneName,
        zoneNumber: z.zoneNumber,
        priceUSD: z.priceUSD,
        stock: z.stock,
        isActive: z.isActive,
        isSoldOut: z.isSoldOut,
        description: z.description,
        availableDates: z.availableDates,
        mapCoordinates: z.mapCoordinates,
      }));
    }
  } catch (err) {
    console.warn("entradas: usando zonas por defecto (Firestore no disponible)", err);
  }

  const availableZones = zones.filter((z) => zoneStatus(z) !== "soldout");

  const jsonLd = buildGraph([
    buildOrganization(),
    buildWebsite(),
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/entradas#webpage`,
      url: `${SITE_URL}/entradas`,
      name: "Entradas BTS Chile 2026 — Estadio Nacional",
      description:
        "Compra verificada de entradas para el BTS WORLD TOUR ARIRANG en el Estadio Nacional de Santiago, 16 y 17 de octubre de 2026.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/entradas#event-series` },
      mainEntity: { "@id": `${SITE_URL}/entradas#event-series` },
      primaryImageOfPage: { "@id": `${SITE_URL}/entradas#primaryimage` },
      breadcrumb: { "@id": `${SITE_URL}/entradas#breadcrumb` },
      inLanguage: "es-CL",
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/entradas#primaryimage`,
      url: EVENT_IMAGE,
      contentUrl: EVENT_IMAGE,
      width: 1200,
      height: 630,
      caption: "BTS WORLD TOUR ARIRANG — Santiago, Chile 2026",
    },
    {
      "@type": "EventSeries",
      "@id": `${SITE_URL}/entradas#event-series`,
      name: 'BTS WORLD TOUR "ARIRANG" IN SANTIAGO 2026',
      description:
        "BTS regresa a Chile con su BTS WORLD TOUR ARIRANG. Dos fechas en el Estadio Nacional de Santiago, el 16 y 17 de octubre de 2026.",
      url: `${SITE_URL}/entradas`,
      image: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/bts-arirang-chile-2026.jpg`,
        width: 1200,
        height: 630,
        caption: "BTS WORLD TOUR ARIRANG — Santiago, Chile 2026",
      },
      startDate: "2026-10-16",
      endDate: "2026-10-17",
      location: {
        "@type": "Place",
        "@id": `${SITE_URL}/entradas#estadio-nacional`,
        name: "Estadio Nacional Julio Martínez Prádanos",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. Grecia 2001",
          addressLocality: "Ñuñoa",
          addressRegion: "Región Metropolitana",
          postalCode: "7750000",
          addressCountry: "CL",
        },
        geo: { "@type": "GeoCoordinates", latitude: -33.4647, longitude: -70.6108 },
        maximumAttendeeCapacity: 47000,
        url: "https://estadionacional.cl",
      },
      performer: {
        "@type": "MusicGroup",
        "@id": `${SITE_URL}/entradas#bts`,
        name: "BTS",
        alternateName: ["방탄소년단", "Bangtan Sonyeondan", "Beyond The Scene"],
        sameAs: ["https://www.wikidata.org/wiki/Q18123741", "https://en.wikipedia.org/wiki/BTS"],
        genre: ["K-pop", "Pop", "Hip-hop", "R&B"],
        member: ["RM", "Jin", "Suga", "J-Hope", "Jimin", "V", "Jungkook"].map((name) => ({
          "@type": "Person",
          name,
        })),
      },
      organizer: {
        "@type": "Organization",
        name: "DG Medios",
        url: "https://dgmedios.com",
      },
      inLanguage: "es-CL",
    },
    {
      "@type": "MusicEvent",
      "@id": `${SITE_URL}/entradas#event-dia1`,
      name: 'BTS WORLD TOUR "ARIRANG" IN SANTIAGO — Viernes 16 Oct',
      startDate: "2026-10-16T20:00:00-03:00",
      endDate: "2026-10-16T23:30:00-03:00",
      doorTime: "2026-10-16T17:00:00-03:00",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isPartOf: { "@id": `${SITE_URL}/entradas#event-series` },
      location: { "@id": `${SITE_URL}/entradas#estadio-nacional` },
      performer: { "@id": `${SITE_URL}/entradas#bts` },
      description:
        "Primera fecha del BTS WORLD TOUR ARIRANG en Chile. Viernes 16 de octubre 2026 en el Estadio Nacional de Santiago.",
      image: [{ "@id": `${SITE_URL}/entradas#primaryimage` }],
      url: `${SITE_URL}/entradas`,
      inLanguage: "es-CL",
      organizer: { "@type": "Organization", name: "DG Medios", url: "https://dgmedios.com" },
      offers: offersFor(zones, "2026-10-16"),
    },
    {
      "@type": "MusicEvent",
      "@id": `${SITE_URL}/entradas#event-dia2`,
      name: 'BTS WORLD TOUR "ARIRANG" IN SANTIAGO — Sábado 17 Oct',
      startDate: "2026-10-17T20:00:00-03:00",
      endDate: "2026-10-17T23:30:00-03:00",
      doorTime: "2026-10-17T17:00:00-03:00",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isPartOf: { "@id": `${SITE_URL}/entradas#event-series` },
      location: { "@id": `${SITE_URL}/entradas#estadio-nacional` },
      performer: { "@id": `${SITE_URL}/entradas#bts` },
      description:
        "Segunda fecha del BTS WORLD TOUR ARIRANG en Chile. Sábado 17 de octubre 2026. Cancha Andes disponible desde $949 USD.",
      image: [{ "@id": `${SITE_URL}/entradas#primaryimage` }],
      url: `${SITE_URL}/entradas`,
      inLanguage: "es-CL",
      organizer: { "@type": "Organization", name: "DG Medios", url: "https://dgmedios.com" },
      offers: offersFor(availableZones, "2026-10-17"),
    },
    {
      ...buildBreadcrumbList([
        { name: "Inicio", path: "/" },
        { name: "Entradas BTS Chile 2026", path: "/entradas" },
      ]),
      "@id": `${SITE_URL}/entradas#breadcrumb`,
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/entradas#faq`,
      inLanguage: "es-CL",
      isPartOf: { "@id": `${SITE_URL}/entradas#webpage` },
      mainEntity: ENTRADAS_FAQ.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ]);

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section aria-labelledby="entradas-titulo" className="aurora mb-10 rounded-card px-6 py-12 text-center">
        <h1 id="entradas-titulo" className="text-h1 font-bold tracking-tight sm:text-display">
          Entradas BTS Chile 2026 — Estadio Nacional
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-text-muted">
          BTS WORLD TOUR &quot;ARIRANG&quot; IN SANTIAGO ·{" "}
          <time dateTime="2026-10-16">16</time> y{" "}
          <time dateTime="2026-10-17">17 de octubre de 2026</time>
        </p>
        <div className="mt-6 flex justify-center">
          <CountdownTimer targetDate={EVENT_DATE} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {["100% Seguro", "Vendedor Verificado", "Pago en Cuotas"].map((b) => (
            <span key={b} className="rounded-full glass px-3 py-1.5 text-sm font-medium">
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Información del evento + mapa de ubicación */}
      <section aria-labelledby="info-evento" className="mb-10">
        <h2 id="info-evento" className="mb-4 text-h2 font-semibold">Información del evento</h2>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <GlassCard as="dl" className="grid grid-cols-1 gap-3">
            <div><dt className="inline text-text-muted">Evento:</dt> <dd className="ml-1 inline">BTS WORLD TOUR &quot;ARIRANG&quot; IN SANTIAGO</dd></div>
            <div>
              <dt className="inline text-text-muted">Fechas:</dt>{" "}
              <dd className="ml-1 inline">
                Viernes <time dateTime="2026-10-16">16</time> y Sábado{" "}
                <time dateTime="2026-10-17">17 de Octubre, 2026</time>
              </dd>
            </div>
            <div><dt className="inline text-text-muted">Recinto:</dt> <dd className="ml-1 inline">Estadio Nacional Julio Martínez Prádanos</dd></div>
            <div><dt className="inline text-text-muted">Capacidad:</dt> <dd className="ml-1 inline">~47,000 personas</dd></div>
            <div><dt className="inline text-text-muted">Dirección:</dt> <dd className="ml-1 inline">Av. Grecia 2001, Ñuñoa, Santiago</dd></div>
          </GlassCard>

          <figure className="glass-card overflow-hidden rounded-card p-2">
            <SmartImage
              src={MAP_IMAGE}
              alt="Mapa de ubicación del Estadio Nacional Julio Martínez Prádanos en Ñuñoa, Santiago de Chile"
              rounded="rounded-xl"
            />
            <figcaption className="px-2 pt-2 text-center text-sm text-text-muted">
              📍 Cómo llegar al Estadio Nacional · Av. Grecia 2001, Ñuñoa, Santiago
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Mapa + zonas + selección */}
      <section aria-labelledby="zonas-precios" className="mb-10">
        <h2 id="zonas-precios" className="mb-4 text-h2 font-semibold">Zonas y precios</h2>
        <EntradasView zones={zones} />
      </section>

      {/* FAQ visible (= JSON-LD FAQPage) */}
      <section aria-labelledby="faq-entradas" className="mb-12">
        <h2 id="faq-entradas" className="mb-4 text-h2 font-semibold">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-3">
          {ENTRADAS_FAQ.map((f) => (
            <details key={f.question} className="glass-card rounded-card p-4">
              <summary className="cursor-pointer font-medium">{f.question}</summary>
              <p className="mt-2 text-text-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section aria-labelledby="alertas-entradas" className="rounded-card glass-card p-6 text-center">
        <h2 id="alertas-entradas" className="text-h3 font-semibold">¿Quieres saber si aparecen más entradas?</h2>
        <p className="mb-4 text-text-muted">Activa alertas 💜</p>
        <div className="flex justify-center">
          <NewsletterForm source="entradas_banner" />
        </div>
      </section>
    </main>
  );
}
