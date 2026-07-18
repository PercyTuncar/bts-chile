"use client";

// Reseñas de producto: lista aprobada + formulario (crea reseña pending) — PRD §7.5, §13.12.
import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { createReview } from "@/lib/firestore/reviews";
import { reviewSchema } from "@/lib/utils/validators";
import { formatDateLong } from "@/lib/utils/formatters";

export interface ReviewItem {
  id: string;
  authorNickname: string;
  authorPhotoURL: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAtMs: number;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= value ? "fill-brand text-brand" : "text-text-muted"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function ReviewList({
  productSlug,
  reviews,
}: {
  productSlug: string;
  reviews: ReviewItem[];
}) {
  const { firebaseUser, profile } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseUser) {
      openLogin();
      return;
    }
    const parsed = reviewSchema.safeParse({ rating, title: title || null, comment });
    if (!parsed.success) {
      toastError(parsed.error.issues[0]?.message ?? "Revisa tu reseña.");
      return;
    }
    setSaving(true);
    try {
      await createReview({
        productSlug,
        authorUid: firebaseUser.uid,
        authorNickname: profile?.nickname || firebaseUser.displayName || "ARMY",
        authorPhotoURL: profile?.customPhotoURL || profile?.photoURL || "",
        rating,
        title: title || null,
        comment,
      });
      toastSuccess("¡Gracias! Tu reseña está en revisión 💜");
      setComment("");
      setTitle("");
      setSent(true);
    } catch (err) {
      console.error(err);
      toastError("No se pudo enviar la reseña.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-h2 font-semibold">Reseñas</h2>

      {reviews.length === 0 ? (
        <p className="mb-6 text-text-muted">Aún no hay reseñas. ¡Sé la primera en opinar! 💜</p>
      ) : (
        <ul className="mb-8 flex flex-col gap-4">
          {reviews.map((r) => (
            <li key={r.id} className="glass-card rounded-card p-4">
              <div className="flex items-center gap-2">
                <span className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-brand">
                  {r.authorPhotoURL ? (
                    <Image src={r.authorPhotoURL} alt={r.authorNickname} fill sizes="32px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-brand-soft text-sm">💜</span>
                  )}
                </span>
                <span className="text-sm font-semibold">{r.authorNickname}</span>
                <span className="text-xs text-text-muted">· {formatDateLong(r.createdAtMs)}</span>
              </div>
              <div className="mt-2">
                <Stars value={r.rating} />
              </div>
              {r.title && <p className="mt-1 font-medium">{r.title}</p>}
              <p className="mt-1 text-sm">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {!sent && (
        <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-3 rounded-card p-4">
          <h3 className="font-semibold">Escribe tu reseña</h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} estrellas`}>
                <Star className={`h-6 w-6 ${n <= rating ? "fill-brand text-brand" : "text-text-muted"}`} aria-hidden />
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            placeholder="Título (opcional)"
            className="h-11 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Cuéntanos qué te pareció…"
            className="resize-none rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-4"
          />
          <div className="flex justify-end">
            <PillButton type="submit" disabled={saving || !comment.trim()}>
              {saving ? "Enviando…" : "Enviar reseña"}
            </PillButton>
          </div>
        </form>
      )}
    </section>
  );
}

export default ReviewList;
