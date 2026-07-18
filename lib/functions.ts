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
