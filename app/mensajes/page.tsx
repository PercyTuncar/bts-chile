import type { Metadata } from "next";
import { MensajesShell } from "@/components/mensajes/MensajesShell";

export const metadata: Metadata = {
  title: "Mensajes",
  robots: { index: false, follow: false },
};

export default function MensajesPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-6">
      <h1 className="mb-4 text-h1 font-bold tracking-tight">Mensajes</h1>
      <MensajesShell />
    </main>
  );
}
