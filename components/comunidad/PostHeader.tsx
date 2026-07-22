"use client";

/**
 * Cabecera del post individual con menú de acciones (3 puntos).
 */

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Edit3, Trash2, Flag } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge, MembershipBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { deletePost } from "@/lib/firestore/posts";
import { reportPost } from "@/lib/firestore/community";
import { formatRelative } from "@/lib/utils/formatters";
import { CATEGORY_LABEL } from "@/lib/comunidad/reactions";
import type { ReportReason, PostCategory } from "@/types";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "ofensivo", label: "Contenido ofensivo" },
  { value: "desinformacion", label: "Desinformación" },
  { value: "otro", label: "Otro" },
];

interface PostHeaderProps {
  postId: string;
  authorUid: string;
  authorUsername?: string;
  authorNickname: string;
  authorPhotoURL?: string;
  authorRole?: string;
  authorMembership?: string;
  createdAt: Date;
  category: PostCategory;
  isAurora?: boolean;
}

export function PostHeader({
  postId,
  authorUid,
  authorUsername,
  authorNickname,
  authorPhotoURL,
  authorRole,
  authorMembership,
  createdAt,
  category,
  isAurora,
}: PostHeaderProps) {
  const { firebaseUser, profile } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = firebaseUser?.uid === authorUid;
  const isAdmin = profile?.role === "admin";
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      toastSuccess("Publicación eliminada");
      router.push("/comunidad");
    } catch (err: any) {
      toastError(err.message || "No se pudo eliminar");
      setDeleting(false);
    }
  };

  const submitReport = async (reason: ReportReason) => {
    if (!firebaseUser) {
      toastError("Debes iniciar sesión");
      return;
    }
    setSending(true);
    try {
      await reportPost(postId, firebaseUser.uid, reason);
      toastSuccess("Reporte enviado. Lo revisaremos pronto.");
      setReportOpen(false);
    } catch (err: any) {
      toastError(err.message || "No se pudo reportar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link
          href={`/perfil/${authorUsername || authorUid}`}
          className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ${
            authorRole === "admin" ? "ring-accent" : "ring-brand"
          }`}
        >
          {authorPhotoURL ? (
            <Image src={authorPhotoURL} alt={authorNickname} fill sizes="44px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-soft">💜</span>
          )}
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/perfil/${authorUsername || authorUid}`} className="font-semibold hover:text-brand">
              {authorNickname}
            </Link>
            {authorRole === "admin" ? (
              <AdminBadge />
            ) : (
              <MembershipBadge type={authorMembership as "free" | "basic" | "premium" | "vip"} />
            )}
          </div>
          <p className="text-xs text-text-muted">
            {formatRelative(createdAt)} · {CATEGORY_LABEL[category]}
          </p>
        </div>
      </div>

      {/* Menú de 3 puntos */}
      {(canEdit || canDelete || firebaseUser) && (
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full p-2 hover:bg-surface transition-colors"
            aria-label="Más opciones"
          >
            <MoreHorizontal className="h-5 w-5 text-text-muted" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 glass-modal rounded-2xl overflow-hidden shadow-xl min-w-[160px]">
              {canEdit && (
                <Link
                  href={`/comunidad/${postId}/editar`}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-brand-soft transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Link>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              )}
              {!isAuthor && firebaseUser && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                >
                  <Flag className="h-4 w-4" />
                  Reportar
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de reporte */}
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

export default PostHeader;
