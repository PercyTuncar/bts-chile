"use client";

/**
 * Componente para mostrar imagen de post sin recortar.
 * - Imagen completa que cabe en el viewport
 * - Sin blur ni efectos (Instagram style)
 * - Skeleton mientras carga
 * - Clickeable en móvil para abrir lightbox con zoom
 */

import { useEffect, useRef, useState } from "react";
import { ImageLightbox } from "@/components/comunidad/ImageLightbox";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

interface PostImageProps {
  src: string;
  alt: string;
  className?: string;
  clickable?: boolean; // Si true, permite abrir lightbox al hacer clic (móvil)
}

export function PostImage({ src, alt, className, clickable = true }: PostImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // En carga directa SSR, la imagen puede terminar de cargar antes de hidratarse.
  // `complete` evita que quede transparente esperando un onLoad que ya ocurrió.
  useEffect(() => {
    setLoaded(false);
    if (imageRef.current?.complete) setLoaded(true);
  }, [src]);

  const handleClick = () => {
    if (clickable) {
      setLightboxOpen(true);
    }
  };

  return (
    <>
      <div className={cn("relative w-full overflow-hidden rounded-2xl", className)}>
        {/* Skeleton mientras carga */}
        {!loaded && <Skeleton className="aspect-[4/3] w-full" rounded="rounded-2xl" />}

        {/* Imagen completa - clickeable en móvil */}
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onClick={handleClick}
          className={cn(
            "w-full h-auto rounded-2xl transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0 absolute inset-0",
            clickable && "lg:cursor-default cursor-pointer active:scale-[0.98] transition-transform"
          )}
          style={{
            maxHeight: "min(80vh, 800px)",
            objectFit: "contain",
            display: "block",
            margin: "0 auto"
          }}
        />
      </div>

      {/* Lightbox para ampliar imagen */}
      {clickable && <ImageLightbox src={lightboxOpen ? src : null} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}

export default PostImage;
