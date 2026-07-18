// Categorías de noticias — PRD §9.1.
import type { NewsCategory } from "@/types";

export interface NewsCategoryDef {
  key: NewsCategory;
  label: string;
}

export const NEWS_CATEGORIES: NewsCategoryDef[] = [
  { key: "oficiales", label: "Noticias Oficiales" },
  { key: "conciertos", label: "Conciertos" },
  { key: "musica", label: "Música" },
  { key: "kpop", label: "K-pop General" },
  { key: "army_chile", label: "Army Chile" },
];

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = Object.fromEntries(
  NEWS_CATEGORIES.map((c) => [c.key, c.label]),
) as Record<NewsCategory, string>;

export const NEWS_TABS: { key: NewsCategory | "all"; label: string }[] = [
  { key: "all", label: "Todas" },
  ...NEWS_CATEGORIES,
];
