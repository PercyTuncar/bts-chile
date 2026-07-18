"use client";

// Encuesta votable — §8.1. Resultados visibles solo tras votar; voto cambiable
// (toggle, mismo patrón que ReactionPicker). Recuento en vivo desde la subcolección.
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toastError } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import {
  removeVote,
  setVote,
  subscribeMyVote,
  subscribeVoteTally,
  type VoteTally,
} from "@/lib/firestore/community";
import type { Poll } from "@/types";

export function PollView({ postId, poll }: { postId: string; poll: Poll }) {
  const { firebaseUser } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [mine, setMine] = useState<number | null>(null);
  const [tally, setTally] = useState<VoteTally>({
    counts: new Array(poll.options.length).fill(0),
    total: 0,
  });

  useEffect(
    () => subscribeVoteTally(postId, poll.options.length, setTally),
    [postId, poll.options.length],
  );

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeMyVote(postId, firebaseUser.uid, setMine);
  }, [postId, firebaseUser]);

  // Enmascara el valor si no hay sesión (sin setState en el effect).
  const myVote = firebaseUser ? mine : null;
  const voted = myVote !== null;

  async function handleVote(i: number) {
    if (!firebaseUser) {
      openLogin();
      return;
    }
    try {
      if (myVote === i) await removeVote(postId, firebaseUser.uid);
      else await setVote(postId, firebaseUser.uid, i);
    } catch (err) {
      console.error(err);
      toastError("No se pudo registrar tu voto.");
    }
  }

  return (
    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
      {poll.options.map((opt, i) => {
        const count = tally.counts[i] ?? 0;
        const pct = tally.total > 0 ? Math.round((count / tally.total) * 100) : 0;
        const isMine = myVote === i;
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleVote(i);
            }}
            aria-pressed={isMine}
            className={`relative overflow-hidden rounded-button border px-4 py-2.5 text-left text-sm transition-colors ${
              isMine
                ? "border-brand"
                : "border-[color-mix(in_srgb,var(--text)_12%,transparent)] hover:border-brand"
            }`}
          >
            {voted && (
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className={`absolute inset-y-0 left-0 ${
                  isMine ? "bg-brand-soft" : "bg-[color-mix(in_srgb,var(--text)_6%,transparent)]"
                }`}
                aria-hidden
              />
            )}
            <span className="relative flex items-center justify-between gap-2">
              <span className="font-medium">
                {isMine ? "✓ " : ""}
                {opt.text}
              </span>
              {voted && (
                <span className="tabular-nums text-text-muted">
                  {pct}% · {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
      <p className="text-xs text-text-muted">
        {tally.total} {tally.total === 1 ? "voto" : "votos"}
        {firebaseUser
          ? voted
            ? ""
            : " · Vota para ver los resultados"
          : " · Entra para votar"}
      </p>
    </div>
  );
}

export default PollView;
