"use client";

/**
 * Panel lateral sticky con todas las vistas previas (Post, Google, Redes, Checklist).
 * Usa tabs para navegar entre las diferentes vistas.
 */

import { useState } from "react";
import { FileText, Search, Share2, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { GooglePreview } from "@/components/admin/GooglePreview";
import { SocialPreview } from "@/components/admin/SocialPreview";
import { SEOChecklist } from "@/components/admin/SEOChecklist";
import type { NewsFormData } from "@/lib/validation/news-schema";

interface PreviewPanelProps {
  data: Partial<NewsFormData>;
}

type Tab = "post" | "google" | "social" | "checklist";

export function PreviewPanel({ data }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("checklist");

  const tabs = [
    { id: "checklist" as Tab, label: "Checklist", icon: CheckSquare },
    { id: "google" as Tab, label: "Google", icon: Search },
    { id: "social" as Tab, label: "Redes", icon: Share2 },
    { id: "post" as Tab, label: "Vista", icon: FileText },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-full glass p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-brand text-white"
                  : "text-text-muted hover:text-brand"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido de las tabs */}
      <div className="min-h-[400px]">
        {activeTab === "checklist" && <SEOChecklist data={data} />}

        {activeTab === "google" && (
          <GooglePreview
            title={data.title || "Título de la noticia"}
            metaTitle={data.metaTitle}
            excerpt={data.excerpt || "Meta descripción de la noticia..."}
            slug={data.slug || "slug-de-ejemplo"}
            category={data.category}
            publishedAt={null}
          />
        )}

        {activeTab === "social" && (
          <SocialPreview
            title={data.title || "Título de la noticia"}
            excerpt={data.excerpt || "Meta descripción de la noticia..."}
            ogImageURL={data.ogImageURL}
            twitterImageURL={data.twitterImageURL}
          />
        )}

        {activeTab === "post" && (
          <PostPreview
            title={data.title || "Título de la noticia"}
            content={data.content || "El contenido aparecerá aquí..."}
            featuredImageURL={data.featuredImageURL}
            authorName={data.authorName || "Autor"}
            category={data.category}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Vista previa del post publicado con el diseño final del blog.
 */
function PostPreview({
  title,
  content,
  featuredImageURL,
  authorName,
  category,
}: {
  title: string;
  content: string;
  featuredImageURL?: string;
  authorName: string;
  category?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-6">
      <div className="text-xs font-semibold text-text-muted">
        Vista previa del post
      </div>

      <article className="flex flex-col gap-4">
        {/* Imagen destacada */}
        {featuredImageURL && (
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <img
              src={featuredImageURL}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Metadatos */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {category && (
            <>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand">
                {category}
              </span>
              <span>•</span>
            </>
          )}
          <span>Por {authorName}</span>
          <span>•</span>
          <span>Hoy</span>
        </div>

        {/* Título H1 */}
        <h1 className="text-2xl font-bold leading-tight text-text">
          {title}
        </h1>

        {/* Contenido (markdown simplificado) */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="mt-4 text-xl font-semibold">
                  {line.replace("## ", "")}
                </h2>
              );
            }
            if (line.startsWith("### ")) {
              return (
                <h3 key={i} className="mt-3 text-lg font-semibold">
                  {line.replace("### ", "")}
                </h3>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <li key={i} className="ml-4">
                  {line.replace("- ", "")}
                </li>
              );
            }
            if (line.trim()) {
              return (
                <p key={i} className="leading-relaxed">
                  {line}
                </p>
              );
            }
            return null;
          })}
        </div>
      </article>

      <div className="rounded-lg bg-brand-soft/30 p-3 text-xs text-text-muted">
        <p>
          Esta es una aproximación del diseño final. Los estilos pueden variar
          en el sitio publicado.
        </p>
      </div>
    </div>
  );
}

export default PreviewPanel;
