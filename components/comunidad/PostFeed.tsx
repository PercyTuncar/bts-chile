"use client";

// Feed de comunidad con tabs de categoría, skeleton y scroll infinito opcional — PRD §8.1.
import { useEffect, useRef, useState } from "react";
import { PostCard } from "@/components/comunidad/PostCard";
import { PillButton } from "@/components/ui/PillButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { FEED_TABS } from "@/lib/comunidad/reactions";
import { usePosts } from "@/hooks/usePosts";
import type { PostCategory } from "@/types";
import { cn } from "@/lib/utils/cn";

export function PostFeed({ infinite = false }: { infinite?: boolean }) {
  const [category, setCategory] = useState<PostCategory | "all">("all");
  const { posts, loading, hasMore, loadMore } = usePosts(category);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(loadMore);
  const hasMoreRef = useRef(hasMore);

  // Mantener refs frescas sin recrear el observer en cada render.
  useEffect(() => {
    loadMoreRef.current = loadMore;
    hasMoreRef.current = hasMore;
  });

  // Scroll infinito: al ver el centinela, cargar la siguiente página (si hay).
  // El observer se recrea cuando cambia el nº de posts → rellena el viewport y luego
  // se dispara al hacer scroll. `loadMore` sale de un callback (sin setState en el effect).
  useEffect(() => {
    if (!infinite) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreRef.current) loadMoreRef.current();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [infinite, posts.length]);

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {FEED_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setCategory(tab.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              category === tab.key
                ? "bg-brand text-white"
                : "glass text-text-muted hover:text-text",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading && posts.length === 0 ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" rounded="rounded-card" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card rounded-card p-10 text-center text-text-muted">
          <p className="text-3xl">💜</p>
          <p className="mt-2">Todavía no hay publicaciones aquí. ¡Sé la primera!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {hasMore && (
            <>
              {/* Centinela para el scroll infinito */}
              {infinite && <div ref={sentinelRef} aria-hidden className="h-1 w-full" />}
              {infinite && (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-40 w-full" rounded="rounded-card" />
                </div>
              )}
              <div className="flex justify-center">
                <PillButton variant="secondary" onClick={loadMore}>
                  Cargar más
                </PillButton>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default PostFeed;
