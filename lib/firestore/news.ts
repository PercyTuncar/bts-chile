// Acceso a datos: noticias — PRD §13.3, §9.
import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import type { News, NewsCategory, NewsStatus, WithId } from "@/types";
import { newsCol } from "./collections";

export function newsDoc(slug: string) {
  return doc(newsCol, slug);
}

export interface SaveNewsInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImageURL: string;
  seoImageSquareURL?: string;
  ogImageURL?: string;
  twitterImageURL?: string;
  imageAlt?: string;
  metaTitle?: string;
  headline?: string;
  category: NewsCategory;
  tags: string[];
  authorUid: string;
  authorName: string;
  authorUrl?: string;
  status: NewsStatus;
  scheduledFor?: Date | null;
  readingTimeMinutes: number;
}

/** Crea/edita una noticia (admin, upsert por slug) — §9.1. */
export async function saveNews(input: SaveNewsInput): Promise<void> {
  const ref = newsDoc(input.slug);
  const existing = await getDoc(ref);

  // Determinar publishedAt según el estado
  let publishedAt: any = existing.data()?.publishedAt ?? null;

  if (input.status === "published" && !publishedAt) {
    // Primera vez que se publica
    publishedAt = serverTimestamp();
  } else if (input.status !== "published") {
    // Si cambia a draft, scheduled o archived, mantener la fecha original si existía
    publishedAt = existing.data()?.publishedAt ?? null;
  }

  // Determinar scheduledFor
  const scheduledFor = input.scheduledFor
    ? input.scheduledFor
    : (input.status === "scheduled" ? existing.data()?.scheduledFor : null);

  // Determinar dateModified
  const dateModified = input.status === "published"
    ? serverTimestamp()
    : existing.data()?.dateModified ?? null;

  await setDoc(
    ref,
    {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      featuredImageURL: input.featuredImageURL,
      seoImageSquareURL: input.seoImageSquareURL || "",
      ogImageURL: input.ogImageURL || "",
      twitterImageURL: input.twitterImageURL || "",
      imageAlt: input.imageAlt || "",
      metaTitle: input.metaTitle || "",
      headline: input.headline || input.title.slice(0, 110),
      category: input.category,
      tags: input.tags,
      authorUid: input.authorUid,
      authorName: input.authorName,
      authorUrl: input.authorUrl || "",
      status: input.status,
      scheduledFor,
      publishedAt,
      dateModified,
      readingTimeMinutes: input.readingTimeMinutes,
      viewCount: existing.data()?.viewCount ?? 0,
      createdAt: existing.data()?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteNews(slug: string): Promise<void> {
  await deleteDoc(newsDoc(slug));
}

/** Todas las noticias (admin, cualquier estado). §11.1 */
export async function getAllNews(): Promise<WithId<News>[]> {
  const snap = await getDocs(query(newsCol, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getNews(slug: string): Promise<News | null> {
  const snap = await getDoc(newsDoc(slug));
  return snap.exists() ? snap.data() : null;
}

/** Noticias relacionadas (misma categoría, excluye la actual). §9.3 */
export async function getRelatedNews(
  category: NewsCategory,
  excludeSlug: string,
  max = 3,
): Promise<WithId<News>[]> {
  const q = query(
    newsCol,
    where("status", "==", "published"),
    where("category", "==", category),
    orderBy("publishedAt", "desc"),
    fbLimit(max + 1),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((n) => n.id !== excludeSlug)
    .slice(0, max);
}

/** Listado publicado (fecha desc), con filtro opcional por categoría. §9.2 */
export async function getPublishedNews(options?: {
  category?: NewsCategory;
  max?: number;
}): Promise<WithId<News>[]> {
  const constraints = [where("status", "==", "published")];
  if (options?.category) constraints.push(where("category", "==", options.category));
  const q = query(
    newsCol,
    ...constraints,
    orderBy("publishedAt", "desc"),
    fbLimit(options?.max ?? 50),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
