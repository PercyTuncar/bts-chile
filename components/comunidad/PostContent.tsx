"use client";

// Render del contenido del post: HTML enriquecido (prose) o texto plano, con
// "Leer más" para posts largos (>200 caracteres) en el feed. §8.1
import { useMemo, useState } from "react";
import { sanitizeHtml } from "@/lib/comunidad/sanitizeHtml";

const PREVIEW_LEN = 200;

export function PostContent({
  content,
  richContent,
  clamp = false,
}: {
  content: string;
  richContent?: string | null;
  clamp?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const safe = useMemo(() => (richContent ? sanitizeHtml(richContent) : ""), [richContent]);

  const isLong = clamp && content.length > PREVIEW_LEN;
  const showFull = !isLong || expanded;

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((v) => !v);
  }

  if (!showFull) {
    return (
      <div>
        <p className="whitespace-pre-wrap">{content.slice(0, PREVIEW_LEN).trimEnd()}…</p>
        <button type="button" onClick={toggle} className="mt-1 text-sm font-medium text-brand hover:underline">
          Leer más
        </button>
      </div>
    );
  }

  return (
    <div>
      {safe ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: safe }}
        />
      ) : (
        <p className="whitespace-pre-wrap">{content}</p>
      )}
      {isLong && (
        <button type="button" onClick={toggle} className="mt-1 text-sm font-medium text-brand hover:underline">
          Leer menos
        </button>
      )}
    </div>
  );
}

export default PostContent;
