"use client";

import Link from "next/link";
import { AdminCard, AdminSection, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { PillButton } from "@/components/ui/PillButton";
import { Badge } from "@/components/ui/Badge";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { deleteProduct, getAllProducts } from "@/lib/firestore/products";
import { PRODUCT_CATEGORY_LABEL } from "@/lib/tienda/catalog";
import { formatUSD } from "@/lib/utils/formatters";

export default function TiendaAdminPage() {
  const { data, loading, reload } = useAdminData(getAllProducts);
  if (loading || !data) return <Loading />;

  return (
    <AdminSection
      title="Tienda"
      description={`${data.length} productos`}
      actions={
        <div className="flex gap-2">
          <Link href="/panel-admin/tienda/resenas"><PillButton variant="secondary">Reseñas</PillButton></Link>
          <Link href="/panel-admin/tienda/nuevo"><PillButton>+ Nuevo producto</PillButton></Link>
        </div>
      }
    >
      <AdminCard className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-text-muted">
            <tr><th className="p-2">Producto</th><th className="p-2">Categoría</th><th className="p-2">Precio</th><th className="p-2">Stock</th><th className="p-2">Estado</th><th className="p-2"></th></tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2">{PRODUCT_CATEGORY_LABEL[p.category]}</td>
                <td className="p-2 tabular-nums">{formatUSD(p.priceUSD)}</td>
                <td className="p-2 tabular-nums">{p.totalStock}</td>
                <td className="p-2"><Badge tone={p.status === "published" ? "success" : "neutral"}>{p.status}</Badge></td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Link href={`/panel-admin/tienda/nuevo?slug=${p.id}`} className="rounded-full glass px-2 py-1 text-xs">Editar</Link>
                    <button
                      className="rounded-full glass px-2 py-1 text-xs text-danger"
                      onClick={async () => {
                        try { await deleteProduct(p.id); toastSuccess("Eliminado"); reload(); }
                        catch { toastError("Error"); }
                      }}
                    >Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-text-muted">Sin productos aún.</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </AdminSection>
  );
}
