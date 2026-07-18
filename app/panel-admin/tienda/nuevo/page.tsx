"use client";

import { useSearchParams } from "next/navigation";
import { AdminSection, Loading } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { useAdminData } from "@/components/admin/useAdminData";
import { getProduct } from "@/lib/firestore/products";

export default function NuevoProductoPage() {
  const slug = useSearchParams().get("slug");
  const { data, loading } = useAdminData(
    () => (slug ? getProduct(slug) : Promise.resolve(null)),
    [slug],
  );

  if (slug && loading) return <Loading />;

  return (
    <AdminSection title={slug ? "Editar producto" : "Nuevo producto"} description="Formulario dinámico por categoría">
      <ProductForm initial={data ?? undefined} />
    </AdminSection>
  );
}
