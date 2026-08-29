"use client";

import { useState } from "react";
import { STATUS_LABEL, zoneStatus, type ZoneData } from "@/lib/entradas/zones";
import { formatUSD } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

const VIEW_W = 120;
const VIEW_H = 90;

const STATUS_FILL = {
  available: "color-mix(in srgb, var(--success) 62%, var(--surface))",
  last: "color-mix(in srgb, var(--warning) 65%, var(--surface))",
  soldout: "color-mix(in srgb, var(--danger) 30%, var(--surface))",
} as const;

const STATUS_STROKE = {
  available: "color-mix(in srgb, var(--success) 78%, var(--text))",
  last: "color-mix(in srgb, var(--warning) 78%, var(--text))",
  soldout: "color-mix(in srgb, var(--danger) 58%, var(--text-muted))",
} as const;

export function StadiumMap({
  zones,
  selectedZoneId,
  onSelect,
}: {
  zones: ZoneData[];
  selectedZoneId: string | null;
  onSelect: (zoneId: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const activeId = hovered ?? selectedZoneId;
  const activeZone = zones.find((z) => z.zoneId === activeId) ?? null;

  return (
    <div className="w-full rounded-card border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] p-3 shadow-[0_12px_32px_color-mix(in_srgb,var(--text)_8%,transparent)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">Mapa del Estadio Nacional</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-text-muted" aria-label="Leyenda de disponibilidad">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-success ring-2 ring-[color-mix(in_srgb,var(--success)_25%,transparent)]" />
            Disponible
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-warning ring-2 ring-[color-mix(in_srgb,var(--warning)_25%,transparent)]" />
            Últimas entradas
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-danger ring-2 ring-[color-mix(in_srgb,var(--danger)_25%,transparent)]" />
            Agotado
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,var(--text)_10%,transparent)]">
        <img
          src="https://res.cloudinary.com/dz1qivt7m/image/upload/v1775645342/mapa_chile_taxr0b.jpg"
          alt="Mapa de zonas del Estadio Nacional para BTS Chile 2026"
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
}

export default StadiumMap;
