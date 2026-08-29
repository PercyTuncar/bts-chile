"use client";

import { useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronUp, MapPinned } from "lucide-react";
import { CartBar } from "@/components/entradas/CartBar";
import { StadiumMap } from "@/components/entradas/StadiumMap";
import { TicketSelector } from "@/components/entradas/TicketSelector";
import { ZoneTable } from "@/components/entradas/ZoneTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { zoneStatus, type ZoneData } from "@/lib/entradas/zones";
import { formatUSD } from "@/lib/utils/formatters";
import type { EventDate } from "@/types";

const DATE_OPTIONS: { value: EventDate; label: string; disabled?: boolean }[] = [
  { value: "2026-10-14", label: "Miércoles 14 Oct - AGOTADO", disabled: true },
  { value: "2026-10-16", label: "Viernes 16 Oct - AGOTADO", disabled: true },
  { value: "2026-10-17", label: "Sábado 17 Oct" },
];

export function EntradasView({ zones }: { zones: ZoneData[] }) {
  const firstAvailable = useMemo(
    () => zones.find((zone) => zoneStatus(zone) !== "soldout") ?? null,
    [zones],
  );
  const [eventDate, setEventDate] = useState<EventDate>("2026-10-17");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [installments, setInstallments] = useState(1);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [sheetDragOffset, setSheetDragOffset] = useState(0);
  const sheetDragStartY = useRef<number | null>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  const selectedZone = zones.find((zone) => zone.zoneId === selectedZoneId) ?? null;
  const selectable = selectedZone && zoneStatus(selectedZone) !== "soldout";
  const quantity = selectedZoneId ? (quantities[selectedZoneId] || 0) : 0;

  const handleQuantityChange = (zoneId: string, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [zoneId]: newQuantity
    }));
    if (newQuantity > 0) {
      setSelectedZoneId(zoneId);
    }
  };

  const handleSelect = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    // No hacer scroll automático
  };

  function closeMobilePanel() {
    setSheetDragOffset(0);
    setMobilePanelOpen(false);
  }

  function handleSheetDragStart(event: React.PointerEvent<HTMLButtonElement>) {
    sheetDragStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSheetDragMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (sheetDragStartY.current === null) return;
    setSheetDragOffset(Math.max(0, event.clientY - sheetDragStartY.current));
  }

  function handleSheetDragEnd(event: React.PointerEvent<HTMLButtonElement>) {
    if (sheetDragStartY.current === null) return;
    const distance = Math.max(0, event.clientY - sheetDragStartY.current);
    sheetDragStartY.current = null;
    setSheetDragOffset(0);
    if (distance >= 96) closeMobilePanel();
  }

  return (
    <div className="relative flex flex-col gap-8">
      {/* Layout: Lista de zonas (izquierda) + Resumen (derecha sticky) */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">

        {/* Lista de zonas con tabla */}
        <div className="min-w-0">
          <ZoneTable zones={zones} selectedZoneId={selectedZoneId} onSelect={handleSelect} quantities={quantities} onQuantityChange={handleQuantityChange} />
        </div>

        {/* Resumen sticky en desktop */}
        <aside ref={selectorRef} aria-live="polite" className="hidden xl:block xl:sticky xl:top-24 xl:self-start">
          {Object.values(quantities).some(q => q > 0) ? (
            <TicketSelector zones={zones} quantities={quantities} installments={installments} onInstallments={setInstallments} eventDate={eventDate} />
          ) : (
            <div className="rounded-card border border-dashed border-[color-mix(in_srgb,var(--text)_20%,transparent)] p-8 text-center text-text-muted">
              <MapPinned className="mx-auto mb-3 h-7 w-7 text-brand" aria-hidden />
              Selecciona una zona y cantidad para ver el resumen.
            </div>
          )}
        </aside>
      </div>

      {/* Desktop: CartBar pegado abajo de la lista */}
      {Object.values(quantities).some(q => q > 0) && (
        <>
          <div className="hidden xl:block"><CartBar zone={selectedZone!} quantity={Object.values(quantities).reduce((a, b) => a + b, 0)} installments={installments} eventDate={eventDate} /></div>

          {/* Mobile: Botón flotante */}
          <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 px-3 xl:hidden">
            <button type="button" onClick={() => setMobilePanelOpen(true)} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--brand)_35%,transparent)] bg-surface px-4 py-3 text-left shadow-[0_12px_30px_color-mix(in_srgb,var(--text)_22%,transparent)]">
              <span className="min-w-0"><span className="block truncate text-sm font-semibold">Resumen de compra</span><span className="block text-xs text-text-muted">{Object.values(quantities).reduce((a, b) => a + b, 0)} entrada(s) seleccionada(s)</span></span>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white">Ver detalle <ChevronUp className="h-4 w-4" aria-hidden /></span>
            </button>
          </div>

          {/* Mobile: Panel deslizante */}
          {mobilePanelOpen && (
            <div className="fixed inset-x-0 top-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex items-end bg-black/45 p-0 xl:hidden" role="dialog" aria-modal="true" aria-label="Detalle de la zona seleccionada">
              <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar detalle de zona" onClick={closeMobilePanel} />
              <div
                className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[28px] bg-surface px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_40px_rgba(0,0,0,.28)] animate-[ticket-sheet-in_280ms_cubic-bezier(.32,.72,0,1)] motion-reduce:animate-none"
                style={{ transform: sheetDragOffset ? `translateY(${sheetDragOffset}px)` : undefined }}
              >
                <button
                  type="button"
                  onClick={closeMobilePanel}
                  onPointerDown={handleSheetDragStart}
                  onPointerMove={handleSheetDragMove}
                  onPointerUp={handleSheetDragEnd}
                  onPointerCancel={handleSheetDragEnd}
                  className="mx-auto mb-4 block touch-none p-3"
                  aria-label="Arrastra hacia abajo para cerrar el detalle de zona"
                >
                  <span className="block h-1.5 w-12 rounded-full bg-[color-mix(in_srgb,var(--text)_20%,transparent)]" />
                </button>
                <TicketSelector zones={zones} quantities={quantities} installments={installments} onInstallments={setInstallments} eventDate={eventDate} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EntradasView;
