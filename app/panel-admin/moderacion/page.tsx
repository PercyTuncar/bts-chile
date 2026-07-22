"use client";

import { useState } from "react";
import { AdminCard, AdminSection, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { getPostsByStatus, getReportedPosts, moderatePost, getPostsWithPendingEdits, reviewPostEdit } from "@/lib/firestore/posts";
import {
  deleteWhatsappGroup,
  getWhatsappGroups,
  saveWhatsappGroup,
} from "@/lib/firestore/community";
import type { PostStatus, WithId, Post } from "@/types";
import { cn } from "@/lib/utils/cn";
import { Modal } from "@/components/ui/Modal";

type Tab = PostStatus | "reported" | "edits";
const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "Pendientes" },
  { key: "edits", label: "Ediciones" },
  { key: "approved", label: "Aprobados" },
  { key: "rejected", label: "Rechazados" },
  { key: "reported", label: "Reportados" },
];

export default function ModeracionPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const { firebaseUser } = useAuth();
  const { data, loading, reload } = useAdminData(
    () => {
      if (tab === "reported") return getReportedPosts();
      if (tab === "edits") return getPostsWithPendingEdits();
      return getPostsByStatus(tab);
    },
    [tab],
  );
  const [comparePost, setComparePost] = useState<WithId<Post> | null>(null);

  async function mod(id: string, status: "approved" | "rejected") {
    try {
      await moderatePost(id, status, firebaseUser?.uid ?? "admin", status === "rejected" ? "No cumple las normas" : null);
      toastSuccess(status === "approved" ? "Aprobado" : "Rechazado");
      reload();
    } catch {
      toastError("Error");
    }
  }

  async function reviewEdit(postId: string, approve: boolean, reason?: string) {
    try {
      await reviewPostEdit(postId, firebaseUser?.uid ?? "admin", approve, reason);
      toastSuccess(approve ? "Edición aprobada" : "Edición rechazada");
      setComparePost(null);
      reload();
    } catch {
      toastError("Error al revisar edición");
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
        ) : tab === "edits" ? (
          <div className="flex flex-col gap-3">
            {data.map((p) => (
              <AdminCard key={p.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{p.authorNickname} · {p.category}</p>
                    <p className="mt-1 text-sm text-text-muted">Editado · Pendiente de revisión</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <PillButton size="sm" onClick={() => setComparePost(p)}>Ver cambios</PillButton>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
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

      {/* Modal de comparación de versiones */}
      {comparePost && comparePost.pendingEdit && (
        <Modal
          open={true}
          onClose={() => setComparePost(null)}
          title="Revisar edición"
        >
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-text-muted">Versión original</h3>
              <div className="rounded-lg glass p-4">
                <p className="text-sm font-medium mb-1">Categoría: {comparePost.category}</p>
                <div className="text-sm whitespace-pre-wrap">{comparePost.content}</div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-brand">Versión nueva (pendiente)</h3>
              <div className="rounded-lg glass p-4 ring-2 ring-brand/30">
                <p className="text-sm font-medium mb-1">Categoría: {comparePost.pendingEdit.category}</p>
                <div className="text-sm whitespace-pre-wrap">{comparePost.pendingEdit.content}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <PillButton onClick={() => reviewEdit(comparePost.id, true)} fullWidth>
                Aprobar cambios
              </PillButton>
              <PillButton
                variant="secondary"
                onClick={() => {
                  const reason = prompt("Motivo del rechazo (opcional):");
                  reviewEdit(comparePost.id, false, reason ?? undefined);
                }}
                fullWidth
              >
                Rechazar
              </PillButton>
            </div>
          </div>
        </Modal>
      )}

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
