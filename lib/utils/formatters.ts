// Formatters y utilidades de negocio — PRD §5, §6.1, §4.6.
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Timestamp } from "firebase/firestore";

const SANTIAGO_TZ = "America/Santiago";

/** Precio en USD con separadores. Ej: 2087.8 → "$2,087.80" */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Redondeo a 2 decimales (evita errores de coma flotante). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// --------------------------------------------------------------------------
// Fórmula canónica de precios del checkout — PRD §6.1
// Las cuotas SIEMPRE se calculan sobre el TOTAL (con comisión).
// --------------------------------------------------------------------------
export interface TicketPricing {
  subtotalUSD: number;
  serviceFeeUSD: number;
  totalUSD: number;
  installmentAmountUSD: number;
}

export const SERVICE_FEE_RATE = 0.1; // 10%

export function computeTicketPricing(
  pricePerTicketUSD: number,
  quantity: number,
  installments: number,
): TicketPricing {
  const subtotalUSD = round2(pricePerTicketUSD * quantity);
  const serviceFeeUSD = round2(subtotalUSD * SERVICE_FEE_RATE);
  const totalUSD = round2(subtotalUSD + serviceFeeUSD);
  const installmentAmountUSD = round2(totalUSD / Math.max(1, installments));
  return { subtotalUSD, serviceFeeUSD, totalUSD, installmentAmountUSD };
}

// --------------------------------------------------------------------------
// Fechas
// --------------------------------------------------------------------------
type DateLike = Date | Timestamp | number | string;

function toDate(value: DateLike): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number" || typeof value === "string") return new Date(value);
  // Firestore Timestamp
  return value.toDate();
}

/** Fecha larga en español, zona America/Santiago. Ej: "sábado, 17 de octubre de 2026" */
export function formatDateLong(value: DateLike): string {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: SANTIAGO_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(toDate(value));
}

/** Fecha corta ISO (YYYY-MM-DD) en zona Santiago. */
export function formatDateISO(value: DateLike): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SANTIAGO_TZ }).format(
    toDate(value),
  );
}

/** ISO 8601 completo (para datePublished de JSON-LD). */
export function toISOString(value: DateLike): string {
  return toDate(value).toISOString();
}

/** Tiempo relativo, ej: "hace 3 horas". §8.1 */
export function formatRelative(value: DateLike): string {
  return formatDistanceToNow(toDate(value), { addSuffix: true, locale: es });
}
