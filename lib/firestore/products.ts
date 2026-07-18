// Acceso a datos: tienda / productos — PRD §13.6, §7.
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
import type { Product, ProductCategory, ProductDetails, ProductStatus, WithId } from "@/types";
import { productsCol } from "./collections";

export function productDoc(slug: string) {
  return doc(productsCol, slug);
}

export interface SaveProductInput {
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  imageURLs: string[];
  priceUSD: number;
  originalPriceUSD: number | null;
  totalStock: number;
  status: ProductStatus;
  isFeatured: boolean;
  details: ProductDetails;
}

/** Crea/edita un producto (admin, upsert por slug) — §7.4. */
export async function saveProduct(input: SaveProductInput): Promise<void> {
  const ref = productDoc(input.slug);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      ...input,
      ratingAvg: existing.exists() ? existing.data().ratingAvg : 0,
      reviewCount: existing.exists() ? existing.data().reviewCount : 0,
      salesCount: existing.exists() ? existing.data().salesCount : 0,
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteProduct(slug: string): Promise<void> {
  await deleteDoc(productDoc(slug));
}

/** Todos los productos (admin, cualquier estado). §11.1 */
export async function getAllProducts(): Promise<WithId<Product>[]> {
  const snap = await getDocs(query(productsCol, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const snap = await getDoc(productDoc(slug));
  return snap.exists() ? snap.data() : null;
}

/** Catálogo publicado, con filtro opcional por categoría. §7.3 */
export async function getPublishedProducts(options?: {
  category?: ProductCategory;
  max?: number;
}): Promise<WithId<Product>[]> {
  const constraints = [where("status", "==", "published")];
  if (options?.category) constraints.push(where("category", "==", options.category));
  const q = query(
    productsCol,
    ...constraints,
    orderBy("createdAt", "desc"),
    fbLimit(options?.max ?? 100),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Productos destacados para el hero de /tienda y del home. §7.3 */
export async function getFeaturedProducts(max = 8): Promise<WithId<Product>[]> {
  const q = query(
    productsCol,
    where("status", "==", "published"),
    where("isFeatured", "==", true),
    orderBy("createdAt", "desc"),
    fbLimit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
