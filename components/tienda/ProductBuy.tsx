"use client";

// Panel de compra: variantes + descuento membresía + agregar al carrito + buy bar — PRD §7.5.
import { useState } from "react";
import { MembershipBadge } from "@/components/ui/Badge";
import { PillButton } from "@/components/ui/PillButton";
import { SizeSelector } from "@/components/tienda/SizeSelector";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { discountedPrice, MEMBERSHIP_DISCOUNT } from "@/lib/tienda/catalog";
import { formatUSD } from "@/lib/utils/formatters";

export interface ProductBuyData {
  slug: string;
  name: string;
  image: string | null;
  priceUSD: number;
  originalPriceUSD: number | null;
  totalStock: number;
  sizes: { value: string; disabled: boolean }[];
  colors: { value: string; swatch: string; disabled: boolean }[];
}

export function ProductBuy({ product }: { product: ProductBuyData }) {
  const { profile } = useAuth();
  const addItem = useCart((s) => s.addItem);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const membership = profile?.membershipType ?? "free";
  const discountRate = MEMBERSHIP_DISCOUNT[membership];
  const finalPrice = discountedPrice(product.priceUSD, membership);
  const soldOut = product.totalStock <= 0;

  function handleAdd() {
    if (product.sizes.length > 0 && !size) {
      toastError("Selecciona una talla.");
      return;
    }
    if (product.colors.length > 0 && !color) {
      toastError("Selecciona un color.");
      return;
    }
    addItem({
      slug: product.slug,
      name: product.name,
      priceUSD: finalPrice,
      image: product.image,
      size: size ?? undefined,
      color: color ?? undefined,
      quantity: qty,
    });
    toastSuccess("Agregado al carrito 🛍💜");
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Precio */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold tabular-nums">{formatUSD(finalPrice)}</span>
        {(discountRate > 0 || (product.originalPriceUSD && product.originalPriceUSD > product.priceUSD)) && (
          <span className="text-lg text-text-muted line-through tabular-nums">
            {formatUSD(product.originalPriceUSD ?? product.priceUSD)}
          </span>
        )}
        {discountRate > 0 && (
          <span className="flex items-center gap-1 text-sm text-brand">
            <MembershipBadge type={membership} /> −{Math.round(discountRate * 100)}%
          </span>
        )}
      </div>

      {product.sizes.length > 0 && (
        <SizeSelector label="Talla" options={product.sizes} value={size} onChange={setSize} />
      )}
      {product.colors.length > 0 && (
        <SizeSelector
          label="Color"
          options={product.colors.map((c) => ({ value: c.value, swatch: c.swatch, disabled: c.disabled }))}
          value={color}
          onChange={setColor}
        />
      )}

      {/* Cantidad */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Cantidad</span>
        <div className="inline-flex items-center rounded-full glass">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 text-lg" aria-label="Menos">−</button>
          <span className="w-8 text-center tabular-nums">{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)} className="h-10 w-10 text-lg" aria-label="Más">+</button>
        </div>
      </div>

      <PillButton size="lg" fullWidth disabled={soldOut} onClick={handleAdd}>
        {soldOut ? "Agotado" : "Agregar al carrito"}
      </PillButton>

      {discountRate === 0 && membership === "free" && (
        <p className="text-sm text-text-muted">
          💜 Los miembros ARMY obtienen hasta 15% de descuento.{" "}
          <a href="/membresia" className="text-brand hover:underline">Ver membresía</a>
        </p>
      )}
    </div>
  );
}

export default ProductBuy;
