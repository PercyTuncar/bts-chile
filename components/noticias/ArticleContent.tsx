// Contenido Markdown del artículo (salida de BlockNote) — PRD §9.3, §9.4.
// Tipografía amplia con @tailwindcss/typography; acento morado en enlaces/citas.
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

export function ArticleContent({ html }: { html: string }) {
  return (
    <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-brand prose-blockquote:border-l-4 prose-blockquote:bg-brand-soft prose-blockquote:py-1 prose-blockquote:italic prose-headings:tracking-tight prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-p:text-base prose-p:leading-relaxed prose-p:mb-4 prose-img:rounded-xl prose-img:shadow-lg prose-strong:text-brand prose-strong:font-semibold prose-code:text-brand prose-code:bg-brand-soft prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface prose-pre:border prose-pre:border-border prose-table:border-collapse prose-table:w-full prose-th:bg-brand-soft prose-th:text-brand prose-th:font-semibold prose-th:p-3 prose-th:border prose-th:border-border prose-td:p-3 prose-td:border prose-td:border-border prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6 prose-li:mb-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Componente personalizado para imágenes
          img: ({ node, ...props }) => {
            const src = props.src as string;
            const alt = props.alt as string;

            if (!src) return null;

            // Si es una URL externa, usar img normal
            if (src.startsWith("http")) {
              return (
                <img
                  {...props}
                  alt={alt || ""}
                  className="rounded-xl shadow-lg w-full h-auto"
                  loading="lazy"
                />
              );
            }

            // Si es local, usar Next.js Image
            return (
              <Image
                src={src}
                alt={alt || ""}
                width={800}
                height={450}
                className="rounded-xl shadow-lg w-full h-auto"
              />
            );
          },

          // Tablas con estilos mejorados
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),

          // Enlaces externos con target blank
          a: ({ node, ...props }) => {
            const href = props.href as string;
            const isExternal = href?.startsWith("http");
            return (
              <a
                {...props}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-brand hover:underline font-medium transition-colors"
              />
            );
          },

          // Blockquotes con diseño destacado
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-brand bg-brand-soft/50 dark:bg-brand-soft/20 py-3 px-6 my-6 italic rounded-r-lg"
              {...props}
            />
          ),

          // Código inline y bloques
          code: ({ node, className, ...props }) => {
            const isInline = !className?.includes("language-");

            if (isInline) {
              return (
                <code
                  className="bg-brand-soft text-brand px-1.5 py-0.5 rounded font-mono text-sm"
                  {...props}
                />
              );
            }

            // Bloque de código
            return (
              <code
                className="block bg-surface border border-border rounded-lg p-4 overflow-x-auto font-mono text-sm"
                {...props}
              />
            );
          },
        }}
      >
        {html}
      </ReactMarkdown>
    </div>
  );
}

export default ArticleContent;
