import type { Metadata } from "next";
import { MensajesView } from "@/components/mensajes/MensajesView";

export const metadata: Metadata = {
  title: "Mensajes",
  robots: { index: false, follow: false },
};

export default function MensajesPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-h1 font-bold tracking-tight">Mensajes</h1>
      <MensajesView />
    </main>
  );
}
