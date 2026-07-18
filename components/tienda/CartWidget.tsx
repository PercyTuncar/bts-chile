"use client";

// Carrito flotante + checkout de tienda → storeOrders — PRD §7.3, §7.1, §13.7.
import { ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { PillButton } from "@/components/ui/PillButton";
import { Sheet } from "@/components/ui/Sheet";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { cartCount, cartSubtotal, useCart } from "@/hooks/useCart";
import { createStoreOrder } from "@/lib/firestore/storeOrders";
import { formatUSD } from "@/lib/utils/formatters";
import type { StoreOrderItem } from "@/types";

export function CartWidget() {
  const { items, updateQty, removeItem, clear } = useCart();
  const { firebaseUser, profile } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [open, setOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ street: "", city: "", region: "", postalCode: "" });

  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  async function handleCheckout() {
    if (!firebaseUser) {
      openLogin();
      return;
    }
    if (!address.street || !address.city) {
      toastError("Completa tu dirección de envío.");
      return;
    }
    setPlacing(true);
    try {
      const orderItems: StoreOrderItem[] = items.map((i) => ({
        productSlug: i.slug,
        productName: i.name,
        selectedVariant: { size: i.size, color: i.color },
        quantity: i.quantity,
        priceUSD: i.priceUSD,
      }));
      await createStoreOrder({
        buyerUid: firebaseUser.uid,
        buyerName: profile?.displayName ?? firebaseUser.displayName ?? "",
        buyerEmail: profile?.email ?? firebaseUser.email ?? "",
        buyerPhone: "",
        items: orderItems,
        subtotalUSD: subtotal,
        shippingUSD: 0,
        discountUSD: 0,
        totalUSD: subtotal,
        shippingAddress: address,
        paymentMethod: "transfer",
      });
      toastSuccess("¡Pedido creado! Te contactaremos para el pago 💜");
      clear();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toastError("No se pudo crear el pedido.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Carrito (${count})`}
        className="fixed bottom-24 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-105 md:bottom-5"
      >
        <ShoppingBag className="h-6 w-6" aria-hidden />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-[#0b0b0f]">
            {count}
          </span>
        )}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Tu carrito">
        {items.length === 0 ? (
          <p className="py-8 text-center text-text-muted">Tu carrito está vacío 🛍</p>
        ) : (
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {items.map((i) => (
                <li key={`${i.slug}-${i.size}-${i.color}`} className="flex items-center gap-3 rounded-2xl glass-card p-3">
                  <div className="flex-1">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-text-muted">
                      {[i.size, i.color].filter(Boolean).join(" · ")} · {formatUSD(i.priceUSD)}
                    </p>
                    <div className="mt-1 inline-flex items-center rounded-full glass text-sm">
                      <button type="button" onClick={() => updateQty(i.slug, i.quantity - 1, i.size, i.color)} className="h-8 w-8" aria-label="Menos">−</button>
                      <span className="w-6 text-center tabular-nums">{i.quantity}</span>
                      <button type="button" onClick={() => updateQty(i.slug, i.quantity + 1, i.size, i.color)} className="h-8 w-8" aria-label="Más">+</button>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeItem(i.slug, i.size, i.color)} aria-label="Quitar" className="text-danger">
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] pt-3">
              <span className="text-text-muted">Subtotal</span>
              <span className="text-lg font-bold tabular-nums">{formatUSD(subtotal)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Calle y número" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="col-span-2 h-11 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3" />
              <input placeholder="Ciudad" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="h-11 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3" />
              <input placeholder="Región" value={address.region} onChange={(e) => setAddress({ ...address, region: e.target.value })} className="h-11 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3" />
              <input placeholder="Código postal" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="col-span-2 h-11 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3" />
            </div>

            <PillButton fullWidth disabled={placing} onClick={handleCheckout}>
              {placing ? "Procesando…" : "Finalizar compra 💜"}
            </PillButton>
          </div>
        )}
      </Sheet>
    </>
  );
}

export default CartWidget;
