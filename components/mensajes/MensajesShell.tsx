"use client";

// Contenedor de /mensajes: conmuta entre el ARMY Chat grupal y los mensajes directos.
import { MessageCircle, Users } from "lucide-react";
import { useState } from "react";
import { ArmyChatView } from "@/components/mensajes/ArmyChatView";
import { MensajesView } from "@/components/mensajes/MensajesView";
import { cn } from "@/lib/utils/cn";

type Tab = "army" | "dm";

export function MensajesShell() {
  const [tab, setTab] = useState<Tab>("army");

  return (
    <div>
      {/* Conmutador */}
      <div className="mb-4 flex gap-1 rounded-full glass p-1">
        <button
          type="button"
          onClick={() => setTab("army")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "army" ? "bg-brand text-white" : "text-text-muted hover:text-brand",
          )}
        >
          <Users className="h-4 w-4" aria-hidden /> ARMY Chat
        </button>
        <button
          type="button"
          onClick={() => setTab("dm")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "dm" ? "bg-brand text-white" : "text-text-muted hover:text-brand",
          )}
        >
          <MessageCircle className="h-4 w-4" aria-hidden /> Directos
        </button>
      </div>

      {tab === "army" ? <ArmyChatView /> : <MensajesView />}
    </div>
  );
}

export default MensajesShell;
