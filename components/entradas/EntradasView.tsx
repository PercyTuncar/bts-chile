"use client";

// Contenedor interactivo de /entradas: estado de zona/fecha/cantidad/cuotas — PRD §5.
import { useMemo, useRef, useState } from "react";
import { CartBar } from "@/components/entradas/CartBar";
import { StadiumMap } from "@/components/entradas/StadiumMap";
import { TicketSelector } from "@/components/entradas/TicketSelector";
import { ZoneTable } from "@/components/entradas/ZoneTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { zoneStatus, type ZoneData } from "@/lib/entradas/zones";
import type { EventDate } from "@/types";

export function EntradasView({ zones }: { zones: ZoneData[] }) {
  const firstAvailable = useMemo(
    () => zones.find((z) => zoneStatus(z) !== "soldout") ?? null,
    [zones],
  );

  const [eventDate, setEventDate] = useState<EventDate>("both");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    firstAvailable?.zoneId ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [installments, setInstallments] = useState(1);

  const selectorRef = useRef<HTMLDivElement>(null);

  const selectedZone = zones.find((z) => z.zoneId === selectedZoneId) ?? null;
  const selectable = selectedZone && zoneStatus(selectedZone) !== "soldout";

  function handleSelect(zoneId: string) {
    setSelectedZoneId(zoneId);
    // Scroll suave al selector (§5.2 Sección 3).
    selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Selección de fecha */}
      <div className="flex justify-center">
        <SegmentedControl<EventDate>
          ariaLabel="Fecha del concierto"
          value={eventDate}
          onChange={setEventDate}
          options={[
            { value: "2026-10-16", label: "Viernes 16 Oct" },
            { value: "2026-10-17", label: "Sábado 17 Oct" },
            { value: "both", label: "Ambas fechas" },
          ]}
        />
      </div>

      {/* Mapa */}
      <StadiumMap zones={zones} selectedZoneId={selectedZoneId} onSelect={handleSelect} />

      {/* Tabla + selector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <ZoneTable zones={zones} selectedZoneId={selectedZoneId} onSelect={handleSelect} />

        <div ref={selectorRef} className="lg:sticky lg:top-24 lg:self-start">
          {selectedZone && selectable ? (
            <TicketSelector
              zone={selectedZone}
              quantity={quantity}
              installments={installments}
              onQuantity={setQuantity}
              onInstallments={setInstallments}
            />
          ) : (
            <div className="glass-card rounded-card p-6 text-center text-text-muted">
              Selecciona una zona disponible en el mapa o la tabla para continuar 💜
            </div>
          )}
        </div>
      </div>

      {/* Carrito flotante */}
      {selectedZone && selectable && (
        <CartBar
          zone={selectedZone}
          quantity={quantity}
          installments={installments}
          eventDate={eventDate}
        />
      )}
    </div>
  );
}

export default EntradasView;
