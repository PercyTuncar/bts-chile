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

const DATE_OPTIONS: { value: EventDate; label: string }[] = [
  { value: "2026-10-14", label: "Miércoles 14 Oct" },
  { value: "2026-10-16", label: "Viernes 16 Oct" },
  { value: "2026-10-17", label: "Sábado 17 Oct" },
  { value: "both", label: "Todas las fechas" },
];

export function EntradasView({ zones }: { zones: ZoneData[] }) {
  const firstAvailable = useMemo(
    () => zones.find((zone) => zoneStatus(zone) !== "soldout") ?? null,
    [zones],
  );
  const [eventDate, setEventDate] = useState<EventDate>("both");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(firstAvailable?.zoneId ?? null);
  const [quantity, setQuantity] = useState(1);
  const [installments, setInstallments] = useState(1);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const selectedZone = zones.find((zone) => zone.zoneId === selectedZoneId) ?? null;
  const selectable = selectedZone && zoneStatus(selectedZone) !== "soldout";

  function handleSelect(zoneId: string) {
    setSelectedZoneId(zoneId);
    if (window.matchMedia("(max-width: 1279px)").matches) {
      setMobilePanelOpen(true);
      return;
    }
    selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="relative flex flex-col gap-8">
      <div className="rounded-card border border-[color-mix(in_srgb,var(--brand)_18%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-soft)_80%,transparent),transparent)] p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white"><CalendarDays className="h-5 w-5" aria-hidden /></span>
          <div>
            <h3 className="font-semibold">Selecciona la fecha del concierto</h3>
            <p className="mt-0.5 text-sm text-text-muted">Elige una fecha antes de seleccionar tu zona.</p>
          </div>
        </div>
        <div className="overflow-x-auto pb-1">
          <SegmentedControl<EventDate> ariaLabel="Fecha del concierto" value={eventDate} onChange={setEventDate} className="min-w-[620px]" options={DATE_OPTIONS} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="min-w-0"><StadiumMap zones={zones} selectedZoneId={selectedZoneId} onSelect={handleSelect} /></div>
        <aside ref={selectorRef} aria-live="polite" className="hidden xl:block xl:sticky xl:top-24 xl:self-start">
          {selectedZone && selectable ? (
            <TicketSelector zone={selectedZone} quantity={quantity} installments={installments} onQuantity={setQuantity} onInstallments={setInstallments} />
          ) : (
            <div className="rounded-card border border-dashed border-[color-mix(in_srgb,var(--text)_20%,transparent)] p-8 text-center text-text-muted">
              <MapPinned className="mx-auto mb-3 h-7 w-7 text-brand" aria-hidden />
              Selecciona una zona disponible en el mapa o la lista para continuar.
            </div>
          )}
        </aside>
      </div>

      <ZoneTable zones={zones} selectedZoneId={selectedZoneId} onSelect={handleSelect} />

      {selectedZone && selectable && (
        <>
          <div className="hidden xl:block"><CartBar zone={selectedZone} quantity={quantity} installments={installments} eventDate={eventDate} /></div>
           <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 px-3 xl:hidden">
            <button type="button" onClick={() => setMobilePanelOpen(true)} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--brand)_35%,transparent)] bg-surface px-4 py-3 text-left shadow-[0_12px_30px_color-mix(in_srgb,var(--text)_22%,transparent)]">
              <span className="min-w-0"><span className="block truncate text-sm font-semibold">{selectedZone.zoneName}</span><span className="block text-xs text-text-muted">{formatUSD(selectedZone.priceUSD)} por entrada</span></span>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white">Ver detalle <ChevronUp className="h-4 w-4" aria-hidden /></span>
            </button>
          </div>

          {mobilePanelOpen && (
            <div className="fixed inset-x-0 top-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex items-end bg-black/45 p-0 xl:hidden" role="dialog" aria-modal="true" aria-label="Detalle de la zona seleccionada">
              <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar detalle de zona" onClick={() => setMobilePanelOpen(false)} />
              <div className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[28px] bg-surface px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_40px_rgba(0,0,0,.28)] animate-[ticket-sheet-in_280ms_cubic-bezier(.32,.72,0,1)] motion-reduce:animate-none">
                <button type="button" onClick={() => setMobilePanelOpen(false)} className="mx-auto mb-4 block h-1.5 w-12 rounded-full bg-[color-mix(in_srgb,var(--text)_20%,transparent)]" aria-label="Cerrar detalle de zona" />
                <TicketSelector zone={selectedZone} quantity={quantity} installments={installments} onQuantity={setQuantity} onInstallments={setInstallments} />
                <div className="sticky bottom-0 z-10 mt-4 border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-surface pt-3"><CartBar zone={selectedZone} quantity={quantity} installments={installments} eventDate={eventDate} /></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EntradasView;
