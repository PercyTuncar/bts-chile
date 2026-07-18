"use client";

// Composer de nueva publicación (bottom sheet glass) — PRD §4.3, §8.1.
// Tres tipos: Texto (enriquecido), Encuesta y Álbum (varias imágenes). Límites por plan.
import Image from "next/image";
import { Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { RichTextEditor, type RichTextValue } from "@/components/comunidad/RichTextEditor";
import { Modal } from "@/components/ui/Modal";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES } from "@/lib/comunidad/reactions";
import { sanitizeHtml } from "@/lib/comunidad/sanitizeHtml";
import { createPost } from "@/lib/firestore/posts";
import { albumImageLimit, postCharLimit } from "@/lib/membership";
import { communityImagePath, uploadImage } from "@/lib/storage";
import { makePostSchema } from "@/lib/utils/validators";
import type { PostCategory, PostType } from "@/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_OPTIONS = 4;
const MIN_OPTIONS = 2;
const OPTION_MAX = 80;

const EMPTY_RICH: RichTextValue = { html: "", text: "" };

const TYPE_LABELS: Record<PostType, string> = {
  text: "Texto",
  poll: "Encuesta",
  album: "Álbum",
};

export function CreatePostSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { firebaseUser, profile, isAdmin } = useAuth();
  const [type, setType] = useState<PostType>("text");
  const [rich, setRich] = useState<RichTextValue>(EMPTY_RICH);
  const [category, setCategory] = useState<PostCategory>("general");
  const [image, setImage] = useState<File | null>(null);
  const [albumFiles, setAlbumFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [editorKey, setEditorKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const membership = profile?.membershipType ?? "basic";
  const charLimit = postCharLimit(membership, isAdmin);
  const albumLimit = albumImageLimit(membership, isAdmin);

  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  const albumPreviews = useMemo(() => albumFiles.map((f) => URL.createObjectURL(f)), [albumFiles]);

  const textLen = rich.text.trim().length;
  const overLimit = rich.text.length > charLimit;
  const hasBody = type === "album" ? albumFiles.length >= 2 : textLen > 0;
  const canSubmit = hasBody && !overLimit && !saving;

  function reset() {
    setType("text");
    setRich(EMPTY_RICH);
    setCategory("general");
    setImage(null);
    setAlbumFiles([]);
    setOptions(["", ""]);
    setEditorKey((k) => k + 1); // remonta el editor → contenido vacío
  }

  function setOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value.slice(0, OPTION_MAX) : o)));
  }
  function addOption() {
    setOptions((prev) => (prev.length < MAX_OPTIONS ? [...prev, ""] : prev));
  }
  function removeOption(i: number) {
    setOptions((prev) => (prev.length > MIN_OPTIONS ? prev.filter((_, idx) => idx !== i) : prev));
  }

  function addAlbumFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files);
    const tooBig = incoming.find((f) => f.size > MAX_IMAGE_BYTES);
    if (tooBig) toastError("Cada imagen debe pesar menos de 5MB.");
    const valid = incoming.filter((f) => f.size <= MAX_IMAGE_BYTES);
    setAlbumFiles((prev) => {
      const next = [...prev, ...valid].slice(0, albumLimit);
      if (prev.length + valid.length > albumLimit) {
        toastError(`Máximo ${albumLimit} imágenes en tu plan.`);
      }
      return next;
    });
  }
  function removeAlbumFile(i: number) {
    setAlbumFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handlePublish() {
    if (!firebaseUser || !profile) return;

    if (type === "album" && albumFiles.length < 2) {
      toastError("Sube al menos 2 imágenes al álbum.");
      return;
    }

    const pollOptions =
      type === "poll"
        ? options.map((t) => ({ text: t.trim() })).filter((o) => o.text.length > 0)
        : null;

    setSaving(true);
    try {
      // Álbum: sube todas las imágenes en paralelo.
      let images: string[] | null = null;
      if (type === "album") {
        images = await Promise.all(
          albumFiles.map((f) => uploadImage(communityImagePath(firebaseUser.uid, f.name), f)),
        );
      }

      const parsed = makePostSchema(charLimit).safeParse({
        type,
        content: rich.text.trim(),
        category,
        poll: pollOptions ? { options: pollOptions } : null,
        images,
      });
      if (!parsed.success) {
        toastError(parsed.error.issues[0]?.message ?? "Revisa el contenido.");
        setSaving(false);
        return;
      }

      // Imagen simple (solo posts de texto).
      let imageURL: string | null = null;
      if (type === "text" && image) {
        if (image.size > MAX_IMAGE_BYTES) {
          toastError("La imagen supera los 5MB.");
          setSaving(false);
          return;
        }
        imageURL = await uploadImage(communityImagePath(firebaseUser.uid, image.name), image);
      }

      await createPost({
        authorUid: firebaseUser.uid,
        authorNickname: profile.nickname || profile.displayName,
        authorUsername: profile.username || firebaseUser.uid,
        authorPhotoURL: profile.customPhotoURL || profile.photoURL || "",
        authorMembership: profile.membershipType,
        authorRole: profile.role,
        type,
        content: rich.text.trim(),
        richContent: sanitizeHtml(rich.html),
        poll: pollOptions ? { options: pollOptions } : null,
        images,
        imageURL,
        category,
      });
      toastSuccess(
        isAdmin
          ? "¡Publicado! 💜 Tu post ya está visible en la comunidad."
          : "Tu publicación está en revisión 💜 El admin la aprobará pronto.",
      );
      reset();
      onClose();
    } catch (err) {
      console.error(err);
      toastError("No se pudo publicar. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva publicación" align="center">
      <div className="flex flex-col gap-4">
        {/* Tipo de publicación */}
        <div className="flex gap-1 rounded-full glass p-1">
          {(["text", "poll", "album"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                type === t ? "bg-brand text-white" : "text-text-muted hover:text-brand"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Editor enriquecido (mensaje, pregunta de encuesta o texto opcional del álbum) */}
        <RichTextEditor
          key={editorKey}
          charLimit={charLimit}
          placeholder={
            type === "poll"
              ? "Escribe la pregunta de tu encuesta…"
              : type === "album"
                ? "Añade una descripción (opcional)…"
                : "Comparte algo con la comunidad ARMY 💜"
          }
          onChange={setRich}
        />

        {/* Opciones de la encuesta */}
        {type === "poll" && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Opciones</span>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  maxLength={OPTION_MAX}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Opción ${i + 1}`}
                  className="h-11 flex-1 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3"
                />
                {options.length > MIN_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    aria-label={`Quitar opción ${i + 1}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-brand-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            ))}
            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-brand hover:underline"
              >
                <Plus className="h-4 w-4" aria-hidden /> Agregar opción
              </button>
            )}
          </div>
        )}

        {/* Álbum de imágenes */}
        {type === "album" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Imágenes</span>
              <span className="text-xs tabular-nums text-text-muted">
                {albumFiles.length}/{albumLimit}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {albumPreviews.map((src, i) => (
                <span key={i} className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src={src} alt={`Imagen ${i + 1}`} fill sizes="120px" className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removeAlbumFile(i)}
                    aria-label={`Quitar imagen ${i + 1}`}
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </span>
              ))}
              {albumFiles.length < albumLimit && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[color-mix(in_srgb,var(--text)_24%,transparent)] text-text-muted hover:border-brand hover:text-brand">
                  <Plus className="h-6 w-6" aria-hidden />
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

        {/* Categorías */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                category === c.key ? "bg-brand text-white" : "glass text-text-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Imagen simple (solo posts de texto) */}
        {type === "text" && preview && (
          <span className="relative block aspect-video overflow-hidden rounded-2xl">
            <Image src={preview} alt="Vista previa" fill sizes="500px" className="object-cover" unoptimized />
          </span>
        )}

        <div className="flex items-center justify-between">
          {type === "text" ? (
            <label className="cursor-pointer text-sm font-medium text-brand hover:underline">
              {image ? "Cambiar imagen" : "Adjuntar imagen"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <span />
          )}
          <PillButton onClick={handlePublish} disabled={!canSubmit}>
            {saving ? "Publicando…" : "Publicar"}
          </PillButton>
        </div>
      </div>
    </Modal>
  );
}

export default CreatePostSheet;
