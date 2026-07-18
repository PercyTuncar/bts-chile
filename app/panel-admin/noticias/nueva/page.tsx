"use client";

import { useSearchParams } from "next/navigation";
import { AdminSection, Loading } from "@/components/admin/ui";
import { NewsForm } from "@/components/admin/NewsForm";
import { useAdminData } from "@/components/admin/useAdminData";
import { getNews } from "@/lib/firestore/news";

export default function NuevaNoticiaPage() {
  const slug = useSearchParams().get("slug");
  const { data, loading } = useAdminData(
    () => (slug ? getNews(slug) : Promise.resolve(null)),
    [slug],
  );

  if (slug && loading) return <Loading />;

  return (
    <AdminSection title={slug ? "Editar noticia" : "Nueva noticia"} description="Editor de texto enriquecido">
      <NewsForm initial={data ?? undefined} />
    </AdminSection>
  );
}
