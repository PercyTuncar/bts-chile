"use client";

// Editor de texto enriquecido (Tiptap) para el composer — §8.1.
// Formato (negrita/cursiva/tachado/listas/cita) + emojis, links, color e imagen subida.
// Reporta {html, text} al padre; el conteo se mide en texto plano contra el límite del plan.
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Palette,
  Quote,
  Smile,
  Strikethrough,
} from "lucide-react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface RichTextValue {
  html: string;
  text: string;
}

const EMOJIS = [
  "💜", "🥹", "😂", "😭", "🔥", "🫶", "✨", "🎉", "😍", "🥰",
  "😎", "🤩", "😳", "😅", "🙈", "👀", "🙌", "👏", "💪", "🙏",
  "💖", "💗", "💛", "💙", "💚", "🖤", "🤍", "⭐", "🌟", "🎶",
  "🎵", "🎤", "🐰", "🐻", "🦋", "🌸", "🌈", "💫", "👑", "🫰",
];

const COLORS = [
  "#8B5CF6", "#7C3AED", "#EC4899", "#EF4444", "#F59E0B",
  "#10B981", "#3B82F6", "#111827", "#6B7280",
];

function ToolbarButton({
  onClick,
  active = false,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // no perder el foco/selección del editor
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        active ? "bg-brand text-white" : "text-text-muted hover:bg-brand-soft hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-[color-mix(in_srgb,var(--text)_12%,transparent)]" />;
}

function Toolbar({ editor }: { editor: Editor }) {
  const [pop, setPop] = useState<"emoji" | "color" | "link" | null>(null);
  const [linkUrl, setLinkUrl] = useState("");

  function close() {
    setPop(null);
  }

  function applyLink() {
    const url = linkUrl.trim();
    if (url) {
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkUrl("");
    close();
  }

  return (
    <div className="relative flex flex-wrap items-center gap-1 border-b border-[color-mix(in_srgb,var(--text)_12%,transparent)] px-2 py-1.5">
      <ToolbarButton label="Negrita" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton label="Cursiva" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton label="Tachado" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" aria-hidden />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton label="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton label="Cita" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" aria-hidden />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Emoji" active={pop === "emoji"} onClick={() => setPop((p) => (p === "emoji" ? null : "emoji"))}>
        <Smile className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Enlace"
        active={editor.isActive("link") || pop === "link"}
        onClick={() => {
          setLinkUrl(editor.getAttributes("link").href ?? "");
          setPop((p) => (p === "link" ? null : "link"));
        }}
      >
        <Link2 className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton label="Color de texto" active={pop === "color"} onClick={() => setPop((p) => (p === "color" ? null : "color"))}>
        <Palette className="h-4 w-4" aria-hidden />
      </ToolbarButton>

      {/* Popovers */}
      {pop === "emoji" && (
        <div className="glass-modal absolute left-2 top-full z-30 mt-1 grid w-64 grid-cols-8 gap-1 rounded-2xl p-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onMouseDown={(ev) => ev.preventDefault()}
              onClick={() => {
                editor.chain().focus().insertContent(e).run();
                close();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-lg hover:bg-brand-soft"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {pop === "color" && (
        <div className="glass-modal absolute left-2 top-full z-30 mt-1 flex w-56 flex-wrap gap-2 rounded-2xl p-3">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onMouseDown={(ev) => ev.preventDefault()}
              onClick={() => {
                editor.chain().focus().setColor(c).run();
                close();
              }}
              className="h-7 w-7 rounded-full ring-1 ring-black/10 transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            type="button"
            onMouseDown={(ev) => ev.preventDefault()}
            onClick={() => {
              editor.chain().focus().unsetColor().run();
              close();
            }}
            className="rounded-full px-3 py-1 text-xs font-medium text-text-muted hover:bg-brand-soft"
          >
            Quitar color
          </button>
        </div>
      )}

      {pop === "link" && (
        <div className="glass-modal absolute left-2 top-full z-30 mt-1 flex w-72 items-center gap-2 rounded-2xl p-2">
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
            placeholder="https://…"
            className="h-9 flex-1 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3 text-sm"
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-button bg-brand px-3 py-1.5 text-sm font-medium text-white"
          >
            {linkUrl.trim() ? "Aplicar" : "Quitar"}
          </button>
        </div>
      )}
    </div>
  );
}

export function RichTextEditor({
  placeholder = "Escribe algo…",
  charLimit,
  onChange,
}: {
  placeholder?: string;
  charLimit: number;
  onChange: (value: RichTextValue) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false, // evita mismatch de hidratación en Next.js
    extensions: [
      StarterKit.configure({ heading: false }),
      TextStyle,
      Color,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[7rem] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange({ html: editor.getHTML(), text: editor.getText() }),
  });

  // Reporta el estado inicial (vacío) una vez montado.
  useEffect(() => {
    if (editor) onChange({ html: editor.getHTML(), text: editor.getText() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const count = editor?.getText().length ?? 0;
  const over = count > charLimit;
  const isEmpty = count === 0;

  return (
    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface">
      {editor && <Toolbar editor={editor} />}
      <div className="relative">
        {isEmpty && (
          <p className="pointer-events-none absolute left-4 top-3 text-text-muted">{placeholder}</p>
        )}
        <EditorContent editor={editor} />
      </div>
      <p
        className={cn(
          "px-4 pb-2 text-right text-xs tabular-nums",
          over ? "font-semibold text-danger" : "text-text-muted",
        )}
      >
        {count}/{charLimit}
      </p>
    </div>
  );
}

export default RichTextEditor;
