"use client";

import { ShieldCheck, TicketCheck, WalletCards } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ZoneData } from "@/lib/entradas/zones";
import { formatUSD, round2 } from "@/lib/utils/formatters";

export function TicketSelector({
  zones,
  quantities,
  installments,
  onInstallments,
  eventDate,
}: {
  zones: ZoneData[];
  quantities: Record<string, number>;
  installments: number;
  onInstallments: (i: number) => void;
  eventDate: string;
}) {
  // Calcular todas las zonas seleccionadas
  const selectedZones = zones
    .map(zone => ({
      zone,
      quantity: quantities[zone.zoneId] || 0,
    }))
    .filter(item => item.quantity > 0);

  const subtotal = selectedZones.reduce((acc, item) => acc + (item.zone.priceUSD * item.quantity), 0);
  const totalQuantity = selectedZones.reduce((acc, item) => acc + item.quantity, 0);
  const perInstallment = round2(subtotal / installments);

  const handlePagar = () => {
    // Crear mensaje para WhatsApp
    let message = `🎟️ *Solicitud de Entradas BTS Chile 2026*\n\n`;
    message += `📅 *Fecha:* ${eventDate === "2026-10-17" ? "Sábado 17 de octubre 2026" : eventDate}\n\n`;
    message += `*Entradas seleccionadas:*\n`;

    selectedZones.forEach(item => {
      message += `• ${item.zone.zoneName}: ${item.quantity} entrada(s) × ${formatUSD(item.zone.priceUSD)} = ${formatUSD(item.zone.priceUSD * item.quantity)}\n`;
    });

    message += `\n💰 *Subtotal:* ${formatUSD(subtotal)}\n`;
    message += `📦 *Total entradas:* ${totalQuantity}\n`;
    message += `💳 *Pago:* ${installments === 1 ? "Al contado" : `${installments} cuotas de ${formatUSD(perInstallment)}`}\n`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/51944784488?text=${encodedMessage}`, '_blank');
  };

  return (
    <GlassCard className="ticket-selector-panel flex flex-col gap-6 border border-[color-mix(in_srgb,var(--brand)_28%,transparent)] shadow-[0_16px_38px_color-mix(in_srgb,var(--brand)_12%,transparent)]">
      <div className="animate-[ticket-panel-in_200ms_ease-out] motion-reduce:animate-none space-y-4">
        <div>
          <p className="text-sm font-semibold text-text-muted">Resumen de compra</p>
          <h3 className="mt-1 text-h3 font-semibold">{totalQuantity} entrada(s) seleccionada(s)</h3>
        </div>

        {/* Lista de zonas seleccionadas */}
        <div className="space-y-2">
          {selectedZones.map(item => (
            <div key={item.zone.zoneId} className="flex items-start justify-between text-sm py-2 border-b border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
              <div className="flex-1">
                <p className="font-semibold">{item.zone.zoneName}</p>
                <p className="text-xs text-text-muted">{item.quantity} × {formatUSD(item.zone.priceUSD)}</p>
              </div>
              <p className="font-semibold tabular-nums">{formatUSD(item.zone.priceUSD * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Resumen total */}
        <div className="space-y-2 rounded-xl bg-[color-mix(in_srgb,var(--brand-soft)_60%,transparent)] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Total entradas:</span>
            <span className="font-semibold tabular-nums">{totalQuantity}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] pt-2">
            <span className="font-semibold">Subtotal:</span>
            <span className="text-lg font-bold tabular-nums">{formatUSD(subtotal)}</span>
          </div>
        </div>

        {/* Opciones de cuotas */}
        <div>
          <p className="mb-3 text-sm font-semibold">Cuotas sin interés</p>
          <SegmentedControl<number>
            ariaLabel="Número de cuotas"
            value={installments}
            onChange={onInstallments}
            options={[
              { value: 1, label: "1 cuota" },
              { value: 2, label: "2 cuotas" },
              { value: 3, label: "3 cuotas", disabled: true },
            ]}
          />
          {installments === 3 && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs text-danger font-medium">
                ⚠️ No disponible
              </span>
            </div>
          )}
        </div>

        {installments > 1 && (
          <div className="rounded-xl bg-[color-mix(in_srgb,var(--brand-soft)_60%,transparent)] p-3 text-sm">
            <span className="text-text-muted">{installments} cuotas de:</span>
            <span className="ml-2 text-lg font-bold tabular-nums">{formatUSD(perInstallment)}</span>
          </div>
        )}

        {/* Botón de reservar */}
        <button
          onClick={handlePagar}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20BA5A] px-8 py-4 text-base font-bold text-white transition-all hover:scale-105 shadow-lg cursor-pointer"
        >
          <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
            <path d="M16 0C7.164 0 0 7.164 0 16c0 2.825.738 5.488 2.031 7.806L.7 29.3l5.694-1.494A15.936 15.936 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm8.281 22.719c-.344.969-2.031 1.781-2.794 1.894-.75.113-1.706.169-2.75-.169a25.118 25.118 0 01-2.5-.919c-4.4-1.9-7.262-6.338-7.481-6.631-.219-.294-1.794-2.387-1.794-4.556 0-2.169 1.137-3.237 1.544-3.681.406-.444.887-.556 1.181-.556.294 0 .588.006.844.013.269.013.631-.1.988.756.356.856 1.231 3 1.344 3.219.113.219.188.475.037.769-.15.294-.225.481-.444.737-.219.256-.463.575-.663.769-.219.219-.444.456-.188.894.256.431 1.144 1.888 2.456 3.056 1.688 1.506 3.1 1.975 3.538 2.194.444.219.7.181.956-.113.256-.294 1.1-1.281 1.394-1.725.294-.444.588-.369.994-.219.406.15 2.569 1.213 3.006 1.431.438.219.731.325.838.506.106.181.106 1.044-.238 2.013z" />
          </svg>
          Reservar
        </button>

        <p className="text-xs leading-relaxed text-text-muted">
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
