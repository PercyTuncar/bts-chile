import type { Metadata } from "next";
import { BuscarView, type SearchItem } from "@/components/buscar/BuscarView";
import { getPublishedNews } from "@/lib/firestore/news";
import { getPublishedProducts } from "@/lib/firestore/products";

export const metadata: Metadata = {
  title: "Buscar",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ q?: string }>;

export default async function BuscarPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;

  let items: SearchItem[] = [];
  try {
    const [news, products] = await Promise.all([
      getPublishedNews({ max: 100 }),
      getPublishedProducts({ max: 100 }),
    ]);
    items = [
      ...news.map((n) => ({
        type: "Noticia" as const,
        title: n.title,
        excerpt: n.excerpt,
        href: `/noticias/${n.id}`,
        image: n.featuredImageURL || null,
      })),
      ...products.map((p) => ({
        type: "Producto" as const,
        title: p.name,
        excerpt: p.description.slice(0, 120),
        href: `/tienda/${p.id}`,
        image: p.imageURLs?.[0] ?? null,
      })),
    ];
  } catch (err) {
    console.warn("buscar: Firestore no disponible", err);
  }

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <h1 className="mb-6 text-h1 font-bold tracking-tight">Buscar en BTS Chile</h1>
      <BuscarView items={items} initialQuery={q ?? ""} />
    </main>
  );
}
