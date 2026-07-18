// Acceso a datos: pedidos de entradas — PRD §13.5, §6.
import {
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type WithFieldValue,
} from "firebase/firestore";
import type { EventDate, Order, OrderStatus, PaymentMethod, WithId } from "@/types";
import { ordersCol } from "./collections";

export function orderDoc(orderId: string) {
  return doc(ordersCol, orderId);
}

export interface CreateTicketOrderInput {
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerRut: string;
  zoneId: string;
  zoneName: string;
  quantity: number;
  installments: number;
  pricePerTicketUSD: number;
  subtotalUSD: number;
  serviceFeeUSD: number;
  totalUSD: number;
  installmentAmountUSD: number;
  eventDate: EventDate;
  paymentMethod: PaymentMethod;
  paymentLinkUsed: string;
}

/** Crea orders/{orderId} con status pending_payment (§6.1, §13.5). Devuelve el id. */
export async function createTicketOrder(
  input: CreateTicketOrderInput,
): Promise<string> {
  const ref = doc(ordersCol);
  const now = Timestamp.now();
  const payload: WithFieldValue<Order> = {
    ...input,
    orderId: ref.id,
    status: "pending_payment",
    statusHistory: [
      {
        status: "pending_payment",
        changedAt: now,
        changedBy: input.buyerUid,
        note: "Pedido creado",
      },
    ],
    ticketURL: null,
    ticketUploadedAt: null,
    notes: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, payload);
  return ref.id;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await getDoc(orderDoc(orderId));
  return snap.exists() ? snap.data() : null;
}

/** Pedidos de un comprador (fecha desc). §6 */
export async function getOrdersByBuyer(buyerUid: string): Promise<WithId<Order>[]> {
  const q = query(
    ordersCol,
    where("buyerUid", "==", buyerUid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Pedidos por estado (dashboard admin). §11.1 */
export async function getOrdersByStatus(status: OrderStatus): Promise<WithId<Order>[]> {
  const q = query(
    ordersCol,
    where("status", "==", status),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Todos los pedidos (admin). */
export async function getAllOrders(): Promise<WithId<Order>[]> {
  const snap = await getDocs(query(ordersCol, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Cambia el estado de un pedido y registra en statusHistory (admin) — §6.1, §11.1. */
export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
  changedBy: string,
  note = "",
): Promise<void> {
  const now = Timestamp.now();
  const snap = await getDoc(orderDoc(orderId));
  const history = (snap.data()?.statusHistory ?? []) as Order["statusHistory"];
  await updateDoc(orderDoc(orderId), {
    status,
    updatedAt: serverTimestamp(),
    statusHistory: [...history, { status, changedAt: now, changedBy, note }],
  });
}

/** Sube la URL de la entrada entregada y marca delivered. */
export async function setOrderTicketURL(orderId: string, ticketURL: string): Promise<void> {
  await updateDoc(orderDoc(orderId), {
    ticketURL,
    ticketUploadedAt: serverTimestamp(),
  });
}
