// ==========================================================================
// btschile.com — Tipos de dominio (modelo Firestore) — PRD §13
// Fuente única de verdad de la forma de los datos en toda la app.
// ==========================================================================
import type { Timestamp } from "firebase/firestore";

// --------------------------------------------------------------------------
// Enums / uniones compartidas
// --------------------------------------------------------------------------
export type Role = "user" | "admin";

export type MembershipType = "free" | "basic" | "premium" | "vip";

export type MembershipStatus =
  | "none"
  | "pending" // provisional tras onApprove, antes de la activación por webhook (§10.5)
  | "trialing"
  | "active"
  | "past_due"
  | "suspended"
  | "cancelled"
  | "expired";

export type MembershipSource =
  | "welcome_trial"
  | "admin_trial"
  | "paypal"
  | "manual"
  | null;

export type Periodicity = "monthly" | "annual" | "trial";

export type PostCategory = "fanart" | "teoria" | "foto" | "noticia" | "general";
export type PostStatus = "pending" | "approved" | "rejected";
/** Texto enriquecido, encuesta votable o álbum de imágenes. §8.1 */
export type PostType = "text" | "poll" | "album";

export type ReactionType =
  | "purple_heart"
  | "moved"
  | "laughing"
  | "sad"
  | "fire"
  | "support";

export type ReportReason = "spam" | "ofensivo" | "desinformacion" | "otro";

export type NewsCategory =
  | "oficiales"
  | "conciertos"
  | "musica"
  | "kpop"
  | "army_chile";
export type NewsStatus = "draft" | "published" | "scheduled" | "archived";

export type ProductCategory =
  | "ropa"
  | "accesorio"
  | "peluche"
  | "album"
  | "poster"
  | "digital";
export type ProductStatus = "published" | "draft" | "archived";
export type ProductCondition = "new" | "like_new" | "used";

export type PaymentMethod = "paypal" | "mercadopago" | "transfer" | "efectivo";
export type OrderStatus =
  | "pending_payment"
  | "payment_received"
  | "confirmed"
  | "delivered"
  | "cancelled";
export type StoreOrderStatus =
  | "pending_payment"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type EventDate = "2026-10-16" | "2026-10-17" | "both";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type NewsletterSource = "footer" | "entradas_banner" | "comunidad";

// --------------------------------------------------------------------------
// 13.1 — users/{uid}
// --------------------------------------------------------------------------
export interface User {
  uid: string;
  email: string;
  displayName: string;
  nickname: string;
  username: string; // handle único para la URL del perfil (/perfil/{username})
  usernameLower: string; // versión en minúsculas para lookup/unicidad
  photoURL: string;
  customPhotoURL: string | null;
  birthDate: Timestamp;
  birthMonth: number; // 1-12
  birthDay: number; // 1-31
  city: string;
  country: string; // "CL"
  role: Role;
  membershipType: MembershipType;
  membershipStatus: MembershipStatus;
  membershipExpiry: Timestamp | null;
  membershipSource: MembershipSource;
  isTrial: boolean;
  hasUsedWelcomeTrial: boolean;
  trialGrantedBy: string | null;
  paypalSubscriptionId: string | null;
  membershipHistory: MembershipHistoryEntry[];
  joinedAt: Timestamp;
  lastSeenAt: Timestamp;
  postsCount: number;
  reactionsGiven: number;
  totalPurchases: number;
  followersCount: number;
  followingCount: number;
  isActive: boolean;
  newsletter: boolean;
  // Moderación del ARMY Chat (§8.x). Solo admin/Cloud Functions los escriben (ver reglas).
  // Definidos en Fase 1; el enforcement de mute/ban es Fase 2.
  isMuted?: boolean;
  mutedUntil?: Timestamp | null;
  isBanned?: boolean;
}

// Reserva de unicidad de username — usernames/{usernameLower}
export interface UsernameDoc {
  uid: string;
}

// Relación de seguimiento — follows/{followerUid}_{followingUid}
export interface Follow {
  followerUid: string;
  followingUid: string;
  createdAt: Timestamp;
}

// Mensajería privada — conversations/{convId} (+ subcolección messages)
export interface ParticipantInfo {
  username: string;
  nickname: string;
  photoURL: string | null;
}

export interface Conversation {
  participants: string[]; // [uidA, uidB]
  participantInfo: Record<string, ParticipantInfo>;
  lastMessage: string;
  lastSenderUid: string | null;
  unread: Record<string, number>;
  updatedAt: Timestamp;
}

export interface Message {
  senderUid: string;
  text: string;
  imageURL: string | null;
  createdAt: Timestamp;
}

// --------------------------------------------------------------------------
// ARMY Chat (grupal) — chatRooms/{roomId} (+ subcolección messages) — §8.x
// Los mensajes SOLO los escribe la Cloud Function `sendArmyChatMessage` (Admin SDK).
// --------------------------------------------------------------------------
export interface ChatRoom {
  isOpen: boolean; // Fase 2: abrir/cerrar el chat para todos
  pinnedMessageId: string | null; // Fase 2: mensaje fijado
  messageCount: number; // contador para badges de "nuevos" (Fase 3)
  lastMessageAt: Timestamp | null;
}

export interface ChatMessage {
  senderUid: string;
  senderNickname: string;
  senderUsername: string;
  senderPhotoURL: string | null;
  senderMembership: MembershipType;
  senderRole: Role;
  text: string; // texto plano (para límite/preview)
  richContent: string | null; // HTML de Tiptap saneado (formato)
  imageURL: string | null;
  createdAt: Timestamp;
  editedAt: Timestamp | null; // Fase 2
  deleted: boolean; // Fase 2 (soft-delete)
  deletedBy: string | null; // Fase 2
  pinned: boolean; // Fase 2
}

/** Estado de rate-limit por usuario — armyChatRate/{uid} (solo Admin SDK escribe). */
export interface ChatRateState {
  burstRemaining: number;
  cooldownUntil: Timestamp | null;
  updatedAt: Timestamp;
}

// Notificaciones — notifications/{id}
export type NotificationType =
  | "reaction"
  | "comment"
  | "post_approved"
  | "post_rejected"
  | "follow";

export interface Notification {
  recipientUid: string;
  type: NotificationType;
  actorUid: string | null;
  actorNickname: string | null;
  actorUsername: string | null;
  actorPhotoURL: string | null;
  postId: string | null;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface MembershipHistoryEntry {
  type: MembershipType;
  startDate: Timestamp;
  endDate: Timestamp | null;
  amount: number;
  source: MembershipSource;
}

// --------------------------------------------------------------------------
// 13.2 — posts/{postId} (+ subcolecciones)
// --------------------------------------------------------------------------
export interface ReactionCounts {
  purple_heart: number;
  moved: number;
  laughing: number;
  sad: number;
  fire: number;
  support: number;
  total: number;
}

/** Opción de una encuesta. El índice en `Poll.options` identifica el voto. */
export interface PollOption {
  text: string; // ≤ 80
}

/** Encuesta embebida en un post; la pregunta es el `content` del post. §8.1 */
export interface Poll {
  options: PollOption[]; // 2–4
}

export interface Post {
  postId: string;
  authorUid: string;
  authorNickname: string;
  authorUsername: string; // handle del autor para enlazar a su perfil
  authorPhotoURL: string;
  authorMembership: MembershipType;
  authorRole: Role; // "admin" → post destacado y auto-aprobado (posts antiguos: "user")
  type: PostType; // posts antiguos sin campo: tratar como "text"
  content: string; // texto plano (usado por SEO/metadata); límite según plan del autor
  richContent: string | null; // HTML de Tiptap (formato); null en posts antiguos
  poll: Poll | null; // definición de la encuesta cuando type === "poll"
  images: string[] | null; // URLs del álbum cuando type === "album" (el content puede ir vacío)
  imageURL: string | null;
  category: PostCategory;
  status: PostStatus;
  rejectionReason: string | null;
  reactionCounts: ReactionCounts;
  commentsCount: number;
  reportCount: number;
  isReported: boolean;
  createdAt: Timestamp;
  approvedAt: Timestamp | null;
  approvedBy: string | null;
}

export interface Reaction {
  uid: string;
  type: ReactionType;
  reactedAt: Timestamp;
}

/** Voto de encuesta — posts/{postId}/votes/{uid}. Un voto por usuario, editable. */
export interface PostVote {
  uid: string;
  optionIndex: number;
  votedAt: Timestamp;
}

export interface Comment {
  commentId: string;
  authorUid: string;
  authorNickname: string;
  authorUsername: string;
  authorPhotoURL: string;
  content: string; // ≤ 200
  createdAt: Timestamp;
  editedAt: Timestamp | null; // se marca al editar; null si nunca se editó
  status: "pending" | "approved" | "rejected";
}

export interface Report {
  uid: string;
  reason: ReportReason;
  reportedAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.3 — news/{slug}
// --------------------------------------------------------------------------
export interface News {
  slug: string;
  title: string; // ≤ 100
  excerpt: string; // ≤ 160
  content: string; // HTML
  featuredImageURL: string; // ≥ 1200×630
  category: NewsCategory;
  tags: string[];
  authorUid: string;
  authorName: string;
  status: NewsStatus;
  publishedAt: Timestamp | null;
  scheduledFor: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewCount: number;
  readingTimeMinutes: number;
}

// --------------------------------------------------------------------------
// 13.4 — tickets/{zoneId}
// --------------------------------------------------------------------------
export interface MapCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TicketPaymentLinks {
  paypal_1cuota?: string;
  paypal_2cuotas?: string;
  paypal_3cuotas?: string;
  mercadopago_1cuota?: string;
  mercadopago_2cuotas?: string;
  mercadopago_3cuotas?: string;
}

export interface Ticket {
  zoneId: string;
  zoneName: string;
  zoneNumber: number; // 1-16
  priceUSD: number;
  stock: number;
  isActive: boolean;
  isSoldOut: boolean; // stock === 0
  mapCoordinates: MapCoordinates;
  description: string;
  paymentLinks: TicketPaymentLinks;
  availableDates: EventDate[];
  updatedAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.5 — orders/{orderId}
// --------------------------------------------------------------------------
export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  changedAt: Timestamp;
  changedBy: string;
  note?: string;
}

export interface Order {
  orderId: string;
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerRut: string;
  zoneId: string;
  zoneName: string;
  quantity: number; // 1-3
  installments: number; // 1-3
  pricePerTicketUSD: number;
  subtotalUSD: number;
  serviceFeeUSD: number; // 10%
  totalUSD: number;
  installmentAmountUSD: number; // totalUSD / installments
  eventDate: EventDate;
  paymentMethod: PaymentMethod;
  paymentLinkUsed: string;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  ticketURL: string | null;
  ticketUploadedAt: Timestamp | null;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.6 — products/{slug}
// --------------------------------------------------------------------------
export interface ProductColor {
  name: string;
  hex: string;
  stock: number;
}

export interface ProductSizes {
  XS?: number;
  S?: number;
  M?: number;
  L?: number;
  XL?: number;
  XXL?: number;
}

/** Campos por categoría (13.6). Todos opcionales; se usan según `category`. */
export interface ProductDetails {
  // ROPA
  sizes?: ProductSizes;
  colors?: ProductColor[];
  material?: string;
  careInstructions?: string;
  // PELUCHE / FIGURA
  heightCm?: number;
  widthCm?: number;
  weightGrams?: number;
  materialType?: string;
  includes?: string[];
  // ÁLBUM
  albumVersion?: string;
  contents?: string[];
  condition?: ProductCondition;
  // POSTER
  sizeCm?: string;
  paperType?: string;
  // DIGITAL
  fileFormat?: string;
  deliveryMethod?: "auto" | "manual";
}

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  description: string; // ≤ 1000
  imageURLs: string[]; // 1-8
  priceUSD: number;
  originalPriceUSD: number | null;
  totalStock: number;
  status: ProductStatus;
  isFeatured: boolean;
  details: ProductDetails;
  ratingAvg: number; // desnormalizado (0 si no hay)
  reviewCount: number; // desnormalizado (0 si no hay)
  salesCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.7 — storeOrders/{orderId}
// --------------------------------------------------------------------------
export interface StoreOrderItem {
  productSlug: string;
  productName: string;
  selectedVariant: { size?: string; color?: string };
  quantity: number;
  priceUSD: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface StoreOrder {
  orderId: string;
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  items: StoreOrderItem[];
  subtotalUSD: number;
  shippingUSD: number;
  discountUSD: number; // descuento de membresía
  totalUSD: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: StoreOrderStatus;
  trackingNumber: string | null;
  createdAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.8 — memberships/{docId} (log)
// --------------------------------------------------------------------------
export interface Membership {
  uid: string;
  membershipType: MembershipType;
  periodicity: Periodicity;
  priceUSD: number;
  startDate: Timestamp;
  endDate: Timestamp | null;
  status: "trialing" | "active" | "expired" | "cancelled";
  source: Exclude<MembershipSource, null>;
  isTrial: boolean;
  grantedBy: string | null;
  paypalSubscriptionId: string | null;
  paymentMethod: PaymentMethod | "trial" | null;
  createdAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.8.A — paypalEvents/{eventId} (idempotencia/auditoría)
// --------------------------------------------------------------------------
export interface PaypalEvent {
  eventType: string; // ej: "BILLING.SUBSCRIPTION.ACTIVATED"
  subscriptionId: string | null;
  uidResolved: string | null;
  rawResource: Record<string, unknown>;
  processed: boolean;
  receivedAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.9 — newsletter/{email}
// --------------------------------------------------------------------------
export interface NewsletterSubscription {
  email: string;
  subscribedAt: Timestamp;
  source: NewsletterSource;
  isActive: boolean;
}

// --------------------------------------------------------------------------
// 13.10 — whatsappGroups/{groupId}
// --------------------------------------------------------------------------
export interface WhatsappGroup {
  name: string;
  region: string;
  link: string;
  maxMembers: number; // 256
  currentMembers: number;
  isFull: boolean;
  updatedAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.11 — raffles/{raffleId} (+ tickets)
// --------------------------------------------------------------------------
export interface Raffle {
  title: string;
  description: string;
  prizeDescription: string;
  prizeImageURL: string;
  ticketPriceUSD: number;
  maxTickets: number;
  soldTickets: number;
  status: "active" | "closed" | "drawn";
  drawDate: Timestamp;
  winnerId: string | null;
  createdAt: Timestamp;
  endDate: Timestamp;
}

export interface RaffleTicket {
  buyerUid: string;
  quantity: number;
  purchasedAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.12 — reviews/{reviewId}
// --------------------------------------------------------------------------
export interface Review {
  reviewId: string;
  productSlug: string;
  authorUid: string;
  authorNickname: string;
  authorPhotoURL: string;
  rating: number; // 1-5
  title: string | null;
  comment: string; // ≤ 500
  status: ReviewStatus;
  createdAt: Timestamp;
}

// --------------------------------------------------------------------------
// 13.13 — Colecciones Fase 2 (esquema mínimo)
// --------------------------------------------------------------------------
export interface Sponsor {
  name: string;
  logoURL: string;
  linkURL: string;
  placement: "home" | "comunidad" | "tienda";
  startDate: Timestamp;
  endDate: Timestamp;
  monthlyPriceUSD: number;
  isActive: boolean;
}

export interface WaitlistEntry {
  uid: string;
  zoneIdInterest: string;
  paidUSD: number; // 5
  status: "active" | "notified" | "expired";
  createdAt: Timestamp;
}

export interface ClassItem {
  title: string;
  type: "coreano" | "danza" | "cover";
  instructorUid: string;
  priceUSD: number;
  schedule: string;
  capacity: number;
  enrolled: number;
  platformCommissionPct: number; // 20
  status: string;
}

// --------------------------------------------------------------------------
// Utilidades de tipos
// --------------------------------------------------------------------------
/** Documento con id incluido, para listas en UI. */
export type WithId<T> = T & { id: string };

/** Reacción vacía inicial. */
export const EMPTY_REACTION_COUNTS: ReactionCounts = {
  purple_heart: 0,
  moved: 0,
  laughing: 0,
  sad: 0,
  fire: 0,
  support: 0,
  total: 0,
};
