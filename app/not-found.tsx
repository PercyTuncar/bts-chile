import Link from "next/link";
import { PillButton } from "@/components/ui/PillButton";

export default function NotFound() {
  return (
    <main className="aurora mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-6xl">💜</p>
      <h1 className="mt-4 text-h1 font-bold tracking-tight">Página no encontrada</h1>
      <p className="mt-2 text-text-muted">
        La página que buscas no existe o fue movida. Volvamos al inicio, ARMY.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <PillButton>Ir al inicio</PillButton>
        </Link>
        <Link href="/entradas">
          <PillButton variant="secondary">Ver entradas 🎟</PillButton>
        </Link>
      </div>
    </main>
  );
}
