"use client";

// Bandeja de conversaciones + total de no leídos — Etapa 3.
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { subscribeConversations } from "@/lib/firestore/messages";
import type { Conversation, WithId } from "@/types";

export function useConversations() {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState<WithId<Conversation>[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeConversations(firebaseUser.uid, setItems);
  }, [firebaseUser]);

  const list = firebaseUser ? items : [];
  const totalUnread = firebaseUser
    ? list.reduce((sum, c) => sum + (c.unread?.[firebaseUser.uid] ?? 0), 0)
    : 0;
  return { items: list, totalUnread };
}
