import type { Metadata } from "next";
import { PricingCards } from "@/components/membresia/PricingCards";
import { TrialBadge } from "@/components/membresia/TrialBadge";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";
import { TIERS } from "@/lib/membership";

// SEO — PRD §10.8, §15.9.
export const metadata: Metadata = {
  title: "Membresía ARMY Boom v4 — 1 Mes Gratis, luego $1/mes",
  description:
    "💜 Únete a la comunidad ARMY Chile: 1 mes gratis para publicar posts y luego solo $1 USD/mes. Acceso anticipado a entradas, descuentos en la tienda y contenido exclusivo.",
  alternates: { canonical: `${SITE_URL}/membresia` },
  openGraph: {
    title: "Membresía ARMY Boom v4 💜",
    url: `${SITE_URL}/membresia`,
    images: [`${SITE_URL}/og-membresia.jpg`],
    locale: "es_CL",
    type: "website",
  },
};

const COMPARISON_ROWS: { label: string; values: [string, string, string, string] }[] = [
  { label: "Publicar en comunidad", values: ["—", "✓", "✓", "✓"] },
  { label: "Descuento en tienda", values: ["—", "5%", "10%", "15%"] },
  { label: "Acceso anticipado a entradas", values: ["—", "—", "12h antes", "Prioridad"] },
  { label: "Contenido exclusivo /premium", values: ["—", "—", "✓", "✓"] },
  { label: "Newsletter", values: ["—", "Mensual", "Mensual", "VIP semanal"] },
  { label: "Sorteo mensual de merch", values: ["—", "—", "—", "✓"] },
];

export default function MembresiaPage() {
  const offers = TIERS.filter((t) => t.key !== "free").map((t) => ({
    "@type": "Offer",
    name: t.name,
    price: String(t.monthlyUSD),
    priceCurrency: "USD",
    url: `${SITE_URL}/membresia`,
    availability: "https://schema.org/InStock",
    category: "Suscripción mensual",
    eligibleDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
  }));

  const jsonLd = buildGraph([
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/membresia#page`,
      url: `${SITE_URL}/membresia`,
      name: "Membresía ARMY Boom v4 — Beneficios Exclusivos | btschile.com",
      description:
        "Únete a la membresía ARMY Boom v4: 1 mes gratis y luego desde $1 USD/mes. Acceso anticipado a entradas, descuentos y contenido exclusivo.",
      inLanguage: "es-CL",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      breadcrumb: buildBreadcrumbList([
        { name: "Inicio", path: "/" },
        { name: "Membresía", path: "/membresia" },
      ]),
    },
    {
      "@type": "Product",
      "@id": `${SITE_URL}/membresia#product`,
      name: "Membresía ARMY Boom v4",
      description:
        "Suscripción a la comunidad ARMY Chile con beneficios por tier: publicar en comunidad, descuentos en tienda, acceso anticipado a entradas y contenido exclusivo.",
      brand: { "@type": "Brand", name: "BTS Chile" },
      image: `${SITE_URL}/og-membresia.jpg`,
      offers,
    },
  ]);

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-12">
      <JsonLd data={jsonLd} />

      {/* Hero + gancho */}
      <section className="aurora mb-8 rounded-card px-6 py-12 text-center">
        <h1 className="text-h1 font-bold tracking-tight sm:text-display">
          Membresía ARMY Boom v4
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-text-muted">
          <b className="text-brand">1 mes gratis</b> para publicar en la comunidad, y luego
          solo <b className="text-brand">$1 USD/mes</b>. Beneficios exclusivos para ARMY Chile 💜
        </p>
      </section>

      <div className="mb-8">
        <TrialBadge />
      </div>

      <PricingCards />

      {/* Tabla comparativa expandible */}
      <details className="glass-card mt-12 rounded-card p-6">
        <summary className="cursor-pointer text-h3 font-semibold">
          Comparar beneficios por plan
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-text-muted">
                <th className="py-2 pr-4 font-medium">Beneficio</th>
                <th className="py-2 px-3 font-medium">Free</th>
                <th className="py-2 px-3 font-medium">Basic</th>
                <th className="py-2 px-3 font-medium">Premium</th>
                <th className="py-2 px-3 font-medium">VIP</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
                  <td className="py-2 pr-4">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="py-2 px-3 tabular-nums">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </main>
  );
}
