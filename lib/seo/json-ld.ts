import type { News } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.btschile.com";

/**
 * Genera el JSON-LD de tipo NewsArticle para un artículo de noticias.
 * Cumple con los requisitos de Google News y Top Stories.
 *
 * Documentación: https://developers.google.com/search/docs/appearance/structured-data/article
 */
export function generateNewsArticleLD(news: News) {
  // Usar headline específico o el título (máx 110 caracteres)
  const headline = (news.headline || news.title).slice(0, 110);

  // Asegurar que las fechas tengan timezone (crítico para Google News)
  const datePublished = news.publishedAt
    ? new Date(news.publishedAt.toMillis()).toISOString()
    : new Date().toISOString();

  const dateModified = news.dateModified
    ? new Date(news.dateModified.toMillis()).toISOString()
    : datePublished;

  // Array de imágenes con las 3 proporciones requeridas (16:9, 4:3, 1:1)
  const images: string[] = [];

  // Hero 16:9 (ya la tienes)
  if (news.featuredImageURL) {
    images.push(news.featuredImageURL);
  }

  // Cuadrada 1:1 (obligatoria para Top Stories con imagen grande)
  if (news.seoImageSquareURL) {
    images.push(news.seoImageSquareURL);
  }

  // Si no tienes 4:3, puedes usar la 16:9 de nuevo o crearla
  // Google acepta duplicados si no tienes todas las proporciones

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/noticias/${news.slug}`,
    },
    headline,
    description: news.excerpt,
    image: images.length > 0 ? images : undefined,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: news.authorName,
      url: news.authorUrl || `${SITE_URL}/autor/${news.authorUid}`,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Army Chile",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-600x60.png`,
        width: 600,
        height: 60,
      },
    },
    articleSection: news.category,
    keywords: news.tags.join(", "),
    inLanguage: "es-CL",
  };
}

/**
 * Genera el JSON-LD de tipo NewsMediaOrganization para el sitio.
 * Este debe publicarse UNA VEZ en el home o página /sobre-nosotros.
 *
 * IMPORTANTE: Los valores de name y logo deben ser IDÉNTICOS byte a byte
 * en todos los artículos y en esta organización.
 */
export function generateNewsMediaOrganizationLD() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "Army Chile",
    alternateName: "ArmyChile",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo-600x60.png`,
      width: 600,
      height: 60,
    },
    description:
      "La comunidad oficial de ARMY en Chile. Noticias, eventos, entradas y contenido exclusivo de BTS y K-pop.",
    sameAs: [
      "https://twitter.com/armychile",
      "https://instagram.com/armychile",
      "https://facebook.com/armychile",
      // Agrega más redes sociales aquí
    ],
    foundingDate: "2018-01-01", // Ajusta a la fecha real
    address: {
      "@type": "PostalAddress",
      addressCountry: "CL",
      addressRegion: "Región Metropolitana",
    },
    areaServed: {
      "@type": "Country",
      name: "Chile",
    },
    // Opcional pero recomendado para Google News approval
    ethicsPolicy: `${SITE_URL}/etica`,
    diversityPolicy: `${SITE_URL}/diversidad`,
    masthead: `${SITE_URL}/sobre-nosotros`,
  };
}

/**
 * Genera el JSON-LD de tipo BreadcrumbList para la página de un artículo.
 */
export function generateBreadcrumbLD(news: News) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Noticias",
        item: `${SITE_URL}/noticias`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: news.title,
        item: `${SITE_URL}/noticias/${news.slug}`,
      },
    ],
  };
}

/**
 * Genera todo el JSON-LD necesario para una página de artículo.
 * Incluye NewsArticle y BreadcrumbList en un @graph.
 */
export function generateArticlePageLD(news: News) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      generateNewsArticleLD(news),
      generateBreadcrumbLD(news),
    ],
  };
}

/**
 * Valida que el JSON-LD sea válido antes de publicar.
 * Retorna array de errores (vacío si todo está bien).
 */
export function validateNewsArticleLD(news: News): string[] {
  const errors: string[] = [];

  // Headline ≤ 110 caracteres
  const headline = news.headline || news.title;
  if (headline.length > 110) {
    errors.push(`Headline muy largo: ${headline.length}/110 caracteres`);
  }

  // Fecha con timezone
  if (news.publishedAt) {
    const dateStr = new Date(news.publishedAt.toMillis()).toISOString();
    if (!dateStr.includes("Z") && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
      errors.push("publishedAt debe tener timezone (Z o +/-HH:MM)");
    }
  }

  // Al menos una imagen
  if (!news.featuredImageURL && !news.seoImageSquareURL) {
    errors.push("Se requiere al menos una imagen (hero o cuadrada)");
  }

  // Autor con URL
  if (!news.authorName) {
    errors.push("authorName es obligatorio");
  }

  // Tags no vacíos
  if (!news.tags || news.tags.length === 0) {
    errors.push("Se requiere al menos un tag/keyword");
  }

  return errors;
}
