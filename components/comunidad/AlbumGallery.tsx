"use client";

// Galería de álbum en masonry (CSS columns) — §8.1.
// preview (feed): primeras 4 fotos, la última con overlay "+N" que abre el detalle.
// completo (detalle): todas las fotos; al hacer clic se abre el visor con descarga.
import Link from "next/link";
import { useState } from "react";
import { ImageLightbox } from "@/components/comunidad/ImageLightbox";
import { SmartImage } from "@/components/ui/SmartImage";

const PREVIEW_COUNT = 4;

export function AlbumGallery({
  images,
  preview = false,
  postHref,
}: {
  images: string[];
  preview?: boolean;
  postHref?: string;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!images?.length) return null;

  const shown = preview ? images.slice(0, PREVIEW_COUNT) : images;
  const extra = preview ? images.length - shown.length : 0;

  return (
    <>
      <div className="columns-2 gap-2 sm:columns-3">
        {shown.map((src, i) => {
          const overlay = preview && i === shown.length - 1 && extra > 0;
          const tile = (
            <span className="relative block overflow-hidden rounded-xl">
              <SmartImage src={src} alt={`Foto ${i + 1}`} rounded="rounded-xl" />
              {overlay && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-bold text-white">
                  +{extra}
                </span>
              )}
            </span>
          );

          if (preview) {
            return (
              <Link key={i} href={postHref ?? "#"} className="mb-2 block break-inside-avoid">
                {tile}
              </Link>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(src)}
              className="mb-2 block w-full break-inside-avoid transition-opacity hover:opacity-90"
            >
              {tile}
            </button>
          );
        })}
      </div>

      {!preview && <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}

export default AlbumGallery;
