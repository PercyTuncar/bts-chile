"use client";

import { useState } from "react";
import { AdminCard, AdminSection, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { getPostsByStatus, getReportedPosts, moderatePost } from "@/lib/firestore/posts";
import {
  deleteWhatsappGroup,
  getWhatsappGroups,
  saveWhatsappGroup,
} from "@/lib/firestore/community";
import type { PostStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

type Tab = PostStatus | "reported";
const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobados" },
  { key: "rejected", label: "Rechazados" },
  { key: "reported", label: "Reportados" },
];

export default function ModeracionPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const { firebaseUser } = useAuth();
  const { data, loading, reload } = useAdminData(
    () => (tab === "reported" ? getReportedPosts() : getPostsByStatus(tab)),
    [tab],
  );

  async function mod(id: string, status: "approved" | "rejected") {
    try {
      await moderatePost(id, status, firebaseUser?.uid ?? "admin", status === "rejected" ? "No cumple las normas" : null);
      toastSuccess(status === "approved" ? "Aprobado" : "Rechazado");
      reload();
    } catch {
      toastError("Error");
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <AdminSection title="Moderación de comunidad">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("rounded-full px-4 py-2 text-sm font-medium", tab === t.key ? "bg-brand text-white" : "glass text-text-muted")}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : !data || data.length === 0 ? (
          <AdminCard>No hay publicaciones en esta categoría.</AdminCard>
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((p) => (
              <AdminCard key={p.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{p.authorNickname} · {p.category}{tab === "reported" && ` · ⚠ ${p.reportCount} reportes`}</p>
                    <p className="mt-1 text-sm">{p.content}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {p.status !== "approved" && <PillButton size="sm" onClick={() => mod(p.id, "approved")}>Aprobar</PillButton>}
                    {p.status !== "rejected" && <PillButton size="sm" variant="secondary" onClick={() => mod(p.id, "rejected")}>Rechazar</PillButton>}
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        )}
      </AdminSection>

      <WhatsappManager />
    </div>
  );
}

function WhatsappManager() {
  const { data, loading, reload } = useAdminData(getWhatsappGroups);
  const [form, setForm] = useState({ name: "", region: "", link: "", maxMembers: 256, currentMembers: 0 });

  async function add() {
    if (!form.name || !form.link) return toastError("Completa nombre y link.");
    try {
      await saveWhatsappGroup(null, { ...form, isFull: form.currentMembers >= form.maxMembers });
      toastSuccess("Grupo agregado");
      setForm({ name: "", region: "", link: "", maxMembers: 256, currentMembers: 0 });
      reload();
    } catch {
      toastError("Error");
    }
  }

  const inp = "h-10 rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2";

  return (
    <AdminSection title="Grupos de WhatsApp">
      <AdminCard>
        <div className="mb-4 flex flex-wrap gap-2">
          <input className={inp} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inp} placeholder="Región" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <input className={inp} placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input className={`${inp} w-24`} type="number" placeholder="Actuales" value={form.currentMembers} onChange={(e) => setForm({ ...form, currentMembers: Number(e.target.value) })} />
          <PillButton size="sm" onClick={add}>Agregar</PillButton>
        </div>
        {loading ? <Loading /> : (
          <ul className="flex flex-col gap-2">
            {(data ?? []).map((g) => (
              <li key={g.id} className="flex items-center justify-between text-sm">
                <span>{g.name} — {g.region} ({g.currentMembers}/{g.maxMembers})</span>
                <button className="text-danger" onClick={async () => { await deleteWhatsappGroup(g.id); reload(); }}>Eliminar</button>
              </li>
            ))}
            {(data ?? []).length === 0 && <li className="text-text-muted">Sin grupos aún.</li>}
          </ul>
        )}
      </AdminCard>
    </AdminSection>
  );
}
