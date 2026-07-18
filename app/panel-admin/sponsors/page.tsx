"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { AdminCard, AdminSection, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { PillButton } from "@/components/ui/PillButton";
import { Badge } from "@/components/ui/Badge";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { deleteSponsor, getAllSponsors, saveSponsor } from "@/lib/firestore/sponsors";
import type { Sponsor } from "@/types";

const inp = "h-10 rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2";

export default function SponsorsAdminPage() {
  const { data, loading, reload } = useAdminData(getAllSponsors);
  const [form, setForm] = useState({
    name: "",
    logoURL: "",
    linkURL: "",
    placement: "home" as Sponsor["placement"],
    monthlyPriceUSD: 0,
  });

  async function add() {
    if (!form.name || !form.linkURL) return toastError("Completa nombre y link.");
    try {
      const now = Timestamp.now();
      await saveSponsor(null, {
        ...form,
        startDate: now,
        endDate: Timestamp.fromMillis(now.toMillis() + 30 * 864e5),
        isActive: true,
      });
      toastSuccess("Sponsor agregado");
      setForm({ name: "", logoURL: "", linkURL: "", placement: "home", monthlyPriceUSD: 0 });
      reload();
    } catch {
      toastError("Error");
    }
  }

  if (loading || !data) return <Loading />;

  return (
    <AdminSection
      title="Sponsors"
      description="Banners de negocios afiliados (Fase 2)"
      actions={<Badge tone="accent">Fase 2</Badge>}
    >
      <AdminCard>
        <div className="mb-4 flex flex-wrap gap-2">
          <input className={inp} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inp} placeholder="Logo URL" value={form.logoURL} onChange={(e) => setForm({ ...form, logoURL: e.target.value })} />
          <input className={inp} placeholder="Link" value={form.linkURL} onChange={(e) => setForm({ ...form, linkURL: e.target.value })} />
          <select className={inp} value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value as Sponsor["placement"] })}>
            <option value="home">Home</option>
            <option value="comunidad">Comunidad</option>
            <option value="tienda">Tienda</option>
          </select>
          <input className={`${inp} w-24`} type="number" placeholder="USD/mes" value={form.monthlyPriceUSD} onChange={(e) => setForm({ ...form, monthlyPriceUSD: Number(e.target.value) })} />
          <PillButton size="sm" onClick={add}>Agregar</PillButton>
        </div>

        <ul className="flex flex-col gap-2 text-sm">
          {data.map((s) => (
            <li key={s.id} className="flex items-center justify-between">
              <span>{s.name} — {s.placement} · ${s.monthlyPriceUSD}/mes {s.isActive ? "" : "(inactivo)"}</span>
              <button className="text-danger" onClick={async () => { await deleteSponsor(s.id); reload(); }}>Eliminar</button>
            </li>
          ))}
          {data.length === 0 && <li className="text-text-muted">Sin sponsors aún.</li>}
        </ul>
      </AdminCard>
    </AdminSection>
  );
}
