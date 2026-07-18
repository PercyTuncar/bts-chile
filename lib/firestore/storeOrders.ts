// Acceso a datos: pedidos de tienda — PRD §13.7, §7.
import {
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type WithFieldValue,
} from "firebase/firestore";
import type {
  PaymentMethod,
  ShippingAddress,
  StoreOrder,
  StoreOrderItem,
  StoreOrderStatus,
  WithId,
} from "@/types";
import { storeOrdersCol } from "./collections";

export interface CreateStoreOrderInput {
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  items: StoreOrderItem[];
  subtotalUSD: number;
  shippingUSD: number;
  discountUSD: number;
  totalUSD: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export async function createStoreOrder(input: CreateStoreOrderInput): Promise<string> {
  const ref = doc(storeOrdersCol);
  const payload: WithFieldValue<StoreOrder> = {
    ...input,
    orderId: ref.id,
    status: "pending_payment",
    trackingNumber: null,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, payload);
  return ref.id;
}

export async function getStoreOrdersByStatus(
  status: StoreOrderStatus,
): Promise<WithId<StoreOrder>[]> {
  const q = query(
    storeOrdersCol,
    where("status", "==", status),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllStoreOrders(): Promise<WithId<StoreOrder>[]> {
  const snap = await getDocs(query(storeOrdersCol, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
