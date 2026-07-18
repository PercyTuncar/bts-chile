"use client";

// Vista de /noticias: tabs de categoría + búsqueda interna + destacado + grid — PRD §9.2, §9.4.
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ArticleCard, type NewsCardItem } from "@/components/noticias/ArticleCard";
import { NEWS_CATEGORY_LABEL, NEWS_TABS } from "@/lib/noticias/categories";
import { formatDateLong } from "@/lib/utils/formatters";
import type { NewsCategory } from "@/types";
import { cn } from "@/lib/utils/cn";

export function NoticiasView({ items }: { items: NewsCardItem[] }) {
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (i) =>
        (category === "all" || i.category === category) &&
        (needle === "" || `${i.title} ${i.excerpt}`.toLowerCase().includes(needle)),
    );
  }, [items, category, q]);

  const [featured, ...rest] = filtered;

  return (
    <div className="flex flex-col gap-6">
      {/* Búsqueda */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar noticias…"
          aria-label="Buscar noticias"
          className="h-11 w-full rounded-full border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface pl-9 pr-4"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {NEWS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setCategory(tab.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              category === tab.key ? "bg-brand text-white" : "glass text-text-muted hover:text-text",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-card p-10 text-center text-text-muted">
          <p className="text-3xl">📰</p>
          <p className="mt-2">No hay noticias que coincidan. Vuelve pronto 💜</p>
        </div>
      ) : (
        <>
          {/* Destacado */}
          {featured && (
            <Link href={`/noticias/${featured.slug}`} className="group">
              <article className="glass-card grid grid-cols-1 overflow-hidden rounded-card md:grid-cols-2">
                <span className="relative aspect-video md:aspect-auto">
                  {featured.featuredImageURL ? (
                    <Image
                      src={featured.featuredImageURL}
                      alt={featured.title}
                      fill
                      sizes="(max-width:768px) 100vw, 560px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <span className="flex h-full min-h-52 w-full items-center justify-center bg-brand-soft text-5xl">💜</span>
                  )}
                </span>
                <div className="flex flex-col justify-center p-6">
                  <span className="mb-2 w-fit rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
                    {NEWS_CATEGORY_LABEL[featured.category]}
                  </span>
                  <h2 className="text-h2 font-bold leading-tight group-hover:text-brand">{featured.title}</h2>
                  <p className="mt-2 text-text-muted">{featured.excerpt}</p>
                  <p className="mt-3 text-xs text-text-muted">
                    {formatDateLong(featured.publishedAtMs)} · {featured.readingTimeMinutes} min
                  </p>
                </div>
              </article>
            </Link>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item) => (
                <ArticleCard key={item.slug} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NoticiasView;
