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
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/panel-admin", "/completar-perfil", "/entradas/comprar", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
