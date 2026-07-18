// Inicialización del Admin SDK (bypassa las Firestore Rules) — PRD §14.
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp();
}

export const db = getFirestore();

/** Milisegundos en 30 días (mes de prueba). */
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
