"use client";

// Presencia "@X escribiendo…" del ARMY Chat: entradas frescas (<5s) excluyendo al propio.
import { useEffect, useState } from "react";
import { subscribeTyping, type TypingEntry } from "@/lib/firestore/chat";

const STALE_MS = 5000;

export function useTypingUsers(myUid: string | undefined): string[] {
  const [entries, setEntries] = useState<TypingEntry[]>([]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!myUid) return; // leer typing requiere sesión
    return subscribeTyping(setEntries);
  }, [myUid]);

  // Tick para expirar entradas viejas (setState fuera del cuerpo del effect).
  useEffect(() => {
    if (entries.length === 0) return;
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const id = setInterval(() => setNow(Date.now()), 2000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [entries.length]);

  if (now === 0) return [];
  return entries
    .filter(
      (e) =>
        e.uid !== myUid && e.updatedAt?.toMillis && now - e.updatedAt.toMillis() < STALE_MS,
    )
    .map((e) => e.nickname);
}
