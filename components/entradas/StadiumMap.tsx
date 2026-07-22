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
        <p className="text-sm font-semibold">Disponibilidad por zona</p>
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

      <div className="relative overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[radial-gradient(circle_at_50%_40%,color-mix(in_srgb,var(--brand)_13%,transparent),transparent_48%)]">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full"
          role="group"
          aria-label="Mapa de zonas del Estadio Nacional para BTS Chile 2026"
        >
          <defs>
            <pattern id="soldout-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y="0" x2="0" y2="3" stroke="color-mix(in srgb, var(--danger) 62%, var(--text-muted))" strokeWidth="0.6" />
            </pattern>
            <filter id="selected-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="var(--brand)" floodOpacity="0.9" />
            </filter>
          </defs>

          <ellipse
            cx={60}
            cy={44}
            rx={26}
            ry={17}
            fill="color-mix(in srgb, var(--brand) 10%, transparent)"
            stroke="color-mix(in srgb, var(--text) 18%, transparent)"
            strokeWidth={0.4}
          />
          <path d="M34 44h52M60 27v34" stroke="color-mix(in srgb, var(--text) 12%, transparent)" strokeWidth={0.3} strokeDasharray="1.2 1.2" />

          <g aria-label="Escenario">
            <rect x={48} y={3} width={24} height={6} rx={1.8} fill="var(--brand)" />
            <path d="M53 5.3h14M55 7h10" stroke="#fff" strokeWidth={0.65} strokeLinecap="round" opacity={0.9} />
            <text x={60} y={6.7} textAnchor="middle" fontSize={2.4} fontWeight="700" fill="#fff">
              ESCENARIO
            </text>
          </g>

          {zones.map((zone) => {
            const status = zoneStatus(zone);
            const selectable = status !== "soldout";
            const isSelected = zone.zoneId === selectedZoneId;
            const { x, y, width, height } = zone.mapCoordinates;

            return (
              <g key={zone.zoneId}>
                <rect
                  role="button"
                  tabIndex={selectable ? 0 : -1}
                  aria-label={`${zone.zoneName}, ${formatUSD(zone.priceUSD)}, ${STATUS_LABEL[status]}`}
                  aria-pressed={isSelected}
                  aria-disabled={!selectable}
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={1.8}
                  className={cn(
                    "origin-center outline-none transition-[transform,opacity,filter] duration-200 motion-reduce:transition-none",
                    selectable ? "cursor-pointer hover:brightness-110 focus:brightness-110" : "cursor-not-allowed opacity-60",
                    isSelected && "animate-[ticket-zone-pulse_2.4s_ease-in-out_infinite] motion-reduce:animate-none",
                  )}
                  fill={STATUS_FILL[status]}
                  stroke={isSelected ? "var(--brand)" : STATUS_STROKE[status]}
                  strokeWidth={isSelected ? 1.25 : 0.55}
                  filter={isSelected ? "url(#selected-glow)" : undefined}
                  onMouseEnter={() => selectable && setHovered(zone.zoneId)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => selectable && setHovered(zone.zoneId)}
                  onBlur={() => setHovered(null)}
                  onClick={() => selectable && onSelect(zone.zoneId)}
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && selectable) {
                      event.preventDefault();
                      onSelect(zone.zoneId);
                    }
                  }}
                />
                {status === "soldout" && (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={1.8}
                    fill="url(#soldout-hatch)"
                    className="pointer-events-none"
                  />
                )}
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 0.9}
                  textAnchor="middle"
                  fontSize={2.35}
                  fontWeight={isSelected ? 800 : 650}
                  fill="var(--text)"
                  className="pointer-events-none select-none"
                >
                  {zone.zoneNumber}
                </text>
              </g>
            );
          })}
        </svg>

        {activeZone && (
          <div
            className="pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-full rounded-xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] glass px-3 py-2 text-xs shadow-lg sm:block"
            style={{
              left: `${((activeZone.mapCoordinates.x + activeZone.mapCoordinates.width / 2) / VIEW_W) * 100}%`,
              top: `${(activeZone.mapCoordinates.y / VIEW_H) * 100}%`,
            }}
          >
            <p className="font-semibold">{activeZone.zoneName}</p>
            <p className="tabular-nums text-text-muted">
              {formatUSD(activeZone.priceUSD)} · {STATUS_LABEL[zoneStatus(activeZone)]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StadiumMap;
