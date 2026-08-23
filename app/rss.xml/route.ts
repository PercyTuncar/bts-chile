// RSS Feed para noticias BTS Chile — mejora descubrimiento y sindicación
import { getPublishedNews } from "@/lib/firestore/news";
import { SITE_URL } from "@/lib/utils/seo";

export const revalidate = 3600; // Revalidar cada hora

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let news: Awaited<ReturnType<typeof getPublishedNews>> = [];
  try {
    news = await getPublishedNews({ max: 50 });
  } catch (err) {
    console.error("RSS: error al obtener noticias", err);
  }

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Noticias BTS Chile</title>
    <link>${SITE_URL}/noticias</link>
    <description>Las últimas noticias de BTS en Chile y el mundo: conciertos, música, ARMY y más.</description>
    <language>es-CL</language>
    <copyright>Copyright ${new Date().getFullYear()} BTS Chile</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>BTS Chile</title>
      <link>${SITE_URL}</link>
    </image>
    ${news
      .map(
        (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}/noticias/${item.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/noticias/${item.slug}</guid>
      <description>${escapeXml(item.excerpt)}</description>
      <pubDate>${item.publishedAt ? new Date(item.publishedAt.toMillis()).toUTCString() : new Date().toUTCString()}</pubDate>
      <dc:creator>${escapeXml(item.authorName)}</dc:creator>
      <category>${escapeXml(item.category)}</category>
      ${item.featuredImageURL ? `<enclosure url="${escapeXml(item.featuredImageURL)}" type="image/jpeg" length="0" />` : ""}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
