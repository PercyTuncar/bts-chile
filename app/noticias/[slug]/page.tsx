import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard, toNewsCard } from "@/components/noticias/ArticleCard";
import { ArticleContent } from "@/components/noticias/ArticleContent";
import { ReadingProgress } from "@/components/noticias/ReadingProgress";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { getNews, getRelatedNews } from "@/lib/firestore/news";
import { NEWS_CATEGORY_LABEL } from "@/lib/noticias/categories";
import { formatDateLong, toISOString } from "@/lib/utils/formatters";
import { absoluteUrl, SITE_URL } from "@/lib/utils/seo";
import { generateArticlePageLD } from "@/lib/seo/json-ld";
import type { News } from "@/types";

type Params = { params: Promise<{ slug: string }> };

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  let news: News | null = null;
  try {
    news = await getNews(slug);
  } catch {
    news = null;
  }
  if (!news) return { title: "Noticia", robots: { index: false } };

  const published = news.publishedAt ? toISOString(news.publishedAt) : undefined;

  // Usar metaTitle si existe, sino el título normal
  const metaTitle = news.metaTitle || news.title;

  // Usar imagen OG si existe, sino la hero
  const ogImage = news.ogImageURL || news.featuredImageURL || `${SITE_URL}/og-noticias.jpg`;

  return {
    title: metaTitle,
    description: news.excerpt,
    alternates: { canonical: absoluteUrl(`/noticias/${slug}`) },
    openGraph: {
      type: "article",
      title: metaTitle,
      description: news.excerpt,
      url: absoluteUrl(`/noticias/${slug}`),
      images: [ogImage],
      publishedTime: published,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: news.excerpt,
      images: [news.twitterImageURL || ogImage],
    },
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  };
}

export default async function NoticiaPage({ params }: Params) {
  const { slug } = await params;
  let news: News | null = null;
  try {
    news = await getNews(slug);
  } catch {
    news = null;
  }
  if (!news || news.status !== "published") notFound();

  const related = await getRelatedNews(news.category, slug).catch(() => []);
  const url = absoluteUrl(`/noticias/${slug}`);

  // Generar JSON-LD profesional optimizado para Google News
  const jsonLd = generateArticlePageLD(news);

  return (
    <>
      <ReadingProgress />
      <article className="mx-auto max-w-3xl px-6 py-10">
        <JsonLd data={jsonLd} />

        <nav className="mb-4 text-sm text-text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand">Inicio</Link> ›{" "}
          <Link href="/noticias" className="hover:text-brand">Noticias</Link> › <span>{news.title}</span>
        </nav>

        <span className="mb-3 inline-block rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
          {NEWS_CATEGORY_LABEL[news.category]}
        </span>
        <h1 className="text-h1 font-bold tracking-tight">{news.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-muted">
          <Badge tone="brand">Admin</Badge>
          <span>{news.authorName}</span>
          {news.publishedAt && <span>· {formatDateLong(news.publishedAt)}</span>}
          <span>· {news.readingTimeMinutes} min de lectura</span>
        </div>

        {news.featuredImageURL && (
          <span className="relative mt-6 block aspect-video overflow-hidden rounded-card">
            <Image
              src={news.featuredImageURL}
              alt={news.title}
              fill
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </span>
        )}

        <div className="mt-8">
          <ArticleContent html={news.content} />
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-h2 font-semibold">Artículos relacionados</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {related.map((r) => (
                <ArticleCard key={r.id} item={toNewsCard(r)} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
