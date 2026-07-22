// Datos canónicos de zonas del Estadio Nacional — PRD §5.2.
// Sirve como (1) fallback cuando la colección `tickets` aún no tiene datos y
// (2) fuente del script de seed. Coordenadas para el mapa SVG en viewBox 120×90.
import type { EventDate } from "@/types";

export interface ZoneData {
  zoneId: string;
  zoneName: string;
  zoneNumber: number;
  priceUSD: number;
  stock: number;
  isActive: boolean;
  isSoldOut: boolean;
  description: string;
  availableDates: EventDate[];
  mapCoordinates: { x: number; y: number; width: number; height: number };
}

const BOTH: EventDate[] = ["2026-10-14", "2026-10-16", "2026-10-17", "both"];

export const DEFAULT_ZONES: ZoneData[] = [
  { zoneId: "pacifico-medio", zoneName: "Pacífico Medio", zoneNumber: 1, priceUSD: 1784, stock: 0, isActive: true, isSoldOut: true, description: "Vista frontal privilegiada, al centro de Pacífico.", availableDates: BOTH, mapCoordinates: { x: 40, y: 20, width: 40, height: 9 } },
  { zoneId: "cancha-pacifico", zoneName: "Cancha Pacífico", zoneNumber: 2, priceUSD: 991, stock: 0, isActive: true, isSoldOut: true, description: "Cancha lado Pacífico, de pie frente al escenario.", availableDates: BOTH, mapCoordinates: { x: 48, y: 33, width: 24, height: 8 } },
  { zoneId: "cancha-andes", zoneName: "Cancha Andes", zoneNumber: 3, priceUSD: 949, stock: 20, isActive: true, isSoldOut: false, description: "Cancha lado Andes, de pie. ¡Últimas disponibles!", availableDates: BOTH, mapCoordinates: { x: 48, y: 47, width: 24, height: 8 } },
  { zoneId: "pacifico-alto", zoneName: "Pacífico Alto", zoneNumber: 4, priceUSD: 892, stock: 0, isActive: true, isSoldOut: true, description: "Tribuna alta lado Pacífico.", availableDates: BOTH, mapCoordinates: { x: 62, y: 10, width: 28, height: 8 } },
  { zoneId: "pacifico-bajo", zoneName: "Pacífico Bajo", zoneNumber: 5, priceUSD: 734, stock: 0, isActive: true, isSoldOut: true, description: "Tribuna baja lado Pacífico.", availableDates: BOTH, mapCoordinates: { x: 30, y: 10, width: 28, height: 8 } },
  { zoneId: "movilidad-reducida", zoneName: "Movilidad Reducida", zoneNumber: 6, priceUSD: 734, stock: 0, isActive: true, isSoldOut: true, description: "Zona accesible con espacio para silla de ruedas.", availableDates: BOTH, mapCoordinates: { x: 40, y: 41, width: 6, height: 8 } },
  { zoneId: "andes-bajo-centro", zoneName: "Andes Bajo Centro", zoneNumber: 7, priceUSD: 615, stock: 0, isActive: true, isSoldOut: true, description: "Tribuna baja Andes, sector central.", availableDates: BOTH, mapCoordinates: { x: 48, y: 60, width: 24, height: 8 } },
  { zoneId: "andes-bajo-norte", zoneName: "Andes Bajo Norte", zoneNumber: 8, priceUSD: 555, stock: 0, isActive: true, isSoldOut: true, description: "Tribuna baja Andes, sector norte.", availableDates: BOTH, mapCoordinates: { x: 22, y: 60, width: 24, height: 8 } },
  { zoneId: "andes-bajo-sur", zoneName: "Andes Bajo Sur", zoneNumber: 9, priceUSD: 555, stock: 0, isActive: true, isSoldOut: true, description: "Tribuna baja Andes, sector sur.", availableDates: BOTH, mapCoordinates: { x: 74, y: 60, width: 24, height: 8 } },
  { zoneId: "andes-alto-centro", zoneName: "Andes Alto Centro", zoneNumber: 10, priceUSD: 535, stock: 0, isActive: true, isSoldOut: true, description: "Tribuna alta Andes, sector central.", availableDates: BOTH, mapCoordinates: { x: 48, y: 70, width: 24, height: 8 } },
  { zoneId: "andes-alto-norte", zoneName: "Andes Alto Norte", zoneNumber: 11, priceUSD: 496, stock: 0, isActive: true, isSoldOut: true, description: "Tribuna alta Andes, sector norte.", availableDates: BOTH, mapCoordinates: { x: 22, y: 70, width: 24, height: 8 } },
  { zoneId: "andes-alto-sur", zoneName: "Andes Alto Sur", zoneNumber: 12, priceUSD: 496, stock: 0, isActive: true, isSoldOut: true, description: "Tribuna alta Andes, sector sur.", availableDates: BOTH, mapCoordinates: { x: 74, y: 70, width: 24, height: 8 } },
  { zoneId: "galeria-norte", zoneName: "Galería Norte", zoneNumber: 13, priceUSD: 377, stock: 0, isActive: true, isSoldOut: true, description: "Galería en la cabecera norte.", availableDates: BOTH, mapCoordinates: { x: 6, y: 30, width: 14, height: 12 } },
  { zoneId: "galeria-sur", zoneName: "Galería Sur", zoneNumber: 14, priceUSD: 377, stock: 0, isActive: true, isSoldOut: true, description: "Galería en la cabecera sur.", availableDates: BOTH, mapCoordinates: { x: 100, y: 30, width: 14, height: 12 } },
  { zoneId: "pacifico-lateral-norte", zoneName: "Pacífico Lateral Norte", zoneNumber: 15, priceUSD: 299, stock: 0, isActive: true, isSoldOut: true, description: "Lateral Pacífico, sector norte.", availableDates: BOTH, mapCoordinates: { x: 6, y: 46, width: 14, height: 12 } },
  { zoneId: "pacifico-lateral-sur", zoneName: "Pacífico Lateral Sur", zoneNumber: 16, priceUSD: 299, stock: 0, isActive: true, isSoldOut: true, description: "Lateral Pacífico, sector sur.", availableDates: BOTH, mapCoordinates: { x: 100, y: 46, width: 14, height: 12 } },
];

export type ZoneStatus = "available" | "last" | "soldout";

export function zoneStatus(zone: Pick<ZoneData, "stock" | "isActive">): ZoneStatus {
  if (!zone.isActive || zone.stock <= 0) return "soldout";
  if (zone.stock <= 5) return "last";
  return "available";
}

export const STATUS_LABEL: Record<ZoneStatus, string> = {
  available: "Disponible",
  last: "Últimas entradas",
  soldout: "Agotado",
};

/** Color de relleno del mapa/tabla por estado (semitransparente). */
export const STATUS_FILL: Record<ZoneStatus, string> = {
  available: "color-mix(in srgb, var(--success) 45%, transparent)",
  last: "color-mix(in srgb, var(--warning) 50%, transparent)",
  soldout: "color-mix(in srgb, var(--danger) 30%, transparent)",
};
