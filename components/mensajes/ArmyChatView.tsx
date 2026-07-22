"use client";

// ARMY Chat (grupal) — lista estilo Telegram + moderación (Fase 2).
import Link from "next/link";
import { Ban, Bell, BellOff, Loader2, Lock, Pin, ShieldAlert, ShieldCheck, Unlock, VolumeX, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatComposer } from "@/components/mensajes/ChatComposer";
import { ChatMessageItem, type ChatItemHandlers } from "@/components/mensajes/ChatMessageItem";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { PillButton } from "@/components/ui/PillButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useArmyChat, type DisplayMessage } from "@/hooks/useArmyChat";
import { useArmyChatNotifications } from "@/hooks/useArmyChatNotifications";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { useTypingUsers } from "@/hooks/useTypingUsers";
import { chatCharLimit } from "@/lib/membership";
import {
  banUser,
  getChatMessage,
  getModeratedUsers,
  muteUser,
  setChatOpen,
  setPinnedMessage,
  subscribeDeletedContent,
  unbanUser,
  unmuteUser,
  type DeletedArchive,
} from "@/lib/firestore/chat";
import { deleteChatMessage, editChatMessage } from "@/lib/functions";
import type { ChatMessage, User, WithId } from "@/types";

const MUTE_OPTIONS = [1, 3, 5, 10, 15, 30];

function msgDate(v: DisplayMessage["createdAt"]): number {
  const d = v instanceof Date ? v : v?.toDate?.();
  return d ? d.getTime() : Date.now();
}
function isGrouped(prev: DisplayMessage | undefined, cur: DisplayMessage): boolean {
  if (!prev || prev.senderUid !== cur.senderUid) return false;
  return msgDate(cur.createdAt) - msgDate(prev.createdAt) < 5 * 60 * 1000;
}

export function ArmyChatView() {
  const { firebaseUser, profile, isAdmin, status } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const { messages, room, loading, hasMore, loadingOlder, loadOlder, send, cooldownUntil } = useArmyChat();
  const typing = useTypingUsers(firebaseUser?.uid);
  const { notifMuted, markRead, toggleMuted } = useArmyChatNotifications();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const prevHeightRef = useRef<number | null>(null);
  const [rulesOpen, setRulesOpen] = useState(true);

  const [archive, setArchive] = useState<Record<string, DeletedArchive>>({});
  const [pinnedMsg, setPinnedMsg] = useState<WithId<ChatMessage> | null>(null);
  const [muteTarget, setMuteTarget] = useState<{ uid: string; nickname: string } | null>(null);
  const [modOpen, setModOpen] = useState(false);
  const [moderated, setModerated] = useState<{ muted: WithId<User>[]; banned: WithId<User>[] }>({ muted: [], banned: [] });
  const [modLoading, setModLoading] = useState(false);

  const banned = profile?.isBanned === true;
  const chatOpen = room?.isOpen !== false;
  const pinnedId = room?.pinnedMessageId ?? null;
  const charLimit = chatCharLimit(profile?.membershipType ?? "basic", isAdmin);

  // Autoscroll / conservar posición al paginar.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (prevHeightRef.current != null) {
      el.scrollTop += el.scrollHeight - prevHeightRef.current;
      prevHeightRef.current = null;
    } else if (atBottomRef.current) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  // Admin: contenido de mensajes borrados.
  useEffect(() => {
    if (!isAdmin) return;
    return subscribeDeletedContent(setArchive);
  }, [isAdmin]);

  // Mensaje fijado (se muestra solo si coincide con room.pinnedMessageId).
  useEffect(() => {
    if (!pinnedId) return;
    let active = true;
    getChatMessage(pinnedId).then((m) => active && setPinnedMsg(m)).catch(() => {});
    return () => {
      active = false;
    };
  }, [pinnedId]);

  // Marca como leído mientras el chat está abierto (markRead cambia con messageCount).
  useEffect(() => {
    markRead();
  }, [markRead]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop < 60 && hasMore && !loadingOlder) {
      prevHeightRef.current = el.scrollHeight;
      loadOlder();
    }
  }

  const handlers: ChatItemHandlers = {
    onEdit: async (id, v) => {
      try {
        await editChatMessage({ messageId: id, text: v.text, richContent: v.richContent });
      } catch {
        toastError("No se pudo editar el mensaje.");
      }
    },
    onDelete: async (id) => {
      try {
        await deleteChatMessage(id);
      } catch {
        toastError("No se pudo eliminar el mensaje.");
      }
    },
    onTogglePin: async (id, pin) => {
      try {
        await setPinnedMessage(pin ? id : null);
      } catch {
        toastError("No se pudo fijar el mensaje.");
      }
    },
    onMute: (uid, nickname) => setMuteTarget({ uid, nickname }),
    onBan: async (uid, nickname) => {
      if (!window.confirm(`¿Banear a ${nickname} del ARMY Chat?`)) return;
      try {
        await banUser(uid);
        toastSuccess(`${nickname} baneado.`);
      } catch {
        toastError("No se pudo banear.");
      }
    },
  };

  async function applyMute(minutes: number) {
    if (!muteTarget) return;
    try {
      await muteUser(muteTarget.uid, minutes);
      toastSuccess(`${muteTarget.nickname} silenciado ${minutes} min.`);
    } catch {
      toastError("No se pudo silenciar.");
    } finally {
      setMuteTarget(null);
    }
  }

  async function toggleChatOpen() {
    try {
      await setChatOpen(!chatOpen);
      toastSuccess(chatOpen ? "Chat cerrado." : "Chat abierto.");
    } catch {
      toastError("No se pudo cambiar el estado del chat.");
    }
  }

  async function openModeration() {
    setModOpen(true);
    setModLoading(true);
    try {
      setModerated(await getModeratedUsers());
    } finally {
      setModLoading(false);
    }
  }

  async function reloadModeration() {
    setModLoading(true);
    try {
      setModerated(await getModeratedUsers());
    } finally {
      setModLoading(false);
    }
  }

  if (status !== "authenticated" || !firebaseUser) {
    return (
      <div className="flex flex-col gap-6">
        <GlassCard className="mx-auto max-w-md text-center">
          <p className="text-3xl">💜</p>
          <h2 className="mt-2 text-h3 font-semibold">Entra al ARMY Chat</h2>
          <p className="mt-1 text-sm text-text-muted">Inicia sesión para ver y participar en el chat de la comunidad.</p>
          <div className="mt-4 flex justify-center">
            <PillButton onClick={openLogin}>Entrar</PillButton>
          </div>
        </GlassCard>

        {/* Invitación a grupos de WhatsApp */}
        <GlassCard className="mx-auto max-w-md">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
              <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Únete a los grupos de WhatsApp</h3>
              <p className="mt-1 text-sm text-text-muted">Conéctate con ARMY de tu región en nuestros grupos oficiales de WhatsApp.</p>
              <Link href="/comunidad/grupos" className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 hover:shadow-lg hover:shadow-[#128C7E]/40">
                Ver grupos disponibles
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const showPinned = !!pinnedId && pinnedMsg?.id === pinnedId && !pinnedMsg?.deleted;

  return (
    <div className="flex h-[calc(100dvh-13rem)] flex-col md:h-[calc(100dvh-14rem)]">
      {/* Barra superior: controles de admin (izq) + silenciar notificaciones (der) */}
      <div className="mb-2 flex items-center gap-2">
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={toggleChatOpen}
              className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm font-medium hover:text-brand"
            >
              {chatOpen ? <Unlock className="h-4 w-4" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
              {chatOpen ? "Chat abierto" : "Chat cerrado"}
            </button>
            <button
              type="button"
              onClick={openModeration}
              className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm font-medium hover:text-brand"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden /> Moderación
            </button>
          </>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={toggleMuted}
          aria-label={notifMuted ? "Activar notificaciones del chat" : "Silenciar notificaciones del chat"}
          className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm font-medium hover:text-brand"
        >
          {notifMuted ? <BellOff className="h-4 w-4" aria-hidden /> : <Bell className="h-4 w-4" aria-hidden />}
          <span className="hidden sm:inline">{notifMuted ? "Silenciado" : "Notif."}</span>
        </button>
      </div>

      {/* Reglas */}
      {rulesOpen && (
        <div className="glass-card mb-2 flex items-start gap-2 rounded-card p-3 text-xs text-text-muted">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <div className="flex-1">
            <p className="font-semibold text-text">Reglas del ARMY Chat</p>
            <p className="mt-0.5">
              🚫 Prohibido vender o promocionar productos aquí — serás baneado. Respeta a las demás ARMY, sin
              spam ni insultos. 💜
            </p>
          </div>
          <button type="button" onClick={() => setRulesOpen(false)} className="text-text-muted hover:text-brand" aria-label="Ocultar reglas">
            ✕
          </button>
        </div>
      )}

      {/* Mensaje fijado */}
      {showPinned && pinnedMsg && (
        <div className="glass-card mb-2 flex items-center gap-2 rounded-card p-2 text-xs">
          <Pin className="h-4 w-4 shrink-0 text-brand" aria-hidden />
          <p className="flex-1 truncate">
            <span className="font-semibold">{pinnedMsg.senderNickname}: </span>
            <span className="text-text-muted">{pinnedMsg.text || "📷 Imagen"}</span>
          </p>
          {isAdmin && (
            <button type="button" onClick={() => handlers.onTogglePin(pinnedMsg.id, false)} className="text-text-muted hover:text-danger" aria-label="Desfijar">
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}

      {/* Mensajes */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className={`h-full overflow-y-auto px-1 ${banned ? "pointer-events-none select-none blur-sm" : ""}`}
        >
          {loading ? (
            <div className="flex flex-col gap-3 py-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-9 w-9 shrink-0" rounded="rounded-full" />
                  <Skeleton className="h-12 w-56" rounded="rounded-2xl" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-muted">
              Aún no hay mensajes. ¡Sé la primera en saludar a la comunidad ARMY! 💜
            </p>
          ) : (
            <>
              {loadingOlder && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-text-muted" aria-hidden />
                </div>
              )}
              {messages.map((m, i) => (
                <ChatMessageItem
                  key={m.id}
                  message={m}
                  mine={m.senderUid === firebaseUser.uid}
                  grouped={isGrouped(messages[i - 1], m)}
                  viewerIsAdmin={isAdmin}
                  isPinned={m.id === pinnedId}
                  archive={archive[m.id]}
                  charLimit={charLimit}
                  handlers={handlers}
                />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Overlay de baneado */}
        {banned && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <Ban className="h-10 w-10 text-danger" aria-hidden />
            <p className="text-h3 font-semibold">Has sido baneado del ARMY Chat</p>
            <p className="text-sm text-text-muted">Ya no puedes ver ni participar en el chat de la comunidad.</p>
          </div>
        )}
      </div>

      {/* Indicador "escribiendo…" */}
      {!banned && typing.length > 0 && (
        <p className="px-1 pt-1 text-xs italic text-text-muted">
          {typing.length === 1
            ? `${typing[0]} está escribiendo…`
            : typing.length === 2
              ? `${typing[0]} y ${typing[1]} están escribiendo…`
              : "Varias ARMY están escribiendo…"}
        </p>
      )}

      {/* Composer (oculto si baneado) */}
      {!banned && <ChatComposer cooldownUntil={cooldownUntil} chatOpen={chatOpen} onSend={send} />}

      {/* Modal: elegir duración del silencio */}
      <Modal open={!!muteTarget} onClose={() => setMuteTarget(null)} title={`Silenciar a ${muteTarget?.nickname ?? ""}`}>
        <p className="mb-3 text-sm text-text-muted">Elige cuánto tiempo estará silenciado:</p>
        <div className="grid grid-cols-3 gap-2">
          {MUTE_OPTIONS.map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => applyMute(min)}
              className="rounded-button glass px-3 py-2 text-sm font-medium hover:bg-brand hover:text-white"
            >
              {min} min
            </button>
          ))}
        </div>
      </Modal>

      {/* Modal: mini-panel de moderación */}
      <Modal open={modOpen} onClose={() => setModOpen(false)} title="Moderación del chat">
        {modLoading ? (
          <p className="py-6 text-center text-sm text-text-muted">Cargando…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <VolumeX className="h-4 w-4" aria-hidden /> Silenciados ({moderated.muted.length})
              </h3>
              {moderated.muted.length === 0 ? (
                <p className="text-xs text-text-muted">Nadie silenciado.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {moderated.muted.map((u) => (
                    <li key={u.id} className="flex items-center justify-between text-sm">
                      <Link href={`/perfil/${u.username}`} className="hover:text-brand">{u.nickname}</Link>
                      <button
                        type="button"
                        onClick={async () => { await unmuteUser(u.id); reloadModeration(); }}
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        Quitar silencio
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Ban className="h-4 w-4" aria-hidden /> Baneados ({moderated.banned.length})
              </h3>
              {moderated.banned.length === 0 ? (
                <p className="text-xs text-text-muted">Nadie baneado.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {moderated.banned.map((u) => (
                    <li key={u.id} className="flex items-center justify-between text-sm">
                      <Link href={`/perfil/${u.username}`} className="hover:text-brand">{u.nickname}</Link>
                      <button
                        type="button"
                        onClick={async () => { await unbanUser(u.id); reloadModeration(); }}
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        Desbanear
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ArmyChatView;
