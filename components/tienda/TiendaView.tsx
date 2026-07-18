"use client";

// Vista de /tienda: filtros + grid — PRD §7.3.
import { useMemo, useState } from "react";
import { ProductCard, type ProductCardItem } from "@/components/tienda/ProductCard";
import { STORE_TABS } from "@/lib/tienda/catalog";
import type { ProductCategory } from "@/types";
import { cn } from "@/lib/utils/cn";

type SortKey = "novedad" | "precio_asc" | "precio_desc" | "vendidos";

export function TiendaView({ items }: { items: ProductCardItem[] }) {
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("novedad");

  const filtered = useMemo(() => {
    let list = items.filter((i) => category === "all" || i.category === category);
    if (sort === "precio_asc") list = [...list].sort((a, b) => a.priceUSD - b.priceUSD);
    else if (sort === "precio_desc") list = [...list].sort((a, b) => b.priceUSD - a.priceUSD);
    else if (sort === "vendidos") list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [items, category, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STORE_TABS.map((tab) => (
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
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Ordenar"
          className="h-10 rounded-full border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4 text-sm"
        >
          <option value="novedad">Novedad</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="vendidos">Más valorados</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-card p-10 text-center text-text-muted">
          <p className="text-3xl">🛍</p>
          <p className="mt-2">Pronto habrá productos en esta categoría 💜</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {filtered.map((item) => (
            <ProductCard key={item.slug} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TiendaView;
