"use client";

// Badge de mensajes nuevos del ARMY Chat + silenciar notificaciones (Fase 3).
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  setChatNotifMuted,
  setChatRead,
  subscribeChatRoom,
  subscribeMyReads,
  type ChatReadState,
} from "@/lib/firestore/chat";

export function useArmyChatNotifications() {
  const { firebaseUser } = useAuth();
  const [messageCount, setMessageCount] = useState(0);
  const [reads, setReads] = useState<ChatReadState | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeChatRoom((r) => setMessageCount(r?.messageCount ?? 0));
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeMyReads(firebaseUser.uid, setReads);
  }, [firebaseUser]);

  const notifMuted = reads?.notifMuted ?? false;
  // Sin doc de lecturas → baseline = actual (no marca como no leídos los históricos).
  const base = reads?.lastReadCount ?? messageCount;
  const unread = notifMuted ? 0 : Math.max(0, messageCount - base);

  const markRead = useCallback(() => {
    if (firebaseUser) setChatRead(firebaseUser.uid, messageCount).catch(() => {});
  }, [firebaseUser, messageCount]);

  const toggleMuted = useCallback(() => {
    if (firebaseUser) setChatNotifMuted(firebaseUser.uid, !notifMuted).catch(() => {});
  }, [firebaseUser, notifMuted]);

  return { unread, notifMuted, markRead, toggleMuted };
}
