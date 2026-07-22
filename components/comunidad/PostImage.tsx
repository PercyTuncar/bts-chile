"use client";

/**
 * Componente para mostrar imagen de post sin recortar.
 * - Imagen completa que cabe en el viewport
 * - Sin blur ni efectos (Instagram style)
 * - Skeleton mientras carga
 */

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

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl bg-surface", className)}>
      {/* Skeleton mientras carga */}
      {!loaded && <Skeleton className="aspect-[4/3] w-full" rounded="rounded-2xl" />}

      {/* Imagen completa - siempre cabe en viewport */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          "w-full h-auto rounded-2xl transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0 absolute inset-0"
        )}
        style={{
          maxHeight: "min(80vh, 800px)",
          objectFit: "contain",
          display: "block",
          margin: "0 auto"
        }}
      />
    </div>
  );
}

export default PostImage;
