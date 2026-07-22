"use client";

/**
 * Componente para mostrar imagen de post con diseño mejorado.
 * - Imagen completa sin recortar
 * - Background blur si la imagen es vertical/cuadrada
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
        // Diseño con background blur para imágenes verticales/cuadradas
        <div className="relative w-full" style={{ minHeight: "400px", maxHeight: "600px" }}>
          {/* Background blur */}
          <div className="absolute inset-0">
            <Image
              src={src}
              alt=""
              fill
              className="object-cover blur-3xl scale-110 opacity-30"
              aria-hidden="true"
            />
          </div>

          {/* Imagen principal centrada */}
          <div className="relative flex items-center justify-center p-4" style={{ minHeight: "400px" }}>
            <Image
              src={src}
              alt={alt}
              width={dimensions!.width}
              height={dimensions!.height}
              className="max-h-[600px] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      ) : (
        // Diseño normal para imágenes horizontales
        <div className="relative w-full">
          <Image
            src={src}
            alt={alt}
            width={dimensions?.width || 1200}
            height={dimensions?.height || 800}
            className="w-full h-auto"
            style={{ maxHeight: "600px", objectFit: "contain" }}
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
