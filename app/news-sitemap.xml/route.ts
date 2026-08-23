import { NextResponse } from "next/server";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.btschile.com";

/**
 * Sitemap dinámico de noticias para Google News.
 * Incluye artículos publicados en los ÚLTIMOS 7 DÍAS.
 * Nota: Google News prefiere 48h, pero usamos 7 días para tener contenido mientras crece el sitio.
 *
 * URL: https://www.btschile.com/news-sitemap.xml
 * Documentación: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */
export async function GET() {
  try {
    // Calcular timestamp de hace 7 días (más flexible que 48h)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const timestampCutoff = Timestamp.fromDate(sevenDaysAgo);

    // Query: solo publicados en últimas 48h
    const newsQuery = query(
      collection(db, "news"),
      where("status", "==", "published"),
      where("publishedAt", ">=", timestampCutoff),
      orderBy("publishedAt", "desc")
    );

    const snapshot = await getDocs(newsQuery);

    // Generar XML
    const urls = snapshot.docs.map((doc) => {
      const data = doc.data();
      const publishedDate = data.publishedAt
        ? new Date(data.publishedAt.toMillis())
        : new Date();

      // CRÍTICO: La fecha debe tener timezone (Z o +/-HH:MM)
      const publicationDate = publishedDate.toISOString();

      return `
    <url>
      <loc>${SITE_URL}/noticias/${data.slug}</loc>
      <news:news>
        <news:publication>
          <news:name>BTS Chile</news:name>
          <news:language>es</news:language>
        </news:publication>
        <news:publication_date>${publicationDate}</news:publication_date>
        <news:title>${escapeXml(data.title)}</news:title>
      </news:news>
      <lastmod>${publicationDate}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${urls.join("")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache 1 hora
      },
    });
  } catch (error) {
    console.error("Error generando news-sitemap.xml:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`,
      {
        status: 500,
        headers: {
          "Content-Type": "application/xml",
        },
      }
    );
  }
}

/**
 * Escapa caracteres especiales para XML.
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
