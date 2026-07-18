"use client";

// Feed de comunidad en tiempo real con paginación — PRD §8.1.
// onSnapshot sobre la query con límite creciente (realtime + "cargar más").
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { feedQuery } from "@/lib/firestore/posts";
import type { Post, PostCategory, WithId } from "@/types";

const PAGE_SIZE = 20;

export function usePosts(category: PostCategory | "all") {
  const [posts, setPosts] = useState<WithId<Post>[]>([]);
  const [limitCount, setLimitCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // La suscripción actualiza el estado desde su callback (patrón sancionado, sin
    // setState directo en el cuerpo del effect).
    const unsub = onSnapshot(
      feedQuery(category, limitCount),
      (snap) => {
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setHasMore(snap.size === limitCount);
        setLoading(false);
      },
      (err) => {
        console.warn("usePosts:", err);
        setLoading(false);
      },
    );
    return unsub;
  }, [category, limitCount]);

  return {
    posts,
    loading,
    hasMore,
    loadMore: () => setLimitCount((c) => c + PAGE_SIZE),
  };
}
