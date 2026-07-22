import { Bell, CalendarDays, CreditCard, LockKeyhole, MapPin, ShieldCheck, Ticket, UsersRound } from "lucide-react";
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
const MAP_IMAGE =
  "https://res.cloudinary.com/dz1qivt7m/image/upload/v1775645342/mapa_chile_taxr0b.jpg";
const DATE_PUBLISHED = "2026-04-07T13:00:00-03:00"; // salida a la venta
const DATE_MODIFIED = "2026-07-22";

export const metadata: Metadata = {
  title: { absolute: "Entradas BTS Chile 2026 | Estadio Nacional, Santiago" },
  description:
    "Compra entradas para BTS WORLD TOUR ARIRANG en Santiago: tres fechas en el Estadio Nacional Julio Martínez Prádanos, Ñuñoa. Consulta zonas, precios y disponibilidad.",
  alternates: { canonical: `${SITE_URL}/entradas` },
  openGraph: {
    type: "website",
    siteName: "BTS Chile",
    title: "Entradas BTS Chile 2026 | Estadio Nacional, Santiago",
    description:
      "BTS WORLD TOUR ARIRANG en Santiago: 14, 16 y 17 de octubre de 2026 en el Estadio Nacional Julio Martínez Prádanos.",
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
    title: "Entradas BTS Chile 2026 | Estadio Nacional, Santiago",
    description:
      "BTS WORLD TOUR ARIRANG en Santiago: 14, 16 y 17 de octubre de 2026 en el Estadio Nacional Julio Martínez Prádanos.",
    images: [OG_IMAGE],
  },
};

const EVENT_DATE = "2026-10-14T20:00:00-03:00";

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

  const jsonLd = buildGraph([
    buildOrganization(),
    buildWebsite(),
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/entradas#webpage`,
      url: `${SITE_URL}/entradas`,
      name: "Entradas BTS Chile 2026 — Estadio Nacional",
       description:
         "Compra entradas para el BTS WORLD TOUR ARIRANG en el Estadio Nacional Julio Martínez Prádanos de Santiago: 14, 16 y 17 de octubre de 2026.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/entradas#event-series` },
       mainEntity: { "@id": `${SITE_URL}/entradas#event-series` },
       breadcrumb: { "@id": `${SITE_URL}/entradas#breadcrumb` },
      inLanguage: "es-CL",
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "EventSeries",
      "@id": `${SITE_URL}/entradas#event-series`,
      name: 'BTS WORLD TOUR "ARIRANG" IN SANTIAGO 2026',
      description:
        "BTS llega a Santiago con tres fechas del BTS WORLD TOUR ARIRANG en el Estadio Nacional: 14, 16 y 17 de octubre de 2026.",
      url: `${SITE_URL}/entradas`,
      startDate: "2026-10-14",
      endDate: "2026-10-17",
      location: {
        "@type": "Place",
        name: "Estadio Nacional Julio Martínez Prádanos",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. Grecia 2001",
          addressLocality: "Ñuñoa",
          addressRegion: "Región Metropolitana",
          postalCode: "7750000",
          addressCountry: "CL",
        },
      },
      performer: {
        "@type": "MusicGroup",
        name: "BTS",
        alternateName: ["방탄소년단", "Bangtan Sonyeondan", "Beyond The Scene"],
      },
      inLanguage: "es-CL",
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
       <section aria-labelledby="entradas-titulo" className="aurora ticket-hero mb-10 overflow-hidden rounded-card px-6 py-12 text-center sm:px-10 sm:py-16">
         <div className="relative z-10">
           <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand">BTS Chile 2026</p>
           <h1 id="entradas-titulo" className="text-h1 font-bold leading-[1.1] tracking-tight sm:text-display">
             Entradas BTS Chile 2026 — Estadio Nacional
           </h1>
           <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
              BTS WORLD TOUR &quot;ARIRANG&quot; IN SANTIAGO ·{" "}
              <time dateTime="2026-10-14">14</time>,{" "}
              <time dateTime="2026-10-16">16</time> y{" "}
              <time dateTime="2026-10-17">17 de octubre de 2026</time>
           </p>
           <div className="mt-8 flex justify-center">
             <CountdownTimer targetDate={EVENT_DATE} className="justify-center" />
           </div>
           <div className="mt-7 flex flex-wrap justify-center gap-2.5">
             <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-2 text-sm font-medium"><LockKeyhole className="h-4 w-4 text-brand" aria-hidden />100% Seguro</span>
             <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-brand" aria-hidden />Vendedor Verificado</span>
             <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-2 text-sm font-medium"><CreditCard className="h-4 w-4 text-brand" aria-hidden />Pago en Cuotas</span>
           </div>
         </div>
       </section>

       {/* Información del evento + mapa de ubicación */}
       <section aria-labelledby="info-evento" className="mb-12">
         <div className="mb-5 flex items-end justify-between gap-4">
           <div>
             <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Antes de comprar</p>
             <h2 id="info-evento" className="mt-1 text-h2 font-semibold">Información del evento</h2>
           </div>
         </div>
         <div className="grid items-stretch gap-5 lg:grid-cols-2">
           <GlassCard as="dl" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
             <div className="rounded-xl bg-[color-mix(in_srgb,var(--brand-soft)_60%,transparent)] p-3 sm:col-span-2"><dt className="flex items-center gap-2 text-sm text-text-muted"><Ticket className="h-4 w-4 text-brand" aria-hidden />Evento:</dt> <dd className="mt-1 font-semibold">BTS WORLD TOUR &quot;ARIRANG&quot; IN SANTIAGO</dd></div>
             <div className="rounded-xl bg-[color-mix(in_srgb,var(--brand-soft)_60%,transparent)] p-3 sm:col-span-2"><dt className="flex items-center gap-2 text-sm text-text-muted"><CalendarDays className="h-4 w-4 text-brand" aria-hidden />Fechas:</dt> <dd className="mt-1">Miércoles <time dateTime="2026-10-14">14</time>, Viernes <time dateTime="2026-10-16">16</time> y Sábado <time dateTime="2026-10-17">17 de octubre de 2026</time></dd></div>
             <div className="rounded-xl bg-[color-mix(in_srgb,var(--brand-soft)_60%,transparent)] p-3"><dt className="flex items-center gap-2 text-sm text-text-muted"><MapPin className="h-4 w-4 text-brand" aria-hidden />Recinto:</dt> <dd className="mt-1 font-medium">Estadio Nacional Julio Martínez Prádanos</dd></div>
             <div className="rounded-xl bg-[color-mix(in_srgb,var(--brand-soft)_60%,transparent)] p-3"><dt className="flex items-center gap-2 text-sm text-text-muted"><UsersRound className="h-4 w-4 text-brand" aria-hidden />Capacidad:</dt> <dd className="mt-1 font-medium">~47,000 personas</dd></div>
             <div className="rounded-xl bg-[color-mix(in_srgb,var(--brand-soft)_60%,transparent)] p-3 sm:col-span-2"><dt className="flex items-center gap-2 text-sm text-text-muted"><MapPin className="h-4 w-4 text-brand" aria-hidden />Dirección:</dt> <dd className="mt-1 font-medium">Av. Grecia 2001, Ñuñoa, Santiago</dd></div>
           </GlassCard>

           <figure className="glass-card overflow-hidden rounded-card p-2 shadow-[0_12px_32px_color-mix(in_srgb,var(--text)_10%,transparent)]">
             <SmartImage src={MAP_IMAGE} alt="Mapa de ubicación del Estadio Nacional Julio Martínez Prádanos en Ñuñoa, Santiago de Chile" rounded="rounded-xl" />
             <figcaption className="flex items-center justify-center gap-2 px-2 py-3 text-center text-sm font-medium text-text-muted"><MapPin className="h-4 w-4 shrink-0 text-brand" aria-hidden />Cómo llegar al Estadio Nacional · Av. Grecia 2001, Ñuñoa, Santiago</figcaption>
           </figure>
         </div>
       </section>

       {/* Mapa + zonas + selección */}
       <section aria-labelledby="zonas-precios" className="mb-14 border-y border-[color-mix(in_srgb,var(--text)_9%,transparent)] py-10 sm:py-12">
         <div className="mb-6">
           <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Compra tus entradas</p>
           <h2 id="zonas-precios" className="mt-1 text-h2 font-semibold">Zonas y precios</h2>
         </div>
         <EntradasView zones={zones} />
       </section>

       {/* FAQ visible (= JSON-LD FAQPage) */}
       <section aria-labelledby="faq-entradas" className="mb-14">
         <div className="mb-5">
           <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Resuelve tus dudas</p>
           <h2 id="faq-entradas" className="mt-1 text-h2 font-semibold">Preguntas frecuentes</h2>
         </div>
         <div className="mx-auto flex max-w-4xl flex-col gap-3">
           {ENTRADAS_FAQ.map((f) => (
             <details key={f.question} className="group rounded-card border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-surface p-0 transition hover:border-[color-mix(in_srgb,var(--brand)_38%,transparent)] open:border-[color-mix(in_srgb,var(--brand)_48%,transparent)]">
               <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold marker:content-none">
                 {f.question}
                 <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition-transform duration-200 group-open:rotate-45" aria-hidden>+</span>
               </summary>
               <p className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] px-5 py-4 leading-relaxed text-text-muted">{f.answer}</p>
             </details>
           ))}
         </div>
       </section>

       {/* Newsletter */}
       <section aria-labelledby="alertas-entradas" className="relative overflow-hidden rounded-card border border-[color-mix(in_srgb,var(--brand)_28%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-soft)_90%,transparent),color-mix(in_srgb,var(--surface)_88%,transparent))] p-6 text-center sm:p-8">
         <div className="relative z-10">
           <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-brand text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--brand)_35%,transparent)]"><Bell className="h-5 w-5" aria-hidden /></span>
           <h2 id="alertas-entradas" className="text-h3 font-semibold">¿Quieres saber si aparecen más entradas?</h2>
           <p className="mb-5 text-text-muted">Activa alertas 💜</p>
           <div className="mx-auto flex max-w-xl justify-center"><NewsletterForm source="entradas_banner" /></div>
         </div>
       </section>

       <article aria-labelledby="guia-entradas-bts" className="mt-16 border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] pt-12">
          <div className="mx-auto max-w-3xl space-y-10 text-[16px] leading-7 sm:leading-8">
          <header className="rounded-card border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_76%,transparent)] p-6 sm:p-8">
            <h2 id="guia-entradas-bts" className="text-h2 font-semibold">
             Entradas BTS Chile 2026: BTS en Santiago en el Estadio Nacional
           </h2>
           <div className="mt-4 space-y-4 text-text-muted">
             <p>
               El ARMY chileno tiene una cita imperdible. El BTS World Tour ARIRANG 2026 aterriza en Santiago con tres fechas en el mítico Estadio Nacional Julio Martínez Prádanos, en la comuna de Ñuñoa. Si estás buscando entradas BTS Chile 2026 para ver en vivo a RM, Jin, Suga, J-Hope, Jimin, V y Jung Kook, aquí tienes toda la información sobre el recinto, el transporte y cómo prepararte para el gran día.
             </p>
             <p>
               BTS, la banda surcoreana surgida de BigHit Music (hoy HYBE), vuelve a Latinoamérica con un espectáculo que promete emocionar a uno de los fandoms más fieles del continente. Chile, que ya ha recibido a la banda en el pasado, se prepara para tres noches inolvidables.
             </p>
           </div>
         </header>

         <section aria-labelledby="estadio-nacional" className="space-y-4">
           <h3 id="estadio-nacional" className="text-h3 font-semibold">El Estadio Nacional: el Coloso de Ñuñoa</h3>
           <div className="space-y-4 text-text-muted">
             <p>
               El Estadio Nacional Julio Martínez Prádanos, conocido cariñosamente como el &quot;Coloso de Ñuñoa&quot;, es el principal recinto deportivo de Chile. Se ubica dentro del Parque Deportivo Estadio Nacional, un complejo de cerca de 64 hectáreas en la comuna de Ñuñoa, en Av. Grecia 2001, Santiago. Es el estadio más grande del país, con una capacidad oficial de aproximadamente 48.665 espectadores en su configuración deportiva.
             </p>
             <p>
               Además de ser la casa de la Roja, el Estadio Nacional es el gran escenario de los conciertos masivos en Chile, habiendo recibido a numerosos artistas internacionales de primer nivel. Su ubicación central y su excelente conexión de transporte lo convierten en el lugar ideal para un evento de la magnitud del BTS ARIRANG 2026 en Santiago.
             </p>
           </div>
         </section>

         <section aria-labelledby="como-llegar" className="space-y-4">
           <h3 id="como-llegar" className="text-h3 font-semibold">Cómo llegar al Estadio Nacional en Metro</h3>
           <p className="text-text-muted">Una de las grandes ventajas del recinto es que cuenta con su propia estación de Metro, diseñada para grandes flujos de personas.</p>
           <ul className="list-disc space-y-3 pl-6 text-text-muted marker:text-brand">
             <li><strong className="text-text">Metro Línea 6 (morada):</strong> la estación Estadio Nacional te deja prácticamente en la puerta del recinto. Se ubica en la Av. Pedro de Valdivia a la altura de Av. Grecia, con salidas directas hacia el estadio. Es la opción más cómoda y rápida.</li>
             <li><strong className="text-text">Metro Línea 3:</strong> puedes usar la Línea 3 y combinar hacia la Línea 6 para acercarte al sector de Ñuñoa. La red de Metro de Santiago está muy interconectada, lo que facilita el acceso desde casi cualquier punto de la ciudad.</li>
             <li><strong className="text-text">Combinaciones útiles:</strong> la Línea 6 conecta con la Línea 1 en Los Leones, con la Línea 3 en Ñuñoa y con la Línea 5 en Ñuble, entre otras. Desde el centro, una ruta recomendada es tomar la Línea 5 y cambiar a la Línea 6 en Ñuble.</li>
           </ul>
           <p className="text-text-muted">También hay recorridos de buses de la Red Metropolitana de Movilidad que circulan por Av. Grecia y Av. Pedro de Valdivia. Si vienes en auto, considera que el estacionamiento es limitado y las calles del entorno se saturan; el Metro sigue siendo la mejor alternativa.</p>
         </section>

         <section aria-labelledby="santiago-nunoa" className="space-y-4">
           <h3 id="santiago-nunoa" className="text-h3 font-semibold">El entorno y la ciudad de Santiago</h3>
           <p className="text-text-muted">
             Ñuñoa es una de las comunas más queridas de Santiago, con ambiente residencial, plazas, cafés y una vida cultural activa. Alrededor del estadio encontrarás el Museo Patrimonial del Estadio Nacional, el velódromo y otras instalaciones deportivas. Santiago, la capital chilena rodeada por la cordillera de los Andes, ofrece atractivos como el cerro San Cristóbal, el barrio Lastarria y el barrio Bellavista, ideales para complementar tu visita.
           </p>
         </section>

         <section aria-labelledby="fechas-bts-arirang" className="space-y-4">
           <h3 id="fechas-bts-arirang" className="text-h3 font-semibold">Fechas del BTS ARIRANG 2026 en Santiago</h3>
           <p className="text-text-muted">El BTS en Santiago tendrá tres fechas confirmadas en el Estadio Nacional:</p>
           <ol className="list-decimal space-y-2 pl-6 text-text-muted marker:font-semibold marker:text-brand">
             <li><time dateTime="2026-10-14">Miércoles 14 de octubre de 2026</time></li>
             <li><time dateTime="2026-10-16">Viernes 16 de octubre de 2026</time></li>
             <li><time dateTime="2026-10-17">Sábado 17 de octubre de 2026</time></li>
           </ol>
           <p className="text-text-muted">
             Sobre las canciones, el ARMY sueña con escuchar clásicos como &quot;Idol&quot;, &quot;Boy With Luv&quot;, &quot;Dynamite&quot; o &quot;Spring Day&quot;, junto a posibles interpretaciones en solitario. Conviene recordar que el setlist definitivo no ha sido oficializado por HYBE, así que todo lo que se comenta al respecto pertenece al terreno de la expectativa y el rumor, parte natural de la ilusión antes de la gira.
           </p>
         </section>

         <section aria-labelledby="consejos-concierto" className="space-y-4">
           <h3 id="consejos-concierto" className="text-h3 font-semibold">Consejos para asistir al concierto</h3>
           <ul className="list-disc space-y-3 pl-6 text-text-muted marker:text-brand">
             <li><strong className="text-text">Llega con anticipación:</strong> las puertas abren varias horas antes del show. Llegar temprano facilita el ingreso y te da tiempo para ubicarte tranquilo.</li>
             <li><strong className="text-text">Qué llevar:</strong> tu entrada, carnet de identidad, agua, una casaca ligera (octubre en Santiago tiene noches frescas) y tu ARMY Bomb para sumarte al mar de luces.</li>
             <li><strong className="text-text">Comunidad ARMY:</strong> el fandom chileno es reconocido por su organización y calidez. Son habituales los proyectos de fans, el intercambio de &quot;photocards&quot; y las coreografías coordinadas por tribuna.</li>
             <li><strong className="text-text">Seguridad:</strong> cuida tus pertenencias y sigue las indicaciones del personal para disfrutar de una jornada segura.</li>
           </ul>
           <p className="text-text-muted">Ver a BTS en Chile en el Estadio Nacional será un recuerdo para toda la vida. Organiza tu ruta en Metro Línea 6, prepara tu ARMY Bomb y vive el BTS World Tour ARIRANG 2026 en Santiago junto a miles de fans.</p>
          </section>
          </div>
        </article>
    </main>
  );
}
