// Helpers de Firebase Storage — PRD §4.2, §4.3, §7.4.
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

/** Sube un archivo y devuelve su URL de descarga. */
export async function uploadImage(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/** Ruta del avatar de un usuario: avatars/{uid}/{fileName}. §4.2 */
export function avatarPath(uid: string, fileName: string): string {
  return `avatars/${uid}/${fileName}`;
}

/** Ruta de imagen de comunidad: community/{uid}/{timestamp}-{fileName}. §4.3 */
export function communityImagePath(uid: string, fileName: string): string {
  return `community/${uid}/${Date.now()}-${fileName}`;
}

/** Ruta de imagen de mensaje privado: messages/{uid}/{timestamp}-{fileName}. */
export function messageImagePath(uid: string, fileName: string): string {
  return `messages/${uid}/${Date.now()}-${fileName}`;
}
