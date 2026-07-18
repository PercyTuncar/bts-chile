import type { Metadata } from "next";
import { CartWidget } from "@/components/tienda/CartWidget";
import { TiendaView } from "@/components/tienda/TiendaView";
import { toProductCard, type ProductCardItem } from "@/components/tienda/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedProducts } from "@/lib/firestore/products";
import { buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Tienda BTS Chile — Merch Oficial: Ropa, Peluches y Álbumes | btschile.com",
  },
  description:
    "💜 Merchandise oficial de BTS en Chile: camisetas, hoodies, peluches, álbumes, posters y accesorios. Envío a todo Chile. Pago en cuotas. Descuentos para miembros ARMY.",
  alternates: { canonical: `${SITE_URL}/tienda` },
  openGraph: {
    type: "website",
    title: "Tienda BTS Chile — Merchandise Oficial 💜",
    url: `${SITE_URL}/tienda`,
    images: [`${SITE_URL}/og-tienda.jpg`],
    locale: "es_CL",
  },
};

export default async function TiendaPage() {
  let items: ProductCardItem[] = [];
  try {
    const products = await getPublishedProducts({ max: 100 });
    items = products.map(toProductCard);
  } catch (err) {
    console.warn("tienda: Firestore no disponible", err);
  }

  const jsonLd = buildGraph([
    {
      "@type": "OnlineStore",
      "@id": `${SITE_URL}/tienda#store`,
      name: "Tienda BTS Chile — Merchandise Oficial",
      url: `${SITE_URL}/tienda`,
      description:
        "Compra merchandise oficial de BTS en Chile: camisetas, peluches, álbumes, posters y accesorios. Envío a todo Chile. Pago en cuotas.",
      image: `${SITE_URL}/og-tienda.jpg`,
      currenciesAccepted: "USD",
      paymentAccepted: "PayPal, Mercado Pago, Transferencia Bancaria",
      priceRange: "$5 - $200 USD",
      areaServed: { "@type": "Country", name: "Chile", identifier: "CL" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Catálogo BTS Chile Merch",
        itemListElement: [
          { "@type": "OfferCatalog", name: "Ropa BTS", description: "Camisetas, hoodies y chaquetas con diseños de BTS" },
          { "@type": "OfferCatalog", name: "Accesorios BTS", description: "Llaveros, bolsas, pins y más" },
          { "@type": "OfferCatalog", name: "Peluches BTS", description: "Peluches y figuras de los miembros" },
          { "@type": "OfferCatalog", name: "Álbumes BTS", description: "Álbumes físicos y ediciones especiales" },
          { "@type": "OfferCatalog", name: "Posters BTS", description: "Posters y decoración en distintos tamaños" },
        ],
      },
      breadcrumb: buildBreadcrumbList([
        { name: "Inicio", path: "/" },
        { name: "Tienda BTS Chile", path: "/tienda" },
      ]),
    },
  ]);

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <JsonLd data={jsonLd} />
      <header className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Tienda BTS Chile — Merchandise Oficial</h1>
        <p className="mt-1 text-text-muted">
          Ropa, peluches, álbumes y más. Descuentos para miembros ARMY 💜
        </p>
      </header>
      <TiendaView items={items} />
      <CartWidget />
    </main>
  );
}
