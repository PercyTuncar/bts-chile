"use client";

// Acciones del post individual: reporte + compartir + editar/eliminar — PRD §8.2.
import { Copy, Flag, Share2, Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { reportPost } from "@/lib/firestore/community";
import { deletePost } from "@/lib/firestore/posts";
import type { ReportReason } from "@/types";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "ofensivo", label: "Contenido ofensivo" },
  { value: "desinformacion", label: "Desinformación" },
  { value: "otro", label: "Otro" },
];

export function PostDetailActions({
  postId,
  shareUrl,
  shareText,
  authorUid,
}: {
  postId: string;
  shareUrl: string;
  shareText: string;
  authorUid: string;
}) {
  const router = useRouter();
  const { firebaseUser, isAdmin } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [reportOpen, setReportOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canDelete = isAdmin || firebaseUser?.uid === authorUid;
  const canEdit = firebaseUser?.uid === authorUid;

  async function submitReport(reason: ReportReason) {
    if (!firebaseUser) {
      setReportOpen(false);
      openLogin();
      return;
    }
    setSending(true);
    try {
      await reportPost(postId, firebaseUser.uid, reason);
      toastSuccess("Gracias, tu reporte fue enviado al admin.");
      setReportOpen(false);
    } catch (err) {
      console.error(err);
      toastError("No se pudo enviar el reporte.");
    } finally {
      setSending(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toastSuccess("Enlace copiado 💜");
    } catch {
      toastError("No se pudo copiar el enlace.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      toastSuccess("Publicación eliminada.");
      router.push("/comunidad");
    } catch (err) {
      console.error(err);
      toastError("No se pudo eliminar la publicación.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEdit && (
        <a
          href={`/comunidad/${postId}/editar`}
          className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm hover:text-brand"
        >
          <Edit3 className="h-4 w-4" aria-hidden /> Editar
        </a>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm text-danger hover:opacity-80 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden /> {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      )}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm hover:text-brand"
      >
        <Share2 className="h-4 w-4" aria-hidden /> Twitter/X
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm hover:text-brand"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm hover:text-brand"
      >
        <Copy className="h-4 w-4" aria-hidden /> Copiar
      </button>
      <button
        type="button"
        onClick={() => setReportOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm text-danger hover:opacity-80"
      >
        <Flag className="h-4 w-4" aria-hidden /> Reportar
      </button>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Reportar publicación">
        <p className="mb-4 text-sm text-text-muted">¿Por qué reportas esta publicación?</p>
        <div className="flex flex-col gap-2">
          {REASONS.map((r) => (
            <PillButton
              key={r.value}
              variant="secondary"
              fullWidth
              disabled={sending}
              onClick={() => submitReport(r.value)}
            >
              {r.label}
            </PillButton>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default PostDetailActions;
