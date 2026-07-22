"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { RichTextEditor } from "@/components/comunidad/RichTextEditor";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORY_LABEL } from "@/lib/comunidad/reactions";
import { getPost, submitPostEdit } from "@/lib/firestore/posts";
import { postCharLimit } from "@/lib/membership";
import type { Post, PostCategory } from "@/types";

const CATEGORIES: PostCategory[] = ["general", "fanart", "teoria", "foto", "noticia"];

export default function EditPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params);
  const router = useRouter();
  const { firebaseUser, profile, isAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [content, setContent] = useState("");
  const [richContent, setRichContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("general");

  const charLimit = postCharLimit(profile?.membershipType ?? "basic", isAdmin);

  useEffect(() => {
    async function load() {
      try {
        const p = await getPost(postId);
        if (!p) {
          toastError("Publicación no encontrada.");
          router.push("/comunidad");
          return;
        }

        // Verificar permisos: solo el autor o admin puede editar
        if (!firebaseUser || (p.authorUid !== firebaseUser.uid && !isAdmin)) {
          toastError("No tienes permiso para editar esta publicación.");
          router.push(`/comunidad/${postId}`);
          return;
        }

        setPost(p);
        setContent(p.content);
        setRichContent(p.richContent ?? "");
        setCategory(p.category);
      } catch (err) {
        console.error(err);
        toastError("Error al cargar la publicación.");
        router.push("/comunidad");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId, firebaseUser, isAdmin, router]);

  async function handleSubmit() {
    if (!firebaseUser || !post) return;
    if (content.length > charLimit) {
      toastError(`El texto no puede superar ${charLimit} caracteres.`);
      return;
    }

    setSubmitting(true);
    try {
      await submitPostEdit(postId, firebaseUser.uid, isAdmin, {
        content,
        richContent,
        imageURL: post.imageURL,
        images: post.images,
        category,
      });

      if (isAdmin) {
        toastSuccess("Publicación actualizada.");
        router.push(`/comunidad/${postId}`);
      } else {
        toastSuccess("Edición enviada a revisión. Recibirás una notificación cuando sea aprobada.");
        router.push(`/comunidad/${postId}`);
      }
    } catch (err) {
      console.error(err);
      toastError("No se pudo guardar la edición.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <GlassCard className="text-center">
          <p className="text-text-muted">Cargando...</p>
        </GlassCard>
      </main>
    );
  }

  if (!post) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-h2 font-bold">Editar publicación</h1>

      {!isAdmin && (
        <div className="mb-4 rounded-lg bg-brand-soft/50 px-4 py-3 text-sm text-text">
          <p className="font-semibold">Revisión requerida</p>
          <p className="mt-1 text-text-muted">
            Tus cambios serán revisados por un admin antes de publicarse. Recibirás una notificación con la respuesta.
          </p>
        </div>
      )}

      <GlassCard className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Categoría</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-brand text-white"
                    : "glass text-text-muted hover:text-text"
                }`}
              >
                {CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Contenido</label>
            <span
              className={`text-xs ${
                content.length > charLimit ? "text-danger" : "text-text-muted"
              }`}
            >
              {content.length} / {charLimit}
            </span>
          </div>
          <RichTextEditor
            content={richContent}
            onChange={(value) => {
              setRichContent(value.html);
              setContent(value.text);
            }}
            placeholder="Escribe tu publicación..."
            charLimit={charLimit}
          />
        </div>

        <div className="flex gap-3">
          <PillButton
            onClick={handleSubmit}
            disabled={submitting || content.length === 0 || content.length > charLimit}
            fullWidth
          >
            {submitting ? "Guardando..." : isAdmin ? "Guardar cambios" : "Enviar a revisión"}
          </PillButton>
          <PillButton
            variant="secondary"
            onClick={() => router.push(`/comunidad/${postId}`)}
            disabled={submitting}
          >
            Cancelar
          </PillButton>
        </div>
      </GlassCard>
    </main>
  );
}
