"use client";

// Búsqueda interna del sitio (UX) — PRD §3.4.
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export interface SearchItem {
  type: "Noticia" | "Producto";
  title: string;
  excerpt: string;
  href: string;
  image: string | null;
}

export function BuscarView({ items, initialQuery = "" }: { items: SearchItem[]; initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return items.filter((i) => `${i.title} ${i.excerpt}`.toLowerCase().includes(needle));
  }, [items, q]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" aria-hidden />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar en BTS Chile…"
          aria-label="Buscar"
          className="h-14 w-full rounded-full border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface pl-12 pr-4 text-lg"
        />
      </div>

      {q.trim() === "" ? (
        <p className="text-text-muted">Escribe para buscar noticias y productos.</p>
      ) : results.length === 0 ? (
        <p className="text-text-muted">Sin resultados para «{q}».</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="glass-card flex items-center gap-4 rounded-card p-3 hover:text-brand">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-soft">
                  {r.image && <Image src={r.image} alt="" fill sizes="56px" className="object-cover" />}
                </span>
                <span>
                  <span className="text-xs text-text-muted">{r.type}</span>
                  <p className="font-medium">{r.title}</p>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BuscarView;
