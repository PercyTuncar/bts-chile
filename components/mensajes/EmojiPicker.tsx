"use client";

// Picker de emojis ARMY — Etapa 3.
import { Smile } from "lucide-react";
import { useState } from "react";

const ARMY_EMOJIS = [
  "💜", "🐰", "🐯", "🐻", "🐨", "🐣", "🐴", "🦊", "🐧", "🎤",
  "🎶", "🔥", "🥹", "😭", "😂", "🫶", "✨", "🌟", "🎉", "🙌",
];

export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Emojis ARMY"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-text-muted hover:text-brand"
      >
        <Smile className="h-5 w-5" aria-hidden />
      </button>
      {open && (
        <div className="glass-modal absolute bottom-full left-0 z-10 mb-2 grid grid-cols-5 gap-1 rounded-2xl p-2">
          {ARMY_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onPick(e);
                setOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-brand-soft"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmojiPicker;
