"use client";

// Grid de grupos de WhatsApp por región con QR en modal — PRD §4.4.
import { useState } from "react";
import { QrCode } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { PillButton } from "@/components/ui/PillButton";

// Datos planos (serializables) que necesita la tarjeta — el Server Component debe
// mapear a esto para no pasar el Timestamp `updatedAt` a un Client Component.
export interface GroupCard {
  id: string;
  name: string;
  region: string;
  link: string;
  isFull: boolean;
  currentMembers: number;
  maxMembers: number;
}

export function GruposGrid({ groups }: { groups: GroupCard[] }) {
  const [qrGroup, setQrGroup] = useState<GroupCard | null>(null);

  if (groups.length === 0) {
    return (
      <div className="glass-card rounded-card p-10 text-center text-text-muted">
        Pronto publicaremos los grupos oficiales por región 💜
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <GlassCard key={g.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 font-semibold">{g.name}</h2>
              <Badge tone={g.isFull ? "danger" : "success"}>
                {g.isFull ? "Lleno" : "Disponible"}
              </Badge>
            </div>
            <p className="text-sm text-text-muted">{g.region}</p>
            <p className="text-xs text-text-muted tabular-nums">
              {g.currentMembers}/{g.maxMembers} miembros
            </p>
            <div className="mt-2 flex gap-2">
              <a href={g.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                <PillButton size="sm" fullWidth disabled={g.isFull}>
                  Unirme
                </PillButton>
              </a>
              <button
                type="button"
                onClick={() => setQrGroup(g)}
                aria-label="Ver código QR"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full glass hover:text-brand"
              >
                <QrCode className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal open={!!qrGroup} onClose={() => setQrGroup(null)} title={qrGroup?.name}>
        {qrGroup && (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrGroup.link)}`}
              alt={`Código QR para el grupo ${qrGroup.name}`}
              width={220}
              height={220}
              className="rounded-2xl bg-white p-2"
            />
            <p className="text-sm text-text-muted">Escanea para unirte al grupo de {qrGroup.region}.</p>
          </div>
        )}
      </Modal>
    </>
  );
}

export default GruposGrid;
