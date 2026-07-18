"use client";

// Editor de texto enriquecido (Tiptap) para noticias — PRD §9.1.
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils/cn";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const btn = (active: boolean) =>
    cn(
      "rounded-lg px-2 py-1 text-sm",
      active ? "bg-brand text-white" : "glass",
    );

  return (
    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)]">
      {editor && (
        <div className="flex flex-wrap gap-1 border-b border-[color-mix(in_srgb,var(--text)_10%,transparent)] p-2">
          <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
          <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
          <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
          <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
          <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lista</button>
          <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝ Cita</button>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="prose prose-neutral dark:prose-invert max-w-none p-3 [&_.ProseMirror]:min-h-40 [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}

export default RichTextEditor;
