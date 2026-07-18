// Referencias de colección tipadas — PRD §13.
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { makeConverter } from "./converters";
import type {
  ClassItem,
  Conversation,
  Follow,
  Membership,
  News,
  Notification,
  NewsletterSubscription,
  Order,
  PaypalEvent,
  Post,
  Product,
  Raffle,
  Review,
  Sponsor,
  StoreOrder,
  Ticket,
  User,
  UsernameDoc,
  WaitlistEntry,
  WhatsappGroup,
} from "@/types";

export const usersCol = collection(db, "users").withConverter(makeConverter<User>());
export const usernamesCol = collection(db, "usernames").withConverter(
  makeConverter<UsernameDoc>(),
);
export const followsCol = collection(db, "follows").withConverter(makeConverter<Follow>());
export const notificationsCol = collection(db, "notifications").withConverter(
  makeConverter<Notification>(),
);
export const conversationsCol = collection(db, "conversations").withConverter(
  makeConverter<Conversation>(),
);
export const postsCol = collection(db, "posts").withConverter(makeConverter<Post>());
export const newsCol = collection(db, "news").withConverter(makeConverter<News>());
export const ticketsCol = collection(db, "tickets").withConverter(makeConverter<Ticket>());
export const ordersCol = collection(db, "orders").withConverter(makeConverter<Order>());
export const productsCol = collection(db, "products").withConverter(makeConverter<Product>());
export const storeOrdersCol = collection(db, "storeOrders").withConverter(
  makeConverter<StoreOrder>(),
);
export const membershipsCol = collection(db, "memberships").withConverter(
  makeConverter<Membership>(),
);
export const reviewsCol = collection(db, "reviews").withConverter(makeConverter<Review>());
export const newsletterCol = collection(db, "newsletter").withConverter(
  makeConverter<NewsletterSubscription>(),
);
export const whatsappGroupsCol = collection(db, "whatsappGroups").withConverter(
  makeConverter<WhatsappGroup>(),
);
export const rafflesCol = collection(db, "raffles").withConverter(makeConverter<Raffle>());
export const sponsorsCol = collection(db, "sponsors").withConverter(makeConverter<Sponsor>());
export const waitlistCol = collection(db, "waitlist").withConverter(makeConverter<WaitlistEntry>());
export const classesCol = collection(db, "classes").withConverter(makeConverter<ClassItem>());
export const paypalEventsCol = collection(db, "paypalEvents").withConverter(
  makeConverter<PaypalEvent>(),
);
