// Utilidades UI compartidas del panel admin.
import type { ReactNode } from "react";

export function AdminSection({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-text-muted">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card rounded-card p-4 ${className}`}>{children}</div>;
}

export function KpiTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="glass-card rounded-card p-4">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function Loading() {
  return <p className="py-10 text-center text-text-muted">Cargando…</p>;
}

/** Descarga un CSV desde filas (export admin). §11.1 */
export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
