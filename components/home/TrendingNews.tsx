"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

const NEWS = [
  {
    id: 1,
    title: "BTS anuncia nuevas fechas para Chile 2026",
    excerpt: "La banda confirmó tres presentaciones en el Estadio Nacional...",
    image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg",
    date: "Hace 2 horas",
    category: "Conciertos",
  },
  {
    id: 2,
    title: "Nuevo álbum ARIRANG rompe récords",
    excerpt: "El último lanzamiento de BTS supera las expectativas...",
    image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg",
    date: "Hace 5 horas",
    category: "Música",
  },
  {
    id: 3,
    title: "Entradas disponibles desde hoy",
    excerpt: "La preventa para miembros ARMY comienza ahora...",
    image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg",
    date: "Hace 1 día",
    category: "Entradas",
  },
];

export function TrendingNews() {
  return (
    <div className="glass-card rounded-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Últimas Noticias</h3>
        <Link
          href="/noticias"
          className="text-sm text-brand hover:text-brand-strong transition-colors"
        >
          Ver todas
        </Link>
      </div>

      <div className="space-y-3">
        {NEWS.map((item) => (
          <Link
            key={item.id}
            href={`/noticias/${item.id}`}
            className="block group"
          >
            <div className="flex gap-3 p-2 rounded-lg hover:bg-surface/50 transition-colors">
              {/* Imagen */}
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-brand/10 text-brand mb-1">
                  {item.category}
                </span>

                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-brand transition-colors">
                  {item.title}
                </h4>

                <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/noticias"
        className="flex items-center justify-center gap-1 mt-4 text-sm text-brand hover:text-brand-strong font-medium transition-colors"
      >
        Más noticias
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
