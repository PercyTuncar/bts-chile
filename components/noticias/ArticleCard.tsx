// Tarjeta de artículo — PRD §9.2. Recibe una forma plana (serializable) del artículo.
import Image from "next/image";
import Link from "next/link";
import { NEWS_CATEGORY_LABEL } from "@/lib/noticias/categories";
import { formatDateLong } from "@/lib/utils/formatters";
import type { News, NewsCategory, WithId } from "@/types";

export interface NewsCardItem {
  slug: string;
  title: string;
  excerpt: string;
  featuredImageURL: string;
  category: NewsCategory;
  publishedAtMs: number;
  readingTimeMinutes: number;
}

/** Convierte un documento News a la forma plana serializable para las tarjetas. */
export function toNewsCard(n: WithId<News>): NewsCardItem {
  return {
    slug: n.slug || n.id,
    title: n.title,
    excerpt: n.excerpt,
    featuredImageURL: n.featuredImageURL,
    category: n.category,
    publishedAtMs: n.publishedAt ? n.publishedAt.toMillis() : n.createdAt?.toMillis?.() ?? Date.now(),
    readingTimeMinutes: n.readingTimeMinutes,
  };
}

export function ArticleCard({ item }: { item: NewsCardItem }) {
  return (
    <Link href={`/noticias/${item.slug}`} className="group">
      <article className="glass-card flex h-full flex-col overflow-hidden rounded-card">
        <span className="relative block aspect-video overflow-hidden">
          {item.featuredImageURL ? (
            <Image
              src={item.featuredImageURL}
              alt={item.title}
              fill
              sizes="(max-width:768px) 100vw, 360px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-soft text-3xl">💜</span>
          )}
        </span>
        <div className="flex flex-1 flex-col p-4">
          <span className="mb-2 w-fit rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
            {NEWS_CATEGORY_LABEL[item.category]}
          </span>
          <h3 className="text-h3 font-semibold leading-snug group-hover:text-brand">{item.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">{item.excerpt}</p>
          <p className="mt-3 text-xs text-text-muted">
            {formatDateLong(item.publishedAtMs)} · {item.readingTimeMinutes} min de lectura
          </p>
        </div>
      </article>
    </Link>
  );
}

export default ArticleCard;
