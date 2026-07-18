// Navegación principal — PRD §3.1, §3.4 (internal linking con anchor descriptivo para sitelinks).
export interface NavLink {
  href: string;
  label: string; // texto corto del menú
  anchor: string; // anchor descriptivo (footer / SEO)
  description: string; // para SiteNavigationElement (§15.1)
  cta?: boolean; // CTA principal (pill morado)
}

export const NAV_LINKS: NavLink[] = [
  {
    href: "/entradas",
    label: "Entradas",
    anchor: "Entradas BTS Chile 2026",
    description:
      "Compra entradas verificadas para BTS WORLD TOUR ARIRANG. Estadio Nacional, 16 y 17 de octubre 2026. Desde $299 USD.",
    cta: true,
  },
  {
    href: "/noticias",
    label: "Noticias",
    anchor: "Noticias BTS Chile",
    description: "Últimas noticias de BTS en Chile: conciertos, música, ARMY y más.",
  },
  {
    href: "/tienda",
    label: "Tienda",
    anchor: "Tienda BTS Chile",
    description: "Merchandise oficial de BTS: camisetas, peluches, álbumes y más.",
  },
  {
    href: "/comunidad",
    label: "Comunidad",
    anchor: "Comunidad ARMY Chile",
    description: "Red social para ARMY chilenas. Publica, reacciona y conecta.",
  },
  {
    href: "/membresia",
    label: "Membresía",
    anchor: "Membresía ARMY Boom v4",
    description: "Acceso anticipado a entradas, descuentos y contenido VIP.",
  },
];

export const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/btschile" },
  { name: "Twitter", href: "https://twitter.com/btschile" },
  { name: "Facebook", href: "https://www.facebook.com/btschile" },
  { name: "TikTok", href: "https://www.tiktok.com/@btschile" },
  { name: "YouTube", href: "https://www.youtube.com/@btschile" },
];
