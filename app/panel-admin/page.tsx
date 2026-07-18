"use client";

import Link from "next/link";
import { AdminCard, AdminSection, KpiTile, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { getBirthdays } from "@/lib/firestore/users";
import { getPostsByStatus } from "@/lib/firestore/posts";
import { getOrdersByStatus } from "@/lib/firestore/orders";
import { getCountFromServer } from "firebase/firestore";
import { usersCol } from "@/lib/firestore/collections";

async function loadOverview() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  const [usersCount, pendingPosts, pendingOrders, birthdays] = await Promise.all([
    getCountFromServer(usersCol).then((s) => s.data().count),
    getPostsByStatus("pending").then((p) => p.length),
    getOrdersByStatus("pending_payment").then((o) => o.length),
    getBirthdays(month, day),
  ]);
  return { usersCount, pendingPosts, pendingOrders, birthdays };
}

export default function OverviewPage() {
  const { data, loading } = useAdminData(loadOverview);

  if (loading || !data) return <Loading />;

  return (
    <AdminSection title="Overview" description="Resumen general de BTS Chile">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTile label="Usuarios" value={data.usersCount} />
        <Link href="/panel-admin/moderacion">
          <KpiTile label="Posts pendientes" value={data.pendingPosts} />
        </Link>
        <Link href="/panel-admin/entradas">
          <KpiTile label="Pedidos pendientes" value={data.pendingOrders} />
        </Link>
        <KpiTile label="Cumpleaños hoy" value={data.birthdays.length} />
      </div>

      <AdminCard>
        <h2 className="mb-2 font-semibold">🎂 Cumpleaños de hoy</h2>
        {data.birthdays.length === 0 ? (
          <p className="text-sm text-text-muted">Nadie cumple años hoy.</p>
        ) : (
          <ul className="text-sm">
            {data.birthdays.map((u) => (
              <li key={u.id}>
                {u.nickname} — {u.email}
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </AdminSection>
  );
}
