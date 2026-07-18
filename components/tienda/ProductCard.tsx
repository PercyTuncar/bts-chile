// Tarjeta de producto — PRD §7.3, §7.5. Recibe forma plana serializable.
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatUSD } from "@/lib/utils/formatters";
import type { Product, ProductCategory, WithId } from "@/types";

export interface ProductCardItem {
  slug: string;
  name: string;
  category: ProductCategory;
  priceUSD: number;
  originalPriceUSD: number | null;
  image: string | null;
  totalStock: number;
  isFeatured: boolean;
  ratingAvg: number;
  reviewCount: number;
}

export function toProductCard(p: WithId<Product>): ProductCardItem {
  return {
    slug: p.slug || p.id,
    name: p.name,
    category: p.category,
    priceUSD: p.priceUSD,
    originalPriceUSD: p.originalPriceUSD,
    image: p.imageURLs?.[0] ?? null,
    totalStock: p.totalStock,
    isFeatured: p.isFeatured,
    ratingAvg: p.ratingAvg,
    reviewCount: p.reviewCount,
  };
}

export function ProductCard({ item }: { item: ProductCardItem }) {
  const soldOut = item.totalStock <= 0;
  return (
    <Link href={`/tienda/${item.slug}`} className="group">
      <article className="glass-card flex h-full flex-col overflow-hidden rounded-card transition-all duration-300 group-hover:-translate-y-1">
        <span className="relative block aspect-square overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width:768px) 50vw, 300px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-soft text-4xl">💜</span>
          )}
          <span className="absolute left-2 top-2 flex gap-1">
            {soldOut ? (
              <Badge tone="danger">AGOTADO</Badge>
            ) : item.isFeatured ? (
              <Badge tone="brand">NUEVO</Badge>
            ) : null}
          </span>
        </span>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold leading-snug group-hover:text-brand">{item.name}</h3>
          {item.reviewCount > 0 && (
            <p className="mt-1 text-xs text-text-muted">
              ⭐ {item.ratingAvg.toFixed(1)} ({item.reviewCount})
            </p>
          )}
          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="text-lg font-bold tabular-nums">{formatUSD(item.priceUSD)}</span>
            {item.originalPriceUSD && item.originalPriceUSD > item.priceUSD && (
              <span className="text-sm text-text-muted line-through tabular-nums">
                {formatUSD(item.originalPriceUSD)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;
