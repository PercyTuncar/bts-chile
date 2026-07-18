"use client";

// Imagen con skeleton shimmer + fade-in al cargar — §3.3 (percepción de velocidad, sin CLS).
// Dos modos:
//  - fill: contenedor con aspecto fijo (next/image fill) → para imagen simple del post.
//  - natural (fill=false): alto según la imagen (masonry) con <img>, el skeleton reserva
//    el espacio mientras carga y luego se revela el alto real.
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

export function SmartImage({
  src,
  alt,
  sizes,
  fill = false,
  aspect = fill ? "aspect-video" : "aspect-[4/5]",
  rounded = "rounded-2xl",
  className = "",
  unoptimized = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
  fill?: boolean;
  /** Aspecto del placeholder (y del contenedor en modo fill). */
  aspect?: string;
  rounded?: string;
  className?: string;
  unoptimized?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  if (fill) {
    return (
      <span className={cn("relative block overflow-hidden", aspect, rounded)}>
        {!loaded && <Skeleton className="absolute inset-0 h-full w-full" rounded="rounded-none" />}
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          unoptimized={unoptimized}
          onLoad={() => setLoaded(true)}
          className={cn(
            "object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      </span>
    );
  }

  return (
    <span className={cn("relative block overflow-hidden", rounded)}>
      {!loaded && <Skeleton className={cn("w-full", aspect)} rounded="rounded-none" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-auto w-full transition-opacity duration-500",
          loaded ? "static opacity-100" : "absolute inset-0 opacity-0",
          className,
        )}
      />
    </span>
  );
}

export default SmartImage;
