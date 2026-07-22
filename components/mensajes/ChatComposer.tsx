"use client";

// Composer del ARMY Chat: formato Tiptap (negrita/cursiva/link/color/emoji) + imagen.
// Estados: cooldown por plan, silenciado (mute), baneado y chat cerrado (Fase 2).
import Link from "next/link";
import { ImagePlus, Loader2, Lock, Send, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RichTextEditor, type RichTextValue } from "@/components/comunidad/RichTextEditor";
import { toastError } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { clearTyping, setTyping } from "@/lib/firestore/chat";
import { chatCharLimit } from "@/lib/membership";
import { armyChatImagePath, uploadImage } from "@/lib/storage";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EMPTY: RichTextValue = { html: "", text: "" };

function fmtCountdown(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

export function ChatComposer({
  cooldownUntil,
  chatOpen,
  onSend,
}: {
  cooldownUntil: number | null;
  chatOpen: boolean;
  onSend: (text: string, richContent: string | null, imageURL: string | null) => Promise<void>;
}) {
  const { firebaseUser, profile, isAdmin, canChat } = useAuth();
  const [rich, setRich] = useState<RichTextValue>(EMPTY);
  const [image, setImage] = useState<File | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(0);
  const typingRef = useRef(0);

  const mutedUntilMs = profile?.mutedUntil?.toMillis?.() ?? null;

  // Presencia "escribiendo…" (throttle 2.5s) y limpieza al desmontar.
  function handleRichChange(v: RichTextValue) {
    setRich(v);
    if (!firebaseUser || !profile || !v.text.trim()) return;
    const t = Date.now();
    if (t - typingRef.current > 2500) {
      typingRef.current = t;
      setTyping(
        firebaseUser.uid,
        profile.nickname || profile.displayName || "ARMY",
        profile.username || firebaseUser.uid,
      ).catch(() => {});
    }
  }
  useEffect(() => {
    const uid = firebaseUser?.uid;
    return () => {
      if (uid) clearTyping(uid);
    };
  }, [firebaseUser]);

  // Reloj para cuentas regresivas (cooldown y mute). setState fuera del cuerpo del effect.
  useEffect(() => {
    const targets = [cooldownUntil, mutedUntilMs].filter((t): t is number => !!t);
    if (targets.length === 0) return;
    const holder: { id?: ReturnType<typeof setInterval> } = {};
    const tick = () => {
      setNow(Date.now());
      if (Math.max(...targets) <= Date.now() && holder.id) clearInterval(holder.id);
    };
    const raf = requestAnimationFrame(tick);
    holder.id = setInterval(tick, 250);
    return () => {
      cancelAnimationFrame(raf);
      if (holder.id) clearInterval(holder.id);
    };
  }, [cooldownUntil, mutedUntilMs]);

  const coolMs = cooldownUntil && now ? Math.max(0, cooldownUntil - now) : 0;
  const muteMs = mutedUntilMs && now ? Math.max(0, mutedUntilMs - now) : 0;
  const cooling = now > 0 && coolMs > 0;
  const muted = now > 0 && muteMs > 0;

  const charLimit = chatCharLimit(profile?.membershipType ?? "basic", isAdmin);
  const hasBody = rich.text.trim().length > 0 || !!image;
  const overLimit = rich.text.length > charLimit;
  const closed = !chatOpen && !isAdmin;
  const canSubmit = canChat && hasBody && !overLimit && !sending && !cooling && !muted && !closed;

  const preview = image ? URL.createObjectURL(image) : null;

  async function handleSend() {
    if (!firebaseUser || !canSubmit) return;
    setSending(true);
    try {
      let imageURL: string | null = null;
      if (image) {
        if (image.size > MAX_IMAGE_BYTES) {
          toastError("La imagen supera los 5MB.");
          setSending(false);
          return;
        }
        imageURL = await uploadImage(armyChatImagePath(firebaseUser.uid, image.name), image);
      }
      await onSend(rich.text.trim(), rich.html || null, imageURL);
      setRich(EMPTY);
      setImage(null);
      setEditorKey((k) => k + 1);
      clearTyping(firebaseUser.uid).catch(() => {});
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "functions/resource-exhausted") toastError("Espera un momento antes de enviar otro mensaje.");
      else if (code === "functions/permission-denied") toastError("No puedes escribir en el chat ahora.");
      else if (code === "functions/failed-precondition") toastError("El chat está cerrado por el momento.");
      else toastError("No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  }

  // Free / sin sesión.
  if (!canChat) {
    return (
      <div className="glass-card mt-3 flex flex-col items-center gap-2 rounded-card p-4 text-center">
        <p className="text-sm text-text-muted">El ARMY Chat es solo para miembros. Hazte ARMY para escribir 💜</p>
        <Link href="/membresia" className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white">
          Ver planes
        </Link>
      </div>
    );
  }

  // Silenciado.
  if (muted) {
    return (
      <div className="mt-3 flex items-center justify-center gap-2 rounded-card border border-[color-mix(in_srgb,var(--warning)_40%,transparent)] bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] p-3 text-sm text-warning">
        <VolumeX className="h-4 w-4" aria-hidden />
        Estás silenciado. Podrás escribir en <span className="font-bold tabular-nums">{fmtCountdown(muteMs)}</span>
      </div>
    );
  }

  // Chat cerrado (el admin nunca ve esto).
  if (closed) {
    return (
      <div className="mt-3 flex items-center justify-center gap-2 rounded-card glass-card p-3 text-sm text-text-muted">
        <Lock className="h-4 w-4" aria-hidden /> El chat está cerrado por el momento.
      </div>
    );
  }

  return (
    <div className="relative mt-3">
      <RichTextEditor key={editorKey} charLimit={charLimit} placeholder="Escribe en el ARMY Chat…" onChange={handleRichChange} />

      <div className="mt-2 flex items-center gap-2">
        <label className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted hover:bg-brand-soft hover:text-brand">
          <ImagePlus className="h-5 w-5" aria-hidden />
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        </label>

        {preview && (
          <span className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Vista previa" className="h-10 w-10 rounded-lg object-cover" />
            <button type="button" onClick={() => setImage(null)} aria-label="Quitar imagen" className="absolute -right-1.5 -top-1.5 rounded-full bg-danger p-0.5 text-white">
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        )}

        <span className="flex-1" />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSubmit}
          aria-label="Enviar mensaje"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Send className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {cooling && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] backdrop-blur-sm">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-brand" aria-hidden />
            <span className="absolute text-xs font-bold tabular-nums text-brand">{Math.ceil(coolMs / 1000)}</span>
          </div>
          <p className="text-xs text-text-muted">Silencio ARMY… espera {Math.ceil(coolMs / 1000)}s para seguir 💜</p>
        </div>
      )}
    </div>
  );
}

export default ChatComposer;
