// Esquemas de validación (zod) reutilizables — PRD §4.2, §4.3, §6, §7.5, §8.
import { z } from "zod";

// Perfil / onboarding — §4.2
export const profileSchema = z.object({
  birthDate: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  nickname: z.string().max(40).optional().or(z.literal("")),
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,20}$/,
      "El nombre de usuario debe tener 3-20 caracteres: minúsculas, números o _",
    ),
  city: z.string().min(1, "Selecciona tu ciudad"),
  country: z.string().min(1, "Selecciona tu país"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// Nueva publicación — §4.3, §8.1
// El límite de caracteres depende del plan del autor (§10), por eso es una fábrica.
const pollOptionSchema = z.object({
  text: z.string().trim().min(1, "La opción no puede estar vacía").max(80, "Máximo 80 caracteres"),
});

export function makePostSchema(maxChars: number) {
  return z
    .object({
      type: z.enum(["text", "poll", "album"]),
      content: z.string().max(maxChars, `Máximo ${maxChars} caracteres`),
      category: z.enum(["fanart", "teoria", "foto", "noticia", "general"]),
      poll: z
        .object({ options: z.array(pollOptionSchema).min(2).max(4) })
        .nullable()
        .optional(),
      images: z.array(z.string().url()).nullable().optional(),
      imageURL: z.string().url().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      // El álbum permite texto vacío (basta con las imágenes); el resto exige contenido.
      if (data.type !== "album" && data.content.trim().length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Escribe algo 💜", path: ["content"] });
      }
      if (data.type === "poll" && (data.poll == null || data.poll.options.length < 2)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agrega al menos 2 opciones a la encuesta",
          path: ["poll"],
        });
      }
      if (data.type === "album" && (data.images == null || data.images.length < 2)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sube al menos 2 imágenes al álbum",
          path: ["images"],
        });
      }
    });
}

/** Esquema por defecto (500) para usos genéricos. */
export const postSchema = makePostSchema(500);
export type PostInput = z.infer<typeof postSchema>;

// Comentario — §8.2
export const commentSchema = z.object({
  content: z.string().min(1).max(200, "Máximo 200 caracteres"),
});
export type CommentInput = z.infer<typeof commentSchema>;

// Reporte — §8.2
export const reportSchema = z.object({
  reason: z.enum(["spam", "ofensivo", "desinformacion", "otro"]),
});
export type ReportInput = z.infer<typeof reportSchema>;

// Reseña de producto — §7.5
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).nullable().optional(),
  comment: z.string().min(1).max(500, "Máximo 500 caracteres"),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

// Datos del comprador (checkout) — §6.1
export const checkoutBuyerSchema = z.object({
  buyerName: z.string().min(2, "Ingresa tu nombre completo"),
  buyerRut: z.string().min(3, "Ingresa tu RUT o pasaporte"),
  buyerEmail: z.string().email("Email inválido"),
  buyerPhone: z.string().min(6, "Ingresa un teléfono de contacto"),
});
export type CheckoutBuyerInput = z.infer<typeof checkoutBuyerSchema>;

// Newsletter — §5.9 / §13.9
export const newsletterSchema = z.object({
  email: z.string().email("Email inválido"),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;
