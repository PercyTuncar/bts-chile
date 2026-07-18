// Acceso a datos: newsletter — PRD §13.9, §5.9.
import { doc, getDocs, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import type { NewsletterSource, NewsletterSubscription, WithId } from "@/types";
import { newsletterCol } from "./collections";

/** Lista de suscriptores (admin, export CSV) — §11.1. */
export async function getNewsletterSubscribers(): Promise<WithId<NewsletterSubscription>[]> {
  const snap = await getDocs(query(newsletterCol, orderBy("subscribedAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Suscribe un email al newsletter (id = email). §13.9 */
export async function subscribeNewsletter(
  email: string,
  source: NewsletterSource,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await setDoc(
    doc(newsletterCol, normalized),
    {
      email: normalized,
      subscribedAt: serverTimestamp() as never,
      source,
      isActive: true,
    },
    { merge: true },
  );
}
