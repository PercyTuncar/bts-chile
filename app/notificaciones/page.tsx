import type { Metadata } from "next";
import { NotificacionesView } from "@/components/comunidad/NotificacionesView";

export const metadata: Metadata = {
  title: "Notificaciones",
  robots: { index: false, follow: false },
};

export default function NotificacionesPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-h1 font-bold tracking-tight">Notificaciones</h1>
      <NotificacionesView />
    </main>
  );
}
