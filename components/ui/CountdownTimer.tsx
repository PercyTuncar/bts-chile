"use client";

// CountdownTimer — cuenta regresiva glass hacia el concierto (PRD §3.2.G, §5.2).
// El reloj es un "sistema externo": se lee con useSyncExternalStore (snapshot
// cacheado por segundo) para evitar setState-en-effect y mismatches de hidratación.
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function toTimeLeft(totalSeconds: number): TimeLeft {
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds / 3_600) % 24),
    minutes: Math.floor((totalSeconds / 60) % 60),
    seconds: Math.floor(totalSeconds % 60),
  };
}

// Store del reloj en ámbito de módulo (mutación sancionada, fuera del render),
// memoizado por fecha objetivo. Un único setInterval compartido por target.
type CountdownStore = {
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => number;
  getServerSnapshot: () => number | null;
};

const countdownStores = new Map<number, CountdownStore>();

function getCountdownStore(target: number): CountdownStore {
  const existing = countdownStores.get(target);
  if (existing) return existing;

  const listeners = new Set<() => void>();
  let snapshot = Math.floor(Math.max(0, target - Date.now()) / 1000);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    const next = Math.floor(Math.max(0, target - Date.now()) / 1000);
    if (next !== snapshot) {
      snapshot = next;
      for (const l of listeners) l();
    }
  };

  const store: CountdownStore = {
    subscribe(cb) {
      listeners.add(cb);
      if (intervalId === null) intervalId = setInterval(tick, 250);
      return () => {
        listeners.delete(cb);
        if (listeners.size === 0 && intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => null,
  };

  countdownStores.set(target, store);
  return store;
}

function useCountdownSeconds(target: number): number | null {
  const store = getCountdownStore(target);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Seg" },
];

export function CountdownTimer({
  targetDate,
  className = "",
}: {
  /** Fecha objetivo en ISO 8601, ej: "2026-10-16T20:00:00-03:00" */
  targetDate: string;
  className?: string;
}) {
  const target = new Date(targetDate).getTime();
  const seconds = useCountdownSeconds(target);
  const time = seconds === null ? null : toTimeLeft(seconds);

  return (
    <div
      className={cn("flex items-center gap-2 sm:gap-3", className)}
      role="timer"
      aria-label="Cuenta regresiva hacia el concierto"
    >
      {UNITS.map(({ key, label }) => (
        <div
          key={key}
          className="glass flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-2.5"
        >
          <span className="text-2xl font-bold tabular-nums">
            {time ? String(time[key]).padStart(2, "0") : "--"}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-text-muted">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default CountdownTimer;
