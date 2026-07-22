"use client";

// Comentarios de un post — PRD §8.2 (máx 200 chars).
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Trash2, X, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { PillButton } from "@/components/ui/PillButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import {
  addComment,
  deleteComment,
  subscribeComments,
  updateComment,
} from "@/lib/firestore/community";
import { commentSchema } from "@/lib/utils/validators";
import { formatRelative } from "@/lib/utils/formatters";
import type { Comment, WithId } from "@/types";

const MAX = 200;

/** Fila skeleton de un comentario (avatar + líneas). */
function CommentSkeleton() {
  return (
    <li className="flex gap-3">
      <Skeleton className="h-9 w-9 shrink-0" rounded="rounded-full" />
      <div className="glass-card flex-1 rounded-2xl p-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2.5 h-3 w-full" />
        <Skeleton className="mt-1.5 h-3 w-2/3" />
      </div>
    </li>
  );
}

export function CommentsSection({ postId }: { postId: string }) {
  const { firebaseUser, profile, isAdmin } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [comments, setComments] = useState<WithId<Comment>[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeComments(postId, (items) => {
        setComments(items);
        setLoading(false); // primer snapshot recibido → oculta el skeleton
      }),
    [postId],
  );

  const visible = comments.filter((c) => c.status !== "rejected");

  function startEdit(c: WithId<Comment>) {
    setEditingId(c.id);
    setEditText(c.content);
  }

  async function saveEdit(commentId: string) {
    const parsed = commentSchema.safeParse({ content: editText });
    if (!parsed.success) {
      toastError(parsed.error.issues[0]?.message ?? "Comentario inválido.");
      return;
    }
    setBusyId(commentId);
    try {
      await updateComment(postId, commentId, editText.trim());
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error(err);
      toastError("No se pudo editar el comentario.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    setBusyId(commentId);
    try {
      await deleteComment(postId, commentId);
      toastSuccess("Comentario eliminado.");
    } catch (err) {
      console.error(err);
      toastError("No se pudo eliminar el comentario.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseUser) {
      openLogin();
      return;
    }
    const parsed = commentSchema.safeParse({ content: text });
    if (!parsed.success) {
      toastError(parsed.error.issues[0]?.message ?? "Comentario inválido.");
      return;
    }
    setSaving(true);
    try {
      await addComment(
        postId,
        {
          uid: firebaseUser.uid,
          nickname: profile?.nickname || firebaseUser.displayName || "ARMY",
          username: profile?.username || firebaseUser.uid,
          photoURL: profile?.customPhotoURL || profile?.photoURL || firebaseUser.photoURL || "",
        },
        text.trim(),
      );
      setText("");
    } catch (err) {
      console.error(err);
      toastError("No se pudo comentar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-h3 font-semibold">
        Comentarios{" "}
        {!loading && <span className="text-text-muted">({visible.length})</span>}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder={firebaseUser ? "Escribe un comentario…" : "Inicia sesión para comentar"}
          className="h-12 flex-1 min-w-0 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4 text-sm"
        />
        <PillButton
          type="submit"
          disabled={saving || !text.trim()}
          size="sm"
          className="!w-12 !h-12 !p-0 !min-h-0 shrink-0"
          aria-label="Enviar comentario"
        >
          <Send className="h-5 w-5" />
        </PillButton>
      </form>

      {loading ? (
        <ul className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <CommentSkeleton key={i} />
          ))}
        </ul>
      ) : (
      <ul className="flex flex-col gap-4">
        <AnimatePresence initial mode="popLayout">
        {visible.map((c, idx) => {
          const created = c.createdAt?.toDate ? c.createdAt.toDate() : new Date();
          const isAuthor = !!firebaseUser && firebaseUser.uid === c.authorUid;
          const canEdit = isAuthor;
          const canDelete = isAuthor || isAdmin;
          const editing = editingId === c.id;
          const busy = busyId === c.id;
          return (
            <motion.li
              key={c.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut", delay: Math.min(idx, 6) * 0.05 }}
              className="flex gap-3"
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-brand">
                {c.authorPhotoURL ? (
                  <Image src={c.authorPhotoURL} alt={c.authorNickname} fill sizes="36px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-brand-soft text-sm">💜</span>
                )}
              </span>
              <div className="glass-card flex-1 rounded-2xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm">
                    <Link
                      href={`/perfil/${c.authorUsername || c.authorUid}`}
                      className="font-semibold hover:text-brand"
                    >
                      {c.authorNickname}
                    </Link>{" "}
                    <span className="text-xs text-text-muted">· {formatRelative(created)}</span>
                    {c.editedAt && (
                      <span className="text-xs text-text-muted" title={`Editado ${formatRelative(c.editedAt.toDate())}`}>
                        {" "}· editado {formatRelative(c.editedAt.toDate())}
                      </span>
                    )}
                  </p>
                  {(canEdit || canDelete) && !editing && (
                    <div className="flex shrink-0 items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          aria-label="Editar comentario"
                          title="Editar"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-brand-soft hover:text-brand"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          disabled={busy}
                          aria-label="Eliminar comentario"
                          title={isAuthor ? "Eliminar" : "Eliminar (moderación)"}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-brand-soft hover:text-danger disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {editing ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={editText}
                      autoFocus
                      onChange={(e) => setEditText(e.target.value.slice(0, MAX))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEdit(c.id);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-10 flex-1 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(c.id)}
                      disabled={busy || !editText.trim()}
                      aria-label="Guardar"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancelar"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-brand-soft"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-sm">{c.content}</p>
                )}
              </div>
            </motion.li>
          );
        })}
        </AnimatePresence>
        {visible.length === 0 && (
          <li className="text-sm text-text-muted">Sé la primera en comentar 💜</li>
        )}
      </ul>
      )}
    </section>
  );
}

export default CommentsSection;
