"use client";

// Wrapper de Cloud Functions callables — PRD §10.4.
import { getFunctions, httpsCallable } from "firebase/functions";
import app from "@/lib/firebase";

const functions = getFunctions(app);

export interface GrantAdminTrialInput {
  targetUid: string;
  plan: "basic" | "premium" | "vip";
  days?: number;
  endDateMs?: number;
}

export async function grantAdminTrial(
  input: GrantAdminTrialInput,
): Promise<{ ok: boolean; expiry: number }> {
  const callable = httpsCallable<GrantAdminTrialInput, { ok: boolean; expiry: number }>(
    functions,
    "grantAdminTrial",
  );
  const res = await callable(input);
  return res.data;
}

// ARMY Chat — envío de mensaje (rate-limit y sanitización en el servidor) — §8.x.
export interface SendChatInput {
  text: string;
  richContent: string | null;
  imageURL: string | null;
  replyTo?: {
    messageId: string;
    senderNickname: string;
    text: string;
  } | null;
}
export interface SendChatResult {
  id: string;
  cooldownUntil: number | null;
  burstRemaining: number;
}

export async function sendArmyChatMessage(input: SendChatInput): Promise<SendChatResult> {
  const callable = httpsCallable<SendChatInput, SendChatResult>(functions, "sendArmyChatMessage");
  const res = await callable(input);
  return res.data;
}

// Fase 2 — editar/eliminar mensajes del ARMY Chat.
export async function editChatMessage(input: {
  messageId: string;
  text: string;
  richContent: string | null;
}): Promise<{ ok: boolean }> {
  const callable = httpsCallable<typeof input, { ok: boolean }>(functions, "editChatMessage");
  return (await callable(input)).data;
}

export async function deleteChatMessage(messageId: string): Promise<{ ok: boolean }> {
  const callable = httpsCallable<{ messageId: string }, { ok: boolean }>(
    functions,
    "deleteChatMessage",
  );
  return (await callable({ messageId })).data;
}
