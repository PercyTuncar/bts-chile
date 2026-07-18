"use client";

import { AdminCard, AdminSection, downloadCSV, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { PillButton } from "@/components/ui/PillButton";
import { getNewsletterSubscribers } from "@/lib/firestore/newsletter";

export default function NewsletterAdminPage() {
  const { data, loading } = useAdminData(getNewsletterSubscribers);
  if (loading || !data) return <Loading />;

  return (
    <AdminSection
      title="Newsletter"
      description={`${data.length} suscriptores`}
      actions={
        <PillButton
          variant="secondary"
          onClick={() =>
            downloadCSV("newsletter-btschile.csv", [
              ["Email", "Origen", "Activo"],
              ...data.map((s) => [s.email, s.source, s.isActive ? "sí" : "no"]),
            ])
          }
        >
          Export CSV (Mailchimp)
        </PillButton>
      }
    >
      <AdminCard className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-text-muted"><tr><th className="p-2">Email</th><th className="p-2">Origen</th><th className="p-2">Activo</th></tr></thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
                <td className="p-2">{s.email}</td>
                <td className="p-2">{s.source}</td>
                <td className="p-2">{s.isActive ? "✓" : "—"}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-text-muted">Sin suscriptores aún.</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </AdminSection>
  );
}
