"use client";

import { AdminCard, AdminSection, KpiTile, Loading } from "@/components/admin/ui";
import { TrialGrantForm } from "@/components/admin/TrialGrantForm";
import { useAdminData } from "@/components/admin/useAdminData";
import { MembershipBadge } from "@/components/ui/Badge";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { getAllUsers, setUserMembershipManual } from "@/lib/firestore/users";
import { formatDateLong } from "@/lib/utils/formatters";

async function loadMembers() {
  const users = await getAllUsers();
  const now = Date.now();
  const paid = users.filter((u) => u.membershipType !== "free");
  const trials = users.filter((u) => u.isTrial);
  const expiringSoon = paid.filter(
    (u) => u.membershipExpiry && u.membershipExpiry.toMillis() - now < 7 * 864e5,
  );
  return { users, paid, trials, expiringSoonCount: expiringSoon.length };
}

export default function MembresiasPage() {
  const { data, loading, reload } = useAdminData(loadMembers);
  if (loading || !data) return <Loading />;

  const { users, paid, trials } = data;

  async function revoke(uid: string) {
    try {
      await setUserMembershipManual(uid, "free", null);
      toastSuccess("Prueba revocada");
      reload();
    } catch {
      toastError("Error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminSection title="Membresías">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiTile label="Con membresía" value={paid.length} />
          <KpiTile label="En prueba" value={trials.length} />
          <KpiTile label="Vencen en 7 días" value={data.expiringSoonCount} />
          <KpiTile label="Total usuarios" value={users.length} />
        </div>
      </AdminSection>

      <TrialGrantForm users={users} onGranted={reload} />

      <AdminSection title="Pruebas activas">
        <AdminCard className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-text-muted"><tr><th className="p-2">Usuario</th><th className="p-2">Plan</th><th className="p-2">Origen</th><th className="p-2">Expira</th><th className="p-2"></th></tr></thead>
            <tbody>
              {trials.map((u) => (
                <tr key={u.id} className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
                  <td className="p-2">{u.nickname} <span className="text-xs text-text-muted">{u.email}</span></td>
                  <td className="p-2"><MembershipBadge type={u.membershipType} isTrial /></td>
                  <td className="p-2">{u.membershipSource}</td>
                  <td className="p-2">{u.membershipExpiry ? formatDateLong(u.membershipExpiry) : "—"}</td>
                  <td className="p-2"><button className="text-danger" onClick={() => revoke(u.id)}>Revocar</button></td>
                </tr>
              ))}
              {trials.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-text-muted">Sin pruebas activas.</td></tr>}
            </tbody>
          </table>
        </AdminCard>
      </AdminSection>
    </div>
  );
}
