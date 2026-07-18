"use client";

// Feed de comunidad con filtro de categoría, skeleton y scroll infinito opcional — PRD §8.1.
import { AnimatePresence, motion } from "framer-motion";
import { Check, SlidersHorizontal } from "lucide-react";
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
  const [filterOpen, setFilterOpen] = useState(false);
  const { posts, loading, hasMore, loadMore } = usePosts(category);

  const activeLabel = FEED_TABS.find((t) => t.key === category)?.label ?? "Todos";

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
      {/* Filtro por categoría: ícono compacto → menú (ahorra espacio) */}
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-text-muted">
          {category === "all" ? "Publicaciones recientes" : `Filtrando: ${activeLabel}`}
        </p>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={filterOpen}
            aria-label="Filtrar publicaciones por categoría"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              category !== "all" ? "bg-brand text-white" : "glass text-text-muted hover:text-text",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {activeLabel}
          </button>

          <AnimatePresence>
            {filterOpen && (
              <>
                {/* Capa para cerrar al hacer clic fuera */}
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setFilterOpen(false)}
                  className="fixed inset-0 z-20 cursor-default"
                />
                <motion.div
                  role="menu"
                  aria-label="Categorías"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  className="glass-modal absolute right-0 z-30 mt-2 w-52 rounded-2xl p-1.5"
                >
                  {FEED_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="menuitemradio"
                      aria-checked={category === tab.key}
                      onClick={() => {
                        setCategory(tab.key);
                        setFilterOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        category === tab.key
                          ? "bg-brand-soft font-medium text-brand"
                          : "hover:bg-brand-soft",
                      )}
                    >
                      {tab.label}
                      {category === tab.key && <Check className="h-4 w-4" aria-hidden />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
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
