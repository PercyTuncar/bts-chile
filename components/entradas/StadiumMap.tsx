"use client";

// Mapa SVG del Estadio Nacional con zonas por disponibilidad — PRD §5.2, §5.3.
// Cada zona es un <button> accesible (teclado + aria-label). Tooltip glass en hover/focus.
import { useState } from "react";
import { STATUS_FILL, STATUS_LABEL, zoneStatus, type ZoneData } from "@/lib/entradas/zones";
import { formatUSD } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

const VIEW_W = 120;
const VIEW_H = 90;

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
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full rounded-card glass-card"
        role="group"
        aria-label="Mapa de zonas del Estadio Nacional para BTS Chile 2026"
      >
        {/* Campo / cancha */}
        <ellipse
          cx={60}
          cy={44}
          rx={26}
          ry={17}
          fill="color-mix(in srgb, var(--brand) 10%, transparent)"
          stroke="color-mix(in srgb, var(--text) 15%, transparent)"
          strokeWidth={0.4}
        />
        {/* Escenario */}
        <rect x={50} y={3} width={20} height={5} rx={1.5} fill="var(--brand)" />
        <text x={60} y={6.6} textAnchor="middle" fontSize={2.6} fill="#fff">
          ESCENARIO
        </text>

        {zones.map((zone) => {
          const status = zoneStatus(zone);
          const selectable = status !== "soldout";
          const isSelected = zone.zoneId === selectedZoneId;
          const { x, y, width, height } = zone.mapCoordinates;
          return (
            <g key={zone.zoneId}>
              <rect
                role="button"
                tabIndex={0}
                aria-label={`${zone.zoneName}, ${formatUSD(zone.priceUSD)}, ${STATUS_LABEL[status]}`}
                aria-pressed={isSelected}
                x={x}
                y={y}
                width={width}
                height={height}
                rx={1.6}
                className={cn("cursor-pointer outline-none transition-opacity", !selectable && "cursor-not-allowed")}
                fill={STATUS_FILL[status]}
                stroke={isSelected ? "var(--brand)" : "color-mix(in srgb, var(--text) 20%, transparent)"}
                strokeWidth={isSelected ? 1.2 : 0.4}
                onMouseEnter={() => setHovered(zone.zoneId)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(zone.zoneId)}
                onBlur={() => setHovered(null)}
                onClick={() => selectable && onSelect(zone.zoneId)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && selectable) {
                    e.preventDefault();
                    onSelect(zone.zoneId);
                  }
                }}
              />
              <text
                x={x + width / 2}
                y={y + height / 2 + 0.9}
                textAnchor="middle"
                fontSize={2.3}
                fill="var(--text)"
                className="pointer-events-none select-none"
              >
                {zone.zoneNumber}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip glass */}
      {activeZone && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl glass px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${((activeZone.mapCoordinates.x + activeZone.mapCoordinates.width / 2) / VIEW_W) * 100}%`,
            top: `${(activeZone.mapCoordinates.y / VIEW_H) * 100}%`,
          }}
        >
          <p className="font-semibold">{activeZone.zoneName}</p>
          <p className="tabular-nums">
            {formatUSD(activeZone.priceUSD)} · {STATUS_LABEL[zoneStatus(activeZone)]}
          </p>
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: STATUS_FILL.available }} /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: STATUS_FILL.last }} /> Últimas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: STATUS_FILL.soldout }} /> Agotado
        </span>
      </div>
    </div>
  );
}

export default StadiumMap;
