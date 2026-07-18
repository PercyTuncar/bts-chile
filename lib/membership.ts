// Definición de tiers de membresía ARMY Boom v4 — PRD §10.1, §10.2.
import type { MembershipType } from "@/types";

export interface Tier {
  key: MembershipType;
  name: string;
  monthlyUSD: number;
  annualUSD: number;
  tagline: string;
  benefits: string[];
  /** Plan de facturación PayPal (mensual). Identificador público, no secreto. */
  planIdMonthly?: string;
  recommended?: boolean;
  accent?: boolean; // VIP usa acento champagne
}

export const TIERS: Tier[] = [
  {
    key: "free",
    name: "Free",
    monthlyUSD: 0,
    annualUSD: 0,
    tagline: "Explora la comunidad",
    benefits: [
      "Perfil público",
      "Leer noticias",
      "Ver el feed y reaccionar en comunidad",
    ],
  },
  {
    key: "basic",
    name: "ARMY Basic",
    monthlyUSD: 1,
    annualUSD: 10,
    tagline: "Publica en la comunidad",
    benefits: [
      "Todo lo de Free",
      "Publicar en comunidad (con moderación)",
      'Badge "BASIC"',
      "Newsletter mensual",
      "5% de descuento en tienda",
    ],
    planIdMonthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_BASIC,
    recommended: true,
  },
  {
    key: "premium",
    name: "ARMY Premium",
    monthlyUSD: 12,
    annualUSD: 120,
    tagline: "Acceso anticipado y más",
    benefits: [
      "Todo lo de Basic",
      'Badge "PREMIUM" morado',
      "Acceso anticipado a entradas (12h antes)",
      "10% de descuento en tienda",
      "Sección /premium con contenido exclusivo",
      "Insignia especial en comunidad",
    ],
    planIdMonthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_PREMIUM,
  },
  {
    key: "vip",
    name: "ARMY VIP — Boom v4",
    monthlyUSD: 25,
    annualUSD: 240,
    tagline: "La experiencia ARMY completa",
    benefits: [
      "Todo lo de Premium",
      'Badge "💜 BOOM v4" (champagne)',
      "Newsletter VIP semanal",
      "Prioridad en lista de espera de entradas",
      "15% de descuento en tienda",
      'Nombre en la "Galería de ARMY Fundadores"',
      "Salas de WhatsApp exclusivas",
      "Sorteo mensual de merch",
    ],
    planIdMonthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_VIP,
    accent: true,
  },
];

export const PAID_TIERS = TIERS.filter((t) => t.key !== "free");

// --------------------------------------------------------------------------
// Límite de caracteres al publicar en comunidad, según plan (§8.1).
// El texto se mide en caracteres planos (sin el HTML del formato).
// --------------------------------------------------------------------------
export const POST_CHAR_LIMITS: Record<MembershipType, number> = {
  free: 0, // free no publica (bloqueado en el composer y en las reglas)
  basic: 500,
  premium: 1000,
  vip: 2000,
};

/** Máximo de caracteres del post para un usuario. Admin: 5.000. */
export function postCharLimit(membershipType: MembershipType, isAdmin: boolean): number {
  if (isAdmin) return 5000;
  return POST_CHAR_LIMITS[membershipType] ?? 500;
}

// Máximo de imágenes en un post de tipo "álbum", según plan (§8.1).
export const ALBUM_IMAGE_LIMITS: Record<MembershipType, number> = {
  free: 0,
  basic: 5,
  premium: 10,
  vip: 15,
};

/** Máximo de imágenes del álbum para un usuario. Admin: 20. */
export function albumImageLimit(membershipType: MembershipType, isAdmin: boolean): number {
  if (isAdmin) return 20;
  return ALBUM_IMAGE_LIMITS[membershipType] ?? 5;
}

/** Días restantes de una membresía a partir de su fecha de expiración. */
export function daysRemaining(expiryMs: number): number {
  return Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));
}
