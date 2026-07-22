"use client";

/**
 * Formulario profesional de noticias con layout 2 columnas.
 * Izquierda: Editor y campos | Derecha: Vistas previas en vivo
 * Optimizado para Google News con validación completa.
 */

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { BlockNoteEditor } from "@/components/admin/BlockNoteEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { PreviewPanel } from "@/components/admin/PreviewPanel";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { saveNews } from "@/lib/firestore/news";
import { uploadImage } from "@/lib/storage";
import { NEWS_CATEGORIES } from "@/lib/noticias/categories";
import { newsFormSchema, newsPublishSchema, type NewsFormData } from "@/lib/validation/news-schema";
import { validateNewsArticleLD } from "@/lib/seo/json-ld";
import { notifyIndexNow } from "@/lib/seo/indexnow";
import { cn } from "@/lib/utils/cn";
import type { News, NewsCategory, NewsStatus } from "@/types";

const input =
  "h-11 w-full rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface NewsFormProProps {
  initial?: News;
}

export function NewsFormPro({ initial }: NewsFormProProps) {
  const router = useRouter();
  const { firebaseUser, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(true);
  const [ogExpanded, setOgExpanded] = useState(true);

  // Estados para archivos de imágenes (antes de subir)
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [squareFile, setSquareFile] = useState<File | null>(null);
  const [ogFile, setOgFile] = useState<File | null>(null);
  const [twitterFile, setTwitterFile] = useState<File | null>(null);

  // Form con react-hook-form + zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsFormSchema),
    mode: "onChange",
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      excerpt: initial?.excerpt ?? "",
      content: initial?.content ?? "",
      metaTitle: initial?.metaTitle ?? "",
      headline: initial?.headline ?? "",
      featuredImageURL: initial?.featuredImageURL ?? "",
      seoImageSquareURL: initial?.seoImageSquareURL ?? "",
      ogImageURL: initial?.ogImageURL ?? "",
      twitterImageURL: initial?.twitterImageURL ?? "",
      imageAlt: initial?.imageAlt ?? "",
      category: initial?.category ?? "oficiales",
      tags: initial?.tags ?? [],
      authorUid: firebaseUser?.uid ?? "",
      authorName: initial?.authorName ?? profile?.nickname ?? "BTS Chile",
      authorUrl: initial?.authorUrl ?? "",
      status: initial?.status ?? "draft",
    },
  });

  // Debug: mostrar errores en consola
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("=== FORM ERRORS ===", errors);
    }
  }, [errors]);

  // Watch para actualizar previews en tiempo real
  const formData = watch();

  // Auto-generar slug del título
  useEffect(() => {
    if (!initial && formData.title) {
      setValue("slug", slugify(formData.title));
    }
  }, [formData.title, initial, setValue]);

  // Auto-generar headline si está vacío
  useEffect(() => {
    if (!formData.headline && formData.title) {
      setValue("headline", formData.title.slice(0, 110));
    }
  }, [formData.title, formData.headline, setValue]);

  async function onSubmit(data: NewsFormData) {
    console.log("=== SUBMIT DATA ===", data);
    console.log("Tags:", data.tags, "Type:", Array.isArray(data.tags), "Length:", data.tags?.length);

    // Validación adicional para publicación
    if (data.status === "published") {
      const errors: string[] = [];

      if (!data.tags || data.tags.length === 0) {
        errors.push("Se requiere al menos 1 tag para publicar");
      }

      if (!heroFile && !data.featuredImageURL) {
        errors.push("Se requiere imagen hero para publicar");
      }

      if (!squareFile && !data.seoImageSquareURL) {
        errors.push("Se requiere imagen cuadrada 1:1 para publicar");
      }

      if (!ogFile && !data.ogImageURL) {
        errors.push("Se requiere imagen Open Graph para publicar");
      }

      if (!data.imageAlt) {
        errors.push("Se requiere texto alternativo para publicar");
      }

      if (errors.length > 0) {
        toastError(errors.join(". "));
        return;
      }
    }

    setSaving(true);

    try {
      // Subir imágenes PRIMERO, antes de validar
      let heroURL = data.featuredImageURL;
      let squareURL = data.seoImageSquareURL;
      let ogURL = data.ogImageURL;
      let twitterURL = data.twitterImageURL;

      if (heroFile) {
        heroURL = await uploadImage(
          `news/${data.slug}/hero.jpg`,
          heroFile
        );
      }

      if (squareFile) {
        squareURL = await uploadImage(
          `news/${data.slug}/square.jpg`,
          squareFile
        );
      }

      if (ogFile) {
        ogURL = await uploadImage(
          `news/${data.slug}/og.jpg`,
          ogFile
        );
      }

      if (twitterFile) {
        twitterURL = await uploadImage(
          `news/${data.slug}/twitter.jpg`,
          twitterFile
        );
      }

      // AHORA validar si está publicando
      if (data.status === "published") {
        // Validar que tenga todas las imágenes requeridas
        if (!heroURL || !squareURL || !ogURL || !data.imageAlt) {
          toastError(
            "Para publicar se requieren: imagen hero, imagen cuadrada 1:1, imagen OG y texto alternativo"
          );
          setSaving(false);
          return;
        }

        // Validar JSON-LD
        const ldErrors = validateNewsArticleLD({
          ...data,
          featuredImageURL: heroURL,
          seoImageSquareURL: squareURL,
          ogImageURL: ogURL,
          publishedAt: null,
          dateModified: null,
        } as any);

        if (ldErrors.length > 0) {
          toastError("Errores de JSON-LD: " + ldErrors.join(", "));
          setSaving(false);
          return;
        }
      }

      // Calcular tiempo de lectura
      const words = data.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.round(words / 200));

      // Guardar en Firestore
      await saveNews({
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        featuredImageURL: heroURL,
        seoImageSquareURL: squareURL,
        ogImageURL: ogURL,
        twitterImageURL: twitterURL,
        imageAlt: data.imageAlt,
        metaTitle: data.metaTitle,
        headline: data.headline || data.title.slice(0, 110),
        category: data.category,
        tags: data.tags,
        authorUid: data.authorUid,
        authorName: data.authorName,
        authorUrl: data.authorUrl,
        status: data.status,
        scheduledFor: data.scheduledFor || null,
        readingTimeMinutes: readingTime,
      });

      // Si se publicó, notificar a IndexNow
      if (data.status === "published") {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.btschile.com";
        await notifyIndexNow(`${siteUrl}/noticias/${data.slug}`);
      }

      toastSuccess(
        data.status === "published"
          ? "Noticia publicada 💜"
          : data.status === "draft"
          ? "Borrador guardado 💜"
          : data.status === "scheduled"
          ? "Noticia programada 💜"
          : "Noticia archivada 💜"
      );
      router.push("/panel-admin/noticias");
    } catch (err) {
      console.error(err);
      toastError("No se pudo guardar la noticia.");
    } finally {
      setSaving(false);
    }
  }

  // Validar solo si tiene contenido mínimo (no bloquear drafts)
  const hasMinimumContent = formData.title && formData.excerpt && formData.content;
  const canSave = hasMinimumContent;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-6">
      {/* Columna izquierda: Editor y campos (65%) */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Sección: Básicos */}
        <div className="flex flex-col gap-4 rounded-2xl glass-card p-6">
          <h2 className="text-lg font-semibold">Información básica</h2>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Título (H1 único) <span className="text-danger">*</span>
            </span>
            <input
              {...register("title")}
              className={cn(input, errors.title && "border-danger")}
              placeholder="Título de la noticia (máx 100 caracteres)"
              maxLength={100}
            />
            {errors.title && (
              <span className="text-xs text-danger">{errors.title.message}</span>
            )}
            <span className="text-xs text-text-muted">
              Este será el ÚNICO H1 de la página. El editor de contenido solo
              permite H2 y H3.
            </span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Slug (URL) <span className="text-danger">*</span>
            </span>
            <input
              {...register("slug")}
              className={cn(input, errors.slug && "border-danger")}
              placeholder="slug-de-la-url"
              disabled={!!initial}
            />
            {errors.slug && (
              <span className="text-xs text-danger">{errors.slug.message}</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Meta descripción <span className="text-danger">*</span>
            </span>
            <textarea
              {...register("excerpt")}
              className={cn(
                "min-h-[80px] rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-3 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                errors.excerpt && "border-danger"
              )}
              placeholder="Descripción que aparecerá en Google (120-160 caracteres recomendado)"
              maxLength={160}
            />
            <div className="flex items-center justify-between">
              {errors.excerpt && (
                <span className="text-xs text-danger">{errors.excerpt.message}</span>
              )}
              <span
                className={cn(
                  "ml-auto text-xs tabular-nums",
                  (formData.excerpt?.length ?? 0) > 160
                    ? "text-danger"
                    : (formData.excerpt?.length ?? 0) < 120
                    ? "text-warning"
                    : "text-success"
                )}
              >
                {formData.excerpt?.length ?? 0}/160
              </span>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Categoría</span>
              <select
                {...register("category")}
                className={input}
              >
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Tags (separados por coma)
                {formData.status === "published" && (
                  <span className="text-danger"> *</span>
                )}
              </span>
              <input
                className={cn(input, errors.tags && "border-danger")}
                placeholder="BTS, K-pop, Noticias"
                onChange={(e) => {
                  const tagsArray = e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  setValue("tags", tagsArray, { shouldValidate: true });
                }}
                defaultValue={initial?.tags?.join(", ") ?? ""}
              />
              {errors.tags && (
                <span className="text-xs text-danger">{errors.tags.message}</span>
              )}
              <span className="text-xs text-text-muted">
                {formData.status === "published"
                  ? "Mínimo 1 tag requerido para publicar. Separa múltiples tags con comas."
                  : "Separa múltiples tags con comas. Opcional para borradores."}
              </span>
            </label>
          </div>
        </div>

        {/* Sección: Contenido */}
        <div className="flex flex-col gap-4 rounded-2xl glass-card p-6">
          <h2 className="text-lg font-semibold">Contenido</h2>
          <p className="text-sm text-text-muted">
            Editor tipo Notion. Solo permite H2 y H3 (sin H1). Soporta tablas,
            listas, citas e imágenes.
          </p>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <BlockNoteEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Escribe el contenido de la noticia..."
              />
            )}
          />
          {errors.content && (
            <span className="text-xs text-danger">{errors.content.message}</span>
          )}
        </div>

        {/* Sección: Imagen destacada (Hero 16:9) */}
        <div className="flex flex-col gap-4 rounded-2xl glass-card p-6">
          <h2 className="text-lg font-semibold">Imagen destacada</h2>
          <Controller
            name="featuredImageURL"
            control={control}
            render={({ field }) => (
              <ImageUploadField
                label="Imagen hero (16:9)"
                description="Mínimo 1200px de ancho, ratio 16:9 (ejemplo: 1200×675px)"
                value={field.value}
                onChange={(url, file) => {
                  field.onChange(url);
                  setHeroFile(file);
                }}
                aspectRatio="16:9"
                minWidth={1200}
                required
              />
            )}
          />
        </div>

        {/* Sección: SEO en buscadores (colapsable) */}
        <div className="flex flex-col gap-4 rounded-2xl glass-card p-6">
          <button
            type="button"
            onClick={() => setSeoExpanded(!seoExpanded)}
            className="flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold">SEO en buscadores</h2>
            {seoExpanded ? (
              <ChevronUp className="h-5 w-5 text-text-muted" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-muted" />
            )}
          </button>

          {seoExpanded && (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Meta título (si difiere del H1)
                </span>
                <input
                  {...register("metaTitle")}
                  className={input}
                  placeholder="Opcional. Google trunca a ~60 caracteres"
                  maxLength={60}
                />
                <span className="text-xs text-text-muted">
                  Déjalo vacío para usar el título principal. Máx 60 caracteres.
                </span>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Headline para NewsArticle
                </span>
                <input
                  {...register("headline")}
                  className={input}
                  placeholder="Se auto-genera del título. Máx 110 caracteres"
                  maxLength={110}
                />
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    (formData.headline?.length ?? 0) > 110
                      ? "text-danger"
                      : "text-text-muted"
                  )}
                >
                  {formData.headline?.length ?? 0}/110 (límite duro de Google)
                </span>
              </label>

              <Controller
                name="seoImageSquareURL"
                control={control}
                render={({ field }) => (
                  <ImageUploadField
                    label="Imagen cuadrada (1:1)"
                    description="≥1200×1200px. Requerida para Google NewsArticle y Top Stories"
                    value={field.value || null}
                    onChange={(url, file) => {
                      field.onChange(url);
                      setSquareFile(file);
                    }}
                    aspectRatio="1:1"
                    minWidth={1200}
                    required={formData.status === "published"}
                  />
                )}
              />

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Texto alternativo (accesibilidad) <span className="text-danger">*</span>
                </span>
                <input
                  {...register("imageAlt")}
                  className={cn(input, errors.imageAlt && "border-danger")}
                  placeholder="Describe la imagen para lectores de pantalla y SEO"
                  maxLength={125}
                />
                {errors.imageAlt && (
                  <span className="text-xs text-danger">{errors.imageAlt.message}</span>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Sección: Vista en redes sociales (colapsable) */}
        <div className="flex flex-col gap-4 rounded-2xl glass-card p-6">
          <button
            type="button"
            onClick={() => setOgExpanded(!ogExpanded)}
            className="flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold">Vista en redes sociales (Open Graph)</h2>
            {ogExpanded ? (
              <ChevronUp className="h-5 w-5 text-text-muted" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-muted" />
            )}
          </button>

          {ogExpanded && (
            <div className="flex flex-col gap-4">
              <Controller
                name="ogImageURL"
                control={control}
                render={({ field }) => (
                  <ImageUploadField
                    label="Imagen Open Graph"
                    description="1200×630px exacto. Para Facebook, LinkedIn, WhatsApp"
                    value={field.value || null}
                    onChange={(url, file) => {
                      field.onChange(url);
                      setOgFile(file);
                    }}
                    aspectRatio="1.91:1"
                    requiredWidth={1200}
                    requiredHeight={630}
                    required={formData.status === "published"}
                  />
                )}
              />

              <Controller
                name="twitterImageURL"
                control={control}
                render={({ field }) => (
                  <ImageUploadField
                    label="Imagen para X/Twitter (opcional)"
                    description="1200×675px. Si no se sube, usa la OG como fallback"
                    value={field.value || null}
                    onChange={(url, file) => {
                      field.onChange(url);
                      setTwitterFile(file);
                    }}
                    aspectRatio="16:9-twitter"
                    requiredWidth={1200}
                    requiredHeight={675}
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* Sección: Publicación */}
        <div className="flex flex-col gap-4 rounded-2xl glass-card p-6">
          <h2 className="text-lg font-semibold">Publicación</h2>

          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium">Estado:</span>
            <select
              {...register("status")}
              className="rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3 py-2"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="scheduled">Programado</option>
              <option value="archived">Archivado</option>
            </select>
          </label>

          {formData.status === "scheduled" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Fecha de publicación programada</span>
              <input
                type="datetime-local"
                {...register("scheduledFor")}
                className={input}
              />
              <span className="text-xs text-text-muted">
                La noticia se publicará automáticamente en esta fecha
              </span>
            </label>
          )}

          {!canSave && (
            <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
              <p className="font-medium">Faltan campos básicos</p>
              <p className="mt-1 text-xs">
                Completa el título, descripción y contenido para guardar.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <PillButton
              type="submit"
              disabled={saving || !canSave}
              fullWidth
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : formData.status === "published" ? (
                "Publicar noticia"
              ) : formData.status === "draft" ? (
                "Guardar borrador"
              ) : formData.status === "scheduled" ? (
                "Programar publicación"
              ) : (
                "Archivar noticia"
              )}
            </PillButton>
            <PillButton
              type="button"
              variant="secondary"
              onClick={() => router.push("/panel-admin/noticias")}
              disabled={saving}
            >
              Cancelar
            </PillButton>
          </div>
        </div>
      </div>

      {/* Columna derecha: Vistas previas (35%) */}
      <div className="sticky top-6 h-fit w-[400px] shrink-0">
        <PreviewPanel data={formData} />
      </div>
    </form>
  );
}

export default NewsFormPro;
