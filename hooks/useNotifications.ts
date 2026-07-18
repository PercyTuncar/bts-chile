"use client";

// Suscripción a mis notificaciones — Etapa 2.
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { subscribeNotifications } from "@/lib/firestore/notifications";
import type { Notification, WithId } from "@/types";

export function useNotifications() {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState<WithId<Notification>[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;
    // setItems se llama desde el callback de onSnapshot (sin setState en el effect).
    return subscribeNotifications(firebaseUser.uid, setItems);
  }, [firebaseUser]);

  const authedItems = firebaseUser ? items : [];
  const unread = authedItems.filter((n) => !n.read).length;
  return { items: authedItems, unread };
}
