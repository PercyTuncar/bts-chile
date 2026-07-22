"use client";

/**
 * Vista previa de cómo se verá el artículo al compartir en redes sociales.
 * Muestra tarjetas de Facebook, Twitter/X y WhatsApp con la imagen OG.
 */

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface SocialPreviewProps {
  title: string;
  excerpt: string;
  ogImageURL?: string;
  twitterImageURL?: string;
  siteUrl?: string;
}

type Platform = "facebook" | "twitter" | "whatsapp";

export function SocialPreview({
  title,
  excerpt,
  ogImageURL,
  twitterImageURL,
  siteUrl = "www.btschile.com",
}: SocialPreviewProps) {
  const [platform, setPlatform] = useState<Platform>("facebook");

  // Usar imagen específica de Twitter si existe, sino la OG
  const twitterImage = twitterImageURL || ogImageURL;

  const truncatedTitle = title.length > 70 ? title.slice(0, 67) + "..." : title;
  const truncatedExcerpt =
    excerpt.length > 200 ? excerpt.slice(0, 197) + "..." : excerpt;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-6">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-text-muted">
          Vista previa de redes sociales
        </div>
      </div>

      {/* Selector de plataforma */}
      <div className="flex gap-1 rounded-full glass p-1">
        <button
          type="button"
          onClick={() => setPlatform("facebook")}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            platform === "facebook"
              ? "bg-[#1877f2] text-white"
              : "text-text-muted hover:text-brand"
          )}
        >
          Facebook
        </button>
        <button
          type="button"
          onClick={() => setPlatform("twitter")}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            platform === "twitter"
              ? "bg-black text-white"
              : "text-text-muted hover:text-brand"
          )}
        >
          X/Twitter
        </button>
        <button
          type="button"
          onClick={() => setPlatform("whatsapp")}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            platform === "whatsapp"
              ? "bg-[#25d366] text-white"
              : "text-text-muted hover:text-brand"
          )}
        >
          WhatsApp
        </button>
      </div>

      {/* Tarjeta de vista previa */}
      <div className="overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)]">
        {/* Imagen OG */}
        {(platform === "facebook" || platform === "whatsapp") && ogImageURL && (
          <div className="relative aspect-[1.91/1] w-full bg-[color-mix(in_srgb,var(--text)_5%,transparent)]">
            <Image
              src={ogImageURL}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        {platform === "twitter" && twitterImage && (
          <div className="relative aspect-video w-full bg-[color-mix(in_srgb,var(--text)_5%,transparent)]">
            <Image
              src={twitterImage}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Contenido de la tarjeta */}
        <div className="flex flex-col gap-1 p-3 bg-[color-mix(in_srgb,var(--surface)_95%,var(--text))]">
          <p className="text-[10px] uppercase tracking-wide text-text-muted">
            {siteUrl}
          </p>
          <h4 className="text-sm font-semibold leading-snug text-text">
            {truncatedTitle}
          </h4>
          <p className="text-xs leading-relaxed text-text-muted line-clamp-2">
            {truncatedExcerpt}
          </p>
        </div>
      </div>

      {/* Información específica de cada plataforma */}
      <div className="rounded-lg bg-brand-soft/30 p-3 text-xs text-text-muted">
        {platform === "facebook" && (
          <p>
            Facebook usa la imagen Open Graph (1200×630px). La tarjeta aparece
            al compartir el link en posts, Messenger y comentarios.
          </p>
        )}
        {platform === "twitter" && (
          <p>
            X/Twitter usa{" "}
            {twitterImageURL
              ? "la imagen específica de Twitter (1200×675px)"
              : "la imagen Open Graph como fallback"}
            . Formato: summary_large_image.
          </p>
        )}
        {platform === "whatsapp" && (
          <p>
            WhatsApp usa la imagen Open Graph (1200×630px). La preview aparece
            automáticamente al pegar el link en un chat.
          </p>
        )}
      </div>

      {/* Feedback de estado */}
      <div className="flex flex-col gap-2 border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">Imagen Open Graph:</span>
          <span
            className={cn(
              "font-medium",
              ogImageURL ? "text-success" : "text-warning"
            )}
          >
            {ogImageURL ? "✓ Configurada" : "No configurada"}
          </span>
        </div>
        {platform === "twitter" && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Imagen Twitter:</span>
            <span
              className={cn(
                "font-medium",
                twitterImageURL ? "text-success" : "text-text-muted"
              )}
            >
              {twitterImageURL
                ? "✓ Configurada"
                : "Usando OG como fallback"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialPreview;
