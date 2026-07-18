"use client";

// Formulario de noticia con Tiptap — PRD §9.1.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { saveNews } from "@/lib/firestore/news";
import { uploadImage } from "@/lib/storage";
import { NEWS_CATEGORIES } from "@/lib/noticias/categories";
import type { News, NewsCategory, NewsStatus } from "@/types";

const input =
  "h-11 w-full rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function NewsForm({ initial }: { initial?: News }) {
  const router = useRouter();
  const { firebaseUser, profile } = useAuth();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [category, setCategory] = useState<NewsCategory>(initial?.category ?? "oficiales");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [content, setContent] = useState(initial?.content ?? "");
  const [status, setStatus] = useState<NewsStatus>(initial?.status ?? "draft");
  const [imageURL] = useState(initial?.featuredImageURL ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toastError("Ingresa un título.");
    const finalSlug = initial?.slug ?? slug ?? slugify(title);
    const words = content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    setSaving(true);
    try {
      let featured = imageURL;
      if (file) featured = await uploadImage(`news/${finalSlug}/featured.jpg`, file);
      await saveNews({
        slug: finalSlug,
        title,
        excerpt: excerpt.slice(0, 160),
        content,
        featuredImageURL: featured,
        category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        authorUid: firebaseUser?.uid ?? "",
        authorName: profile?.nickname ?? "BTS Chile",
        status,
        readingTimeMinutes: Math.max(1, Math.round(words / 200)),
      });
      toastSuccess("Noticia guardada 💜");
      router.push("/panel-admin/noticias");
    } catch (err) {
      console.error(err);
      toastError("No se pudo guardar la noticia.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Título (máx 100)</span>
        <input className={input} value={title} maxLength={100} onChange={(e) => { setTitle(e.target.value); if (!initial) setSlug(slugify(e.target.value)); }} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Slug</span>
        <input className={input} value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!!initial} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Extracto (máx 160 = meta description)</span>
        <textarea className="rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-3" maxLength={160} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Categoría</span>
          <select className={input} value={category} onChange={(e) => setCategory(e.target.value as NewsCategory)}>
            {NEWS_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Tags (coma)</span>
          <input className={input} value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Imagen destacada (≥1200×630)</span>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {imageURL && !file && <span className="text-xs text-text-muted">Imagen actual configurada</span>}
      </label>
      <div>
        <span className="mb-1 block text-sm font-medium">Contenido</span>
        <RichTextEditor value={content} onChange={setContent} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        Estado:
        <select className="rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value as NewsStatus)}>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="scheduled">Programado</option>
          <option value="archived">Archivado</option>
        </select>
      </label>
      <PillButton type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar noticia"}</PillButton>
    </form>
  );
}

export default NewsForm;
