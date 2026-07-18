"use client";

// Selector de cantidad y cuotas — PRD §5.2 (Sección 6). Máx 3 entradas, 1-3 cuotas.
import { GlassCard } from "@/components/ui/GlassCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ZoneData } from "@/lib/entradas/zones";
import { formatUSD, round2 } from "@/lib/utils/formatters";

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
  // Monto por cuota REFERENCIAL (sin comisión). El valor vinculante es el del checkout (§6.1).
  const perInstallment = round2(subtotal / installments);

  return (
    <GlassCard className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-text-muted">Zona seleccionada</p>
        <p className="text-h3 font-semibold">
          {zone.zoneName} — {formatUSD(zone.priceUSD)}
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Cantidad (máx. 3)</p>
        <SegmentedControl<string>
          ariaLabel="Cantidad de entradas"
          value={String(quantity)}
          onChange={(v) => onQuantity(Number(v))}
          options={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
          ]}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Cuotas</p>
        <SegmentedControl<string>
          ariaLabel="Número de cuotas"
          value={String(installments)}
          onChange={(v) => onInstallments(Number(v))}
          options={[
            { value: "1", label: "1 cuota" },
            { value: "2", label: "2 cuotas" },
            { value: "3", label: "3 cuotas" },
          ]}
        />
      </div>

      <div className="rounded-2xl bg-brand-soft p-4">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Subtotal ({quantity} ×)</span>
          <span className="tabular-nums font-semibold">{formatUSD(subtotal)}</span>
        </div>
        {installments > 1 && (
          <div className="mt-1 flex items-center justify-between text-sm text-text-muted">
            <span>
              {installments} cuotas de (referencial)
            </span>
            <span className="tabular-nums">{formatUSD(perInstallment)}</span>
          </div>
        )}
        <p className="mt-2 text-xs text-text-muted">
          La comisión de servicio (10%) se calcula en el checkout; las cuotas se aplican sobre el total.
        </p>
      </div>
    </GlassCard>
  );
}

export default TicketSelector;
