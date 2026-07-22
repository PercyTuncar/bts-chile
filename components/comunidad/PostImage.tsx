"use client";

/**
 * Componente para mostrar imagen de post con diseño mejorado.
 * - Imagen completa sin recortar
 * - Background glass blur estilo iPhone si la imagen es vertical/cuadrada
 * - Skeleton mientras carga
 */

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

interface PostImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function PostImage({ src, alt, className }: PostImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setLoaded(true);
  };

  // Calcular si es vertical, horizontal o cuadrada
  const aspectRatio = dimensions ? dimensions.width / dimensions.height : 1;
  const isVertical = aspectRatio < 0.8; // Más alto que ancho
  const isSquare = aspectRatio >= 0.8 && aspectRatio <= 1.2;

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl bg-surface", className)}>
      {/* Skeleton mientras carga */}
      {!loaded && <Skeleton className="aspect-[4/3] w-full" rounded="rounded-2xl" />}

      {loaded && (isVertical || isSquare) ? (
        // Diseño con background glass blur para imágenes verticales/cuadradas
        <div className="relative w-full" style={{ minHeight: "500px", maxHeight: "700px" }}>
          {/* Background glass con blur suave */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={src}
              alt=""
              fill
              className="object-cover scale-110"
              style={{ filter: "blur(40px) saturate(1.2)" }}
              aria-hidden="true"
            />
            {/* Overlay glass con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/40 to-bg/60 backdrop-blur-xl" />
          </div>

          {/* Imagen principal centrada sin recortar */}
          <div className="relative flex items-center justify-center p-6" style={{ minHeight: "500px" }}>
            <img
              src={src}
              alt={alt}
              className="max-h-[700px] w-auto max-w-full"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      ) : (
        // Diseño normal para imágenes horizontales
        <div className="relative w-full">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto rounded-2xl"
            style={{ maxHeight: "700px", objectFit: "contain" }}
          />
        </div>
      )}

      {/* Imagen oculta para obtener dimensiones */}
      {!loaded && (
        <img
          src={src}
          alt=""
          onLoad={handleLoad}
          className="absolute inset-0 opacity-0 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default PostImage;
