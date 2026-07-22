"use client";

/**
 * Vista previa de cómo se verá el artículo en los resultados de búsqueda de Google (SERP).
 * Simula el snippet exacto con favicon, título, URL, descripción y rich snippet de noticias.
 */

import { Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface GooglePreviewProps {
  title: string;
  metaTitle?: string;
  excerpt: string;
  slug: string;
  category?: string;
  publishedAt?: Date | null;
  siteUrl?: string;
}

export function GooglePreview({
  title,
  metaTitle,
  excerpt,
  slug,
  category,
  publishedAt,
  siteUrl = "www.btschile.com",
}: GooglePreviewProps) {
  // Usar metaTitle si existe, sino el title
  const displayTitle = metaTitle || title;

  // Truncar título a ~60 caracteres (Google trunca a ~580px)
  const truncatedTitle =
    displayTitle.length > 60 ? displayTitle.slice(0, 57) + "..." : displayTitle;

  // Truncar descripción a ~160 caracteres
  const truncatedExcerpt =
    excerpt.length > 160 ? excerpt.slice(0, 157) + "..." : excerpt;

  // Formatear fecha
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Hoy";

  // URL completa
  const fullUrl = `${siteUrl}/noticias/${slug}`;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-6">
      <div className="flex items-center gap-2">
        <div className="text-xs font-semibold text-text-muted">
          Vista previa de Google
        </div>
      </div>

      {/* Simulación del resultado de búsqueda */}
      <div className="flex flex-col gap-1">
        {/* Favicon + Dominio + URL */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs text-white">
            A
          </div>
          <span className="text-text-muted">{siteUrl}</span>
          <ExternalLink className="h-3 w-3 text-text-muted" />
        </div>

        <div className="flex items-center gap-1 text-sm text-[#5f6368]">
          <span>{siteUrl}</span>
          <span>›</span>
          <span>noticias</span>
          <span>›</span>
          <span className="truncate">{slug.slice(0, 30)}</span>
        </div>

        {/* Título (azul, clickeable en apariencia) */}
        <h3 className="mt-1 text-xl text-[#1a0dab] hover:underline cursor-default">
          {truncatedTitle}
        </h3>

        {/* Rich snippet de noticias (si tiene fecha) */}
        {publishedAt && (
          <div className="flex items-center gap-2 text-xs text-[#5f6368]">
            <Clock className="h-3 w-3" />
            <span>{formattedDate}</span>
            {category && (
              <>
                <span>·</span>
                <span className="capitalize">{category}</span>
              </>
            )}
          </div>
        )}

        {/* Meta descripción */}
        <p className="mt-1 text-sm leading-relaxed text-[#4d5156]">
          {truncatedExcerpt}
        </p>
      </div>

      {/* Feedback de longitud */}
      <div className="flex flex-col gap-2 border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Longitud del título:</span>
          <span
            className={cn(
              "font-medium tabular-nums",
              displayTitle.length > 60
                ? "text-danger"
                : displayTitle.length < 30
                ? "text-warning"
                : "text-success"
            )}
          >
            {displayTitle.length}/60
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Longitud de descripción:</span>
          <span
            className={cn(
              "font-medium tabular-nums",
              excerpt.length > 160
                ? "text-danger"
                : excerpt.length < 120
                ? "text-warning"
                : "text-success"
            )}
          >
            {excerpt.length}/160
          </span>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="rounded-lg bg-brand-soft/30 p-3 text-xs text-text-muted">
        <p>
          Esta es una aproximación de cómo se vería en Google. El snippet real
          puede variar según la consulta del usuario.
        </p>
      </div>
    </div>
  );
}

export default GooglePreview;
