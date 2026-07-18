// Firebase Admin SDK (SOLO SERVIDOR) — usado por los route handlers de PayPal (§10.5).
// El Admin SDK bypassa las Firestore Rules para escribir campos de membresía, que el
// cliente no puede tocar (endurecimiento anti-escalada, §14.1).
//
// Inicialización LAZY: no se ejecuta al importar el módulo (evita parsear credenciales
// en build/collection de datos), solo en la primera llamada en runtime.
import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

function ensureApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(ensureApp());
  return dbInstance;
}

export function getAdminAuth(): Auth {
  if (!authInstance) authInstance = getAuth(ensureApp());
  return authInstance;
}
