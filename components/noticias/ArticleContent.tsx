// Contenido HTML del artículo (salida de Tiptap) — PRD §9.3, §9.4.
// Tipografía amplia con @tailwindcss/typography; acento morado en enlaces/citas.
export function ArticleContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none prose-a:text-brand prose-blockquote:border-l-brand prose-headings:tracking-tight"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default ArticleContent;
