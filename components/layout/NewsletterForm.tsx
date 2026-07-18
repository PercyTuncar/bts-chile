"use client";

// Formulario de suscripción al newsletter (footer / banner entradas) — PRD §5.9, §13.9.
import { useState } from "react";
import { PillButton } from "@/components/ui/PillButton";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { subscribeNewsletter } from "@/lib/firestore/newsletter";
import { newsletterSchema } from "@/lib/utils/validators";
import type { NewsletterSource } from "@/types";

export function NewsletterForm({
  source,
  placeholder = "tu@email.com",
}: {
  source: NewsletterSource;
  placeholder?: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      toastError("Ingresa un email válido.");
      return;
    }
    setLoading(true);
    try {
      await subscribeNewsletter(parsed.data.email, source);
      toastSuccess("¡Suscrita! Revisa tu correo 💜");
      setEmail("");
    } catch (err) {
      console.error(err);
      toastError("No se pudo suscribir. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        aria-label="Correo electrónico"
        className="h-12 w-full min-w-0 flex-1 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4"
      />
      <PillButton type="submit" disabled={loading} className="w-full shrink-0 sm:w-auto">
        {loading ? "…" : "Suscribirme"}
      </PillButton>
    </form>
  );
}

export default NewsletterForm;
