"use client";

// Mensaje del ARMY Chat — estilo Telegram: avatar + nombre + hora, agrupa consecutivos.
// Fase 2: borrado (soft-delete, el admin ve el contenido archivado), edición inline y
// menú de acciones (editar / eliminar / fijar / silenciar / banear).
import Image from "next/image";
import Link from "next/link";
import { Ban, Check, MoreVertical, Pencil, Pin, PinOff, Trash2, VolumeX, X } from "lucide-react";
import { useMemo, useState } from "react";
import { RichTextEditor, type RichTextValue } from "@/components/comunidad/RichTextEditor";
import { AdminBadge } from "@/components/ui/Badge";
import { SmartImage } from "@/components/ui/SmartImage";
import { sanitizeHtml } from "@/lib/comunidad/sanitizeHtml";
import type { DeletedArchive } from "@/lib/firestore/chat";
import { formatRelative } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { DisplayMessage } from "@/hooks/useArmyChat";

function toDate(v: DisplayMessage["createdAt"]): Date {
  return v instanceof Date ? v : v?.toDate?.() ?? new Date();
}

export interface ChatItemHandlers {
  onEdit: (id: string, v: { text: string; richContent: string | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTogglePin: (id: string, pin: boolean) => void;
  onMute: (uid: string, nickname: string) => void;
  onBan: (uid: string, nickname: string) => void;
}

export function ChatMessageItem({
  message: m,
  mine,
  grouped,
  viewerIsAdmin,
  isPinned,
  archive,
  charLimit,
  handlers,
}: {
  message: DisplayMessage;
  mine: boolean;
  grouped: boolean;
  viewerIsAdmin: boolean;
  isPinned: boolean;
  archive?: DeletedArchive;
  charLimit: number;
  handlers: ChatItemHandlers;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editRich, setEditRich] = useState<RichTextValue>({ html: "", text: "" });
  const [busy, setBusy] = useState(false);

  const safe = useMemo(() => (m.richContent ? sanitizeHtml(m.richContent) : ""), [m.richContent]);
  const archiveSafe = useMemo(
    () => (archive?.richContent ? sanitizeHtml(archive.richContent) : ""),
    [archive],
  );
  const profileHref = `/perfil/${m.senderUsername}`;
  const isAdminAuthor = m.senderRole === "admin";
  const time = formatRelative(toDate(m.createdAt));

  // ---- Mensaje eliminado (soft-delete) ----
  if (m.deleted) {
    return (
      <div className={cn("flex gap-2", mine ? "justify-end" : "justify-start", grouped ? "mt-0.5" : "mt-3")}>
        {!mine && <div className="w-9 shrink-0" />}
        <div className="max-w-[78%] rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--text)_18%,transparent)] px-3 py-2 text-sm text-text-muted">
          🚫 Mensaje eliminado
          {viewerIsAdmin && archive && (
            <div className="mt-1 rounded-lg bg-[color-mix(in_srgb,var(--text)_5%,transparent)] p-2 text-xs">
              <p className="font-medium text-text-muted">
                Eliminado por {archive.deletedByNickname}
                {archive.byAdmin ? " (admin)" : ""} · autor: {archive.senderNickname}
              </p>
              {archiveSafe ? (
                <div className="prose prose-sm mt-1 max-w-none opacity-80 dark:prose-invert" dangerouslySetInnerHTML={{ __html: archiveSafe }} />
              ) : (
                archive.text && <p className="mt-1 italic opacity-80">{archive.text}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const canEdit = mine && !m._pending;
  const canDelete = (mine || viewerIsAdmin) && !m._pending;
  const canModerate = viewerIsAdmin && !mine && !m._pending;
  const hasMenu = canEdit || canDelete || viewerIsAdmin;

  async function saveEdit() {
    if (!editRich.text.trim()) return;
    setBusy(true);
    try {
      await handlers.onEdit(m.id, { text: editRich.text.trim(), richContent: editRich.html || null });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    setMenuOpen(false);
    setBusy(true);
    try {
      await handlers.onDelete(m.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "group/msg flex gap-2",
        mine ? "justify-end" : "justify-start",
        m._pending && "opacity-60",
        grouped ? "mt-0.5" : "mt-3",
      )}
    >
      {!mine && (
        <div className="w-9 shrink-0">
          {!grouped && (
            <Link href={profileHref} className="relative block h-9 w-9 overflow-hidden rounded-full ring-1 ring-brand">
              {m.senderPhotoURL ? (
                <Image src={m.senderPhotoURL} alt={m.senderNickname} fill sizes="36px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-brand-soft text-sm">💜</span>
              )}
            </Link>
          )}
        </div>
      )}

      <div className="max-w-[78%]">
        {!mine && !grouped && (
          <div className="mb-0.5 flex items-center gap-1.5 pl-1">
            <Link href={profileHref} className="text-xs font-semibold hover:text-brand">
              {m.senderNickname}
            </Link>
            {isAdminAuthor && <AdminBadge className="px-1.5 py-0" />}
          </div>
        )}

        <div className="relative">
          <div
            className={cn(
              "rounded-2xl px-3 py-2",
              mine ? "bg-brand text-white" : "glass-card",
              // Mensajes de admin resaltan con anillo brand (identidad de moderador).
              !mine && isAdminAuthor && "ring-1 ring-[color-mix(in_srgb,var(--brand)_45%,transparent)]",
            )}
          >
            {isPinned && (
              <p className={cn("mb-1 flex items-center gap-1 text-[10px] font-medium", mine ? "text-white/80" : "text-brand")}>
                <Pin className="h-3 w-3" aria-hidden /> Fijado
              </p>
            )}

            {editing ? (
              <div className="min-w-[16rem]">
                <RichTextEditor
                  charLimit={charLimit}
                  content={m.richContent || m.text}
                  placeholder="Edita tu mensaje…"
                  onChange={setEditRich}
                />
                <div className="mt-1 flex justify-end gap-1">
                  <button type="button" onClick={() => setEditing(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-brand-soft" aria-label="Cancelar">
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                  <button type="button" onClick={saveEdit} disabled={busy || !editRich.text.trim()} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50" aria-label="Guardar">
                    <Check className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {m.imageURL && (
                  <div className="mb-1 max-w-[16rem]">
                    <SmartImage src={m.imageURL} alt="Imagen" rounded="rounded-xl" />
                  </div>
                )}
                {safe ? (
                  <div className={cn("prose prose-sm max-w-none break-words", mine ? "prose-invert" : "dark:prose-invert")} dangerouslySetInnerHTML={{ __html: safe }} />
                ) : (
                  m.text && <p className="whitespace-pre-wrap break-words text-sm">{m.text}</p>
                )}
                <p className={cn("mt-0.5 text-[10px]", mine ? "text-white/70" : "text-text-muted")}>
                  {m._failed ? "No enviado" : m._pending ? "Enviando…" : m.editedAt ? `${time} · editado` : time}
                </p>
              </>
            )}
          </div>

          {/* Menú de acciones */}
          {hasMenu && !editing && (
            <div className={cn("absolute top-0", mine ? "-left-8" : "-right-8")}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Acciones"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-text-muted opacity-0 transition-opacity hover:bg-brand-soft hover:text-brand group-hover/msg:opacity-100 aria-expanded:opacity-100"
                aria-expanded={menuOpen}
              >
                <MoreVertical className="h-4 w-4" aria-hidden />
              </button>

              {menuOpen && (
                <>
                  <button type="button" aria-hidden tabIndex={-1} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-20 cursor-default" />
                  <div className={cn("glass-modal absolute z-30 mt-1 w-40 rounded-xl p-1 text-sm", mine ? "right-0" : "left-0")}>
                    {canEdit && (
                      <MenuItem icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditing(true); setMenuOpen(false); }}>
                        Editar
                      </MenuItem>
                    )}
                    {viewerIsAdmin && (
                      <MenuItem icon={isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />} onClick={() => { handlers.onTogglePin(m.id, !isPinned); setMenuOpen(false); }}>
                        {isPinned ? "Desfijar" : "Fijar"}
                      </MenuItem>
                    )}
                    {canModerate && (
                      <MenuItem icon={<VolumeX className="h-4 w-4" />} onClick={() => { handlers.onMute(m.senderUid, m.senderNickname); setMenuOpen(false); }}>
                        Silenciar autor
                      </MenuItem>
                    )}
                    {canModerate && (
                      <MenuItem icon={<Ban className="h-4 w-4" />} danger onClick={() => { handlers.onBan(m.senderUid, m.senderNickname); setMenuOpen(false); }}>
                        Banear autor
                      </MenuItem>
                    )}
                    {canDelete && (
                      <MenuItem icon={<Trash2 className="h-4 w-4" />} danger onClick={del}>
                        Eliminar
                      </MenuItem>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-brand-soft",
        danger ? "text-danger" : "",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export default ChatMessageItem;
