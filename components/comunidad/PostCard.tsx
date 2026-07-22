"use client";

// Tarjeta de post del feed — PRD §8.1.
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import { useState } from "react";
import { AlbumGallery } from "@/components/comunidad/AlbumGallery";
import { PollView } from "@/components/comunidad/PollView";
import { PostContent } from "@/components/comunidad/PostContent";
import { ReactionPicker } from "@/components/comunidad/ReactionPicker";
import { AdminBadge, MembershipBadge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SmartImage } from "@/components/ui/SmartImage";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { deletePost } from "@/lib/firestore/posts";
import { CATEGORY_LABEL } from "@/lib/comunidad/reactions";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatters";
import type { Post, WithId } from "@/types";

export function PostCard({ post }: { post: WithId<Post> }) {
  const created = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
  const isAdmin = post.authorRole === "admin";
  const { firebaseUser, isAdmin: currentUserIsAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canDelete = currentUserIsAdmin || firebaseUser?.uid === post.authorUid;
  const canEdit = firebaseUser?.uid === post.authorUid;
  const hasPendingEdit = post.pendingEdit?.status === "pending";
  const editRejected = post.pendingEdit?.status === "rejected";

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    try {
      await deletePost(post.id);
      toastSuccess("Publicación eliminada.");
      window.location.reload(); // Recarga para actualizar el feed
    } catch (err) {
      console.error(err);
      toastError("No se pudo eliminar la publicación.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <GlassCard
      className={cn(
        "flex flex-col gap-3",
        // Post de admin: se resalta con anillo y halo brand para diferenciarlo.
        isAdmin &&
          "aurora ring-1 ring-[color-mix(in_srgb,var(--brand)_45%,transparent)] shadow-[0_10px_36px_color-mix(in_srgb,var(--brand)_18%,transparent)]",
      )}
    >
      {/* Indicador de edición pendiente o rechazada */}
      {hasPendingEdit && (
        <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm">
          <p className="font-medium text-amber-600 dark:text-amber-400">⏳ Edición en revisión</p>
          <p className="text-xs text-text-muted">Tus cambios están siendo revisados por un admin.</p>
        </div>
      )}
      {editRejected && post.pendingEdit && (
        <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm">
          <p className="font-medium text-danger">✗ Edición rechazada</p>
          {post.pendingEdit.rejectionReason && (
            <p className="text-xs text-text-muted">Motivo: {post.pendingEdit.rejectionReason}</p>
          )}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Link
          href={`/perfil/${post.authorUsername ?? post.authorUid}`}
          className={cn(
            "relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2",
            isAdmin ? "ring-accent" : "ring-brand",
          )}
        >
          {post.authorPhotoURL ? (
            <Image src={post.authorPhotoURL} alt={post.authorNickname} fill sizes="40px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-soft">💜</span>
          )}
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/perfil/${post.authorUsername ?? post.authorUid}`} className="font-semibold hover:text-brand">
              {post.authorNickname}
            </Link>
            {isAdmin ? <AdminBadge /> : <MembershipBadge type={post.authorMembership} />}
          </div>
          <p className="text-xs text-text-muted">{formatRelative(created)}</p>
        </div>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
          {CATEGORY_LABEL[post.category]}
        </span>

        {/* Menú de acciones */}
        {(canDelete || canEdit) && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] transition-colors"
              aria-label="Más opciones"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg glass shadow-lg ring-1 ring-black/5 overflow-hidden">
                  {canEdit && (
                    <Link
                      href={`/comunidad/${post.id}/editar`}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] transition-colors"
                      onClick={() => setMenuOpen(false)}
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
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Contenido */}
      {post.content && (
        <PostContent content={post.content} richContent={post.richContent} clamp />
      )}

      {(post.type ?? "text") === "poll" && post.poll && (
        <PollView postId={post.id} poll={post.poll} />
      )}

      {(post.type ?? "text") === "album" && post.images && post.images.length > 0 && (
        <AlbumGallery images={post.images} preview postHref={`/comunidad/${post.id}`} />
      )}

      {post.imageURL && (
        <Link href={`/comunidad/${post.id}`} className="block">
          <SmartImage src={post.imageURL} alt="" fill sizes="(max-width:768px) 100vw, 600px" />
        </Link>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <ReactionPicker postId={post.id} counts={post.reactionCounts} />
        <Link
          href={`/comunidad/${post.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span className="tabular-nums">{post.commentsCount}</span>
        </Link>
      </div>
    </GlassCard>
  );
}

export default PostCard;
