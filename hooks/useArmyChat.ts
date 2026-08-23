"use client";

// Estado del ARMY Chat: mensajes en vivo, carga progresiva, cooldown y envío optimista.
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  loadOlderMessages,
  subscribeChatRoom,
  subscribeLatestMessages,
  subscribeMyRate,
  sendChatMessage,
  type ChatCursor,
} from "@/lib/firestore/chat";
import type { ChatMessage, ChatRoom, WithId } from "@/types";

export interface DisplayMessage extends Omit<WithId<ChatMessage>, "createdAt"> {
  createdAt: { toDate: () => Date } | Date;
  _pending?: boolean;
  _failed?: boolean;
}

let tempCounter = 0;

export function useArmyChat() {
  const { firebaseUser, profile } = useAuth();
  const [messages, setMessages] = useState<WithId<ChatMessage>[]>([]);
  const [older, setOlder] = useState<DisplayMessage[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [pendings, setPendings] = useState<DisplayMessage[]>([]);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loading, setLoading] = useState(true);
  const cursorRef = useRef<ChatCursor>(null);

  // Ventana viva de los últimos mensajes (requiere sesión: las reglas exigen auth).
  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeLatestMessages((items, oldest) => {
      setMessages(items);
      if (!cursorRef.current) cursorRef.current = oldest; // cursor inicial
      setLoading(false);
    });
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeChatRoom(setRoom);
  }, [firebaseUser]);

  // Estado de rate-limit propio (para restaurar el cooldown al recargar).
  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeMyRate(firebaseUser.uid, (state) => {
      const ms = state?.cooldownUntil?.toMillis?.() ?? null;
      setCooldownUntil((prev) => {
        const next = ms && ms > Date.now() ? ms : null;
        // conserva el valor más lejano entre el persistido y el optimista
        return Math.max(prev ?? 0, next ?? 0) || null;
      });
    });
  }, [firebaseUser]);

  const loadOlder = useCallback(async () => {
    if (loadingOlder || !hasMore || !cursorRef.current) return;
    setLoadingOlder(true);
    try {
      const { items, oldest } = await loadOlderMessages(cursorRef.current);
      setOlder((prev) => [...items, ...prev]);
      cursorRef.current = oldest;
      if (!oldest) setHasMore(false);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMore]);

  const send = useCallback(
    async (
      text: string,
      richContent: string | null,
      imageURL: string | null,
      replyTo?: { messageId: string; senderNickname: string; text: string } | null,
    ) => {
      if (!firebaseUser || !profile) return;
      const tempId = `temp-${++tempCounter}`;
      const temp: DisplayMessage = {
        id: tempId,
        senderUid: firebaseUser.uid,
        senderNickname: profile.nickname || profile.displayName || "ARMY",
        senderUsername: profile.username || firebaseUser.uid,
        senderPhotoURL: profile.customPhotoURL || profile.photoURL || null,
        senderMembership: profile.membershipType,
        senderRole: profile.role,
        text,
        richContent,
        imageURL,
        createdAt: new Date(),
        editedAt: null,
        deleted: false,
        deletedBy: null,
        pinned: false,
        replyTo: replyTo || undefined,
        _pending: true,
      };
      setPendings((p) => [...p, temp]);
      try {
        const res = await sendChatMessage({
          senderUid: firebaseUser.uid,
          senderNickname: profile.nickname || profile.displayName || "ARMY",
          senderUsername: profile.username || firebaseUser.uid,
          senderPhotoURL: profile.customPhotoURL || profile.photoURL || null,
          senderMembership: profile.membershipType,
          senderRole: profile.role,
          text,
          richContent,
          imageURL,
          replyTo,
        });

        if (!res.success) {
          // Rate limit excedido
          if (res.cooldownUntil) {
            setCooldownUntil(res.cooldownUntil);
          }
          setPendings((p) => p.map((m) => (m.id === tempId ? { ...m, _failed: true } : m)));
          throw new Error(res.error || "Error al enviar mensaje");
        }

        // Mensaje enviado exitosamente - el listener en tiempo real lo mostrará
        if (res.messageId) {
          setPendings((p) => p.map((m) => (m.id === tempId ? { ...m, id: res.messageId! } : m)));
        }
      } catch (err: unknown) {
        const details = (err as { details?: { cooldownUntil?: number } })?.details;
        if (details?.cooldownUntil) setCooldownUntil(details.cooldownUntil);
        setPendings((p) => p.map((m) => (m.id === tempId ? { ...m, _failed: true } : m)));
        throw err; // el composer muestra el toast
      }
    },
    [firebaseUser, profile],
  );

  // Combina: antiguos (paginados) + ventana viva + pendientes aún no confirmados.
  const liveIds = new Set(messages.map((m) => m.id));
  const visiblePendings = pendings.filter((p) => p._failed || !liveIds.has(p.id));
  const display: DisplayMessage[] = [
    ...older,
    ...(messages as unknown as DisplayMessage[]),
    ...visiblePendings,
  ];

  return {
    messages: display,
    room,
    loading,
    hasMore,
    loadingOlder,
    loadOlder,
    send,
    cooldownUntil,
  };
}
