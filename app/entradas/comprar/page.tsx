import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutView } from "@/components/entradas/CheckoutView";
import { JsonLd } from "@/components/seo/JsonLd";
import { GlassCard } from "@/components/ui/GlassCard";
import { getTicket } from "@/lib/firestore/tickets";
import { DEFAULT_ZONES, zoneStatus, type ZoneData } from "@/lib/entradas/zones";
import { computeTicketPricing, formatUSD } from "@/lib/utils/formatters";
import { buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";
import type { EventDate, TicketPaymentLinks } from "@/types";

// Página transaccional → noindex (§6.3). Excluida del sitemap; en disallow en robots (F13).
export const metadata: Metadata = {
  title: "Comprar entradas BTS Chile 2026",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{
  zoneId?: string;
  qty?: string;
  installments?: string;
  date?: string;
}>;

function clampInt(value: string | undefined, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function parseDate(value: string | undefined): EventDate {
  return value === "2026-10-16" || value === "2026-10-17" || value === "both"
    ? value
    : "both";
}

export default async function ComprarPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const quantity = clampInt(params.qty, 1, 3, 1);
  const installments = clampInt(params.installments, 1, 3, 1);
  const eventDate = parseDate(params.date);

  // Resolver zona: Firestore → fallback a datos canónicos.
  let zone: ZoneData | null = null;
  let paymentLinks: TicketPaymentLinks = {};
  if (params.zoneId) {
    try {
      const ticket = await getTicket(params.zoneId);
      if (ticket) {
        zone = {
          zoneId: ticket.zoneId || params.zoneId,
          zoneName: ticket.zoneName,
          zoneNumber: ticket.zoneNumber,
          priceUSD: ticket.priceUSD,
          stock: ticket.stock,
          isActive: ticket.isActive,
          isSoldOut: ticket.isSoldOut,
          description: ticket.description,
          availableDates: ticket.availableDates,
          mapCoordinates: ticket.mapCoordinates,
        };
        paymentLinks = ticket.paymentLinks ?? {};
      }
    } catch {
      /* fallback abajo */
    }
    if (!zone) zone = DEFAULT_ZONES.find((z) => z.zoneId === params.zoneId) ?? null;
  }

  if (!zone || zoneStatus(zone) === "soldout") {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="mb-3 text-h2 font-semibold">Zona no disponible</h1>
        <p className="mb-6 text-text-muted">
          La zona seleccionada no existe o está agotada. Vuelve a elegir en la ticketera.
        </p>
        <Link href="/entradas" className="text-brand underline">
          Volver a /entradas
        </Link>
      </main>
    );
  }

  const pricing = computeTicketPricing(zone.priceUSD, quantity, installments);

  const jsonLd = buildGraph([
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/entradas/comprar#webpage`,
      url: `${SITE_URL}/entradas/comprar`,
      name: "Comprar Entradas BTS Chile 2026 — Pago Seguro | btschile.com",
      description:
        "Completa tu compra de entradas BTS WORLD TOUR ARIRANG. Revisa el resumen, ingresa tus datos y elige PayPal, Mercado Pago o transferencia bancaria.",
      inLanguage: "es-CL",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      breadcrumb: buildBreadcrumbList([
        { name: "Inicio", path: "/" },
        { name: "Entradas", path: "/entradas" },
        { name: "Comprar", path: "/entradas/comprar" },
      ]),
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/entradas/comprar#service`,
      name: "Venta de Entradas BTS Chile — Mercado Secundario Verificado",
      provider: { "@type": "Organization", name: "BTS Chile", url: SITE_URL },
      description:
        "Venta verificada de entradas para el BTS WORLD TOUR ARIRANG en Santiago. Entrega digital por email en 24-48 horas hábiles.",
      areaServed: { "@type": "Country", name: "Chile" },
      serviceType: "Ticket Resale",
      termsOfService: `${SITE_URL}/terminos`,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Entradas disponibles BTS Chile 2026",
        itemListElement: [
          {
            "@type": "Offer",
            name: `${zone.zoneName} — ${quantity} ${quantity === 1 ? "entrada" : "entradas"}`,
            price: String(pricing.subtotalUSD),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        ],
      },
    },
  ]);

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <JsonLd data={jsonLd} />

      <header className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Comprar entradas BTS Chile 2026</h1>
        <p className="mt-1 text-text-muted">
          {zone.zoneName} · {formatUSD(zone.priceUSD)} · Total estimado {formatUSD(pricing.totalUSD)}
        </p>
      </header>

      <CheckoutView
        zone={zone}
        quantity={quantity}
        installments={installments}
        eventDate={eventDate}
        paymentLinks={paymentLinks}
      />

      <p className="mt-8 text-center text-sm text-text-muted">
        <GlassCard as="span" className="inline-block px-4 py-2">
          🔒 Compra 100% segura · Entrega por email en 24-48 horas hábiles
        </GlassCard>
      </p>
    </main>
  );
}
