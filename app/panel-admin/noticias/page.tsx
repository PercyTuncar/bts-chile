"use client";

import Link from "next/link";
import { AdminCard, AdminSection, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { PillButton } from "@/components/ui/PillButton";
import { Badge } from "@/components/ui/Badge";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { deleteNews, getAllNews } from "@/lib/firestore/news";
import { NEWS_CATEGORY_LABEL } from "@/lib/noticias/categories";

export default function NoticiasAdminPage() {
  const { data, loading, reload } = useAdminData(getAllNews);
  if (loading || !data) return <Loading />;

  return (
    <AdminSection
      title="Noticias"
      description={`${data.length} artículos`}
      actions={<Link href="/panel-admin/noticias/nueva"><PillButton>+ Nueva noticia</PillButton></Link>}
    >
      <AdminCard className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-text-muted"><tr><th className="p-2">Título</th><th className="p-2">Categoría</th><th className="p-2">Estado</th><th className="p-2"></th></tr></thead>
          <tbody>
            {data.map((n) => (
              <tr key={n.id} className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
                <td className="p-2 font-medium">{n.title}</td>
                <td className="p-2">{NEWS_CATEGORY_LABEL[n.category]}</td>
                <td className="p-2"><Badge tone={n.status === "published" ? "success" : "neutral"}>{n.status}</Badge></td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Link href={`/panel-admin/noticias/nueva?slug=${n.id}`} className="rounded-full glass px-2 py-1 text-xs">Editar</Link>
                    <button className="rounded-full glass px-2 py-1 text-xs text-danger" onClick={async () => { try { await deleteNews(n.id); toastSuccess("Eliminada"); reload(); } catch { toastError("Error"); } }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-text-muted">Sin noticias aún.</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </AdminSection>
  );
}
