import { z } from "zod";
import type { NewsCategory, NewsStatus } from "@/types";

// Validación de dimensiones de imagen (se valida en el servidor con Sharp)
export const imageDimensionsSchema = z.object({
  width: z.number().min(1200, "La imagen debe tener al menos 1200px de ancho"),
  height: z.number(),
  aspectRatio: z.number().optional(),
});

// Schema para imagen hero (16:9, ≥1200px ancho)
export const heroImageSchema = z.object({
  url: z.string().url("URL de imagen inválida"),
  width: z.number().min(1200, "Mínimo 1200px de ancho"),
  height: z.number().min(675, "Mínimo 675px de alto para ratio 16:9"),
  alt: z.string().min(1, "El texto alternativo es obligatorio").max(125, "Máximo 125 caracteres"),
});

// Schema para imagen cuadrada 1:1 (Google NewsArticle)
export const squareImageSchema = z.object({
  url: z.string().url("URL de imagen inválida"),
  width: z.number().min(1200, "Mínimo 1200×1200px"),
  height: z.number().min(1200, "Mínimo 1200×1200px"),
  alt: z.string().optional(),
}).refine(
  (data) => Math.abs(data.width / data.height - 1) < 0.05,
  "La imagen debe ser cuadrada (ratio 1:1)"
);

// Schema para imagen Open Graph (1200×630px)
export const ogImageSchema = z.object({
  url: z.string().url("URL de imagen inválida"),
  width: z.number().min(1200, "Debe ser 1200px de ancho").max(1200, "Debe ser 1200px de ancho"),
  height: z.number().min(630, "Debe ser 630px de alto").max(630, "Debe ser 630px de alto"),
  alt: z.string().optional(),
});

// Schema para imagen Twitter (1200×675px, opcional)
export const twitterImageSchema = z.object({
  url: z.string().url("URL de imagen inválida"),
  width: z.number().min(1200, "Debe ser 1200px de ancho").max(1200, "Debe ser 1200px de ancho"),
  height: z.number().min(675, "Debe ser 675px de alto").max(675, "Debe ser 675px de alto"),
  alt: z.string().optional(),
}).optional();

// Schema principal de News para creación/edición
export const newsFormSchema = z.object({
  // Básicos
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  excerpt: z
    .string()
    .min(50, "La meta descripción debe tener al menos 50 caracteres")
    .max(160, "Máximo 160 caracteres para meta descripción"),
  content: z
    .string()
    .min(100, "El contenido debe tener al menos 100 caracteres")
    .refine(
      (content) => content.includes("## ") || content.includes("### "),
      "El contenido debe incluir al menos un H2 o H3 (## o ###)"
    ),

  // SEO avanzado
  metaTitle: z
    .string()
    .max(60, "Máximo 60 caracteres para meta título (Google trunca a ~580px)")
    .optional()
    .or(z.literal("")),
  headline: z
    .string()
    .max(110, "Máximo 110 caracteres para headline de NewsArticle (límite duro de Google)")
    .optional()
    .or(z.literal("")),

  // Imágenes (URLs, la validación de dimensiones se hace en el servidor)
  // Nota: Permiten string vacío porque las imágenes se suben después de la validación del form
  featuredImageURL: z.string().optional().or(z.literal("")),
  seoImageSquareURL: z.string().optional().or(z.literal("")),
  ogImageURL: z.string().optional().or(z.literal("")),
  twitterImageURL: z.string().optional().or(z.literal("")),
  imageAlt: z.string().min(1, "El texto alternativo es obligatorio").max(125, "Máximo 125 caracteres"),

  // Categoría y tags
  category: z.enum([
    "oficiales",
    "conciertos",
    "musica",
    "kpop",
    "army_chile",
  ] as const),
  tags: z.array(z.string()).max(10, "Máximo 10 tags").default([]),

  // Autor
  authorUid: z.string().min(1, "Autor obligatorio"),
  authorName: z.string().min(1, "Nombre del autor obligatorio"),
  authorUrl: z.string().url("URL del autor inválida").optional().or(z.literal("")),

  // Estado
  status: z.enum(["draft", "published", "scheduled", "archived"] as const),
  scheduledFor: z.date().nullable().optional(),
});

export type NewsFormData = z.infer<typeof newsFormSchema>;

// Schema para validación de publicación (más estricto que draft)
export const newsPublishSchema = newsFormSchema.extend({
  featuredImageURL: z.string().url("La imagen hero es obligatoria para publicar"),
  seoImageSquareURL: z.string().url("La imagen cuadrada 1:1 es obligatoria para publicar"),
  ogImageURL: z.string().url("La imagen Open Graph es obligatoria para publicar"),
  headline: z.string().min(1, "El headline es obligatorio para publicar").max(110),
  tags: z.array(z.string()).min(1, "Agrega al menos un tag para publicar").max(10, "Máximo 10 tags"),
}).refine(
  (data) => {
    // Si está publicado, debe tener todas las imágenes requeridas
    if (data.status === "published") {
      return (
        data.featuredImageURL &&
        data.seoImageSquareURL &&
        data.ogImageURL &&
        data.imageAlt &&
        data.tags.length > 0
      );
    }
    return true;
  },
  {
    message: "Para publicar se requieren: imagen hero, imagen cuadrada 1:1, imagen OG, texto alternativo y al menos 1 tag",
    path: ["status"],
  }
);

// Validación de checklist SEO (para UI)
export interface SEOChecklistItem {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  message: string;
}

export function validateSEOChecklist(data: Partial<NewsFormData>): SEOChecklistItem[] {
  const items: SEOChecklistItem[] = [];

  // 1. Longitud del título
  items.push({
    id: "title-length",
    label: "Longitud del título",
    status: !data.title
      ? "fail"
      : data.title.length > 100
      ? "fail"
      : data.title.length < 30
      ? "warning"
      : "pass",
    message: !data.title
      ? "El título es obligatorio"
      : data.title.length > 100
      ? `${data.title.length}/100 caracteres - excede el límite`
      : data.title.length < 30
      ? `${data.title.length}/100 caracteres - muy corto para SEO`
      : `${data.title.length}/100 caracteres - perfecto`,
  });

  // 2. Longitud de meta descripción
  items.push({
    id: "excerpt-length",
    label: "Meta descripción",
    status: !data.excerpt
      ? "fail"
      : data.excerpt.length > 160
      ? "fail"
      : data.excerpt.length < 120
      ? "warning"
      : "pass",
    message: !data.excerpt
      ? "La meta descripción es obligatoria"
      : data.excerpt.length > 160
      ? `${data.excerpt.length}/160 caracteres - Google la truncará`
      : data.excerpt.length < 120
      ? `${data.excerpt.length}/160 caracteres - aprovecha más espacio`
      : `${data.excerpt.length}/160 caracteres - perfecto`,
  });

  // 3. Headline para NewsArticle
  items.push({
    id: "headline-length",
    label: "Headline NewsArticle",
    status: !data.headline
      ? "warning"
      : data.headline.length > 110
      ? "fail"
      : "pass",
    message: !data.headline
      ? "Se usará el título por defecto. Recomendado crear uno específico ≤110 caracteres"
      : data.headline.length > 110
      ? `${data.headline.length}/110 caracteres - Google lo ignorará`
      : `${data.headline.length}/110 caracteres - perfecto`,
  });

  // 4. Contenido tiene H2
  items.push({
    id: "content-h2",
    label: "Estructura de contenido",
    status: !data.content
      ? "fail"
      : data.content.includes("## ") || data.content.includes("### ")
      ? "pass"
      : "fail",
    message: !data.content
      ? "El contenido es obligatorio"
      : data.content.includes("## ") || data.content.includes("### ")
      ? "Tiene H2/H3 correctos"
      : "Debe incluir al menos un H2 (## ) para buena estructura",
  });

  // 5. Imagen hero 16:9
  items.push({
    id: "hero-image",
    label: "Imagen destacada (16:9)",
    status: !data.featuredImageURL ? "fail" : "pass",
    message: !data.featuredImageURL
      ? "Imagen hero obligatoria (≥1200px ancho, ratio 16:9)"
      : "Imagen hero configurada",
  });

  // 6. Imagen cuadrada 1:1
  items.push({
    id: "square-image",
    label: "Imagen cuadrada (1:1)",
    status: !data.seoImageSquareURL ? "warning" : "pass",
    message: !data.seoImageSquareURL
      ? "Recomendada para Google NewsArticle (≥1200×1200px)"
      : "Imagen cuadrada configurada",
  });

  // 7. Imagen Open Graph
  items.push({
    id: "og-image",
    label: "Imagen Open Graph",
    status: !data.ogImageURL ? "warning" : "pass",
    message: !data.ogImageURL
      ? "Recomendada para redes sociales (1200×630px)"
      : "Imagen OG configurada",
  });

  // 8. Texto alternativo
  items.push({
    id: "image-alt",
    label: "Texto alternativo",
    status: !data.imageAlt ? "fail" : data.imageAlt.length < 10 ? "warning" : "pass",
    message: !data.imageAlt
      ? "Obligatorio para accesibilidad y SEO"
      : data.imageAlt.length < 10
      ? "Muy corto, sé más descriptivo"
      : "Texto alternativo correcto",
  });

  // 9. Tags
  items.push({
    id: "tags",
    label: "Tags/palabras clave",
    status: !data.tags || data.tags.length === 0 ? "fail" : data.tags.length < 3 ? "warning" : "pass",
    message: !data.tags || data.tags.length === 0
      ? "Agrega al menos 1 tag"
      : data.tags.length < 3
      ? `${data.tags.length} tags - agrega más para mejor categorización`
      : `${data.tags.length} tags - perfecto`,
  });

  // 10. Tiempo de lectura estimado
  const wordCount = data.content ? data.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  items.push({
    id: "reading-time",
    label: "Tiempo de lectura",
    status: wordCount < 300 ? "warning" : wordCount > 3000 ? "warning" : "pass",
    message: wordCount < 300
      ? `~${readingTime} min - contenido muy corto`
      : wordCount > 3000
      ? `~${readingTime} min - considera dividir en múltiples artículos`
      : `~${readingTime} min (${wordCount} palabras) - perfecto`,
  });

  return items;
}
