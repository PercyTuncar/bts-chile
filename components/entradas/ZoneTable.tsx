"use client";

// Tabla de zonas y precios — PRD §5.2 (Sección 5), §5.3.
import { PillButton } from "@/components/ui/PillButton";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABEL, zoneStatus, type ZoneData } from "@/lib/entradas/zones";
import { formatUSD } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE = {
  available: "success",
  last: "warning",
  soldout: "danger",
} as const;

export function ZoneTable({
  zones,
  selectedZoneId,
  onSelect,
}: {
  zones: ZoneData[];
  selectedZoneId: string | null;
  onSelect: (zoneId: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-card glass-card">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Zonas y precios del Estadio Nacional</caption>
        <thead>
          <tr className="text-text-muted">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Zona</th>
            <th className="px-4 py-3 font-medium">Precio USD</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => {
            const status = zoneStatus(zone);
            const selectable = status !== "soldout";
            const isSelected = zone.zoneId === selectedZoneId;
            return (
              <tr
                key={zone.zoneId}
                className={cn(
                  "border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]",
                  isSelected && "bg-brand-soft",
                )}
              >
                <td className="px-4 py-3 tabular-nums text-text-muted">{zone.zoneNumber}</td>
                <td className="px-4 py-3 font-medium">{zone.zoneName}</td>
                <td className="px-4 py-3 tabular-nums">{formatUSD(zone.priceUSD)}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  {selectable ? (
                    <PillButton
                      size="sm"
                      variant={isSelected ? "primary" : "secondary"}
                      onClick={() => onSelect(zone.zoneId)}
                    >
                      {isSelected ? "Seleccionada" : "+ Agregar"}
                    </PillButton>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ZoneTable;
