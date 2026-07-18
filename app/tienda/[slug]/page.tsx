import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartWidget } from "@/components/tienda/CartWidget";
import { ProductBuy, type ProductBuyData } from "@/components/tienda/ProductBuy";
import { ProductGallery } from "@/components/tienda/ProductGallery";
import { ReviewList, type ReviewItem } from "@/components/tienda/ReviewList";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProduct } from "@/lib/firestore/products";
import { getApprovedReviews } from "@/lib/firestore/reviews";
import { PRODUCT_CATEGORY_LABEL } from "@/lib/tienda/catalog";
import { absoluteUrl, buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";
import type { Product, ProductCondition } from "@/types";

type Params = { params: Promise<{ slug: string }> };

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const CONDITION_SCHEMA: Record<ProductCondition, string> = {
  new: "https://schema.org/NewCondition",
  used: "https://schema.org/UsedCondition",
  like_new: "https://schema.org/RefurbishedCondition",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  let product: Product | null = null;
  try {
    product = await getProduct(slug);
  } catch {
    product = null;
  }
  if (!product) return { title: "Producto", robots: { index: false } };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: absoluteUrl(`/tienda/${slug}`) },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description.slice(0, 160),
      url: absoluteUrl(`/tienda/${slug}`),
      images: product.imageURLs?.[0] ? [product.imageURLs[0]] : [`${SITE_URL}/og-tienda.jpg`],
    },
  };
}

export default async function ProductoPage({ params }: Params) {
  const { slug } = await params;
  let product: Product | null = null;
  try {
    product = await getProduct(slug);
  } catch {
    product = null;
  }
  if (!product || product.status !== "published") notFound();

  const reviewsRaw = await getApprovedReviews(slug).catch(() => []);
  const reviews: ReviewItem[] = reviewsRaw.map((r) => ({
    id: r.id,
    authorNickname: r.authorNickname,
    authorPhotoURL: r.authorPhotoURL,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    createdAtMs: r.createdAt?.toMillis?.() ?? 0,
  }));

  const sizes = SIZE_ORDER.filter((s) => product!.details.sizes && s in product!.details.sizes).map(
    (s) => ({ value: s, disabled: (product!.details.sizes?.[s] ?? 0) <= 0 }),
  );
  const colors = (product.details.colors ?? []).map((c) => ({
    value: c.name,
    swatch: c.hex,
    disabled: c.stock <= 0,
  }));

  const buyData: ProductBuyData = {
    slug: product.slug || slug,
    name: product.name,
    image: product.imageURLs?.[0] ?? null,
    priceUSD: product.priceUSD,
    originalPriceUSD: product.originalPriceUSD,
    totalStock: product.totalStock,
    sizes,
    colors,
  };

  const url = absoluteUrl(`/tienda/${slug}`);
  const itemCondition = product.details.condition
    ? CONDITION_SCHEMA[product.details.condition]
    : "https://schema.org/NewCondition";

  const productNode: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description,
    sku: product.slug || slug,
    image: (product.imageURLs ?? []).slice(0, 3),
    brand: { "@type": "Brand", name: "BTS" },
    category: PRODUCT_CATEGORY_LABEL[product.category],
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      priceCurrency: "USD",
      price: String(product.priceUSD),
      priceValidUntil: "2027-12-31",
      availability:
        product.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition,
      seller: { "@type": "Organization", name: "BTS Chile", url: SITE_URL },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "CL" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "CL",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 10,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };
  // aggregateRating SOLO si hay reseñas reales aprobadas (§15.8 — nunca inventar).
  if (product.reviewCount > 0) {
    productNode.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(product.ratingAvg),
      reviewCount: String(product.reviewCount),
      bestRating: "5",
      worstRating: "1",
    };
  }

  const jsonLd = buildGraph([
    productNode,
    buildBreadcrumbList([
      { name: "Inicio", path: "/" },
      { name: "Tienda", path: "/tienda" },
      { name: product.name, path: `/tienda/${slug}` },
    ]),
  ]);

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <JsonLd data={jsonLd} />

      <nav className="mb-4 text-sm text-text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand">Inicio</Link> ›{" "}
        <Link href="/tienda" className="hover:text-brand">Tienda</Link> › <span>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.imageURLs ?? []} name={product.name} />
        <div>
          <span className="mb-2 inline-block rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
            {PRODUCT_CATEGORY_LABEL[product.category]}
          </span>
          <h1 className="text-h1 font-bold tracking-tight">{product.name}</h1>
          <div className="mt-5">
            <ProductBuy product={buyData} />
          </div>
        </div>
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="mb-3 text-h2 font-semibold">Descripción</h2>
        <p className="whitespace-pre-wrap text-text-muted">{product.description}</p>
      </section>

      <ReviewList productSlug={slug} reviews={reviews} />
      <CartWidget />
    </main>
  );
}
