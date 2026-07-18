// Acceso a datos: sponsors (Fase 2) — PRD §12, §13.13.
import {
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  type WithFieldValue,
} from "firebase/firestore";
import type { Sponsor, WithId } from "@/types";
import { sponsorsCol } from "./collections";

export async function getAllSponsors(): Promise<WithId<Sponsor>[]> {
  const snap = await getDocs(query(sponsorsCol, orderBy("startDate", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Sponsors activos por ubicación (home/comunidad/tienda). */
export async function getActiveSponsors(
  placement: Sponsor["placement"],
): Promise<WithId<Sponsor>[]> {
  const snap = await getDocs(
    query(sponsorsCol, where("placement", "==", placement), where("isActive", "==", true)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveSponsor(
  id: string | null,
  data: WithFieldValue<Sponsor>,
): Promise<void> {
  const ref = id ? doc(sponsorsCol, id) : doc(sponsorsCol);
  await setDoc(ref, data, { merge: true });
}

export async function deleteSponsor(id: string): Promise<void> {
  await deleteDoc(doc(sponsorsCol, id));
}
