// Sistema de 6 reacciones + categorías de comunidad — PRD §8.1.A, §4.3.
import type { PostCategory, ReactionType } from "@/types";

export interface ReactionDef {
  type: ReactionType;
  emoji: string;
  label: string;
}

export const REACTIONS: ReactionDef[] = [
  { type: "purple_heart", emoji: "💜", label: "Me encanta" },
  { type: "moved", emoji: "🥹", label: "Me emocionó" },
  { type: "laughing", emoji: "😂", label: "Me divierte" },
  { type: "sad", emoji: "😢", label: "Triste" },
  { type: "fire", emoji: "🔥", label: "¡Lo mejor!" },
  { type: "support", emoji: "🫶", label: "Te apoyo" },
];

export const REACTION_EMOJI: Record<ReactionType, string> = Object.fromEntries(
  REACTIONS.map((r) => [r.type, r.emoji]),
) as Record<ReactionType, string>;

export interface CategoryDef {
  key: PostCategory;
  label: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "fanart", label: "Fan Art" },
  { key: "teoria", label: "Teorías" },
  { key: "foto", label: "Fotos" },
  { key: "noticia", label: "Noticias Fan" },
  { key: "general", label: "General" },
];

export const CATEGORY_LABEL: Record<PostCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label]),
) as Record<PostCategory, string>;

/** Tabs del feed: Todos + categorías principales (§8.1). */
export const FEED_TABS: { key: PostCategory | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  ...CATEGORIES,
];
