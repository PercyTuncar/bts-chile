"use client";

import { AdminCard, AdminSection, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { getPendingReviews, setReviewStatus } from "@/lib/firestore/reviews";

export default function ResenasAdminPage() {
  const { data, loading, reload } = useAdminData(getPendingReviews);
  if (loading || !data) return <Loading />;

  async function moderate(id: string, status: "approved" | "rejected") {
    try {
      await setReviewStatus(id, status);
      toastSuccess(status === "approved" ? "Reseña aprobada" : "Reseña rechazada");
      reload();
    } catch {
      toastError("Error");
    }
  }

  return (
    <AdminSection title="Moderación de reseñas" description={`${data.length} pendientes`}>
      {data.length === 0 ? (
        <AdminCard>No hay reseñas pendientes 💜</AdminCard>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((r) => (
            <AdminCard key={r.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{r.authorNickname} · ⭐ {r.rating} · {r.productSlug}</p>
                  {r.title && <p className="font-semibold">{r.title}</p>}
                  <p className="text-sm text-text-muted">{r.comment}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <PillButton size="sm" onClick={() => moderate(r.id, "approved")}>Aprobar</PillButton>
                  <PillButton size="sm" variant="secondary" onClick={() => moderate(r.id, "rejected")}>Rechazar</PillButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
