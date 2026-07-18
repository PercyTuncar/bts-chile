"use client";

// Picker de 6 reacciones — PRD §8.1.A. Toggle/reemplazo, bounce, top-3 + total, accesible.
// UI OPTIMISTA: la reacción y el contador se actualizan al instante en local y luego se
// reconcilian con el servidor (el conteo real lo mantiene una Cloud Function, que agrega
// latencia). Si el write falla, se revierte y se avisa. Referencia: patrón optimistic-UI.
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toastError } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { removeReaction, setReaction, subscribeMyReaction } from "@/lib/firestore/community";
import { REACTIONS, REACTION_EMOJI } from "@/lib/comunidad/reactions";
import { EMPTY_REACTION_COUNTS, type ReactionCounts, type ReactionType } from "@/types";

interface Optimistic {
  base: ReactionCounts; // referencia de `counts` al momento de reaccionar
  counts: ReactionCounts; // conteo optimista mostrado
  mine: ReactionType | null; // mi reacción optimista
}

export function ReactionPicker({
  postId,
  counts,
}: {
  postId: string;
  counts: ReactionCounts;
}) {
  const { firebaseUser } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [mine, setMine] = useState<ReactionType | null>(null);
  const [open, setOpen] = useState(false);
  const [optimistic, setOptimistic] = useState<Optimistic | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeMyReaction(postId, firebaseUser.uid, setMine);
  }, [postId, firebaseUser]);

  const serverCounts = counts ?? EMPTY_REACTION_COUNTS;
  // El optimista sigue vigente mientras el servidor no haya emitido un snapshot nuevo
  // (misma referencia de `counts`). Al llegar datos frescos, mandan (se descarta).
  const active = optimistic && optimistic.base === serverCounts ? optimistic : null;

  const myReaction = active ? active.mine : firebaseUser ? mine : null;
  const displayCounts = active ? active.counts : serverCounts;

  const top3 = REACTIONS.map((r) => ({ ...r, count: displayCounts[r.type] }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  async function handleSelect(type: ReactionType) {
    setOpen(false);
    if (!firebaseUser) {
      openLogin();
      return;
    }

    const prev = myReaction;
    const next = prev === type ? null : type;

    // 1) Update optimista instantáneo (reacción + contador).
    const optCounts: ReactionCounts = { ...displayCounts };
    if (prev) {
      optCounts[prev] = Math.max(0, optCounts[prev] - 1);
      optCounts.total = Math.max(0, optCounts.total - 1);
    }
    if (next) {
      optCounts[next] = (optCounts[next] ?? 0) + 1;
      optCounts.total = (optCounts.total ?? 0) + 1;
    }
    setOptimistic({ base: serverCounts, counts: optCounts, mine: next });

    // 2) Escritura en segundo plano; el conteo real lo reconcilia la Cloud Function.
    try {
      if (next === null) await removeReaction(postId, firebaseUser.uid);
      else await setReaction(postId, firebaseUser.uid, type);
    } catch (err) {
      console.error(err);
      setOptimistic(null); // revertir
      toastError("No se pudo registrar tu reacción. Inténtalo de nuevo.");
    }
  }

  return (
    <div
      className="relative inline-flex items-center gap-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm font-medium transition-transform hover:scale-105"
      >
        <span className="text-base">{myReaction ? REACTION_EMOJI[myReaction] : "💜"}</span>
        {top3.length > 0 ? (
          <span className="flex items-center gap-1">
            {top3.map((r) => (
              <span key={r.type} className="tabular-nums text-xs text-text-muted">
                {r.emoji} {r.count}
              </span>
            ))}
            <span className="ml-1 tabular-nums">· {displayCounts.total}</span>
          </span>
        ) : (
          <span className="text-text-muted">Reaccionar</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Elegir reacción"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="glass-modal absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-full p-1.5"
          >
            {REACTIONS.map((r, i) => (
              <motion.button
                key={r.type}
                role="menuitemradio"
                aria-checked={myReaction === r.type}
                aria-label={r.label}
                title={r.label}
                onClick={() => handleSelect(r.type)}
                whileHover={{ scale: 1.3, y: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: i * 0.02 }}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                  myReaction === r.type ? "bg-brand-soft" : "hover:bg-brand-soft"
                }`}
              >
                {r.emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ReactionPicker;
