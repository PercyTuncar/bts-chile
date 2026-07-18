"use client";

// Galería de producto estilo Apple: imagen protagonista + thumbnails + zoom — PRD §7.5.
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-card glass-card text-6xl">
        💜
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setZoom((z) => !z)}
        aria-label={zoom ? "Reducir imagen" : "Ampliar imagen"}
        className="relative aspect-square overflow-hidden rounded-card glass-card"
      >
        <Image
          src={images[active]}
          alt={name}
          fill
          sizes="(max-width:768px) 100vw, 560px"
          priority
          className={cn(
            "object-cover transition-transform duration-300",
            zoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in",
          )}
        />
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Imagen ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2",
                i === active ? "border-brand" : "border-transparent",
              )}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
