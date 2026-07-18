"use client";

// Formulario de producto con campos dinámicos por categoría — PRD §7.2, §7.4.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { saveProduct } from "@/lib/firestore/products";
import { uploadImage } from "@/lib/storage";
import { PRODUCT_CATEGORIES } from "@/lib/tienda/catalog";
import type { Product, ProductCategory, ProductCondition, ProductDetails } from "@/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const input =
  "h-11 w-full rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "ropa");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceUSD, setPriceUSD] = useState(initial?.priceUSD ?? 0);
  const [originalPriceUSD, setOriginalPriceUSD] = useState(initial?.originalPriceUSD ?? 0);
  const [totalStock, setTotalStock] = useState(initial?.totalStock ?? 0);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [status, setStatus] = useState<Product["status"]>(initial?.status ?? "draft");
  const [imageURLs] = useState<string[]>(initial?.imageURLs ?? []);
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  // Detalles dinámicos
  const [material, setMaterial] = useState(initial?.details?.material ?? "");
  const [sizes, setSizes] = useState<Record<string, number>>(
    (initial?.details?.sizes ?? {}) as Record<string, number>,
  );
  const [condition, setCondition] = useState<ProductCondition>(initial?.details?.condition ?? "new");
  const [albumVersion, setAlbumVersion] = useState(initial?.details?.albumVersion ?? "");
  const [sizeCm, setSizeCm] = useState(initial?.details?.sizeCm ?? "");
  const [paperType, setPaperType] = useState(initial?.details?.paperType ?? "");
  const [fileFormat, setFileFormat] = useState(initial?.details?.fileFormat ?? "");

  function buildDetails(): ProductDetails {
    switch (category) {
      case "ropa":
        return { sizes, material };
      case "peluche":
        return { material, materialType: material };
      case "album":
        return { albumVersion, condition };
      case "poster":
        return { sizeCm, paperType };
      case "digital":
        return { fileFormat, deliveryMethod: "manual" };
      default:
        return { material };
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toastError("Ingresa un nombre.");
      return;
    }
    const slug = initial?.slug ?? slugify(name);
    setSaving(true);
    try {
      let urls = [...imageURLs];
      if (files) {
        const uploaded = await Promise.all(
          Array.from(files).map((f, i) => uploadImage(`products/${slug}/foto_${Date.now()}_${i}.jpg`, f)),
        );
        urls = [...urls, ...uploaded];
      }
      await saveProduct({
        slug,
        name,
        category,
        description,
        imageURLs: urls,
        priceUSD,
        originalPriceUSD: originalPriceUSD || null,
        totalStock,
        status,
        isFeatured,
        details: buildDetails(),
      });
      toastSuccess("Producto guardado 💜");
      router.push("/panel-admin/tienda");
    } catch (err) {
      console.error(err);
      toastError("No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Nombre</span>
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Categoría</span>
        <select className={input} value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Descripción</span>
        <textarea className="min-h-24 rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-3" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Precio USD</span>
          <input type="number" className={input} value={priceUSD} onChange={(e) => setPriceUSD(Number(e.target.value))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Precio tachado</span>
          <input type="number" className={input} value={originalPriceUSD} onChange={(e) => setOriginalPriceUSD(Number(e.target.value))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Stock total</span>
          <input type="number" className={input} value={totalStock} onChange={(e) => setTotalStock(Number(e.target.value))} />
        </label>
      </div>

      {/* Campos dinámicos por categoría */}
      <div className="rounded-2xl bg-brand-soft p-4">
        <p className="mb-2 text-sm font-semibold">Detalles ({category})</p>
        {category === "ropa" && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Material</span>
              <input className={input} value={material} onChange={(e) => setMaterial(e.target.value)} />
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SIZES.map((s) => (
                <label key={s} className="flex flex-col gap-1">
                  <span className="text-xs">{s}</span>
                  <input type="number" className={input} value={sizes[s] ?? 0} onChange={(e) => setSizes({ ...sizes, [s]: Number(e.target.value) })} />
                </label>
              ))}
            </div>
          </>
        )}
        {category === "peluche" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Material principal</span>
            <input className={input} value={material} onChange={(e) => setMaterial(e.target.value)} />
          </label>
        )}
        {category === "album" && (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Versión</span>
              <input className={input} value={albumVersion} onChange={(e) => setAlbumVersion(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Condición</span>
              <select className={input} value={condition} onChange={(e) => setCondition(e.target.value as ProductCondition)}>
                <option value="new">Nuevo</option>
                <option value="like_new">Como nuevo</option>
                <option value="used">Con detalles</option>
              </select>
            </label>
          </div>
        )}
        {category === "poster" && (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Tamaño</span>
              <input className={input} value={sizeCm} onChange={(e) => setSizeCm(e.target.value)} placeholder="A3, 60×90cm…" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Tipo de papel</span>
              <input className={input} value={paperType} onChange={(e) => setPaperType(e.target.value)} />
            </label>
          </div>
        )}
        {category === "digital" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Formato de entrega</span>
            <input className={input} value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} placeholder="ZIP, PDF, PNG" />
          </label>
        )}
        {category === "accesorio" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Material</span>
            <input className={input} value={material} onChange={(e) => setMaterial(e.target.value)} />
          </label>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Imágenes (subir)</span>
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
        {imageURLs.length > 0 && <span className="text-xs text-text-muted">{imageURLs.length} imagen(es) existentes</span>}
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Destacado
        </label>
        <label className="flex items-center gap-2 text-sm">
          Estado:
          <select className="rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value as Product["status"])}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </label>
      </div>

      <PillButton type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar producto"}</PillButton>
    </form>
  );
}

export default ProductForm;
