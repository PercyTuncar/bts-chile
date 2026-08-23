// Sitemap dinámico — PRD §15.11. Excluye /entradas/comprar (noindex) y /perfil (privacidad).
import type { MetadataRoute } from "next";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SITE_URL } from "@/lib/utils/seo";

export const revalidate = 3600;

async function dynamicEntries(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];
  try {
    const news = await getDocs(
      query(collection(db, "news"), where("status", "==", "published"), orderBy("publishedAt", "desc"), limit(100)),
    );
    news.forEach((d) => {
      const data = d.data();
      out.push({
        url: `${SITE_URL}/noticias/${d.id}`,
        lastModified: data.updatedAt?.toDate?.() ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    const products = await getDocs(
      query(collection(db, "products"), where("status", "==", "published"), limit(200)),
    );
    products.forEach((d) => {
      const data = d.data();
      out.push({
        url: `${SITE_URL}/tienda/${d.id}`,
        lastModified: data.updatedAt?.toDate?.() ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.65,
      });
    });

    const posts = await getDocs(
      query(collection(db, "posts"), where("status", "==", "approved"), orderBy("approvedAt", "desc"), limit(200)),
    );
    posts.forEach((d) => {
      const data = d.data();
      out.push({
        url: `${SITE_URL}/comunidad/${d.id}`,
        lastModified: data.approvedAt?.toDate?.() ?? new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    });
  } catch (err) {
    console.warn("sitemap: Firestore no disponible", err);
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          "es-CL": SITE_URL,
          "es": SITE_URL,
        },
      },
    },
    {
      url: `${SITE_URL}/entradas`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/entradas`,
          "es": `${SITE_URL}/entradas`,
        },
      },
    },
    {
      url: `${SITE_URL}/noticias`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/noticias`,
          "es": `${SITE_URL}/noticias`,
        },
      },
    },
    {
      url: `${SITE_URL}/sobre-bts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/sobre-bts`,
          "es": `${SITE_URL}/sobre-bts`,
        },
      },
    },
    {
      url: `${SITE_URL}/preguntas-frecuentes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/preguntas-frecuentes`,
          "es": `${SITE_URL}/preguntas-frecuentes`,
        },
      },
    },
    {
      url: `${SITE_URL}/como-llegar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/como-llegar`,
          "es": `${SITE_URL}/como-llegar`,
        },
      },
    },
    {
      url: `${SITE_URL}/tienda`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/tienda`,
          "es": `${SITE_URL}/tienda`,
        },
      },
    },
    {
      url: `${SITE_URL}/comunidad`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.75,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/comunidad`,
          "es": `${SITE_URL}/comunidad`,
        },
      },
    },
    {
      url: `${SITE_URL}/membresia`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/membresia`,
          "es": `${SITE_URL}/membresia`,
        },
      },
    },
    {
      url: `${SITE_URL}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/privacidad`,
          "es": `${SITE_URL}/privacidad`,
        },
      },
    },
    {
      url: `${SITE_URL}/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          "es-CL": `${SITE_URL}/terminos`,
          "es": `${SITE_URL}/terminos`,
        },
      },
    },
  ];
  return [...staticPages, ...(await dynamicEntries())];
}
