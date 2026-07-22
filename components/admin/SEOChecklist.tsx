"use client";

/**
 * Checklist de SEO en vivo con sistema de semáforo (verde/amarillo/rojo).
 * Valida todos los aspectos críticos para Google News y Top Stories.
 */

import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { validateSEOChecklist, type SEOChecklistItem } from "@/lib/validation/news-schema";
import type { NewsFormData } from "@/lib/validation/news-schema";

interface SEOChecklistProps {
  data: Partial<NewsFormData>;
}

export function SEOChecklist({ data }: SEOChecklistProps) {
  const items = validateSEOChecklist(data);

  // Contar estados
  const passCount = items.filter((i) => i.status === "pass").length;
  const warningCount = items.filter((i) => i.status === "warning").length;
  const failCount = items.filter((i) => i.status === "fail").length;
  const totalCount = items.length;

  // Calcular score general
  const score = Math.round((passCount / totalCount) * 100);

  // Determinar color del score
  const scoreColor =
    score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-danger";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-6">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-text-muted">
          Checklist SEO
        </div>
        <div className={cn("text-2xl font-bold tabular-nums", scoreColor)}>
          {score}%
        </div>
      </div>

      {/* Resumen de estados */}
      <div className="flex gap-4 rounded-lg glass p-3">
        <div className="flex flex-1 items-center gap-2 text-xs">
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="font-medium text-success">{passCount}</span>
          <span className="text-text-muted">Perfecto</span>
        </div>
        <div className="flex flex-1 items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4 text-warning" />
          <span className="font-medium text-warning">{warningCount}</span>
          <span className="text-text-muted">Mejorable</span>
        </div>
        <div className="flex flex-1 items-center gap-2 text-xs">
          <XCircle className="h-4 w-4 text-danger" />
          <span className="font-medium text-danger">{failCount}</span>
          <span className="text-text-muted">Falta</span>
        </div>
      </div>

      {/* Lista de checks */}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ChecklistItem key={item.id} item={item} />
        ))}
      </div>

      {/* Mensaje de estado general */}
      <div
        className={cn(
          "rounded-lg p-3 text-xs",
          score >= 80
            ? "bg-success/10 text-success"
            : score >= 60
            ? "bg-warning/10 text-warning"
            : "bg-danger/10 text-danger"
        )}
      >
        {score >= 80 ? (
          <p>
            <strong>✓ Excelente!</strong> El artículo está optimizado para
            Google News y Top Stories.
          </p>
        ) : score >= 60 ? (
          <p>
            <strong>⚠ Casi listo.</strong> Resuelve los puntos en amarillo y
            rojo para publicar.
          </p>
        ) : (
          <p>
            <strong>✗ Requiere atención.</strong> Completa los campos
            obligatorios antes de publicar.
          </p>
        )}
      </div>
    </div>
  );
}

function ChecklistItem({ item }: { item: SEOChecklistItem }) {
  const Icon =
    item.status === "pass"
      ? CheckCircle
      : item.status === "warning"
      ? AlertCircle
      : XCircle;

  const iconColor =
    item.status === "pass"
      ? "text-success"
      : item.status === "warning"
      ? "text-warning"
      : "text-danger";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[color-mix(in_srgb,var(--text)_8%,transparent)] p-3 transition-colors hover:border-[color-mix(in_srgb,var(--text)_16%,transparent)]">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
      <div className="flex-1">
        <p className="text-sm font-medium text-text">{item.label}</p>
        <p className="mt-0.5 text-xs text-text-muted">{item.message}</p>
      </div>
    </div>
  );
}

export default SEOChecklist;
