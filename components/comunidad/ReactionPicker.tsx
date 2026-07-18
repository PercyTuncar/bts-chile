"use client";

// Picker de 6 reacciones — PRD §8.1.A. Toggle/reemplazo, bounce, top-3 + total, accesible.
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toastError } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { removeReaction, setReaction, subscribeMyReaction } from "@/lib/firestore/community";
import { REACTIONS, REACTION_EMOJI } from "@/lib/comunidad/reactions";
import type { ReactionCounts, ReactionType } from "@/types";

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

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeMyReaction(postId, firebaseUser.uid, setMine);
  }, [postId, firebaseUser]);

  // Enmascara el valor si no hay sesión (sin setState en el effect).
  const myReaction = firebaseUser ? mine : null;

  const top3 = REACTIONS.map((r) => ({ ...r, count: counts[r.type] }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  async function handleSelect(type: ReactionType) {
    setOpen(false);
    if (!firebaseUser) {
      openLogin();
      return;
    }
    try {
      if (myReaction === type) {
        await removeReaction(postId, firebaseUser.uid);
      } else {
        await setReaction(postId, firebaseUser.uid, type);
      }
    } catch (err) {
      console.error(err);
      toastError("No se pudo registrar tu reacción.");
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
            <span className="ml-1 tabular-nums">· {counts.total}</span>
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
