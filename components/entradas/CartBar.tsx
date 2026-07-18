"use client";

// Mini carrito flotante sticky — PRD §5.2 (Sección 7), §5.3.
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import type { EventDate } from "@/types";
import type { ZoneData } from "@/lib/entradas/zones";
import { formatUSD } from "@/lib/utils/formatters";

export function CartBar({
  zone,
  quantity,
  installments,
  eventDate,
}: {
  zone: ZoneData;
  quantity: number;
  installments: number;
  eventDate: EventDate;
}) {
  const total = zone.priceUSD * quantity;
  const href = `/entradas/comprar?zoneId=${zone.zoneId}&qty=${quantity}&installments=${installments}&date=${eventDate}`;

  return (
    <div className="sticky bottom-24 z-30 mx-auto mt-6 max-w-[1120px] px-2 md:bottom-4">
      <div className="glass-modal flex items-center justify-between gap-3 rounded-full px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-sm">
          <ShoppingCart className="h-5 w-5 text-brand" aria-hidden />
          <span className="hidden sm:inline">
            {quantity} {quantity === 1 ? "entrada" : "entradas"} — {zone.zoneName}
          </span>
          <span className="font-semibold tabular-nums">{formatUSD(total)}</span>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Comprar ahora <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export default CartBar;
