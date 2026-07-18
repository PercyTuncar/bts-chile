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
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/entradas`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${SITE_URL}/noticias`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${SITE_URL}/tienda`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/comunidad`, lastModified: now, changeFrequency: "hourly", priority: 0.75 },
    { url: `${SITE_URL}/membresia`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
  return [...staticPages, ...(await dynamicEntries())];
}
