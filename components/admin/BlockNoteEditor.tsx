"use client";

/**
 * Editor tipo Notion usando BlockNote.
 * Bloquea H1 (solo permite H2 y H3), soporta listas, tablas, citas, imágenes.
 */

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEffect } from "react";
import { blocksToMarkdown, markdownToBlocks } from "@/lib/markdown/blocknote-converter";

interface BlockNoteEditorProps {
  value: string; // Markdown
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export function BlockNoteEditor({ value, onChange, placeholder }: BlockNoteEditorProps) {
  // Crear el editor
  const editor = useCreateBlockNote({
    initialContent: value ? markdownToBlocks(value) : undefined,
  });

  // Actualizar contenido cuando cambian los bloques
  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.onChange(() => {
      const blocks = editor.document;
      const markdown = blocksToMarkdown(blocks as any[]);
      onChange(markdown);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [editor, onChange]);

  if (!editor) {
    return (
      <div className="min-h-[400px] rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface p-4">
        <p className="text-text-muted">Cargando editor...</p>
      </div>
    );
  }

  return (
    <div className="blocknote-wrapper rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface overflow-hidden">
      <BlockNoteView
        editor={editor}
        theme="light"
      />

      <style jsx global>{`
        /* Estilos personalizados para BlockNote */
        .blocknote-wrapper .bn-editor {
          padding: 1rem;
          min-height: 400px;
        }

        .blocknote-wrapper .bn-block-content {
          font-family: var(--font-sans);
        }

        /* Dark mode support */
        .dark .blocknote-wrapper {
          background: var(--surface);
        }

        .dark .blocknote-wrapper .bn-editor {
          background: var(--surface);
          color: var(--text);
        }

        /* Ocultar H1 del menú de slash commands */
        .bn-suggestion-menu-item[data-item-type="heading"][data-level="1"],
        button[data-test="heading-1"] {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export default BlockNoteEditor;
