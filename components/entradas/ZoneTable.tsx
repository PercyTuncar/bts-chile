"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowDownUp, Check, Plus } from "lucide-react";
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

type SortMode = "default" | "price-asc" | "price-desc" | "availability";

export function ZoneTable({
  zones,
  selectedZoneId,
  onSelect,
}: {
  zones: ZoneData[];
  selectedZoneId: string | null;
  onSelect: (zoneId: string) => void;
}) {
  const [sort, setSort] = useState<SortMode>("default");
  const sortedZones = useMemo(() => {
    if (sort === "default") return zones;
    return [...zones].sort((a, b) => {
      if (sort === "price-asc") return a.priceUSD - b.priceUSD;
      if (sort === "price-desc") return b.priceUSD - a.priceUSD;
      const order = { available: 0, last: 1, soldout: 2 } as const;
      return order[zoneStatus(a)] - order[zoneStatus(b)];
    });
  }, [sort, zones]);

  return (
    <section aria-label="Lista de zonas y precios" className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold">Elige tu zona</p>
          <p className="text-sm text-text-muted">Selecciona una zona disponible para continuar.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <ArrowDownUp className="h-4 w-4" aria-hidden />
          <span className="sr-only">Ordenar zonas</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            className="min-h-11 rounded-xl border border-[color-mix(in_srgb,var(--text)_14%,transparent)] bg-surface px-3 text-sm font-medium text-text outline-none focus:border-brand"
          >
            <option value="default">Ordenar por: Orden original</option>
            <option value="price-asc">Ordenar por: Precio menor</option>
            <option value="price-desc">Ordenar por: Precio mayor</option>
            <option value="availability">Ordenar por: Disponibilidad</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:hidden">
        {sortedZones.map((zone) => {
          const status = zoneStatus(zone);
          const selectable = status !== "soldout";
          const isSelected = zone.zoneId === selectedZoneId;
          return (
            <article
              key={zone.zoneId}
              className={cn(
                "rounded-card border p-4 transition-colors",
                selectable ? "border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface" : "border-[color-mix(in_srgb,var(--text)_8%,transparent)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] opacity-65",
                isSelected && "border-brand bg-brand-soft shadow-[inset_4px_0_0_var(--brand)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-text-muted">Zona {zone.zoneNumber}</p>
                  <h3 className="mt-0.5 font-semibold">{zone.zoneName}</h3>
                  <div className="mt-2"><Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge></div>
                </div>
                <p className="text-lg font-bold tabular-nums">{formatUSD(zone.priceUSD)}</p>
              </div>
              {selectable && (
                <PillButton
                  fullWidth
                  className="mt-4 min-h-11"
                  variant={isSelected ? "primary" : "secondary"}
                  onClick={() => onSelect(zone.zoneId)}
                >
                  {isSelected ? <><Check className="h-4 w-4" aria-hidden /> Seleccionada</> : <><Plus className="h-4 w-4" aria-hidden /> Agregar</>}
                </PillButton>
              )}
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-card border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-surface md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Zonas y precios del Estadio Nacional</caption>
          <thead>
            <tr className="border-b border-[color-mix(in_srgb,var(--text)_10%,transparent)] text-text-muted">
              <th className="px-4 py-4 font-medium">#</th>
              <th className="px-4 py-4 font-medium">Zona</th>
              <th className="px-4 py-4 font-medium">Precio USD</th>
              <th className="px-4 py-4 font-medium">Estado</th>
              <th className="px-4 py-4 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {sortedZones.map((zone) => {
              const status = zoneStatus(zone);
              const selectable = status !== "soldout";
              const isSelected = zone.zoneId === selectedZoneId;
              return (
                <tr
                  key={zone.zoneId}
                  className={cn(
                    "border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--brand-soft)_45%,transparent)]",
                    isSelected && "bg-brand-soft shadow-[inset_4px_0_0_var(--brand)]",
                  )}
                >
                  <td className="px-4 py-4 tabular-nums text-text-muted">{zone.zoneNumber}</td>
                  <td className="px-4 py-4 font-semibold">{zone.zoneName}</td>
                  <td className="px-4 py-4 text-base font-semibold tabular-nums">{formatUSD(zone.priceUSD)}</td>
                  <td className="px-4 py-4"><Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge></td>
                  <td className="px-4 py-4">
                    {selectable ? (
                      <PillButton size="sm" variant={isSelected ? "primary" : "secondary"} onClick={() => onSelect(zone.zoneId)}>
                        {isSelected ? <><Check className="h-4 w-4" aria-hidden /> Seleccionada</> : <><Plus className="h-4 w-4" aria-hidden /> Agregar</>}
                      </PillButton>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-text-muted"><ArrowDownAZ className="h-4 w-4" aria-hidden /> No disponible</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ZoneTable;
