"use client";

import { useSearchParams } from "next/navigation";
import { AdminSection, Loading } from "@/components/admin/ui";
import { NewsFormPro } from "@/components/admin/NewsFormPro";
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
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <div className="mb-6">
        <h1 className="text-h1 font-bold">
          {slug ? "Editar noticia" : "Nueva noticia"}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Editor profesional optimizado para Google News y Top Stories
        </p>
      </div>
      <NewsFormPro initial={data ?? undefined} />
    </div>
  );
}
