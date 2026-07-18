"use client";

import { useState } from "react";
import { AdminCard, AdminSection, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { PillButton } from "@/components/ui/PillButton";
import { Badge } from "@/components/ui/Badge";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { getZones, saveZone } from "@/lib/firestore/tickets";
import { getAllOrders, setOrderStatus, setOrderTicketURL } from "@/lib/firestore/orders";
import { DEFAULT_ZONES } from "@/lib/entradas/zones";
import { formatUSD } from "@/lib/utils/formatters";
import { useAuth } from "@/hooks/useAuth";
import type { OrderStatus, Ticket, WithId } from "@/types";

const ORDER_STATES: OrderStatus[] = [
  "pending_payment",
  "payment_received",
  "confirmed",
  "delivered",
  "cancelled",
];

async function loadEntradas() {
  const [zonesDb, orders] = await Promise.all([getZones(), getAllOrders()]);
  const zones =
    zonesDb.length > 0
      ? zonesDb
      : DEFAULT_ZONES.map((z) => ({ id: z.zoneId, ...z, paymentLinks: {} }) as unknown as WithId<Ticket>);
  return { zones, orders };
}

export default function EntradasAdminPage() {
  const { data, loading, reload } = useAdminData(loadEntradas);
  const { firebaseUser } = useAuth();

  if (loading || !data) return <Loading />;

  return (
    <div className="flex flex-col gap-10">
      <AdminSection title="Zonas y precios" description="Edita stock, precio y activación de cada zona.">
        <AdminCard className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-text-muted">
              <tr>
                <th className="p-2">Zona</th>
                <th className="p-2">Precio USD</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Activa</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {data.zones.map((z) => (
                <ZoneRow key={z.id} zone={z} onSaved={reload} />
              ))}
            </tbody>
          </table>
        </AdminCard>
      </AdminSection>

      <AdminSection title="Pedidos de entradas" description={`${data.orders.length} pedidos`}>
        <AdminCard className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-text-muted">
              <tr>
                <th className="p-2">Comprador</th>
                <th className="p-2">Zona</th>
                <th className="p-2">Total</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o.id} className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
                  <td className="p-2">
                    <p className="font-medium">{o.buyerName}</p>
                    <p className="text-xs text-text-muted">{o.buyerEmail}</p>
                  </td>
                  <td className="p-2">{o.zoneName} ×{o.quantity}</td>
                  <td className="p-2 tabular-nums">{formatUSD(o.totalUSD)}</td>
                  <td className="p-2">
                    <select
                      defaultValue={o.status}
                      onChange={async (e) => {
                        try {
                          await setOrderStatus(o.id, e.target.value as OrderStatus, firebaseUser?.uid ?? "admin");
                          toastSuccess("Estado actualizado");
                          reload();
                        } catch {
                          toastError("Error al actualizar");
                        }
                      }}
                      className="rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2 py-1"
                    >
                      {ORDER_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <TicketUpload orderId={o.id} current={o.ticketURL} onSaved={reload} />
                  </td>
                </tr>
              ))}
              {data.orders.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-text-muted">Sin pedidos aún.</td></tr>
              )}
            </tbody>
          </table>
        </AdminCard>
      </AdminSection>
    </div>
  );
}

function ZoneRow({ zone, onSaved }: { zone: WithId<Ticket>; onSaved: () => void }) {
  const [price, setPrice] = useState(zone.priceUSD);
  const [stock, setStock] = useState(zone.stock);
  const [active, setActive] = useState(zone.isActive);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await saveZone(zone.zoneId || zone.id, {
        zoneName: zone.zoneName,
        zoneNumber: zone.zoneNumber,
        priceUSD: price,
        stock,
        isActive: active,
        isSoldOut: stock <= 0,
        mapCoordinates: zone.mapCoordinates,
        description: zone.description,
        paymentLinks: zone.paymentLinks ?? {},
        availableDates: zone.availableDates,
      });
      toastSuccess(`${zone.zoneName} guardada`);
      onSaved();
    } catch (err) {
      console.error(err);
      toastError("No se pudo guardar la zona.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
      <td className="p-2 font-medium">{zone.zoneName}</td>
      <td className="p-2">
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-24 rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2 py-1" />
      </td>
      <td className="p-2">
        <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-20 rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2 py-1" />
      </td>
      <td className="p-2">
        <button onClick={() => setActive((a) => !a)}>
          <Badge tone={active ? "success" : "neutral"}>{active ? "Sí" : "No"}</Badge>
        </button>
      </td>
      <td className="p-2">
        <PillButton size="sm" onClick={save} disabled={saving}>{saving ? "…" : "Guardar"}</PillButton>
      </td>
    </tr>
  );
}

function TicketUpload({ orderId, current, onSaved }: { orderId: string; current: string | null; onSaved: () => void }) {
  const [url, setUrl] = useState(current ?? "");
  return (
    <div className="flex items-center gap-1">
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL del ticket" className="w-32 rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2 py-1 text-xs" />
      <button
        className="rounded-full glass px-2 py-1 text-xs"
        onClick={async () => {
          try {
            await setOrderTicketURL(orderId, url);
            await setOrderStatus(orderId, "delivered", "admin", "Ticket entregado");
            toastSuccess("Ticket guardado");
            onSaved();
          } catch {
            toastError("Error");
          }
        }}
      >
        Subir
      </button>
    </div>
  );
}
