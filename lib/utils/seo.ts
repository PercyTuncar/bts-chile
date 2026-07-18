// Helpers de SEO / JSON-LD (structured data) — PRD §15.
// Los datos se inyectan server-side con <JsonLd> para que Google los lea sin JS.
// Reglas de oro (§15): el markup refleja el contenido visible; nunca inventar ratings/precios.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://btschile.com";

export type JsonLdData = Record<string, unknown>;

/** URL absoluta a partir de una ruta relativa. */
export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Serializa JSON-LD de forma segura para dangerouslySetInnerHTML. */
export function jsonLdString(data: JsonLdData | JsonLdData[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// --------------------------------------------------------------------------
// Nodos reutilizables del @graph
// --------------------------------------------------------------------------

/** Organization (#organization) — PRD §15.1. Campos obligatorios: name, url, logo. */
export function buildOrganization(): JsonLdData {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "BTS Chile",
    legalName: "BTS Chile Comunidad ARMY",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/logo.png`,
      contentUrl: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
      caption: "BTS Chile",
    },
    image: { "@id": `${SITE_URL}/#logo` },
    foundingDate: "2026",
    description:
      "Comunidad oficial de fans de BTS (방탄소년단) en Chile. Venta verificada de entradas para el BTS WORLD TOUR ARIRANG en el Estadio Nacional de Santiago.",
    knowsAbout: [
      "BTS",
      "K-pop",
      "방탄소년단",
      "ARMY",
      "Conciertos Chile",
      "BTS WORLD TOUR ARIRANG",
    ],
    areaServed: { "@type": "Country", name: "Chile", identifier: "CL" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contacto@btschile.com",
        availableLanguage: ["Spanish"],
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "entradas@btschile.com",
        availableLanguage: ["Spanish"],
      },
    ],
    sameAs: [
      "https://www.instagram.com/btschile",
      "https://twitter.com/btschile",
      "https://www.facebook.com/btschile",
      "https://www.tiktok.com/@btschile",
      "https://www.youtube.com/@btschile",
    ],
  };
}

/** WebSite (#website) con SearchAction (UX interna; SearchBox retirado por Google). §15.1 */
export function buildWebsite(): JsonLdData {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "BTS Chile",
    alternateName: ["btschile.com", "BTS Chile Oficial", "ARMY Chile"],
    description:
      "La comunidad oficial de ARMY en Chile. Entradas BTS Chile 2026 verificadas, noticias, membresía ARMY Boom v4 y tienda de merchandise.",
    inLanguage: "es-CL",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/buscar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** BreadcrumbList — PRD §15 (todas las páginas). */
export function buildBreadcrumbList(items: BreadcrumbItem[]): JsonLdData {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Envuelve nodos en un documento @graph completo. */
export function buildGraph(nodes: JsonLdData[]): JsonLdData {
  return { "@context": "https://schema.org", "@graph": nodes };
}
