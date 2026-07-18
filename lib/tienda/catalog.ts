// Catálogo de tienda: categorías y descuentos de membresía — PRD §7.2, §10.2.
import type { MembershipType, ProductCategory } from "@/types";

export interface ProductCategoryDef {
  key: ProductCategory;
  label: string;
}

export const PRODUCT_CATEGORIES: ProductCategoryDef[] = [
  { key: "ropa", label: "Ropa" },
  { key: "accesorio", label: "Accesorios" },
  { key: "peluche", label: "Peluches / Figuras" },
  { key: "album", label: "Álbumes y Photocards" },
  { key: "poster", label: "Posters y Decoración" },
  { key: "digital", label: "Digital" },
];

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c.key, c.label]),
) as Record<ProductCategory, string>;

export const STORE_TABS: { key: ProductCategory | "all"; label: string }[] = [
  { key: "all", label: "Todo" },
  ...PRODUCT_CATEGORIES,
];

/** Descuento de tienda por tier de membresía (§10.2). */
export const MEMBERSHIP_DISCOUNT: Record<MembershipType, number> = {
  free: 0,
  basic: 0.05,
  premium: 0.1,
  vip: 0.15,
};

export function discountedPrice(priceUSD: number, membership: MembershipType): number {
  const rate = MEMBERSHIP_DISCOUNT[membership] ?? 0;
  return Math.round(priceUSD * (1 - rate) * 100) / 100;
}
