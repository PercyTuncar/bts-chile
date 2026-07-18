/**
 * Seed de la colección `tickets` con las 16 zonas canónicas (PRD §5.2).
 * Ejecutar desde la raíz: npm run seed   (o: npx tsx scripts/seedTickets.ts)
 * Carga .env.local de la raíz automáticamente. Idempotente (merge por zoneId).
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { DEFAULT_ZONES } from "../lib/entradas/zones";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  let raw: string;
  try {
    raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  } catch {
    console.warn("No se encontro .env.local; usando variables del entorno.");
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function init() {
  if (getApps().length) return;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Faltan FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY en .env.local");
  }
  console.log("-> Proyecto:", projectId);
  console.log("-> Service account:", clientEmail);
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

async function main() {
  loadEnvLocal();
  init();
  const db = getFirestore();
  const batch = db.batch();
  const now = Timestamp.now();
  for (const zone of DEFAULT_ZONES) {
    batch.set(
      db.collection("tickets").doc(zone.zoneId),
      { ...zone, paymentLinks: {}, updatedAt: now },
      { merge: true },
    );
  }
  await batch.commit();
  console.log(`OK Seed completado: ${DEFAULT_ZONES.length} zonas en 'tickets'.`);
}

main().catch((err) => {
  console.error("Seed fallo:", err);
  process.exit(1);
});
