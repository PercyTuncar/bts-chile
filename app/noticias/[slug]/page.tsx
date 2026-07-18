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
import { absoluteUrl, buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";
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
  return {
    title: news.title,
    description: news.excerpt,
    alternates: { canonical: absoluteUrl(`/noticias/${slug}`) },
    openGraph: {
      type: "article",
      title: news.title,
      description: news.excerpt,
      url: absoluteUrl(`/noticias/${slug}`),
      images: news.featuredImageURL ? [news.featuredImageURL] : [`${SITE_URL}/og-noticias.jpg`],
      publishedTime: published,
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
  const published = news.publishedAt ? toISOString(news.publishedAt) : new Date().toISOString();
  const modified = news.updatedAt ? toISOString(news.updatedAt) : published;
  const body = stripHtml(news.content);
  const url = absoluteUrl(`/noticias/${slug}`);

  const jsonLd = buildGraph([
    {
      "@type": "NewsArticle",
      "@id": `${url}#article`,
      headline: news.title.slice(0, 110),
      description: news.excerpt,
      articleBody: body,
      wordCount: body.split(" ").length,
      image: {
        "@type": "ImageObject",
        url: news.featuredImageURL,
        width: 1200,
        height: 630,
        caption: news.title,
      },
      thumbnailUrl: news.featuredImageURL,
      datePublished: published,
      dateModified: modified,
      author: { "@type": "Organization", name: "BTS Chile", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "BTS Chile",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      keywords: news.tags.join(", "),
      articleSection: NEWS_CATEGORY_LABEL[news.category],
      inLanguage: "es-CL",
      isPartOf: { "@id": `${SITE_URL}/noticias#blog` },
    },
    buildBreadcrumbList([
      { name: "Inicio", path: "/" },
      { name: "Noticias", path: "/noticias" },
      { name: news.title.slice(0, 60), path: `/noticias/${slug}` },
    ]),
  ]);

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
          <span>· {formatDateLong(published)}</span>
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
