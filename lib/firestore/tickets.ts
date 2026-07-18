// Acceso a datos: entradas / zonas — PRD §13.4, §5.
import {
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type WithFieldValue,
} from "firebase/firestore";
import type { Ticket, WithId } from "@/types";
import { ticketsCol } from "./collections";

export function ticketDoc(zoneId: string) {
  return doc(ticketsCol, zoneId);
}

/** Crea/edita una zona (admin) — §11.1. */
export async function saveZone(
  zoneId: string,
  data: Omit<Ticket, "zoneId" | "updatedAt">,
): Promise<void> {
  const payload: WithFieldValue<Ticket> = {
    ...data,
    zoneId,
    isSoldOut: data.stock <= 0,
    updatedAt: serverTimestamp(),
  };
  await setDoc(ticketDoc(zoneId), payload, { merge: true });
}

export async function getTicket(zoneId: string): Promise<Ticket | null> {
  const snap = await getDoc(ticketDoc(zoneId));
  return snap.exists() ? snap.data() : null;
}

/** Todas las zonas ordenadas por número (1-16). §5.2 */
export async function getZones(): Promise<WithId<Ticket>[]> {
  const snap = await getDocs(query(ticketsCol, orderBy("zoneNumber", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
