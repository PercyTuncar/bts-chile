// robots.txt — máximo rastreo + privacidad — PRD §15.12.
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/entradas", "/noticias", "/tienda", "/comunidad", "/membresia"],
        disallow: ["/panel-admin", "/completar-perfil", "/perfil", "/entradas/comprar", "/api", "/buscar"],
        crawlDelay: 1,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/panel-admin", "/completar-perfil", "/entradas/comprar", "/api"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: ["/panel-admin"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/panel-admin", "/completar-perfil", "/entradas/comprar", "/api"],
        crawlDelay: 1,
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/news-sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
