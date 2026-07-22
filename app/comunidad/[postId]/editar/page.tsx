"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { RichTextEditor } from "@/components/comunidad/RichTextEditor";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORY_LABEL } from "@/lib/comunidad/reactions";
import { getPost, submitPostEdit } from "@/lib/firestore/posts";
import { albumImageLimit, postCharLimit } from "@/lib/membership";
import { communityImagePath, uploadImage } from "@/lib/storage";
import type { Post, PostCategory } from "@/types";

const CATEGORIES: PostCategory[] = ["general", "fanart", "teoria", "foto", "noticia"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

  // Estados para imágenes
  const [imageURL, setImageURL] = useState<string | null>(null); // URL de imagen simple actual
  const [newImageFile, setNewImageFile] = useState<File | null>(null); // Nueva imagen para subir
  const [removeImage, setRemoveImage] = useState(false); // Flag para eliminar la imagen

  // Estados para álbum
  const [images, setImages] = useState<string[]>([]); // URLs del álbum actual
  const [newAlbumFiles, setNewAlbumFiles] = useState<File[]>([]); // Nuevas imágenes a agregar
  const [removedImageURLs, setRemovedImageURLs] = useState<string[]>([]); // URLs a eliminar

  const charLimit = postCharLimit(profile?.membershipType ?? "basic", isAdmin);
  const albumLimit = albumImageLimit(profile?.membershipType ?? "basic", isAdmin);
  const isAlbum = post?.type === "album";

  // Previews para nuevas imágenes
  const newImagePreview = useMemo(
    () => (newImageFile ? URL.createObjectURL(newImageFile) : null),
    [newImageFile]
  );
  const newAlbumPreviews = useMemo(
    () => newAlbumFiles.map((f) => URL.createObjectURL(f)),
    [newAlbumFiles]
  );

  // Imágenes del álbum que se mostrarán (actuales - removidas + nuevas)
  const displayAlbumImages = images.filter((url) => !removedImageURLs.includes(url));
  const totalAlbumImages = displayAlbumImages.length + newAlbumFiles.length;

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

        // Cargar imagen simple si existe
        if (p.imageURL) {
          setImageURL(p.imageURL);
        }

        // Cargar álbum si existe
        if (p.images && p.images.length > 0) {
          setImages(p.images);
        }
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

    // Validación para álbum: debe tener al menos 2 imágenes
    if (isAlbum && totalAlbumImages < 2) {
      toastError("Un álbum debe tener al menos 2 imágenes.");
      return;
    }

    setSubmitting(true);
    try {
      let finalImageURL: string | null = imageURL;
      let finalImages: string[] | null = images;

      // Procesar imagen simple (solo para posts de texto)
      if (!isAlbum) {
        if (removeImage) {
          finalImageURL = null;
        } else if (newImageFile) {
          if (newImageFile.size > MAX_IMAGE_BYTES) {
            toastError("La imagen supera los 5MB.");
            setSubmitting(false);
            return;
          }
          finalImageURL = await uploadImage(
            communityImagePath(firebaseUser.uid, newImageFile.name),
            newImageFile
          );
        }
      }

      // Procesar álbum
      if (isAlbum) {
        // Subir nuevas imágenes
        const uploadedNewImages: string[] = [];
        if (newAlbumFiles.length > 0) {
          const tooBig = newAlbumFiles.find((f) => f.size > MAX_IMAGE_BYTES);
          if (tooBig) {
            toastError("Cada imagen debe pesar menos de 5MB.");
            setSubmitting(false);
            return;
          }

          const uploads = await Promise.all(
            newAlbumFiles.map((f) =>
              uploadImage(communityImagePath(firebaseUser.uid, f.name), f)
            )
          );
          uploadedNewImages.push(...uploads);
        }

        // Combinar: imágenes actuales (sin las removidas) + nuevas
        finalImages = [...displayAlbumImages, ...uploadedNewImages];
      }

      await submitPostEdit(postId, firebaseUser.uid, isAdmin, {
        content,
        richContent,
        imageURL: finalImageURL,
        images: finalImages,
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

  // Funciones para manejar álbum
  function addAlbumFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files);
    const tooBig = incoming.find((f) => f.size > MAX_IMAGE_BYTES);
    if (tooBig) {
      toastError("Cada imagen debe pesar menos de 5MB.");
      return;
    }
    const valid = incoming.filter((f) => f.size <= MAX_IMAGE_BYTES);
    setNewAlbumFiles((prev) => {
      const next = [...prev, ...valid];
      const total = displayAlbumImages.length + next.length;
      if (total > albumLimit) {
        toastError(`Máximo ${albumLimit} imágenes en tu plan.`);
        return prev;
      }
      return next;
    });
  }

  function removeExistingAlbumImage(url: string) {
    setRemovedImageURLs((prev) => [...prev, url]);
  }

  function removeNewAlbumFile(index: number) {
    setNewAlbumFiles((prev) => prev.filter((_, i) => i !== index));
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

        {/* Sección de imagen simple (solo para posts de texto) */}
        {!isAlbum && (
          <div>
            <label className="mb-2 block text-sm font-medium">Imagen adjunta</label>
            {(imageURL && !removeImage) || newImagePreview ? (
              <div className="relative aspect-video overflow-hidden rounded-2xl">
                <Image
                  src={newImagePreview || imageURL || ""}
                  alt="Imagen del post"
                  fill
                  sizes="600px"
                  className="object-cover"
                  unoptimized={!!newImagePreview}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newImageFile) {
                      setNewImageFile(null);
                    } else {
                      setRemoveImage(true);
                    }
                  }}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  aria-label="Eliminar imagen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--text)_24%,transparent)] py-8 text-text-muted hover:border-brand hover:text-brand">
                <Plus className="h-8 w-8" />
                <span className="text-sm">Agregar imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setNewImageFile(e.target.files?.[0] || null);
                    setRemoveImage(false);
                  }}
                />
              </label>
            )}
          </div>
        )}

        {/* Sección de álbum (solo para posts de tipo álbum) */}
        {isAlbum && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Imágenes del álbum</label>
              <span className="text-xs tabular-nums text-text-muted">
                {totalAlbumImages}/{albumLimit}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Imágenes existentes */}
              {displayAlbumImages.map((url, i) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src={url} alt={`Imagen ${i + 1}`} fill sizes="200px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingAlbumImage(url)}
                    aria-label={`Quitar imagen ${i + 1}`}
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Nuevas imágenes a subir */}
              {newAlbumPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative aspect-square overflow-hidden rounded-xl ring-2 ring-brand">
                  <Image src={src} alt={`Nueva imagen ${i + 1}`} fill sizes="200px" className="object-cover" unoptimized />
                  <div className="absolute left-1 top-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                    NUEVA
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewAlbumFile(i)}
                    aria-label={`Quitar nueva imagen ${i + 1}`}
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Botón para agregar más imágenes */}
              {totalAlbumImages < albumLimit && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[color-mix(in_srgb,var(--text)_24%,transparent)] text-text-muted hover:border-brand hover:text-brand">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs">Agregar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addAlbumFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>
        )}

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
