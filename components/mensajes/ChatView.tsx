"use client";

// Chat privado en tiempo real: burbujas, imágenes y emojis — Etapa 3.
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmojiPicker } from "@/components/mensajes/EmojiPicker";
import { GlassCard } from "@/components/ui/GlassCard";
import { toastError } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import {
  getConversation,
  markConversationRead,
  sendMessage,
  subscribeMessages,
} from "@/lib/firestore/messages";
import { messageImagePath, uploadImage } from "@/lib/storage";
import { formatRelative } from "@/lib/utils/formatters";
import type { Conversation, Message, WithId } from "@/types";
import { cn } from "@/lib/utils/cn";

export function ChatView({ convId }: { convId: string }) {
  const { status, firebaseUser } = useAuth();
  const [messages, setMessages] = useState<WithId<Message>[]>([]);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeMessages(convId, setMessages);
  }, [convId, firebaseUser]);

  useEffect(() => {
    if (!firebaseUser) return;
    let active = true;
    getConversation(convId)
      .then((c) => active && setConv(c))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [convId, firebaseUser]);

  // Marca leído y baja al final cuando llegan mensajes (efectos, sin setState).
  useEffect(() => {
    if (firebaseUser && messages.length > 0) {
      markConversationRead(convId, firebaseUser.uid).catch(() => {});
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, convId, firebaseUser]);

  if (status !== "authenticated" || !firebaseUser) {
    return (
      <GlassCard className="mx-auto max-w-md text-center text-text-muted">
        Inicia sesión para ver esta conversación 💜
      </GlassCard>
    );
  }

  const otherUid = conv?.participants.find((p) => p !== firebaseUser.uid) ?? null;
  const other = otherUid ? conv?.participantInfo?.[otherUid] : undefined;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseUser || !otherUid) return;
    if (!text.trim() && !image) return;
    setSending(true);
    try {
      let imageURL: string | null = null;
      if (image) {
        imageURL = await uploadImage(messageImagePath(firebaseUser.uid, image.name), image);
      }
      await sendMessage(convId, firebaseUser.uid, otherUid, { text: text.trim(), imageURL });
      setText("");
      setImage(null);
    } catch (err) {
      console.error(err);
      toastError("No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col md:h-[calc(100dvh-11rem)]">
      {/* Cabecera */}
      <header className="glass-card mb-3 flex items-center gap-3 rounded-card p-3">
        <Link href="/mensajes" aria-label="Volver" className="text-text-muted hover:text-brand">
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
        <Link
          href={other?.username ? `/perfil/${other.username}` : "#"}
          className="flex items-center gap-2"
        >
          <span className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-brand">
            {other?.photoURL ? (
              <Image src={other.photoURL} alt={other.nickname} fill sizes="36px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-brand-soft text-sm">💜</span>
            )}
          </span>
          <span className="font-semibold">{other?.nickname ?? "ARMY"}</span>
        </Link>
      </header>

      {/* Mensajes */}
      <div className="flex-1 space-y-2 overflow-y-auto rounded-card px-1">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-muted">
            Sé la primera en escribir 💜
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderUid === firebaseUser.uid;
            const created = m.createdAt?.toDate ? m.createdAt.toDate() : new Date();
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2",
                    mine ? "bg-brand text-white" : "glass-card",
                  )}
                >
                  {m.imageURL && (
                    <span className="relative mb-1 block h-40 w-52 overflow-hidden rounded-xl">
                      <Image src={m.imageURL} alt="" fill sizes="208px" className="object-cover" />
                    </span>
                  )}
                  {m.text && <p className="whitespace-pre-wrap break-words text-sm">{m.text}</p>}
                  <p className={cn("mt-0.5 text-[10px]", mine ? "text-white/70" : "text-text-muted")}>
                    {formatRelative(created)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="mt-3 flex items-end gap-2">
        <EmojiPicker onPick={(e) => setText((t) => t + e)} />
        <label className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted hover:text-brand">
          <ImagePlus className="h-5 w-5" aria-hidden />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="flex flex-1 flex-col gap-1">
          {preview && (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Vista previa" className="h-16 rounded-lg" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute -right-2 -top-2 rounded-full bg-danger p-0.5 text-white"
                aria-label="Quitar imagen"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </div>
          )}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje…"
            className="h-11 w-full rounded-full border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4"
          />
        </div>
        <button
          type="submit"
          disabled={sending || (!text.trim() && !image)}
          aria-label="Enviar"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Send className="h-5 w-5" aria-hidden />
        </button>
      </form>
    </div>
  );
}

export default ChatView;
