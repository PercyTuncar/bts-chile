"use client";

import { Minus, Plus, ShieldCheck, TicketCheck, WalletCards } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ZoneData } from "@/lib/entradas/zones";
import { formatUSD, round2 } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export function TicketSelector({
  zone,
  quantity,
  installments,
  onQuantity,
  onInstallments,
}: {
  zone: ZoneData;
  quantity: number;
  installments: number;
  onQuantity: (q: number) => void;
  onInstallments: (i: number) => void;
}) {
  const subtotal = zone.priceUSD * quantity;
  const perInstallment = round2(subtotal / installments);

  return (
    <GlassCard className="ticket-selector-panel flex flex-col gap-6 border border-[color-mix(in_srgb,var(--brand)_28%,transparent)] shadow-[0_16px_38px_color-mix(in_srgb,var(--brand)_12%,transparent)]">
      <div className="animate-[ticket-panel-in_200ms_ease-out] motion-reduce:animate-none" key={zone.zoneId}>
        <p className="text-sm font-medium text-text-muted">Zona seleccionada</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-h3 font-semibold">{zone.zoneName}</h3>
          <p className="text-xl font-bold tabular-nums text-brand">{formatUSD(zone.priceUSD)}</p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Cantidad (máx. 3)</p>
        <div className="flex min-h-12 items-center justify-between rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-1.5" aria-label="Cantidad de entradas">
          <button
            type="button"
            aria-label="Reducir cantidad"
            disabled={quantity === 1}
            onClick={() => onQuantity(quantity - 1)}
            className="grid h-10 w-10 place-items-center rounded-xl text-text transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus className="h-5 w-5" aria-hidden />
          </button>
          <span className="text-xl font-bold tabular-nums" aria-live="polite">{quantity}</span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            disabled={quantity === 3}
            onClick={() => onQuantity(quantity + 1)}
            className="grid h-10 w-10 place-items-center rounded-xl text-text transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Cuotas</p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Número de cuotas">
          {[1, 2, 3].map((value) => {
            const isActive = installments === value;
            const installmentPrice = round2(subtotal / value);
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onInstallments(value)}
                className={cn(
                  "min-h-16 rounded-xl border px-2 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  isActive ? "border-brand bg-brand-soft shadow-[inset_0_0_0_1px_var(--brand)]" : "border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface hover:border-brand",
                )}
              >
                <span className="block text-sm font-semibold">{value} {value === 1 ? "cuota" : "cuotas"}</span>
                <span className="mt-0.5 block text-xs tabular-nums text-text-muted">{formatUSD(installmentPrice)} c/u</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[color-mix(in_srgb,var(--brand)_24%,transparent)] bg-brand-soft p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold">Subtotal ({quantity} ×)</span>
          <span className="text-xl font-bold tabular-nums text-brand">{formatUSD(subtotal)}</span>
        </div>
        {installments > 1 && (
          <div className="mt-2 flex items-center justify-between gap-4 text-sm text-text-muted">
            <span>{installments} cuotas de (referencial)</span>
            <span className="tabular-nums">{formatUSD(perInstallment)}</span>
          </div>
        )}
        <p className="mt-3 text-xs leading-relaxed text-text-muted">
          La comisión de servicio (10%) se calcula en el checkout; las cuotas se aplican sobre el total.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] pt-4 text-center text-[11px] font-medium text-text-muted">
        <span className="flex flex-col items-center gap-1"><ShieldCheck className="h-4 w-4 text-brand" aria-hidden />100% Seguro</span>
        <span className="flex flex-col items-center gap-1"><TicketCheck className="h-4 w-4 text-brand" aria-hidden />Vendedor Verificado</span>
        <span className="flex flex-col items-center gap-1"><WalletCards className="h-4 w-4 text-brand" aria-hidden />Pago en Cuotas</span>
      </div>
    </GlassCard>
  );
}

export default TicketSelector;
