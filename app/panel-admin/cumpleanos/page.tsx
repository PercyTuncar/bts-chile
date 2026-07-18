"use client";

import { AdminCard, AdminSection, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { getAllUsers } from "@/lib/firestore/users";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function currentMonth(): number {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", month: "2-digit" }).formatToParts(new Date());
  return Number(parts.find((p) => p.type === "month")?.value);
}

export default function CumpleanosPage() {
  const { data, loading } = useAdminData(getAllUsers);
  if (loading || !data) return <Loading />;

  const month = currentMonth();
  const list = data
    .filter((u) => u.birthMonth === month)
    .sort((a, b) => a.birthDay - b.birthDay);

  return (
    <AdminSection title={`Cumpleaños de ${MONTHS[month - 1]}`} description={`${list.length} ARMY cumplen este mes`}>
      {list.length === 0 ? (
        <AdminCard>Nadie cumple años este mes.</AdminCard>
      ) : (
        <AdminCard className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-text-muted"><tr><th className="p-2">Día</th><th className="p-2">Nombre</th><th className="p-2">Email</th><th className="p-2">Ciudad</th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
                  <td className="p-2 tabular-nums font-semibold">{u.birthDay}</td>
                  <td className="p-2">{u.nickname}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      )}
    </AdminSection>
  );
}
