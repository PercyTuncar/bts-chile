# PRD — btschile.com
## Plataforma Oficial Fan Community BTS Chile
**Versión:** 3.1 — Revisión Integral + Membresías con Prueba Gratuita y PayPal Recurrente
**Fecha:** Julio 2026
**Stack:** Next.js 16.2 · React 19 · Firebase JS SDK 12.16 · Firebase Auth (Google) · Firestore · Firebase Storage · Tailwind CSS v4 · Node.js 20+

> Este documento es la evolución de `PRD_BTSChile_v1.md`. **No elimina ninguna funcionalidad**: todas
> se conservan y se detallan con mayor precisión. Está listo para pasar directamente a desarrollo.

---

## CHANGELOG v3.1 (nueva funcionalidad de membresías)

- 💵 **Precio del plan más barato reducido a $1 USD/mes:** ARMY Basic pasa de $5 a **$1 USD/mes**
  (o $10/año). Es el plan de entrada para "hacer lo básico" (publicar en comunidad). Actualizado en
  membresía, monetización y JSON-LD.
- 🎁 **Prueba gratuita de bienvenida (automática):** **todo usuario nuevo** recibe **1 mes gratis del
  plan ARMY Basic** al completar su perfil. Se calcula la fecha exacta (`membershipExpiry = fecha de
  registro + 30 días`) y **se desactiva automáticamente** (Cloud Function programada). Flag
  `hasUsedWelcomeTrial` evita otorgarla dos veces.
- 🛠️ **Pruebas gratuitas otorgadas por el admin:** nueva opción en el dashboard (Membresías → "Pruebas
  Gratuitas"): el admin busca al usuario, define **días** o un **rango de fechas** y el **tipo de plan**,
  y el sistema activa la prueba (con desactivación automática al expirar).
- 💳 **Suscripción recurrente con PayPal + activación automática:** integración nativa con el **PayPal
  JS SDK (Subscriptions)** + **webhook** (Cloud Function) que activa/renueva/cancela la membresía en
  automático (`BILLING.SUBSCRIPTION.ACTIVATED`, `PAYMENT.SALE.COMPLETED`, `BILLING.SUBSCRIPTION.CANCELLED`,
  `BILLING.SUBSCRIPTION.EXPIRED`, `BILLING.SUBSCRIPTION.PAYMENT.FAILED`). Se mantiene el pago manual por
  transferencia como respaldo.
- ⏰ **Expiración y desactivación automática de membresías:** Cloud Function diaria que degrada a `free`
  a quien venció sin suscripción PayPal activa.
- 🔒 **Endurecimiento de reglas Firestore:** los campos de membresía (`membershipType`, `membershipExpiry`,
  `paypalSubscriptionId`, etc.) **dejan de ser auto-editables** por el usuario; solo los modifican el
  admin o las Cloud Functions (corrige un riesgo de escalada de privilegios de v1/v2).
- 🗂️ **Nuevos campos/colecciones:** `users` gana campos de trial/PayPal; `memberships` registra origen;
  nueva colección `paypalEvents` (idempotencia/auditoría de webhooks).

---

## CHANGELOG v3.0 (respecto a v1/v2 previo)

**Coherencia y consistencia (sin quitar features):**
- ✅ Unificado el sistema social: se elimina el "like morado único" y la subcolección `likes/{uid}`.
  Todo el documento usa ahora el **sistema de 6 reacciones** (`reactions/{uid}` + `reactionCounts`).
  El campo de usuario `likesGiven` pasa a `reactionsGiven`.
- ✅ Reportes estandarizados en la subcolección `posts/{postId}/reports/{uid}` (se elimina la referencia
  a una colección raíz `reports/{reportId}`).
- ✅ Requisito de publicación alineado en todo el doc: **publicar requiere membresía ≥ Basic**
  (`membershipType != "free"`), consistente con las reglas de Firestore.
- ✅ Añadida la colección **`reviews`** (referenciada por la tienda y por el JSON-LD de producto pero
  ausente en v1) con moderación.
- ✅ Corregida la **matemática de cuotas** del checkout: las cuotas se calculan sobre el TOTAL (incluye
  comisión). Ejemplo numérico consistente.
- ✅ Añadidas colecciones **Fase 2** referenciadas por monetización: `sponsors`, `waitlist`, `classes`.
- ✅ Actualizado el diagrama de relaciones entre colecciones.

**SEO (correcciones basadas en cambios reales de Google):**
- ⚠️ **Sitelinks Search Box retirado por Google (nov 2024):** el markup `SearchAction` de `WebSite` ya
  **no** genera la caja de búsqueda en el SERP. Se conserva la ruta `/buscar` para UX interna, pero
  deja de presentarse como palanca de sitelinks. El peso se traslada a internal linking + `SiteNavigationElement`.
- ⚠️ **FAQ Rich Results restringidos (ago 2023):** Google solo los muestra para sitios gov/health
  autoritativos. Se mantiene el markup `FAQPage` (válido y útil) pero **no se promete** el acordeón en
  el SERP; su valor real es cubrir intención de búsqueda en contenido visible.
- ✅ Añadido bloque **"SEO on-page"** en cada página (H1 único, jerarquía Hx, keywords objetivo,
  internal linking, alt text, canonical, OG/Twitter).
- ✅ Añadida sección de **Core Web Vitals** (LCP/CLS/INP) como palanca real de ranking.

**JSON-LD (campos reales y soportados):**
- ✅ Eliminado `contactOption: "TollFree"` en `ContactPoint` de email (semántica inválida de teléfono).
- ✅ `aggregateRating` de producto se renderiza **solo si hay reseñas reales** (`reviewCount > 0`) —
  Google prohíbe ratings inventados.
- ✅ `OnlineStore` en lugar de `Store` para la tienda; `Offer` con `priceValidUntil`, `shippingDetails`
  y `hasMerchantReturnPolicy`.
- ✅ **Nuevos JSON-LD:** `/membresia` (OfferCatalog de suscripción) y `/perfil/[uid]` (`ProfilePage`).
- ✅ Cada bloque JSON-LD incluye lista de campos **obligatorios vs recomendados** y nota de validación.

**Diseño:**
- ✅ Nuevo **Design System "Apple-Glass Morado"** (glassmorphism, tipografía SF-like, movimiento spring,
  modo claro/oscuro). Se reemplaza el dorado saturado `#FFD700` por acento lavanda/champagne fino.
- ✅ Bloque **"Diseño UX/UI"** detallado en cada página.

---

## TABLA DE CONTENIDOS

1. [Visión y Objetivos](#1-visión-y-objetivos)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Design System, Navegación y UX/UI Global](#3-design-system-navegación-y-uxui-global)
4. [Funcionalidades Core — Ciclo de Vida Completo](#4-funcionalidades-core--ciclo-de-vida-completo)
5. [Página /entradas — Ticketera Oficial](#5-página-entradas--ticketera-oficial)
6. [Página /entradas/comprar — Checkout](#6-página-entradascomprar--checkout)
7. [Página /tienda — Merchandising](#7-página-tienda--merchandising)
8. [Red Social Interna / Comunidad](#8-red-social-interna--comunidad)
9. [Blog de Noticias /noticias](#9-blog-de-noticias-noticias)
10. [Membresía ARMY Boom v4](#10-membresía-army-boom-v4)
11. [Panel Admin Dashboard](#11-panel-admin-dashboard)
12. [Monetización](#12-monetización)
13. [Estructura de Base de Datos Firebase](#13-estructura-de-base-de-datos-firebase)
14. [Flujos CRUD por Colección](#14-flujos-crud-por-colección)
15. [SEO — JSON-LD por Página](#15-seo--json-ld-por-página)
16. [Arquitectura de Archivos Next.js 16](#16-arquitectura-de-archivos-nextjs-16)
17. [Dependencias y Versiones](#17-dependencias-y-versiones)

---

## 1. VISIÓN Y OBJETIVOS

### 1.1 Visión
`btschile.com` es la comunidad digital oficial de ARMY en Chile: el único lugar donde los fans pueden
comprar entradas de forma segura en el mercado secundario, conectarse entre sí, leer noticias
verificadas y adquirir merchandise, todo bajo una identidad visual **premium inspirada en Apple** con
la paleta morada de BTS y materiales *glass*.

### 1.2 Objetivos de Negocio
- Posicionarse #1 en Google Chile para "entradas BTS Chile", "BTS Chile 2026", "army Chile".
- Generar ingresos recurrentes mediante membresías, comisión sobre entradas y ventas de merch.
- Construir la base de datos de fans más grande de Chile, con datos de cumpleaños para marketing.
- Retener tráfico con una red social propia que sustituya grupos de WhatsApp / Facebook.

### 1.3 Público Objetivo
Fans de BTS en Chile entre 14 y 35 años, mayoritariamente femenino, con alto uso móvil y disposición
de pago digital. **Implicación de diseño:** mobile-first estricto, rendimiento impecable en gama media,
estética aspiracional tipo iPhone.

### 1.4 Principios Rectores del Producto
1. **Confianza primero:** cada pantalla de compra transmite seguridad (badges, verificación, claridad de precios).
2. **Cero fricción:** login con Google, un solo flujo de compra, formularios pre-rellenados.
3. **Elegancia Apple:** menos es más; jerarquía visual clara, whitespace, movimiento sutil.
4. **SEO estructural:** cada página nace con su H1, metadatos, JSON-LD e internal linking.

---

## 2. STACK TECNOLÓGICO

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.x |
| React | React | 19.x |
| Bundler | Turbopack (default en Next 16) | — |
| Auth | Firebase Authentication (Google Sign-In) | JS SDK 12.16.x |
| Base de datos | Cloud Firestore | JS SDK 12.16.x |
| Almacenamiento | Firebase Storage | JS SDK 12.16.x |
| Serverless | Cloud Functions for Firebase (2nd gen) | — |
| Hosting/Deploy | Vercel (recomendado) o Firebase Hosting | — |
| Node.js | Node.js | 20 LTS+ |
| CSS | Tailwind CSS v4 | 4.x |
| Animación | Framer Motion | 11.x |
| Pagos online (entradas/tienda) | Links de pago externos (PayPal / Mercado Pago) | — |
| Suscripciones recurrentes (membresía) | PayPal Subscriptions (JS SDK + Webhooks) | `@paypal/react-paypal-js` |
| SEO | next/metadata + JSON-LD inline (Server Components) | — |

### 2.1 Instalación Base

```bash
npx create-next-app@latest btschile --typescript --tailwind --app --turbopack
cd btschile
npm install firebase@12.16.0
npm install next@16.2.7
npm install framer-motion react-hook-form zod zustand date-fns react-hot-toast
npm install @paypal/react-paypal-js   # botón de suscripción PayPal (checkout nativo)
```

### 2.2 Configuración Firebase (`lib/firebase.ts`)

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
```

---

## 3. DESIGN SYSTEM, NAVEGACIÓN Y UX/UI GLOBAL

> **Norte visual:** "iPhone morado, elegante y fino, con efectos glass, al estilo de las páginas web de
> Apple". Interfaces limpias, mucho aire, tipografía grande, materiales translúcidos, movimiento sutil.
> El morado es un **acento fino**, no un fondo saturado.

### 3.1 Estructura del Menú Principal

```
LOGO btschile.com  (wordmark fino + corazón 💜 monoline)
├── INICIO          → /
├── ENTRADAS        → /entradas            ⭐ CTA principal (pill morado)
├── NOTICIAS        → /noticias
├── TIENDA          → /tienda
├── COMUNIDAD       → /comunidad
├── MEMBRESÍA       → /membresia
└── [Botón] ENTRAR  → Modal Google Sign-In
    (si logueado) → Avatar + menú (/perfil, /panel-admin solo admin, cerrar sesión)
```

### 3.2 Design System "Apple-Glass Morado"

**A) Paleta de color (tokens)**

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--brand` | `#8B2FC9` | `#A855F7` | Acento morado primario (CTAs, links, focus) |
| `--brand-strong` | `#6D21A6` | `#7C3AED` | Hover / estados activos |
| `--brand-soft` | `#F3EAFE` | `#1C1430` | Fondos de realce sutiles |
| `--accent` | `#D9C7A8` (champagne) | `#E9DBFF` (lavanda) | Acento fino premium (reemplaza el dorado saturado) |
| `--bg` | `#FAFAFC` | `#0B0B0F` | Fondo de página |
| `--surface` | `#FFFFFF` | `#141419` | Superficies sólidas |
| `--text` | `#0B0B0F` | `#F5F5F7` | Texto principal |
| `--text-muted` | `#6E6E76` | `#A1A1AA` | Texto secundario |
| `--success` `--warning` `--danger` | `#22C55E` `#F59E0B` `#EF4444` | (idénticos, ajustar luminancia por tema) |

- **Gradiente "aurora morada"** para heros: `radial-gradient` de `#8B2FC9` → transparente sobre el fondo,
  con un segundo halo `#A855F7`/`#D9C7A8` desenfocado. Sutil, nunca chillón.
- **Modo claro y oscuro** con `prefers-color-scheme` + toggle manual persistido en `localStorage`.

**B) Material glass (glassmorphism)**

Definir una utilidad Tailwind `.glass`:
```
background: color-mix(in srgb, var(--surface) 60%, transparent);
backdrop-filter: blur(20px) saturate(160%);
-webkit-backdrop-filter: blur(20px) saturate(160%);
border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
box-shadow: 0 8px 32px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.15);
```
- Variantes: `.glass-nav` (blur mayor, sticky), `.glass-card`, `.glass-modal`, `.glass-sheet`.
- **Regla de legibilidad:** todo texto sobre glass debe conservar contraste AA (mín 4.5:1). Si el fondo
  detrás es ruidoso, añadir una capa de `--surface` al 70–80% bajo el blur.

**C) Tipografía (SF Pro-like)**
- **UI/Display:** `Inter` variable (o `Pretendard`, muy cercana a SF). Coreano: `Noto Sans KR`.
- Escala estilo apple.com: Display `56–72px` / tracking `-0.02em`, H1 `40–48px`, H2 `28–32px`,
  H3 `20–22px`, body `16–17px` line-height `1.6`, caption `13px`.
- Pesos: 600/700 para títulos, 400/500 para texto. Números tabulares en precios.

**D) Forma y espaciado**
- Radios: botones/inputs `12–14px`, cards `20–24px`, modales/sheets `28px` (esquinas continuas iOS).
- Grid de 8px. Márgenes generosos, secciones full-bleed con `max-w-[1120px]` centrado para contenido.
- Sombras suaves y difusas (nunca duras).

**E) Movimiento (Framer Motion)**
- Transiciones **spring** suaves (`stiffness ~ 260`, `damping ~ 30`).
- Hero con parallax ligero; secciones con *reveal* fade/slide-up al entrar en viewport (`whileInView`).
- Microinteracciones: botones con lift + scale `0.98` al presionar; **bounce del emoji** al reaccionar.
- **Obligatorio** respetar `prefers-reduced-motion: reduce` (desactivar parallax y grandes desplazamientos).

**F) Iconografía y elementos signature**
- Iconos monoline finos (Lucide/SF Symbols-like). Corazón 💜 como elemento de marca.
- Partículas de corazones muy sutiles y de baja opacidad en el hero del home (no distraer, GPU-friendly).

**G) Biblioteca de componentes UI (`components/ui`)**
`GlassCard`, `PillButton` (primario/secundario/ghost), `SegmentedControl` (selector iOS para fecha/
cantidad/cuotas/tallas), `Sheet` (bottom sheet móvil), `Modal` (glass, centrado desktop / sheet móvil),
`Badge` (membresía/estado), `Toast` (glass, esquina inferior derecha), `Skeleton` (shimmer),
`Stepper` (checkout), `CountdownTimer`.

### 3.3 Principios UX/UI transversales
- **Mobile-first:** 100% responsive; en móvil, navbar glass sticky + menú tipo sheet; barras de acción
  sticky abajo (carrito, comprar).
- **Accesibilidad WCAG 2.1 AA:** alt text obligatorio, foco visible (anillo morado), targets ≥44px,
  contraste AA sobre glass, navegación por teclado en modales/sheets, `aria-*` en el picker de reacciones.
- **Loading states:** Skeleton shimmer en toda lista de datos; nunca layout shift (reservar espacio → CLS bajo).
- **Toasts:** notificaciones glass no intrusivas (éxito/error) en esquina inferior derecha.
- **Estados vacíos** cuidados (ilustración monoline + CTA), y estados de error claros.

### 3.4 Estrategia de Sitelinks y Autoridad de Marca en Google

**Objetivo:** que al buscar "BTS Chile" aparezcan las subpáginas (Entradas, Noticias, Tienda, Comunidad,
Membresía) como sitelinks. Google lo decide algorítmicamente; estas palancas aumentan la probabilidad:

- **Palanca 1 — `SiteNavigationElement` (JSON-LD del home, ver 15.1).** Declara el menú como structured
  data: señal fuerte de las páginas más importantes.
- **Palanca 2 — Internal linking consistente.** El header y el footer enlazan a las 5 rutas prioritarias
  en **cada** página, con *anchor text descriptivo* (ej: "Entradas BTS Chile 2026", nunca "click aquí").
  Las páginas objetivo deben recibir más enlaces internos que el resto.
- **Palanca 3 — Arquitectura de URLs limpia y jerárquica** (español, cortas, descriptivas):
  `/entradas` (no `/tickets`), `/noticias` (no `/blog`), `/comunidad` (no `/forum`).
- **Palanca 4 — Sitemap XML dinámico + Google Search Console.** `app/sitemap.ts` (ver 15.9); subirlo el
  día 1 y solicitar indexación de las 5 páginas principales.
- **Palanca 5 — Señales de marca (`sameAs`).** Perfiles **reales y activos** en Instagram, TikTok,
  Twitter/X, Facebook y YouTube con el nombre "BTS Chile", enlazando al dominio. Los sitelinks aparecen
  sobre todo en *navigational queries* de marca.
- **Palanca 6 — Core Web Vitals** (ver 3.5): la velocidad y estabilidad son factor de ranking.

> ⚠️ **Actualización importante (Google, nov 2024):** el **Sitelinks Search Box** fue **retirado**. El
> markup `SearchAction` en `WebSite` (sección 15.1) ya **no** produce una caja de búsqueda en el SERP.
> Se conserva la ruta `/buscar` para búsqueda interna del sitio (UX), pero **no** debe presentarse como
> palanca de sitelinks. El markup se mantiene por ser válido e inocuo.

> **Nota:** si Google elige mostrar una página que no quieres como sitelink (ej. `/completar-perfil`),
> aplica `noindex` en esa ruta (ya contemplado en `robots.ts`, sección 15.10).

**Tiempo estimado:** con tráfico orgánico constante y las palancas activas, los sitelinks suelen
aparecer entre 3 y 8 semanas post-lanzamiento.

### 3.5 Core Web Vitals (palanca SEO real y transversal)

Metas por página (móvil, p75): **LCP < 2.5s**, **CLS < 0.1**, **INP < 200ms**.
- Usar `next/image` con `sizes` correctos y `priority` solo en el LCP del hero.
- Reservar dimensiones de imágenes y skeletons → sin layout shift (CLS).
- **PPR** (Partial Prerendering) activado (ver `next.config.ts`) para páginas híbridas (contenido
  estático + datos dinámicos de Firestore).
- Fuentes con `next/font` (self-hosted, `display: swap`, subsetting) → sin FOIT/FOUT.
- Diferir JS no crítico; el JSON-LD se renderiza en servidor (Server Components) para que Google lo lea sin JS.

---

## 4. FUNCIONALIDADES CORE — CICLO DE VIDA COMPLETO

### 4.1 AUTENTICACIÓN (Firebase Google Sign-In)

**Flujo completo de inicio a fin:**

1. **Trigger:** Usuario hace click en "ENTRAR" en el header.
2. **UI:** Se abre un **modal glass centrado** (en móvil, *bottom sheet*) con el botón "Continuar con
   Google" (diseño Google oficial) sobre fondo aurora sutil.
3. **Acción:** Se llama `signInWithPopup(auth, googleProvider)`.
4. **Primera vez (nuevo usuario):**
   - Firebase crea el registro en Authentication.
   - Redirect a `/completar-perfil` donde el usuario ingresa:
     - Fecha de nacimiento (DatePicker, **obligatorio**)
     - Apodo / nombre artístico (opcional)
     - País / Ciudad (selector)
     - Foto de perfil (usar la de Google o subir una a `Storage/avatars/{uid}`)
   - Al guardar se crea el documento en la colección `users` en Firestore.
5. **Usuario existente:**
   - Firebase verifica el token, se carga `users/{uid}` al contexto global (React Context + Zustand).
   - Redirect al origen o a `/`.
6. **Sesión persistente:** `setPersistence(browserLocalPersistence)`.
7. **Cierre de sesión:** botón en el menú del avatar → `signOut(auth)`, limpia contexto, redirige a `/`.

**Por qué solo Google:** elimina fricción de contraseñas, reduce soporte, aprovecha el trust de Google
y unifica el perfil con la cuenta Gmail.

**Diseño UX/UI:** modal/sheet glass, botón Google con altura ≥48px, foco visible, animación spring de
entrada, cierre por backdrop/tecla Esc, foco atrapado (focus trap) dentro del modal.

---

### 4.2 REGISTRO Y PERFIL DE USUARIO

**Flujo detallado:**

1. Nuevo usuario completa `/completar-perfil` (obligatorio antes de acceder a funciones sociales).
2. Datos guardados en `users/{uid}` (esquema completo en 13.1). Campos clave: `uid`, `email`,
   `displayName`, `photoURL`, `birthDate`, `nickname`, `city`, `country`, `membershipType`,
   `membershipExpiry`, `role`, `joinedAt`, `postsCount`, `reactionsGiven`, `totalPurchases`.
3. **🎁 Prueba gratuita de bienvenida (automática):** al crear el documento de perfil, una Cloud
   Function (`grantWelcomeTrial`, disparada por el `onCreate` del documento `users/{uid}`) otorga
   **1 mes gratis del plan ARMY Basic** si el usuario no la ha usado antes. Establece:
   `membershipType: "basic"`, `membershipExpiry = joinedAt + 30 días` (fecha exacta calculada en el
   servidor con la zona `America/Santiago`), `membershipSource: "welcome_trial"`, `isTrial: true`,
   `hasUsedWelcomeTrial: true`, y registra el evento en la colección `memberships`. Así el usuario puede
   **publicar posts durante 1 mes gratis** desde el minuto uno. Se **desactiva automáticamente** al
   vencer (ver 10.6). (La lógica vive en la Function, no en el cliente, para que no sea manipulable.)
4. `/perfil/[uid]` muestra: avatar, nickname, ciudad, posts aprobados, insignia de membresía (con
   etiqueta "Prueba" si `isTrial`), fecha de unión y botón de editar (solo el dueño).
5. El **admin** ve en el dashboard todos los usuarios, filtra por cumpleaños del mes y envía
   notificaciones de cumpleaños.

**Diseño UX/UI:** onboarding tipo iOS en pasos con `Stepper`; DatePicker nativo estilizado; preview del
avatar en círculo con anillo morado; guardar con botón pill sticky. `/perfil/[uid]` con cabecera glass,
avatar grande, badges de membresía y grid de posts.

---

### 4.3 COMUNIDAD / RED SOCIAL INTERNA

**Flujo completo de publicación:**

1. Usuario **logueado con membresía ≥ Basic** entra a `/comunidad`. (Los usuarios *Free* pueden leer el
   feed y reaccionar, pero **no** publicar — restricción anti-bots, consistente con 8.1, 10.2 y las
   reglas Firestore).
2. Ve el feed de posts aprobados (fecha desc). Puede reaccionar con el **sistema de 6 reacciones**
   (ver 8.1.A) — cualquier usuario logueado puede reaccionar, aunque sea Free.
3. Hace click en "Nueva publicación" (visible solo si membresía ≥ Basic).
4. Se abre un editor (*bottom sheet* glass en móvil) con:
   - Campo de texto (máx 500 caracteres, contador visible)
   - Upload de imagen/gif (máx 5MB → `Storage/community/{uid}/{timestamp}`)
   - Categorías: Teorías, Fan Art, Fotos, Noticias Fan, General
5. Al "Publicar":
   - Se crea documento en `posts` con `status: "pending"`.
   - Mensaje: "Tu publicación está en revisión 💜 El admin la aprobará pronto."
6. **Moderación (Admin)** en `/panel-admin/moderacion`: ve `status: "pending"`; puede Aprobar
   (`approved`, aparece en feed), Rechazar (`rejected` + `rejectionReason`, notificación al autor) o
   Editar antes de aprobar.
7. **Post aprobado:**
   - Aparece en el feed público de `/comunidad`.
   - Los usuarios logueados **reaccionan** (1 reacción por usuario, cambiable) — se guarda en
     `posts/{postId}/reactions/{uid}`. Los contadores `reactionCounts` se actualizan vía Cloud Function
     `onReactionWrite` y se reflejan en tiempo real con `onSnapshot`.
   - Los usuarios comentan (texto, máx 200 chars) — pasan por moderación si el admin lo configura.
8. **Reglas Firestore:** solo autenticados con membresía ≥ Basic crean posts; solo admins actualizan
   `status`; solo el dueño (o admin) borra su post. (Detalle en sección 14.)

**Diseño UX/UI:** feed de `GlassCard`; picker de reacciones flotante con emojis animados; composer como
sheet glass; estados vacíos cuidados.

---

### 4.4 GRUPO DE WHATSAPP / CHAT

**No se implementa chat en tiempo real** (complejidad y costos). En su lugar:

- Sección `/comunidad/grupos` con links a grupos de WhatsApp oficiales verificados por región
  (Santiago, Valparaíso, Concepción, etc.), con QR descargables.
- El admin gestiona los links (CRUD en colección `whatsappGroups`).
- Genera tráfico orgánico ("grupo whatsapp army chile").

**Diseño UX/UI:** grid de tarjetas glass por región con badge de "lleno/disponible", QR en modal glass,
botón pill "Unirme".

---

### 4.5 BLOG DE NOTICIAS (Ver sección 9)

---

### 4.6 CUMPLEAÑOS Y NOTIFICACIONES

**Flujo:**
1. Al registrarse, el usuario ingresa su `birthDate` (se derivan `birthMonth`/`birthDay` para queries).
2. **Cloud Function** programada (Cloud Scheduler) corre a las 08:00 AM Chile (America/Santiago):
   - Consulta `users` donde `birthMonth`/`birthDay` == hoy.
   - Envía email de cumpleaños vía Firebase Extension "Trigger Email".
3. Dashboard admin: tabla "Cumpleaños del mes" (nombre, email, fecha).
4. Perfil del usuario: badge 🎂 el día de su cumpleaños.
5. Futuro (Fase 2): push vía Firebase Cloud Messaging.

**Diseño UX/UI:** badge 🎂 con glow morado en el perfil; en el admin, vista de calendario glass.

---

## 5. PÁGINA /entradas — TICKETERA OFICIAL

### 5.1 Concepto Visual
**NO es un marketplace.** Es una ticketera oficial con la solidez de TicketMaster/PuntoTicket pero con
estética **Apple-glass morada**. El usuario llega, ve el banner del concierto, selecciona zona, elige
cuotas y va al checkout. **Solo el admin publica entradas.**

### 5.2 Estructura de la Página (de arriba hacia abajo)

**Sección 1 — Hero Banner**
- Banner full-width con foto oficial BTS Chile 2026 y **gradiente aurora morada**.
- `CountdownTimer` glass hacia el concierto (16 octubre 2026).
- Badges glass: "100% Seguro", "Vendedor Verificado", "Pago en Cuotas".

**Sección 2 — Información del Evento**
- Nombre: **BTS WORLD TOUR "ARIRANG" IN SANTIAGO**
- Fechas: Viernes 16 y Sábado 17 de Octubre, 2026
- Recinto: Estadio Nacional Julio Martínez Prádanos, Santiago de Chile
- Capacidad estimada: ~47,000 personas
- Dirección: Av. Grecia 2001, Ñuñoa, Santiago

**Sección 3 — Mapa del Estadio Interactivo**
- SVG del Estadio Nacional con zonas coloreadas según disponibilidad:
  - 🟢 Verde: con stock · 🟡 Amarillo: últimas entradas · 🔴 Rojo: agotado
- Hover en zona → tooltip glass con nombre y precio.
- Click en zona disponible → autoselecciona en el formulario inferior (scroll suave).

**Sección 4 — Selección de Fecha** (`SegmentedControl` estilo iOS)
```
[Viernes 16 Oct]  [Sábado 17 Oct]  [Ambas fechas]
```

**Sección 5 — Tabla de Zonas y Precios**

| # | Zona | Precio USD | Estado | Acción |
|---|---|---|---|---|
| 1 | Pacífico Medio | $1,784 | Agotado | — |
| 2 | Cancha Pacífico | $991 | Agotado | — |
| 3 | Cancha Andes | $949 | Disponible | [+ Agregar] |
| 4 | Pacífico Alto | $892 | Agotado | — |
| 5 | Pacífico Bajo | $734 | Agotado | — |
| 6 | Movilidad Reducida | $734 | Agotado | — |
| 7 | Andes Bajo Centro | $615 | Agotado | — |
| 8 | Andes Bajo Norte | $555 | Agotado | — |
| 9 | Andes Bajo Sur | $555 | Agotado | — |
| 10 | Andes Alto Centro | $535 | Agotado | — |
| 11 | Andes Alto Norte | $496 | Agotado | — |
| 12 | Andes Alto Sur | $496 | Agotado | — |
| 13 | Galería Norte | $377 | Agotado | — |
| 14 | Galería Sur | $377 | Agotado | — |
| 15 | Pacífico Lateral Norte | $299 | Agotado | — |
| 16 | Pacífico Lateral Sur | $299 | Agotado | — |

> Todos los precios en USD. El admin actualiza stock y precios desde el dashboard (colección `tickets`).

**Sección 6 — Selector de Cantidad y Cuotas** (`SegmentedControl`)
```
Zona seleccionada: Cancha Andes — $949 USD
Cantidad: [1] [2] [3]  (máximo 3 entradas)
Cuotas:   [1 cuota]  [2 cuotas]  [3 cuotas]
```
- Al seleccionar cuotas se muestra el monto por cuota **calculado sobre el TOTAL con comisión**
  (ver 6.1). Ejemplo (1 entrada, sin considerar aún comisión de servicio, referencial): $949 en 3 cuotas.

**Sección 7 — Mini Carrito Flotante** (barra sticky glass abajo en móvil)
```
🛒 Carrito: 2 entradas — Cancha Andes | Total: $1,898 USD  [COMPRAR AHORA →]
```

**Sección 8 — FAQ y Garantías** (acordeón glass)
- ¿Cómo funciona el mercado secundario? · ¿Cómo recibo mi entrada? · ¿Garantía de autenticidad? ·
  Política de reembolso · Instrucciones de acceso al estadio (mismas 8 preguntas del JSON-LD 15.2).

**Sección 9 — Banner Newsletter**
"¿Quieres saber si aparecen más entradas? Activa alertas 💜" (input email → colección `newsletter`,
`source: "entradas_banner"`).

### 5.3 Diseño UX/UI de /entradas
- Hero cinematográfico con parallax sutil y countdown glass; badges translúcidos.
- **Mapa SVG:** zonas con `fill` semitransparente por estado, borde hairline, hover con elevación y
  tooltip glass; accesible por teclado (cada zona es `<button>` con `aria-label`).
- Tabla de zonas limpia, números tabulares, fila disponible resaltada con `--brand-soft`.
- Selectores como `SegmentedControl` iOS (pill deslizante).
- Barra de carrito sticky glass con blur; en desktop, panel lateral sticky.
- Acordeón FAQ con animación spring.

### 5.4 SEO on-page de /entradas
- **H1 único:** "Entradas BTS Chile 2026 — Estadio Nacional (16 y 17 oct)". H2 por sección (Evento,
  Zonas y Precios, Cómo comprar, Preguntas frecuentes).
- **Keywords objetivo:** entradas BTS Chile 2026, BTS Estadio Nacional Santiago, comprar entradas BTS,
  BTS ARIRANG Chile, entradas concierto BTS octubre 2026.
- **Internal linking:** enlazar a `/noticias` (novedades del tour), `/membresia` (acceso anticipado) y
  `/comunidad` con anchor descriptivo.
- **Alt text** en banner y mapa (ej. "Mapa de zonas del Estadio Nacional para BTS Chile 2026").
- **Canonical:** `https://btschile.com/entradas`. Contenido de las FAQ **visible** (no solo en JSON-LD).

**Meta tags de /entradas:**
```html
<title>Entradas BTS Chile 2026 — Cancha Andes $949 USD | btschile.com</title>
<meta name="description" content="💜 Compra entradas BTS WORLD TOUR ARIRANG en Chile. Estadio Nacional Santiago, 16 y 17 oct 2026. Cancha Andes disponible desde $949 USD. Pago en 3 cuotas. Entrega por email. 100% seguro." />
<meta property="og:type" content="website" />
<meta property="og:title" content="Entradas BTS Chile 2026 — Disponibles | Compra Segura 💜" />
<meta property="og:description" content="Cancha Andes disponible $949 USD. Estadio Nacional, 16 y 17 oct 2026. Pago en cuotas. Entrega por email en 24-48h." />
<meta property="og:image" content="https://btschile.com/og-entradas.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://btschile.com/entradas" />
<meta property="og:locale" content="es_CL" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@btschile" />
<link rel="canonical" href="https://btschile.com/entradas" />
```
JSON-LD completo en sección 15.2.

---

## 6. PÁGINA /entradas/comprar — CHECKOUT

### 6.1 Flujo Completo de Checkout

**Prerrequisito:** el usuario debe estar logueado. Si no, se muestra el modal de Google Sign-In antes de
continuar.

**Paso 1 — Resumen del Pedido** (tarjeta glass)
```
┌─────────────────────────────────────────────────────┐
│  RESUMEN DE TU PEDIDO                               │
├─────────────────────────────────────────────────────┤
│  BTS WORLD TOUR "ARIRANG" — Santiago                │
│  📅 Fecha: Sábado 17 de Octubre, 2026              │
│  📍 Estadio Nacional, Santiago                      │
│  🎟 Zona: Cancha Andes                              │
│  🪑 Cantidad: 2 entradas                           │
│  💰 Precio unitario: $949 USD                       │
├─────────────────────────────────────────────────────┤
│  SUBTOTAL:                       $1,898.00 USD      │
│  Comisión de servicio (10%):       $189.80 USD      │
│  TOTAL:                          $2,087.80 USD      │
│  💳 Cuotas: 3 cuotas de           $695.93 USD       │
└─────────────────────────────────────────────────────┘
```

> **Fórmula de precios (canónica):**
> `subtotalUSD = pricePerTicketUSD × quantity`
> `serviceFeeUSD = round(subtotalUSD × 0.10, 2)`
> `totalUSD = subtotalUSD + serviceFeeUSD`
> `installmentAmountUSD = round(totalUSD / installments, 2)`
> Las cuotas **siempre** se calculan sobre el TOTAL (con comisión). Ejemplo: $2,087.80 / 3 = **$695.93**.
> (En la página /entradas el monto por cuota mostrado antes de la comisión es referencial; el valor
> vinculante es el del checkout.)

**Paso 2 — Datos del Comprador** (pre-rellenados desde el perfil Firebase)
- Nombre completo (editable) · RUT / Pasaporte (verificación de identidad) · Email de confirmación ·
  Teléfono (WhatsApp de contacto post-venta).

**Paso 3 — Método de Pago**
```
PAGO ONLINE:
○ PayPal — Link de pago seguro por zona
○ Mercado Pago — Link de pago directo
PAGO OFFLINE:
○ Transferencia Bancaria — (datos bancarios al seleccionar)
○ Efectivo (Khipu / CajaVecina) — (instrucciones al seleccionar)
```

**Lógica de Links de Pago por Zona:** el admin configura en el dashboard hasta 6 links por zona (uno por
plataforma × nº de cuotas). Al elegir zona + método + cuotas, el sistema muestra el link correcto. Los
links viven en `tickets/{zoneId}.paymentLinks` (ver 13.4).

**Paso 4 — Confirmación Pre-Pago**
- Checkbox: "Entiendo que esta es una venta de mercado secundario y que las entradas serán entregadas
  vía email dentro de 24-48 horas hábiles tras confirmar el pago."
- Botón grande pill: **[PROCEDER AL PAGO 💜]**
- Al hacer click: se crea `orders/{orderId}` con `status: "pending_payment"` y se redirige al link de
  pago externo en nueva pestaña.

**Paso 5 — Post-Pago (Manual del Admin)**
- El comprador envía comprobante al WhatsApp del admin o a `pagos@btschile.com`.
- El admin verifica y cambia `status` a `payment_received` → `confirmed`.
- Cloud Function envía email de confirmación con instrucciones de entrega.

**Paso 6 — Entrega de Entradas**
- El admin sube el PDF/imagen a Firebase Storage, actualiza `order.ticketURL` (URL firmada, expira en
  7 días) y el email se envía al comprador. El `order` pasa a `status: "delivered"`.

### 6.2 Diseño UX/UI de /entradas/comprar
- **Stepper iOS** (4 pasos) arriba; cada paso en `GlassCard`.
- **Resumen sticky** (panel lateral en desktop, colapsable arriba en móvil) que actualiza totales en vivo.
- Inputs con foco morado, validación en tiempo real (react-hook-form + zod), errores claros.
- Selector de método de pago como tarjetas glass seleccionables (radio custom).
- Botón final pill grande, estado de carga con spinner; toast de éxito glass.

### 6.3 SEO / Indexación de /entradas/comprar
- **`noindex, follow`** recomendado: es una página transaccional/estado del usuario, sin valor de
  búsqueda y con datos personales. Añadir `robots: { index: false }` en `generateMetadata`.
  → **Corrección:** quitar `/entradas/comprar` del `sitemap.ts` (ver 15.9) y añadirla a `disallow` en
  `robots.ts` (ver 15.10). El JSON-LD informativo (`Service`/`WebPage`) se mantiene sin datos personales.
- H1: "Comprar entradas BTS Chile 2026". Canonical a sí misma solo si se decide indexar; por defecto,
  `noindex`.

JSON-LD en sección 15.3.

---

## 7. PÁGINA /tienda — MERCHANDISING

### 7.1 Concepto
Tienda online de merch oficial y no oficial verificado. El admin publica productos por categorías. Los
usuarios compran y el pago sigue el mismo flujo de links de pago que /entradas. Estética de página de
producto **estilo Apple** (imagen protagonista, tipografía amplia, glass sutil).

### 7.2 Categorías de Productos y Campos Requeridos

**A) Ropa (Camisetas, Hoodies, Chaquetas)**
- Nombre · Descripción (hasta 1000 chars) · Fotos (mín 3, máx 8 → Firebase Storage) · Tallas
  XS/S/M/L/XL/XXL con stock por talla · Colores (selector hex con etiqueta y stock) · Precio USD ·
  Precio tachado (opcional) · Stock total · SKU · Material · Instrucciones de cuidado.

**B) Accesorios (Llaveros, Bolsas, Pins)**
- Nombre, descripción, fotos · Variantes (si aplica) · Dimensiones (largo × ancho × alto cm) ·
  Material · Precio USD / Stock.

**C) Peluches / Figuras**
- Nombre, descripción, fotos · Dimensiones (Alto × Ancho cm) · Peso (g) · Material principal
  (peluche, vinilo, resina…) · Incluye (checkbox: caja, certificado, packaging especial) · Precio USD / Stock.

**D) Álbumes y Photocards**
- Nombre del álbum / set · Versión (estándar, limitada…) · Contenido incluido (checklist) · Condición
  (Nuevo / Como nuevo / Con detalles) · Precio USD / Stock.

**E) Posters y Decoración**
- Nombre, descripción, fotos · Tamaño (A4, A3, A2, 60×90cm…) · Tipo de papel (mate, brillante, canvas) ·
  Precio USD / Stock.

**F) Digital (Packs de fotos, stickers digitales)**
- Nombre, descripción, preview (imagen con watermark) · Formato de entrega (ZIP, PDF, PNG) · Entrega
  automática (link tras pago) o manual.

### 7.3 Estructura de la Página /tienda
- Hero con productos destacados (carrusel) · Filtros: Categoría | Precio | Novedad | Más vendido ·
  Grid de productos (3 cols desktop, 2 tablet, 1 móvil) · Cada card: foto, nombre, precio, badge
  "NUEVO"/"AGOTADO" · `/tienda/[slug]` con galería, tallas/colores, descripción, "Agregar al carrito"
  y **sección de reseñas** (colección `reviews`, ver 13.12) · Carrito persistente (localStorage) con
  resumen y link a checkout.

### 7.4 Admin — Publicar Nuevo Producto
1. `/panel-admin/tienda/nuevo`. 2. Selecciona categoría → el formulario cambia dinámicamente. 3. Sube
fotos → `Storage/products/{slug}/foto_{n}.jpg`. 4. Completa campos requeridos de la categoría. 5. Guarda
→ `products/{slug}` con `status: "published"` o `"draft"`. 6. Aparece en `/tienda` si `published`.

### 7.5 Diseño UX/UI de /tienda y /tienda/[slug]
- **Grid aireado**, cards `GlassCard` con hover *lift* + sombra suave; badge glass "NUEVO"/"AGOTADO".
- **Página de producto estilo Apple:** galería grande con thumbnails, zoom, mucho whitespace, precio
  destacado, `SegmentedControl` para talla/color, **sticky buy bar** glass en móvil.
- Reseñas con estrellas finas; estado "sin reseñas aún" cuidado.
- Descuento de membresía mostrado como precio tachado + badge del tier.

### 7.6 SEO on-page de /tienda
- `/tienda` — **H1:** "Tienda BTS Chile — Merchandise Oficial". Meta tags + OG/Twitter propios.
- `/tienda/[slug]` — **H1:** nombre del producto. Descripción única por producto (evitar duplicados),
  alt text descriptivo en cada foto, breadcrumb visible, internal links a productos relacionados.
- **Keywords:** merch BTS Chile, comprar [producto] BTS, peluche BTS Chile, álbum BTS Chile, poster BTS.

**Meta tags de /tienda:**
```html
<title>Tienda BTS Chile — Merch Oficial: Ropa, Peluches y Álbumes | btschile.com</title>
<meta name="description" content="💜 Merchandise oficial de BTS en Chile: camisetas, hoodies, peluches, álbumes, posters y accesorios. Envío a todo Chile. Pago en cuotas. Descuentos para miembros ARMY." />
<meta property="og:type" content="website" />
<meta property="og:title" content="Tienda BTS Chile — Merchandise Oficial 💜" />
<meta property="og:image" content="https://btschile.com/og-tienda.jpg" />
<meta property="og:url" content="https://btschile.com/tienda" />
<meta property="og:locale" content="es_CL" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="canonical" href="https://btschile.com/tienda" />
```
**Meta tags de /tienda/[slug]** (dinámicos): `og:type=product`, título = nombre del producto, imagen =
primera foto, description = extracto de la descripción. JSON-LD en 15.7 y 15.8.

---

## 8. RED SOCIAL INTERNA / COMUNIDAD

### 8.1 Página /comunidad

**Header:**
- Estadísticas: X miembros ARMY | X posts esta semana.
- Botón "+ Publicar" (visible solo para logueados con **membresía ≥ Basic**; los Free ven un CTA a
  `/membresia`).

**Feed:**
- Posts aprobados en orden cronológico inverso. Cada post: avatar, nickname, badge de membresía, fecha
  relativa ("hace 3 horas"), badge de categoría, texto, imagen (si tiene), **barra de reacciones**,
  contador de comentarios.
- Paginación: `onSnapshot` con límite de 20 + botón "Cargar más".
- Imágenes con `next/image` optimizado y lazy loading (CLS bajo).

**Categorías como tabs:** `Todos | Fan Art | Teorías | Fotos | General`.

**Sidebar (desktop, tarjetas glass):**
- "ARMY del mes" (usuario con más reacciones **recibidas**) · Próximos eventos con cuenta regresiva ·
  Links a grupos de WhatsApp verificados · Banner de membresía ARMY Boom v4.

### 8.1.A SISTEMA DE REACCIONES MÚLTIPLES

En lugar de un único corazón, el feed usa un sistema de **6 reacciones** (inspirado en Facebook
Reactions con temática ARMY). El usuario logueado puede dar **una sola** reacción por post (cambiable).
Al hover (desktop) o long-press (móvil) aparece el selector flotante glass.

| Emoji | Nombre interno | Significado |
|---|---|---|
| 💜 | `purple_heart` | Me encanta / Amor ARMY |
| 🥹 | `moved` | Me emocionó / Me conmueve |
| 😂 | `laughing` | Me divierte / Gracioso |
| 😢 | `sad` | Triste / Me entristece |
| 🔥 | `fire` | ¡Lo mejor! / Increíble |
| 🫶 | `support` | Te apoyo / Fuerza |

**Comportamiento UX:**
1. Por defecto el botón muestra 💜 y el total combinado de reacciones.
2. Hover/long-press → picker flotante con los 6 emojis animados.
3. Al seleccionar → el emoji elegido reemplaza a 💜 en el botón, contador +1, animación *bounce*.
4. Si ya había reaccionado y elige la misma → se elimina (toggle off).
5. Si elige una distinta → se reemplaza la anterior por la nueva.
6. El card muestra los **top 3 emojis** + total: `💜 38  🔥 12  🥹 7  · 57 reacciones`.

**Firestore:**
```
posts/{postId}/reactions/{uid}
├── uid: string          — usuario que reaccionó (= ID del documento)
├── type: string         — "purple_heart"|"moved"|"laughing"|"sad"|"fire"|"support"
└── reactedAt: Timestamp

posts/{postId}.reactionCounts: { purple_heart, moved, laughing, sad, fire, support, total }
```

**Cloud Function `onReactionWrite`:** en cada escritura a `posts/{postId}/reactions/{uid}`, recalcula
`reactionCounts` en el post padre (evita lecturas costosas por render).

**Reglas Firestore para reacciones:**
```javascript
match /posts/{postId}/reactions/{uid} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.uid == uid; // solo MI reacción
}
```

**Diseño UX/UI del picker:** panel glass flotante con los 6 emojis, animación spring escalonada,
accesible por teclado (`role="menu"`, flechas + Enter), `aria-pressed` en la reacción activa.

### 8.2 Post Individual `/comunidad/[postId]`
- URL canónica: `https://btschile.com/comunidad/{postId}`.
- H1 con el contenido truncado (primeras 60 chars + "…").
- Avatar del autor, nickname, fecha ISO, categoría.
- Imagen del post con alt descriptivo.
- Barra de reacciones completa (6 opciones expandidas).
- Comentarios: lista + caja para logueados.
- **Botón de reporte** → crea documento en la subcolección **`posts/{postId}/reports/{uid}`** (un
  reporte por usuario), incrementa `reportCount` e `isReported=true` (vía Cloud Function), notifica al admin.
- Breadcrumb: Inicio → Comunidad → [fragmento].
- Compartir: Twitter/X (texto pre-armado), WhatsApp, copiar link.
- **SEO:** título dinámico "ARMY opina: [texto truncado] — Comunidad BTS Chile".

### 8.3 Moderación
El admin ve en `/panel-admin/moderacion`:
- Tab "Pendientes" (con vista previa) · "Aprobados" (despublicar/eliminar) · "Rechazados" (historial +
  razón) · "Reportados" (con `reportCount`). El admin ve la reacción más dada en cada post reportado
  para contextualizar.

### 8.4 Diseño UX/UI de /comunidad
- Feed de `GlassCard` con avatares circulares (anillo del color del tier), badges de categoría glass.
- Composer como *bottom sheet* glass; picker de reacciones flotante animado; sidebar en tarjetas glass.
- Skeleton shimmer al cargar; estados vacíos con ilustración monoline.

### 8.5 SEO on-page de /comunidad
- **H1:** "Comunidad ARMY Chile — Foro de Fans de BTS".
- **Keywords:** comunidad army chile, foro BTS Chile, fans BTS Chile, fan art BTS, teorías BTS.
- Internal linking hacia posts destacados y a `/entradas`, `/membresia`. Cada post individual es una URL
  indexable con su JSON-LD `DiscussionForumPosting` (ver 15.6).

**Meta tags de /comunidad:**
```html
<title>Comunidad ARMY Chile — Foro Fans BTS | btschile.com</title>
<meta name="description" content="💜 Únete a la comunidad ARMY más grande de Chile. Publica fan art, teorías y fotos de BTS. Reacciona y conecta con miles de fans. Publicar requiere membresía ARMY Boom." />
<meta property="og:title" content="Comunidad ARMY Chile — Foro Fans BTS 💜" />
<meta property="og:image" content="https://btschile.com/og-comunidad.jpg" />
<meta property="og:url" content="https://btschile.com/comunidad" />
<meta property="og:locale" content="es_CL" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="canonical" href="https://btschile.com/comunidad" />
```

---

## 9. BLOG DE NOTICIAS /noticias

### 9.1 Flujo del Admin para Publicar Noticias
1. `/panel-admin/noticias/nueva`. 2. Formulario:
   - **Título** (máx 100 chars) · **Slug** (auto desde título, editable) · **Imagen destacada**
     (`Storage/news/{slug}/featured.jpg`, mín 1200×630px para OG) · **Categoría** (Noticias Oficiales |
     Conciertos | Música | K-pop General | Army Chile) · **Extracto** (máx 160 chars = meta description) ·
     **Contenido** (rich text: Tiptap) · **Tags** · **Estado** (Borrador | Publicado | Programado con
     fecha) · **Fuentes / Créditos**.
3. Al publicar → `news/{slug}` con todos los campos + `publishedAt`, `authorUid`, `readingTimeMinutes`.
4. Aparece de inmediato en `/noticias` ordenada por fecha.

### 9.2 Página /noticias
- Header con categorías como tabs filtro · Grid de artículos (imagen, título, extracto, fecha, tiempo de
  lectura, categoría) · Artículo más reciente destacado en banner grande · Búsqueda interna
  (Firestore limitada; Algolia en Fase 2).

### 9.3 Página /noticias/[slug]
- H1 = título · imagen destacada · autor (badge Admin) · fecha de publicación · contenido HTML ·
  breadcrumb estructurado · compartir (Twitter/X, Instagram Story, WhatsApp, Facebook) · artículos
  relacionados (misma categoría) · comentarios desactivados al inicio.

### 9.4 Diseño UX/UI de /noticias
- **Portada editorial estilo Apple Newsroom:** artículo destacado a ancho completo con imagen grande y
  título display; grid de tarjetas glass debajo.
- **Artículo:** columna de lectura estrecha (~680px), tipografía amplia (`@tailwindcss/typography`),
  imagen destacada full-bleed, cita/destacados con acento morado, barra de progreso de lectura sutil.

### 9.5 SEO on-page de /noticias
- `/noticias` — **H1:** "Noticias BTS Chile". Tabs con anchor descriptivo.
- `/noticias/[slug]` — H1 = título (único), meta description = extracto, OG `type=article` con
  `article:published_time`, imagen 1200×630. Alt text en imagen destacada. Internal links a `/entradas`
  y a noticias relacionadas. Contenido original (evitar copiar de fuentes; citar y enlazar).
- **Keywords:** noticias BTS Chile, BTS Chile 2026 noticias, [tema del artículo].

**Meta tags de /noticias (listado):**
```html
<title>Noticias BTS Chile — Conciertos, Música y ARMY | btschile.com</title>
<meta name="description" content="💜 Las últimas noticias de BTS en Chile y el mundo: fechas de conciertos, nuevas canciones, novedades de los miembros y de ARMY Chile." />
<meta property="og:title" content="Noticias BTS Chile 💜" />
<meta property="og:image" content="https://btschile.com/og-noticias.jpg" />
<meta property="og:url" content="https://btschile.com/noticias" />
<link rel="canonical" href="https://btschile.com/noticias" />
```
JSON-LD en 15.4 (listado) y 15.5 (artículo).

---

## 10. MEMBRESÍA ARMY BOOM v4

### 10.1 Tiers de Membresía

| Tier | Nombre | Precio | Duración |
|---|---|---|---|
| 0 | Free | $0 | Indefinido |
| 1 | ARMY Basic | **$1 USD/mes** | Mensual o $10/año |
| 2 | ARMY Premium | $12 USD/mes | Mensual o $120/año |
| 3 | ARMY VIP — Boom v4 | $25 USD/mes | Mensual o $240/año |

> **ARMY Basic es el plan de entrada a $1 USD/mes:** precio deliberadamente bajo para convertir usuarios
> Free en pagos y mantener una fricción anti-bot mínima. Es el plan que se regala como **prueba de
> bienvenida** (10.3) y el que el usuario paga vía **PayPal recurrente** (10.5) para seguir publicando.

### 10.2 Beneficios por Tier

**Free:** perfil público, leer noticias, ver feed y **reaccionar** en comunidad. **No puede publicar**
(anti-bots).

**ARMY Basic ($1/mes):** todo lo de Free + **publicar en comunidad** (con moderación) + badge "BASIC" +
newsletter mensual + **5% de descuento** en tienda.

**ARMY Premium ($12/mes):** todo lo de Basic + badge "PREMIUM" morado + **acceso anticipado a entradas
(12h antes)** + **10% descuento** en tienda + sección `/premium` con contenido exclusivo (fotos HD,
behind the scenes) + insignia especial en comunidad.

**ARMY VIP — Boom v4 ($25/mes):** todo lo de Premium + badge "💜 BOOM v4" (acento champagne) + newsletter
VIP semanal + prioridad en lista de espera de entradas + **15% descuento** en tienda + nombre en la
"Galería de ARMY Fundadores" permanente + salas de WhatsApp exclusivas + sorteo mensual de merch.

### 10.3 🎁 Prueba Gratuita de Bienvenida (automática, 1 mes de ARMY Basic)

**Objetivo:** todo usuario nuevo puede "hacer lo básico" (publicar posts) durante 1 mes sin pagar, para
enamorarlo del producto y luego convertirlo a la suscripción de $1/mes.

**Cómo funciona (todo del lado servidor, no manipulable):**
1. Al completar el perfil se crea `users/{uid}` (ver 4.2). La Cloud Function `grantWelcomeTrial` se
   dispara con el `onCreate` del documento.
2. La Function verifica `hasUsedWelcomeTrial`. Si es `false`/inexistente:
   - `membershipType = "basic"`
   - `membershipStatus = "trialing"`, `isTrial = true`
   - `membershipSource = "welcome_trial"`
   - `membershipExpiry = joinedAt + 30 días` — **fecha exacta** calculada en el servidor
     (`Timestamp`, zona `America/Santiago`), no en el cliente.
   - `hasUsedWelcomeTrial = true` (evita re-otorgar si el usuario borra y recrea el perfil).
   - Registra el evento en `memberships` (`source: "welcome_trial"`, `isTrial: true`).
3. Durante la prueba el usuario tiene los permisos de ARMY Basic (puede publicar; las reglas Firestore
   ya permiten crear posts cuando `membershipType != "free"`).
4. **Se desactiva automáticamente** al vencer (ver 10.6): al llegar `membershipExpiry`, el usuario vuelve
   a `free` y deja de poder publicar, salvo que active una suscripción PayPal.
5. **UI:** en `/perfil` y en la comunidad se muestra un badge "Prueba ARMY Basic — quedan X días" con un
   CTA "Mantener mi acceso por $1/mes" que abre el checkout PayPal (10.5). 3 días antes de vencer se
   envía email recordatorio (Cloud Function `membershipExpiryReminder`).

### 10.4 🛠️ Pruebas Gratuitas Otorgadas por el Admin

**Dónde:** Dashboard → **Membresías → "Pruebas Gratuitas"** (ver 11.1).

**Flujo del admin:**
1. El admin abre la sección "Pruebas Gratuitas".
2. **Busca al usuario** por email o nickname (autocompletar sobre `users`).
3. Selecciona el **tipo de plan** a regalar: `basic` | `premium` | `vip`.
4. Define la **duración**, en una de dos modalidades (`SegmentedControl`):
   - **Por días:** ingresa un número (ej. 7, 14, 30) → `membershipExpiry = ahora + N días`.
   - **Por rango de fechas:** elige fecha de inicio y fin (DatePicker) → `membershipExpiry = fecha fin`.
5. Confirma. Una función admin (Callable Cloud Function `grantAdminTrial`, que valida `role == "admin"`)
   actualiza `users/{uid}`:
   - `membershipType = <plan elegido>`, `membershipStatus = "trialing"`, `isTrial = true`,
     `membershipSource = "admin_trial"`, `trialGrantedBy = <uid admin>`, `membershipExpiry = <calculada>`.
   - Registra en `memberships` (`source: "admin_trial"`, `grantedBy`, `isTrial: true`).
6. El usuario ve su nuevo acceso al instante (el contexto se refresca con `onSnapshot` sobre su `users/{uid}`).
7. **Desactivación automática** al expirar (ver 10.6), idéntica a la prueba de bienvenida.

> **Consistencia:** una prueba de admin **sobrescribe** la fecha de expiración vigente (extiende o cambia
> el plan). Si el usuario ya tiene una suscripción PayPal activa (`paypalSubscriptionId` + `membershipStatus:
> "active"`), la prueba **no** la cancela; solo se aplica si mejora el acceso, y al terminar la prueba se
> respeta la suscripción de pago existente.

### 10.5 💳 Suscripción Recurrente con PayPal (activación automática)

**Enfoque:** checkout **nativo** con el **PayPal JS SDK (Subscriptions)** + **webhook** que activa la
membresía en automático, sin intervención del admin.
[Referencias oficiales: PayPal Webhooks](https://developer.paypal.com/api/rest/webhooks/) ·
[Integrate Subscriptions](https://developer.paypal.com/docs/subscriptions/integrate/) ·
[Subscriptions API v1](https://developer.paypal.com/docs/api/subscriptions/v1/).

**Configuración única (una vez, en el panel de PayPal / vía API):**
1. Crear un **Product** (Catalog Products API): "Membresía ARMY Basic".
2. Crear un **Billing Plan** recurrente: **$1 USD / mes** (y opcionalmente planes Premium $12 y VIP $25,
   y variantes anuales). Guardar cada `plan_id` en variables de entorno.
3. Registrar la **URL del webhook** (`/api/paypal/webhook`) en la app de PayPal y suscribir los eventos:
   `BILLING.SUBSCRIPTION.ACTIVATED`, `PAYMENT.SALE.COMPLETED`, `BILLING.SUBSCRIPTION.CANCELLED`,
   `BILLING.SUBSCRIPTION.EXPIRED`, `BILLING.SUBSCRIPTION.SUSPENDED`, `BILLING.SUBSCRIPTION.PAYMENT.FAILED`.
   Guardar el `PAYPAL_WEBHOOK_ID`.

**Flujo del usuario (checkout nativo):**
1. En `/membresia` (o desde el CTA del trial) el usuario elige plan y hace click en "Suscribirme por $1/mes".
2. Se renderiza el **botón de PayPal** (`@paypal/react-paypal-js`) que crea la suscripción con
   `createSubscription({ plan_id })` y `application_context.user_action` para **activación inmediata**
   (`SUBSCRIBE_NOW`). El usuario aprueba dentro del popup/redirect de PayPal (experiencia nativa).
3. En `onApprove` se recibe el `subscriptionID`. El front lo envía a una API interna que guarda de forma
   **provisional** `paypalSubscriptionId` y `membershipStatus: "pending"` en `users/{uid}`.
4. **La activación real la hace el webhook**, no el front (fuente de verdad = PayPal):

**Webhook (`app/api/paypal/webhook/route.ts` → o Cloud Function HTTPS):**
- Verifica la **firma** del webhook (headers `Paypal-Transmission-Id`, `Paypal-Transmission-Time`,
  `Paypal-Transmission-Sig`, `Paypal-Cert-Url` + `PAYPAL_WEBHOOK_ID`) antes de procesar. Responde **2xx**
  solo si se procesó (si no, PayPal reintenta hasta 25 veces en 3 días).
- **Idempotencia:** guarda cada `event.id` en la colección `paypalEvents`; si ya existe, ignora.
- Mapea `subscriptionID` → `uid` (buscando `users` por `paypalSubscriptionId`, o vía `custom_id` que se
  envía al crear la suscripción con el `uid`).
- Acciones por evento:

| Evento PayPal | Acción sobre `users/{uid}` |
|---|---|
| `BILLING.SUBSCRIPTION.ACTIVATED` | `membershipType` = plan; `membershipStatus: "active"`; `isTrial: false`; `membershipSource: "paypal"`; `membershipExpiry = ahora + 1 mes` |
| `PAYMENT.SALE.COMPLETED` (cargo mensual) | **Renueva:** `membershipExpiry += 1 mes`; `membershipStatus: "active"` |
| `BILLING.SUBSCRIPTION.PAYMENT.FAILED` | `membershipStatus: "past_due"` (email de aviso; gracia corta) |
| `BILLING.SUBSCRIPTION.SUSPENDED` | `membershipStatus: "suspended"` (no renueva; degradar al expirar) |
| `BILLING.SUBSCRIPTION.CANCELLED` / `EXPIRED` | `membershipStatus: "cancelled"`; al llegar `membershipExpiry`, degradar a `free` (10.6) |

- Cada evento se registra en `memberships` (log) para auditoría.

> **Resultado:** el usuario paga en PayPal y su membresía se **activa/renueva en automático**; si cancela
> o falla el pago, se **degrada en automático**. El admin no interviene en el caso PayPal.

**Método de respaldo (manual):** se mantiene la opción de **transferencia bancaria**: el usuario paga,
envía comprobante y el admin activa manualmente desde el dashboard (actualiza `membershipType`/
`membershipExpiry`, `membershipSource: "manual"`). Útil para quien no usa PayPal.

### 10.6 ⏰ Expiración y Desactivación Automática

**Cloud Function programada `membershipExpiryCron`** (Cloud Scheduler, diaria 00:15 `America/Santiago`):
1. Consulta `users` con `membershipType != "free"` y `membershipExpiry <= ahora`.
2. Para cada uno, verifica si tiene suscripción **PayPal activa** (`membershipStatus == "active"` con
   `paypalSubscriptionId`): si la tiene, **no** degrada (la renovación llega por webhook `PAYMENT.SALE.COMPLETED`).
3. Si **no** hay pago activo (trial vencido, o suscripción cancelada/vencida):
   - `membershipType = "free"`, `membershipStatus = "expired"`, `isTrial = false`, `membershipExpiry = null`.
   - Registra en `memberships` (`status: "expired"`). Envía email "tu acceso terminó, renueva por $1/mes".
4. **Recordatorio previo (`membershipExpiryReminder`):** 3 días antes de `membershipExpiry`, email con CTA
   a renovar / suscribirse por PayPal.

> Así, tanto la **prueba de bienvenida** como las **pruebas del admin** se apagan solas en la fecha exacta,
> y las suscripciones PayPal se mantienen mientras el pago siga vigente.

### 10.7 Diseño UX/UI de /membresia
- **Pricing estilo Apple:** 3–4 cards glass alineadas; el tier recomendado (Premium o VIP) destacado con
  **glow morado** y badge "Popular"; toggle mensual/anual (`SegmentedControl`) que anima el cambio de precio.
- Lista de beneficios con checks finos; CTA pill por card; tabla comparativa expandible abajo.

### 10.8 SEO on-page de /membresia
- **H1:** "Membresía ARMY Boom v4 — Beneficios Exclusivos".
- **Keywords:** membresía army chile, army boom, beneficios fans BTS Chile, publicar en comunidad BTS.
- Internal links a `/comunidad` (requisito para publicar) y `/entradas` (acceso anticipado).
- Destacar en el contenido visible el gancho "1 mes gratis" y "$1 USD/mes" (intención de conversión).

**Meta tags de /membresia:**
```html
<title>Membresía ARMY Boom v4 — 1 Mes Gratis, luego $1/mes | btschile.com</title>
<meta name="description" content="💜 Únete a la comunidad ARMY Chile: 1 mes gratis para publicar posts y luego solo $1 USD/mes. Acceso anticipado a entradas, descuentos en la tienda y contenido exclusivo." />
<meta property="og:title" content="Membresía ARMY Boom v4 💜" />
<meta property="og:image" content="https://btschile.com/og-membresia.jpg" />
<meta property="og:url" content="https://btschile.com/membresia" />
<link rel="canonical" href="https://btschile.com/membresia" />
```
JSON-LD nuevo en 15.11.

---

## 11. PANEL ADMIN DASHBOARD

**URL:** `/panel-admin` — protegida por middleware Next.js que verifica `users/{uid}.role === "admin"`
(y por Firestore Rules). Ruta con `noindex`.

### 11.1 Secciones del Dashboard

**📊 Overview** — KPIs (usuarios hoy/semana/mes), pedidos pendientes (badge rojo), posts pendientes
(badge amarillo), ingresos del mes (manual), cumpleaños de hoy y próximos 7 días, actividad reciente.

**👥 Usuarios** — tabla (nombre, email, ciudad, membresía, registro, cumpleaños); filtros por membresía/
ciudad/mes de cumpleaños; acciones (ver perfil, cambiar rol, desactivar, cambiar membresía); export CSV.

**🎟 Entradas** — gestión de zonas (stock, precio, activar/desactivar), configurar links de pago por zona,
lista de pedidos (filtro por estado), detalle de pedido (datos del comprador, subir ticket), cambio de
estado en un click.

**🛍 Tienda** — crear/editar/eliminar productos, ver pedidos de tienda, gestión de stock por variante,
**moderación de reseñas** (`reviews`).

**📝 Noticias** — crear/editar/archivar/eliminar, borradores, programar publicaciones.

**🗣 Comunidad / Moderación** — cola de posts pendientes (Aprobar/Rechazar), posts reportados, gestión de
grupos de WhatsApp.

**💜 Membresías** — activas/vencidas/por vencer en 7 días, activar/renovar/cancelar, estadísticas de
ingresos por membresía, estado de suscripciones PayPal (`active`/`past_due`/`cancelled`). Incluye la
subsección **"Pruebas Gratuitas"**:
- **Buscador de usuario** (por email o nickname, autocompletar sobre `users`).
- Selector de **tipo de plan** a regalar: Basic / Premium / VIP.
- Selector de **duración** (`SegmentedControl`): **por días** (input numérico) **o por rango de fechas**
  (DatePicker inicio–fin).
- Botón "Otorgar prueba" → ejecuta la Callable Function `grantAdminTrial` (valida `role == "admin"`),
  fija `membershipType`/`membershipExpiry`/`isTrial`/`membershipSource: "admin_trial"`/`trialGrantedBy`,
  y registra en `memberships`. La prueba **se desactiva sola** al expirar (ver 10.4 y 10.6).
- Tabla de **pruebas activas** (usuario, plan, fecha de expiración, origen, días restantes) con acción
  para revocar (vuelve a `free`).

**🎂 Cumpleaños** — calendario del mes, lista diaria para mensajes manuales/automáticos.

**📧 Newsletter** — lista de emails suscritos, export CSV (Mailchimp/Sendinblue).

**🤝 Sponsors (Fase 2)** — CRUD de banners de negocios afiliados (colección `sponsors`).

### 11.2 Diseño UX/UI del Panel Admin
- **Sidebar glass** fija con navegación por secciones; contenido en cards glass; KPIs en tiles con
  números tabulares y micro-sparklines. Tablas densas pero legibles, con acciones rápidas (pills).
  Modales glass para confirmaciones. Mantiene la estética Apple pero prioriza densidad de información.

---

## 12. MONETIZACIÓN

### 12.1 Fuentes de Ingreso Directas
1. **Venta de Entradas (Principal)** — comisión 8-12% por entrada. Ej: $949 × 10% = $94.9. 100 entradas
   → $9,490. Precios en USD (protege del tipo de cambio).
2. **Membresías ARMY Boom v4** — ingresos recurrentes (PayPal). 100 VIP ($25) = $2,500; 300 Premium
   ($12) = $3,600; 500 Basic ($1) = $500 → **$6,600/mes** con 900 miembros. El plan Basic a **$1/mes** es
   un producto de **volumen/adquisición**: la prueba gratuita de 1 mes convierte usuarios nuevos y el
   cobro recurrente vía PayPal (activación automática) hace escalable la base de pagos con mínima gestión.
3. **Tienda de Merchandise** — margen 20-40%; mayor margen en ropa estampada y digital.
4. **Publicidad Interna** — banners de negocios locales K-pop (no Google Ads), precio fijo mensual;
   página "Sponsors" (colección `sponsors`, Fase 2).

### 12.2 Fuentes de Ingreso Indirectas
5. **Afiliados y Partnerships** — comisión 5-10% por referidos (cursos de coreano, K-beauty/K-pop).
6. **Contenido Patrocinado (Blog)** — $100-300 USD por artículo.
7. **Sorteos y Rifas** — boletos $2-5 USD (colección `raffles`).
8. **Clases y Workshops (Fase 2)** — `/clases` (coreano, danza K-pop, cover), $10-30 USD; instructores
   externos pagan 20% de comisión (colección `classes`).
9. **Lista de Espera Premium** — $5 USD por reserva prioritaria, no reembolsable (colección `waitlist`).

### 12.3 Cálculo de Rentabilidad Estimada (Año 1)

| Fuente | Estimado Bajo | Estimado Alto |
|---|---|---|
| Entradas (200 vendidas) | $10,000 USD | $20,000 USD |
| Membresías (mix Basic $1 / Premium / VIP) | $2,500/mes | $4,500/mes |
| Tienda (50 ventas/mes) | $1,000/mes | $3,000/mes |
| Publicidad interna | $500/mes | $1,500/mes |
| **TOTAL MENSUAL** | **$4,000** | **$9,000** |

> Nota: con Basic a $1/mes, el ingreso por membresías depende más del **volumen** (miles de usuarios
> convertidos desde la prueba gratuita) y de la proporción que sube a Premium/VIP. La prueba de 1 mes es
> la principal palanca de conversión.

---

## 13. ESTRUCTURA DE BASE DE DATOS FIREBASE

### 13.1 Colección `users`
```
users/{uid}
├── uid: string                    — Firebase Auth UID (= Google UID)
├── email: string                  — Email de Google (indexado)
├── displayName: string            — Nombre real de Google
├── nickname: string               — Apodo elegido
├── photoURL: string               — URL foto Google o Storage
├── customPhotoURL: string | null  — Foto subida manualmente (Storage/avatars/{uid})
├── birthDate: Timestamp           — Fecha de nacimiento (OBLIGATORIA)
├── birthMonth: number             — Mes (1-12, queries de cumpleaños)
├── birthDay: number               — Día (1-31, queries de cumpleaños)
├── city: string                   — Ciudad (ej: "Santiago")
├── country: string                — País (ej: "CL")
├── role: "user" | "admin"         — Control de acceso. Default: "user"
├── membershipType: "free" | "basic" | "premium" | "vip"
├── membershipStatus: "none"|"trialing"|"active"|"past_due"|"suspended"|"cancelled"|"expired"
├── membershipExpiry: Timestamp | null    — Fecha exacta de vencimiento (server-side)
├── membershipSource: "welcome_trial"|"admin_trial"|"paypal"|"manual"|null  — Origen del acceso
├── isTrial: boolean               — True si el acceso actual es una prueba gratuita
├── hasUsedWelcomeTrial: boolean   — True tras otorgar el mes gratis de bienvenida (no re-otorgar)
├── trialGrantedBy: string | null  — uid del admin que otorgó una prueba (si admin_trial)
├── paypalSubscriptionId: string | null  — ID de la suscripción PayPal activa
├── membershipHistory: array       — [{type, startDate, endDate, amount, source}]
├── joinedAt: Timestamp
├── lastSeenAt: Timestamp
├── postsCount: number             — Posts aprobados publicados
├── reactionsGiven: number         — Reacciones dadas (antes "likesGiven")
├── totalPurchases: number
├── isActive: boolean              — Para bloquear cuentas desde admin
└── newsletter: boolean            — ¿Suscrito?
```
**Queries críticas:** `where("birthMonth","==",m).where("birthDay","==",d)` (cumpleaños);
`where("membershipType","!=","free")`; `where("role","==","admin")`.

### 13.2 Colección `posts`
```
posts/{postId}
├── postId, authorUid, authorNickname, authorPhotoURL, authorMembership
├── content: string            — máx 500 chars
├── imageURL: string | null
├── category: "fanart"|"teoria"|"foto"|"noticia"|"general"
├── status: "pending"|"approved"|"rejected"
├── rejectionReason: string | null
├── reactionCounts: { purple_heart, moved, laughing, sad, fire, support, total }
├── commentsCount: number
├── reportCount: number
├── isReported: boolean
├── createdAt, approvedAt: Timestamp|null, approvedBy: string|null

Subcolección posts/{postId}/reactions/{uid}   — { uid, type, reactedAt }
Subcolección posts/{postId}/comments/{commentId} — { authorUid, authorNickname, authorPhotoURL, content(≤200), createdAt, status }
Subcolección posts/{postId}/reports/{uid}      — { uid, reason: "spam"|"ofensivo"|"desinformacion"|"otro", reportedAt }
```
**Cloud Functions:** `onReactionWrite` (recalcula `reactionCounts`), `onReportWrite` (recalcula
`reportCount`/`isReported`).

> **Nota v3:** se eliminó la subcolección `likes/{uid}` de v1. Todo se maneja con `reactions/{uid}`.

### 13.3 Colección `news`
```
news/{slug}
├── slug, title(≤100), excerpt(≤160), content(HTML)
├── featuredImageURL (≥1200×630), category, tags[]
├── authorUid, authorName
├── status: "draft"|"published"|"scheduled"|"archived"
├── publishedAt|null, scheduledFor|null, createdAt, updatedAt
├── viewCount, readingTimeMinutes
```

### 13.4 Colección `tickets` (Zonas)
```
tickets/{zoneId}
├── zoneId, zoneName, zoneNumber(1-16)
├── priceUSD, stock, isActive, isSoldOut (stock===0)
├── mapCoordinates: {x,y,width,height}   — para el SVG
├── description                          — tooltip del mapa
├── paymentLinks: { paypal_1cuota, paypal_2cuotas, paypal_3cuotas,
│                   mercadopago_1cuota, mercadopago_2cuotas, mercadopago_3cuotas }
├── availableDates: string[]             — ["2026-10-16","2026-10-17","both"]
└── updatedAt
```

### 13.5 Colección `orders` (Pedidos de Entradas)
```
orders/{orderId}
├── orderId, buyerUid, buyerName, buyerEmail, buyerPhone, buyerRut
├── zoneId, zoneName, quantity(1-3), installments(1-3)
├── pricePerTicketUSD, subtotalUSD, serviceFeeUSD (10%), totalUSD
├── installmentAmountUSD  = totalUSD / installments   (sobre el TOTAL, ver 6.1)
├── eventDate: "2026-10-16"|"2026-10-17"|"both"
├── paymentMethod: "paypal"|"mercadopago"|"transfer"|"efectivo"
├── paymentLinkUsed
├── status: "pending_payment"|"payment_received"|"confirmed"|"delivered"|"cancelled"
├── statusHistory: [{status, changedAt, changedBy, note}]
├── ticketURL|null, ticketUploadedAt|null, notes, createdAt, updatedAt
```

### 13.6 Colección `products` (Tienda)
```
products/{slug}
├── slug, name, category: "ropa"|"accesorio"|"peluche"|"album"|"poster"|"digital"
├── description(≤1000), imageURLs[] (1-8), priceUSD, originalPriceUSD|null, totalStock
├── status: "published"|"draft"|"archived", isFeatured
├── details: {  // campos por categoría
│     sizes:{XS,S,M,L,XL,XXL}, colors:[{name,hex,stock}], material, careInstructions,   // ROPA
│     heightCm, widthCm, weightGrams, materialType, includes[],                          // PELUCHE
│     albumVersion, contents[], condition:"new"|"like_new"|"used",                       // ÁLBUM
│     sizeCm, paperType,                                                                 // POSTER
│     fileFormat, deliveryMethod:"auto"|"manual"                                         // DIGITAL
│   }
├── ratingAvg: number          — desnormalizado desde reviews (0 si no hay)
├── reviewCount: number        — desnormalizado desde reviews (0 si no hay)
├── salesCount, createdAt, updatedAt
```

### 13.7 Colección `storeOrders` (Pedidos de Tienda)
```
storeOrders/{orderId}
├── orderId, buyerUid, buyerName, buyerEmail, buyerPhone
├── items: [{ productSlug, productName, selectedVariant:{size?,color?}, quantity, priceUSD }]
├── subtotalUSD, shippingUSD, discountUSD (descuento de membresía), totalUSD
├── shippingAddress: {street, city, region, postalCode}
├── paymentMethod
├── status: "pending_payment"|"confirmed"|"shipped"|"delivered"|"cancelled"
├── trackingNumber|null, createdAt
```

### 13.8 Colección `memberships` (Log de cambios de membresía)
```
memberships/{docId}
├── uid, membershipType, periodicity:"monthly"|"annual"|"trial", priceUSD
├── startDate, endDate, status:"trialing"|"active"|"expired"|"cancelled"
├── source: "welcome_trial"|"admin_trial"|"paypal"|"manual"   — Origen del registro
├── isTrial: boolean
├── grantedBy: string | null        — uid admin (welcome/admin trial o activación manual)
├── paypalSubscriptionId: string | null
├── paymentMethod, createdAt
```

### 13.8.A Colección `paypalEvents` (idempotencia/auditoría de webhooks) — NUEVA
```
paypalEvents/{eventId}             — eventId = event.id de PayPal (clave para idempotencia)
├── eventType: string              — ej: "BILLING.SUBSCRIPTION.ACTIVATED"
├── subscriptionId: string | null
├── uidResolved: string | null     — uid al que se aplicó
├── rawResource: map               — payload recibido (para auditoría)
├── processed: boolean
├── receivedAt: Timestamp
```
**Uso:** el webhook guarda cada `event.id`; si ya existe, ignora (evita procesar dos veces). Solo
escribible por Cloud Functions (Admin SDK); no accesible desde el cliente.

### 13.9 Colección `newsletter`
```
newsletter/{email}  — { email, subscribedAt, source:"footer"|"entradas_banner"|"comunidad", isActive }
```

### 13.10 Colección `whatsappGroups`
```
whatsappGroups/{groupId}  — { name, region, link, maxMembers(256), currentMembers, isFull, updatedAt }
```

### 13.11 Colección `raffles` (Sorteos)
```
raffles/{raffleId}  — { title, description, prizeDescription, prizeImageURL, ticketPriceUSD,
                        maxTickets, soldTickets, status:"active"|"closed"|"drawn", drawDate,
                        winnerId|null, createdAt, endDate }
Subcolección raffles/{raffleId}/tickets/{ticketId} — { buyerUid, quantity, purchasedAt }
```

### 13.12 Colección `reviews` (Reseñas de Tienda) — NUEVA
```
reviews/{reviewId}
├── reviewId, productSlug        — Referencia a products/{slug}
├── authorUid, authorNickname, authorPhotoURL
├── rating: number               — 1-5
├── title: string | null
├── comment: string              — máx 500 chars
├── status: "pending"|"approved"|"rejected"   — moderación admin
├── createdAt: Timestamp
```
**Uso:** alimenta la sección de reseñas de `/tienda/[slug]` y el `aggregateRating` del JSON-LD **solo si
hay reseñas aprobadas** (`reviewCount > 0`). Cloud Function `onReviewWrite` actualiza
`products/{slug}.ratingAvg` y `.reviewCount` (solo reseñas `approved`).

### 13.13 Colecciones Fase 2 (esquema mínimo)
```
sponsors/{id}   — { name, logoURL, linkURL, placement:"home"|"comunidad"|"tienda",
                    startDate, endDate, monthlyPriceUSD, isActive }
waitlist/{id}   — { uid, zoneIdInterest, paidUSD(5), status:"active"|"notified"|"expired", createdAt }
classes/{slug}  — { title, type:"coreano"|"danza"|"cover", instructorUid, priceUSD, schedule,
                    capacity, enrolled, platformCommissionPct(20), status }
```

---

## 14. FLUJOS CRUD POR COLECCIÓN

### 14.1 Reglas de Seguridad Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    function membership() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.membershipType;
    }

    // Usuarios: leer si auth; crear el propio; actualizar el propio SOLO campos de perfil
    // (los campos de membresía/rol los cambian únicamente admin o Cloud Functions vía Admin SDK).
    match /users/{uid} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == uid;
      allow update: if isAdmin()
        || (request.auth.uid == uid && membershipFieldsUnchanged());
    }
    // El usuario NO puede autoconcederse membresía/rol/trial. Estos campos solo cambian por
    // admin o por las Cloud Functions (que usan el Admin SDK y saltan estas reglas).
    function membershipFieldsUnchanged() {
      let before = resource.data;
      let after = request.resource.data;
      return after.role == before.role
        && after.membershipType == before.membershipType
        && after.membershipStatus == before.membershipStatus
        && after.membershipExpiry == before.membershipExpiry
        && after.membershipSource == before.membershipSource
        && after.isTrial == before.isTrial
        && after.hasUsedWelcomeTrial == before.hasUsedWelcomeTrial
        && after.paypalSubscriptionId == before.paypalSubscriptionId;
    }

    // Posts: crear requiere membresía != free; leer si aprobado o admin; update status solo admin
    match /posts/{postId} {
      allow read: if resource.data.status == 'approved' || isAdmin();
      allow create: if request.auth != null && membership() != 'free';
      allow update: if isAdmin()
        || (request.auth.uid == resource.data.authorUid
            && request.resource.data.status == resource.data.status);
      allow delete: if request.auth.uid == resource.data.authorUid || isAdmin();

      // Reacciones: cualquier autenticado escribe SOLO la suya
      match /reactions/{uid} {
        allow read: if true;
        allow write: if request.auth != null && request.auth.uid == uid;
      }
      // Comentarios: crear si auth; moderación/borrado admin o autor
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if isAdmin() || request.auth.uid == resource.data.authorUid;
      }
      // Reportes: un reporte por usuario
      match /reports/{uid} {
        allow read: if isAdmin();
        allow create: if request.auth != null && request.auth.uid == uid;
      }
    }

    match /news/{slug}      { allow read: if resource.data.status == 'published' || isAdmin();
                              allow write: if isAdmin(); }
    match /tickets/{zoneId} { allow read: if true; allow write: if isAdmin(); }
    match /orders/{orderId} { allow create: if request.auth != null;
                              allow read: if request.auth.uid == resource.data.buyerUid || isAdmin();
                              allow update: if isAdmin(); }
    match /storeOrders/{id} { allow create: if request.auth != null;
                              allow read: if request.auth.uid == resource.data.buyerUid || isAdmin();
                              allow update: if isAdmin(); }
    match /products/{slug}  { allow read: if resource.data.status == 'published' || isAdmin();
                              allow write: if isAdmin(); }

    // Reseñas: crear si auth; visibles solo si aprobadas o admin; moderación admin
    match /reviews/{reviewId} {
      allow read: if resource.data.status == 'approved' || isAdmin();
      allow create: if request.auth != null && request.auth.uid == request.resource.data.authorUid;
      allow update, delete: if isAdmin();
    }

    match /newsletter/{email}     { allow create: if true; allow read, update: if isAdmin(); }
    match /whatsappGroups/{id}    { allow read: if true; allow write: if isAdmin(); }
    match /memberships/{id}       { allow read: if isAdmin(); allow write: if isAdmin(); }
    // paypalEvents: solo Cloud Functions (Admin SDK). Bloqueado para todo cliente.
    match /paypalEvents/{eventId} { allow read, write: if false; }
    match /raffles/{id}           { allow read: if true; allow write: if isAdmin();
      match /tickets/{ticketId}   { allow read: if isAdmin();
                                    allow create: if request.auth != null; }
    }
  }
}
```

### 14.2 Relaciones entre Colecciones (actualizado)
```
users/{uid}
  └── REFERENCIADO EN: posts.authorUid, orders.buyerUid, storeOrders.buyerUid,
                       memberships.uid, reviews.authorUid, reactions.uid, comments.authorUid,
                       reports.uid, raffles.tickets.buyerUid

tickets/{zoneId}   └── REFERENCIADO EN: orders.zoneId
products/{slug}    └── REFERENCIADO EN: storeOrders.items[].productSlug, reviews.productSlug
news/{slug}        └── AUTÓNOMA
posts/{postId}     └── SUBCOLECCIONES: reactions/{uid}, comments/{commentId}, reports/{uid}
                   └── REFERENCIADO EN: users.postsCount (contador desnormalizado)
```
> Cambios v3: se añadieron `storeOrders`, `reviews`, `reactions`, `reports`; se eliminó `likes`.

---

## 15. SEO — JSON-LD POR PÁGINA

> **Nota técnica:** en Next.js 16 App Router cada JSON-LD se inyecta con
> `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />`
> dentro del **Server Component** de la página (o en un helper `lib/utils/seo.ts`). Al renderizarse en
> servidor (SSR/SSG/PPR), Google lo lee sin ejecutar JS.
>
> **Reglas de oro (política de Google):**
> 1. El structured data debe **reflejar el contenido visible** de la página (no información oculta).
> 2. **No inventar** `aggregateRating`/`review`/precios: deben provenir de datos reales.
> 3. Validar **antes de deploy** en **Rich Results Test** (search.google.com/test/rich-results) y en el
>    **Schema Markup Validator** (validator.schema.org).
> 4. Tener el markup no garantiza el rich result; Google decide su elegibilidad y presentación.

### 15.0 Tipos usados y su soporte real en Google (resumen)

| Tipo schema.org | ¿Válido? | ¿Rich result en Google? | Uso en el sitio |
|---|---|---|---|
| `Organization`, `WebSite`, `WebPage` | ✅ | Knowledge/Sitename | Home (identidad) |
| `SiteNavigationElement` (en `ItemList`) | ✅ | Señal (no visual directo) | Home (sitelinks) |
| `MusicEvent` / `EventSeries` | ✅ | **Sí** (Event rich result) | /entradas |
| `Offer` (con `availability`, `price`) | ✅ | Dentro de Event/Product | /entradas, /tienda |
| `Product` + `Offer` (shipping/return) | ✅ | **Sí** (Merchant/Product) | /tienda/[slug] |
| `aggregateRating` / `Review` | ✅ | **Sí**, solo con datos reales | /tienda/[slug] |
| `NewsArticle` / `Blog` | ✅ | Article / Top Stories (elegibilidad) | /noticias |
| `DiscussionForumPosting` | ✅ | **Sí** (Discussion/Forum) | /comunidad |
| `ProfilePage` | ✅ | **Sí** (Profile) | /perfil/[uid] |
| `OnlineStore` (LocalBusiness) | ✅ | Indirecto | /tienda |
| `BreadcrumbList` | ✅ | **Sí** (breadcrumbs) | Todas |
| `FAQPage` | ✅ | ⚠️ Restringido a gov/health | /entradas |
| `SearchAction` (Sitelinks SearchBox) | ✅ | ❌ **Retirado (nov 2024)** | /buscar (solo UX) |
| `SpeakableSpecification` | ✅ | Experimental (noticias) | Home (opcional) |

---

### 15.1 Página Home `/` — JSON-LD (Sitelinks + Organización)

**Correcciones v3:** eliminado `contactOption:"TollFree"` (inválido en email); añadidos
`eventAttendanceMode`/`image` al `MusicEvent`; `sameAs` deben apuntar a perfiles **reales**.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://btschile.com/#website",
      "url": "https://btschile.com",
      "name": "BTS Chile",
      "alternateName": ["btschile.com", "BTS Chile Oficial", "ARMY Chile"],
      "description": "La comunidad oficial de ARMY en Chile. Entradas BTS Chile 2026 verificadas, noticias, membresía ARMY Boom v4 y tienda de merchandise.",
      "inLanguage": "es-CL",
      "publisher": {"@id": "https://btschile.com/#organization"},
      "potentialAction": {
        "@type": "SearchAction",
        "target": {"@type": "EntryPoint", "urlTemplate": "https://btschile.com/buscar?q={search_term_string}"},
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://btschile.com/#organization",
      "name": "BTS Chile",
      "legalName": "BTS Chile Comunidad ARMY",
      "url": "https://btschile.com",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://btschile.com/#logo",
        "url": "https://btschile.com/logo.png",
        "contentUrl": "https://btschile.com/logo.png",
        "width": 512, "height": 512, "caption": "BTS Chile"
      },
      "image": {"@id": "https://btschile.com/#logo"},
      "foundingDate": "2026",
      "description": "Comunidad oficial de fans de BTS (방탄소년단) en Chile. Venta verificada de entradas para el BTS WORLD TOUR ARIRANG en el Estadio Nacional de Santiago.",
      "knowsAbout": ["BTS", "K-pop", "방탄소년단", "ARMY", "Conciertos Chile", "BTS WORLD TOUR ARIRANG"],
      "areaServed": {"@type": "Country", "name": "Chile", "identifier": "CL"},
      "contactPoint": [
        {"@type": "ContactPoint", "contactType": "customer support", "email": "contacto@btschile.com", "availableLanguage": ["Spanish"]},
        {"@type": "ContactPoint", "contactType": "sales", "email": "entradas@btschile.com", "availableLanguage": ["Spanish"]}
      ],
      "sameAs": [
        "https://www.instagram.com/btschile",
        "https://twitter.com/btschile",
        "https://www.facebook.com/btschile",
        "https://www.tiktok.com/@btschile",
        "https://www.youtube.com/@btschile"
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://btschile.com/#webpage",
      "url": "https://btschile.com",
      "name": "BTS Chile — Entradas, Comunidad ARMY & Noticias Oficiales",
      "isPartOf": {"@id": "https://btschile.com/#website"},
      "about": {"@id": "https://btschile.com/#organization"},
      "description": "La comunidad oficial de BTS en Chile. Compra entradas verificadas, lee noticias, únete a la membresía ARMY Boom v4 y conecta con miles de fans.",
      "inLanguage": "es-CL",
      "dateModified": "2026-07-17",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "BTS Chile", "item": "https://btschile.com"}
        ]
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://btschile.com/#navigation",
      "name": "Menú principal de BTS Chile",
      "description": "Navegación principal del sitio BTS Chile",
      "itemListElement": [
        {"@type": "SiteNavigationElement", "position": 1, "name": "Entradas BTS Chile 2026", "description": "Compra entradas verificadas para BTS WORLD TOUR ARIRANG. Estadio Nacional, 16 y 17 de octubre 2026. Desde $299 USD.", "url": "https://btschile.com/entradas"},
        {"@type": "SiteNavigationElement", "position": 2, "name": "Noticias BTS Chile", "description": "Últimas noticias de BTS en Chile: conciertos, música, ARMY y más.", "url": "https://btschile.com/noticias"},
        {"@type": "SiteNavigationElement", "position": 3, "name": "Tienda BTS Chile", "description": "Merchandise oficial de BTS: camisetas, peluches, álbumes y más.", "url": "https://btschile.com/tienda"},
        {"@type": "SiteNavigationElement", "position": 4, "name": "Comunidad ARMY Chile", "description": "Red social para ARMY chilenas. Publica, reacciona y conecta.", "url": "https://btschile.com/comunidad"},
        {"@type": "SiteNavigationElement", "position": 5, "name": "Membresía ARMY Boom v4", "description": "Acceso anticipado a entradas, descuentos y contenido VIP.", "url": "https://btschile.com/membresia"}
      ]
    },
    {
      "@type": "MusicEvent",
      "@id": "https://btschile.com/#event-arirang-chile",
      "name": "BTS WORLD TOUR \"ARIRANG\" IN SANTIAGO",
      "startDate": "2026-10-16", "endDate": "2026-10-17",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "image": "https://btschile.com/images/bts-arirang-chile-2026.jpg",
      "location": {
        "@type": "Place",
        "name": "Estadio Nacional Julio Martínez Prádanos",
        "address": {"@type": "PostalAddress", "addressLocality": "Santiago", "addressCountry": "CL"}
      },
      "performer": {"@type": "MusicGroup", "name": "BTS", "sameAs": "https://www.wikidata.org/wiki/Q18123741"},
      "url": "https://btschile.com/entradas",
      "offers": {
        "@type": "Offer", "url": "https://btschile.com/entradas", "priceCurrency": "USD",
        "lowPrice": "299", "highPrice": "1784",
        "availability": "https://schema.org/LimitedAvailability", "validFrom": "2026-04-07T13:00:00-03:00"
      }
    }
  ]
}
```
> **Campos obligatorios de `Organization`** (Google): `name`, `url`, `logo`. Recomendados: `sameAs`,
> `contactPoint`, `description`. **`MusicEvent`:** obligatorios `name`, `startDate`, `location`;
> recomendados `endDate`, `eventStatus`, `eventAttendanceMode`, `performer`, `offers`, `image`.

**Meta tags del Home:**
```html
<title>BTS Chile — Entradas BTS 2026, Comunidad ARMY & Noticias | btschile.com</title>
<meta name="description" content="💜 Comunidad oficial ARMY Chile. Entradas BTS WORLD TOUR ARIRANG en el Estadio Nacional, 16 y 17 oct 2026. Desde $299 USD. Pago en cuotas. Noticias, tienda y membresía ARMY Boom v4." />
<meta property="og:type" content="website" />
<meta property="og:title" content="BTS Chile — Entradas Verificadas & Comunidad ARMY 💜" />
<meta property="og:description" content="La comunidad ARMY más grande de Chile. Entradas BTS 2026, noticias, merch y membresía exclusiva." />
<meta property="og:image" content="https://btschile.com/og-home.jpg" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta property="og:url" content="https://btschile.com" />
<meta property="og:locale" content="es_CL" /><meta property="og:site_name" content="BTS Chile" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@btschile" />
<meta name="twitter:title" content="BTS Chile — Entradas BTS 2026 & Comunidad ARMY" />
<meta name="twitter:image" content="https://btschile.com/og-home.jpg" />
<link rel="canonical" href="https://btschile.com" />
```

**Diseño UX/UI del Home:**
- **Hero** aurora morada full-bleed con `CountdownTimer` glass y CTA pill "Ver entradas"; partículas 💜
  de baja opacidad; parallax sutil.
- Secciones Apple full-bleed alternando fondo: Evento (resumen + mapa teaser), Comunidad (preview de
  posts), Tienda (productos destacados en carrusel), Membresía (mini pricing), Noticias (últimas 3).
- Reveal en scroll; navbar glass sticky que se opaca al bajar; footer glass con **todos** los enlaces
  del menú (anchor descriptivo, refuerza internal linking para sitelinks).

---

### 15.2 Página /entradas — JSON-LD (EventSeries + 2 MusicEvent + 16 zonas + FAQ)

**Correcciones v3:** `Offer` con `validThrough` y `priceValidUntil`; `Place` con `maximumAttendeeCapacity`;
`FAQPage` conservado con la advertencia de rich results (ver 15.0). Se mantienen las 16 zonas con su
disponibilidad real.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EventSeries",
      "@id": "https://btschile.com/entradas#event-series",
      "name": "BTS WORLD TOUR \"ARIRANG\" IN SANTIAGO 2026",
      "description": "BTS regresa a Chile con su BTS WORLD TOUR ARIRANG. Dos fechas en el Estadio Nacional de Santiago, el 16 y 17 de octubre de 2026.",
      "url": "https://btschile.com/entradas",
      "image": {"@type": "ImageObject", "url": "https://btschile.com/images/bts-arirang-chile-2026.jpg", "width": 1200, "height": 630, "caption": "BTS WORLD TOUR ARIRANG — Santiago, Chile 2026"},
      "startDate": "2026-10-16", "endDate": "2026-10-17",
      "location": {
        "@type": "Place",
        "@id": "https://btschile.com/entradas#estadio-nacional",
        "name": "Estadio Nacional Julio Martínez Prádanos",
        "address": {"@type": "PostalAddress", "streetAddress": "Av. Grecia 2001", "addressLocality": "Ñuñoa", "addressRegion": "Región Metropolitana", "postalCode": "7750000", "addressCountry": "CL"},
        "geo": {"@type": "GeoCoordinates", "latitude": -33.4647, "longitude": -70.6108},
        "maximumAttendeeCapacity": 47000,
        "url": "https://estadionacional.cl"
      },
      "performer": {
        "@type": "MusicGroup",
        "@id": "https://btschile.com/entradas#bts",
        "name": "BTS",
        "alternateName": ["방탄소년단", "Bangtan Sonyeondan", "Beyond The Scene"],
        "sameAs": ["https://www.wikidata.org/wiki/Q18123741", "https://en.wikipedia.org/wiki/BTS"],
        "genre": ["K-pop", "Pop", "Hip-hop", "R&B"],
        "member": [
          {"@type": "Person", "name": "RM"}, {"@type": "Person", "name": "Jin"}, {"@type": "Person", "name": "Suga"},
          {"@type": "Person", "name": "J-Hope"}, {"@type": "Person", "name": "Jimin"}, {"@type": "Person", "name": "V"},
          {"@type": "Person", "name": "Jungkook"}
        ]
      },
      "organizer": {"@type": "Organization", "name": "DG Medios", "url": "https://dgmedios.com"}
    },
    {
      "@type": "MusicEvent",
      "@id": "https://btschile.com/entradas#event-dia1",
      "name": "BTS WORLD TOUR \"ARIRANG\" IN SANTIAGO — Viernes 16 Oct",
      "startDate": "2026-10-16T20:00:00-03:00", "endDate": "2026-10-16T23:30:00-03:00",
      "doorTime": "2026-10-16T17:00:00-03:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "isPartOf": {"@id": "https://btschile.com/entradas#event-series"},
      "location": {"@id": "https://btschile.com/entradas#estadio-nacional"},
      "performer": {"@id": "https://btschile.com/entradas#bts"},
      "organizer": {"@type": "Organization", "name": "DG Medios", "url": "https://dgmedios.com"},
      "audience": {"@type": "Audience", "audienceType": "K-pop fans, BTS ARMY", "geographicArea": {"@type": "Country", "name": "Chile"}},
      "typicalAgeRange": "14-",
      "description": "Primera fecha del BTS WORLD TOUR ARIRANG en Chile. Viernes 16 de octubre 2026 en el Estadio Nacional de Santiago.",
      "image": "https://btschile.com/images/bts-arirang-chile-2026.jpg",
      "url": "https://btschile.com/entradas",
      "offers": [
        {"@type": "Offer", "name": "Pacífico Medio",         "price": "1784", "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "VIP",           "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Cancha Pacífico",        "price": "991",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Cancha",        "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Cancha Andes",           "price": "949",  "priceCurrency": "USD", "availability": "https://schema.org/InStock", "url": "https://btschile.com/entradas", "category": "Cancha",        "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Pacífico Alto",          "price": "892",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Tribuna",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Pacífico Bajo",          "price": "734",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Tribuna",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Movilidad Reducida",     "price": "734",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Accesibilidad", "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Andes Bajo Centro",      "price": "615",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Tribuna",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Andes Bajo Norte",       "price": "555",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Tribuna",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Andes Bajo Sur",         "price": "555",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Tribuna",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Andes Alto Centro",      "price": "535",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Tribuna",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Andes Alto Norte",       "price": "496",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Tribuna",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Andes Alto Sur",         "price": "496",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Tribuna",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Galería Norte",          "price": "377",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Galería",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Galería Sur",            "price": "377",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Galería",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Pacífico Lateral Norte", "price": "299",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Lateral",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}},
        {"@type": "Offer", "name": "Pacífico Lateral Sur",   "price": "299",  "priceCurrency": "USD", "availability": "https://schema.org/SoldOut", "url": "https://btschile.com/entradas", "category": "Lateral",       "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-16", "seller": {"@type": "Organization", "name": "BTS Chile"}}
      ]
    },
    {
      "@type": "MusicEvent",
      "@id": "https://btschile.com/entradas#event-dia2",
      "name": "BTS WORLD TOUR \"ARIRANG\" IN SANTIAGO — Sábado 17 Oct",
      "startDate": "2026-10-17T20:00:00-03:00", "endDate": "2026-10-17T23:30:00-03:00",
      "doorTime": "2026-10-17T17:00:00-03:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "isPartOf": {"@id": "https://btschile.com/entradas#event-series"},
      "location": {"@id": "https://btschile.com/entradas#estadio-nacional"},
      "performer": {"@id": "https://btschile.com/entradas#bts"},
      "description": "Segunda fecha del BTS WORLD TOUR ARIRANG en Chile. Sábado 17 de octubre 2026. Cancha Andes disponible desde $949 USD.",
      "image": "https://btschile.com/images/bts-arirang-chile-2026.jpg",
      "url": "https://btschile.com/entradas",
      "offers": [
        {"@type": "Offer", "name": "Cancha Andes", "price": "949", "priceCurrency": "USD", "availability": "https://schema.org/InStock", "url": "https://btschile.com/entradas", "category": "Cancha", "validFrom": "2026-04-07T13:00:00-03:00", "priceValidUntil": "2026-10-17", "seller": {"@type": "Organization", "name": "BTS Chile"}}
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://btschile.com"},
        {"@type": "ListItem", "position": 2, "name": "Entradas BTS Chile 2026", "item": "https://btschile.com/entradas"}
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {"@type": "Question", "name": "¿Cómo compro entradas para BTS Chile 2026 en btschile.com?", "acceptedAnswer": {"@type": "Answer", "text": "Selecciona tu zona y fecha en el mapa del Estadio Nacional, elige la cantidad (máximo 3 entradas) y el número de cuotas (1, 2 o 3). En /entradas/comprar completa tus datos y realiza el pago. Las entradas llegan a tu email en 24-48 horas hábiles."}},
        {"@type": "Question", "name": "¿Son seguras las entradas de btschile.com?", "acceptedAnswer": {"@type": "Answer", "text": "Sí. Solo el administrador de btschile.com vende las entradas, eliminando el riesgo de estafas. Cada entrada es verificada antes de ser entregada al comprador vía email."}},
        {"@type": "Question", "name": "¿Puedo comprar entradas BTS Chile en cuotas?", "acceptedAnswer": {"@type": "Answer", "text": "Sí, puedes pagar en 1, 2 o 3 cuotas a través de PayPal o Mercado Pago. Al seleccionar las cuotas se muestra el monto exacto por pago antes de confirmar."}},
        {"@type": "Question", "name": "¿Cuánto cuestan las entradas para BTS en Santiago?", "acceptedAnswer": {"@type": "Answer", "text": "Los precios van desde $299 USD (Pacífico Lateral) hasta $1,784 USD (Pacífico Medio), según la zona del Estadio Nacional. La zona Cancha Andes está disponible desde $949 USD."}},
        {"@type": "Question", "name": "¿Cuándo es el concierto de BTS en Chile 2026?", "acceptedAnswer": {"@type": "Answer", "text": "BTS se presenta el viernes 16 y sábado 17 de octubre de 2026 en el Estadio Nacional Julio Martínez Prádanos, Santiago de Chile, en el BTS WORLD TOUR ARIRANG."}},
        {"@type": "Question", "name": "¿Qué zonas quedan disponibles para BTS Chile?", "acceptedAnswer": {"@type": "Answer", "text": "La zona Cancha Andes ($949 USD) tiene disponibilidad limitada para ambas fechas. El resto está agotado en el mercado oficial."}},
        {"@type": "Question", "name": "¿Cómo me llegan las entradas de BTS Chile?", "acceptedAnswer": {"@type": "Answer", "text": "Una vez confirmado tu pago, btschile.com te envía la entrada en formato digital (PDF o imagen) a tu email registrado en 24 a 48 horas hábiles."}},
        {"@type": "Question", "name": "¿Puedo comprar entradas BTS Chile sin membresía ARMY?", "acceptedAnswer": {"@type": "Answer", "text": "Sí, no necesitas membresía para comprar entradas. Solo debes registrarte con tu cuenta de Google y completar el proceso de compra."}}
      ]
    }
  ]
}
```
> Meta tags de /entradas: ver sección 5.4. ⚠️ Las respuestas del `FAQPage` deben aparecer **visibles** en
> el acordeón de la Sección 8 de /entradas (regla de contenido visible).

---

### 15.3 Página /entradas/comprar — JSON-LD (informativo, sin datos personales)

**Correcciones v3:** la página es transaccional → se marca **`noindex`** (ver 6.3). El JSON-LD se
mantiene como semántica del servicio **sin placeholders de datos personales** (no incluir nombre del
comprador ni asiento específico). El schema `Order`/`Ticket` es válido pero **no genera rich result**.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://btschile.com/entradas/comprar#webpage",
      "url": "https://btschile.com/entradas/comprar",
      "name": "Comprar Entradas BTS Chile 2026 — Pago Seguro | btschile.com",
      "description": "Completa tu compra de entradas BTS WORLD TOUR ARIRANG. Revisa el resumen, ingresa tus datos y elige PayPal, Mercado Pago o transferencia bancaria.",
      "inLanguage": "es-CL",
      "isPartOf": {"@id": "https://btschile.com/#website"},
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Inicio",   "item": "https://btschile.com"},
          {"@type": "ListItem", "position": 2, "name": "Entradas", "item": "https://btschile.com/entradas"},
          {"@type": "ListItem", "position": 3, "name": "Comprar",  "item": "https://btschile.com/entradas/comprar"}
        ]
      }
    },
    {
      "@type": "Service",
      "@id": "https://btschile.com/entradas/comprar#service",
      "name": "Venta de Entradas BTS Chile — Mercado Secundario Verificado",
      "provider": {"@type": "Organization", "name": "BTS Chile", "url": "https://btschile.com"},
      "description": "Venta verificada de entradas para el BTS WORLD TOUR ARIRANG en Santiago. Entrega digital por email en 24-48 horas hábiles.",
      "areaServed": {"@type": "Country", "name": "Chile"},
      "serviceType": "Ticket Resale",
      "termsOfService": "https://btschile.com/terminos",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Entradas disponibles BTS Chile 2026",
        "itemListElement": [
          {"@type": "Offer", "name": "Cancha Andes — 1 entrada", "price": "949",  "priceCurrency": "USD", "availability": "https://schema.org/InStock"},
          {"@type": "Offer", "name": "Cancha Andes — 2 entradas", "price": "1898", "priceCurrency": "USD", "availability": "https://schema.org/InStock"},
          {"@type": "Offer", "name": "Cancha Andes — 3 entradas", "price": "2847", "priceCurrency": "USD", "availability": "https://schema.org/InStock"}
        ]
      }
    }
  ]
}
```

---

### 15.4 Página /noticias — JSON-LD (Blog)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Blog",
      "@id": "https://btschile.com/noticias#blog",
      "url": "https://btschile.com/noticias",
      "name": "Noticias BTS Chile",
      "description": "Las últimas noticias de BTS en Chile y el mundo: actualizaciones oficiales, fechas de conciertos, nuevas canciones y más.",
      "inLanguage": "es-CL",
      "about": [{"@type": "Thing", "name": "BTS"}, {"@type": "Thing", "name": "K-pop"}, {"@type": "Thing", "name": "Conciertos Chile"}],
      "publisher": {"@type": "Organization", "name": "BTS Chile", "url": "https://btschile.com", "logo": {"@type": "ImageObject", "url": "https://btschile.com/logo.png", "width": 512, "height": 512}},
      "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio",   "item": "https://btschile.com"},
        {"@type": "ListItem", "position": 2, "name": "Noticias", "item": "https://btschile.com/noticias"}
      ]}
    }
  ]
}
```

---

### 15.5 Página /noticias/[slug] — JSON-LD (NewsArticle)

**Añadido v3:** `author` con `url`, `wordCount`, `thumbnailUrl`, `dateModified`. `NewsArticle` es
elegible para Article/Top Stories (Google evalúa elegibilidad).

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsArticle",
      "@id": "https://btschile.com/noticias/[slug]#article",
      "headline": "[Título del artículo — máx 110 chars]",
      "description": "[Extracto — máx 160 chars]",
      "articleBody": "[Contenido sin HTML]",
      "wordCount": "[nº de palabras]",
      "image": {"@type": "ImageObject", "url": "[URL imagen 1200x630]", "width": 1200, "height": 630, "caption": "[Alt text]"},
      "thumbnailUrl": "[URL imagen destacada]",
      "datePublished": "[publishedAt ISO8601, ej: 2026-07-10T14:00:00-03:00]",
      "dateModified": "[updatedAt ISO8601]",
      "author": {"@type": "Organization", "name": "BTS Chile", "url": "https://btschile.com"},
      "publisher": {"@type": "Organization", "name": "BTS Chile", "url": "https://btschile.com", "logo": {"@type": "ImageObject", "url": "https://btschile.com/logo.png", "width": 512, "height": 512}},
      "mainEntityOfPage": {"@type": "WebPage", "@id": "https://btschile.com/noticias/[slug]"},
      "keywords": "[tags separados por coma]",
      "articleSection": "[categoría del artículo]",
      "inLanguage": "es-CL",
      "isPartOf": {"@id": "https://btschile.com/noticias#blog"}
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio",   "item": "https://btschile.com"},
        {"@type": "ListItem", "position": 2, "name": "Noticias", "item": "https://btschile.com/noticias"},
        {"@type": "ListItem", "position": 3, "name": "[Título truncado]", "item": "https://btschile.com/noticias/[slug]"}
      ]
    }
  ]
}
```
> Obligatorios de `NewsArticle` (Google): `headline`, `image`, `datePublished`. Recomendados: `author`,
> `publisher.logo`, `dateModified`.

---

### 15.6 Página /comunidad y /comunidad/[postId] — JSON-LD (DiscussionForumPosting)

**Por qué importa:** Google soporta `DiscussionForumPosting` (rich result de foros). El contenedor
`/comunidad` se declara como `CollectionPage`; cada post como `DiscussionForumPosting` con **`author`
(Person, requerido)**, **`datePublished` (requerido)** e `interactionStatistic`.

**JSON-LD de `/comunidad`:**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://btschile.com/comunidad#page",
      "url": "https://btschile.com/comunidad",
      "name": "Comunidad ARMY Chile — Foro Fans BTS | btschile.com",
      "description": "El foro oficial de fans de BTS en Chile. Comparte fan art, teorías, fotos y opiniones con miles de ARMY chilenas.",
      "inLanguage": "es-CL",
      "isPartOf": {"@id": "https://btschile.com/#website"},
      "about": [{"@type": "Thing", "name": "BTS"}, {"@type": "Thing", "name": "ARMY Chile"}, {"@type": "Thing", "name": "Fan Art BTS"}],
      "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio",    "item": "https://btschile.com"},
        {"@type": "ListItem", "position": 2, "name": "Comunidad", "item": "https://btschile.com/comunidad"}
      ]}
    }
  ]
}
```

**JSON-LD de `/comunidad/[postId]` (post individual):**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "DiscussionForumPosting",
      "@id": "https://btschile.com/comunidad/[postId]#post",
      "headline": "[Primeras 60 chars del post.content]",
      "text": "[post.content completo]",
      "url": "https://btschile.com/comunidad/[postId]",
      "datePublished": "[post.approvedAt ISO8601]",
      "dateModified": "[post.approvedAt ISO8601]",
      "inLanguage": "es-CL",
      "author": {"@type": "Person", "name": "[post.authorNickname]", "url": "https://btschile.com/perfil/[post.authorUid]", "image": "[post.authorPhotoURL]"},
      "publisher": {"@type": "Organization", "name": "BTS Chile", "url": "https://btschile.com", "logo": {"@type": "ImageObject", "url": "https://btschile.com/logo.png"}},
      "image": "[post.imageURL — si tiene]",
      "keywords": "[post.category], BTS, ARMY Chile, K-pop",
      "interactionStatistic": [
        {"@type": "InteractionCounter", "interactionType": "https://schema.org/LikeAction", "userInteractionCount": "[post.reactionCounts.total]"},
        {"@type": "InteractionCounter", "interactionType": "https://schema.org/CommentAction", "userInteractionCount": "[post.commentsCount]"}
      ],
      "mainEntityOfPage": {"@type": "WebPage", "@id": "https://btschile.com/comunidad/[postId]"}
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio",    "item": "https://btschile.com"},
        {"@type": "ListItem", "position": 2, "name": "Comunidad", "item": "https://btschile.com/comunidad"},
        {"@type": "ListItem", "position": 3, "name": "[post.content primeras 40 chars]", "item": "https://btschile.com/comunidad/[postId]"}
      ]
    }
  ]
}
```

**Implementación Next.js 16 (con null-safety):**
```typescript
// app/comunidad/[postId]/page.tsx
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { postId: string } }) {
  const snap = await getDoc(doc(db, "posts", params.postId));
  if (!snap.exists()) return {};
  const post = snap.data();
  const title = (post.content ?? "").slice(0, 60);
  return {
    title: `ARMY opina: ${title}… — Comunidad BTS Chile`,
    description: (post.content ?? "").slice(0, 160),
    openGraph: { title: `${title}… — Comunidad BTS Chile`, images: post.imageURL ? [post.imageURL] : ["https://btschile.com/og-comunidad.jpg"] },
    alternates: { canonical: `https://btschile.com/comunidad/${params.postId}` },
  };
}

export default async function PostPage({ params }: { params: { postId: string } }) {
  const snap = await getDoc(doc(db, "posts", params.postId));
  if (!snap.exists() || snap.data().status !== "approved") notFound();
  const post = snap.data();
  const published = (post.approvedAt ?? post.createdAt)?.toDate?.().toISOString() ?? new Date().toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: (post.content ?? "").slice(0, 60),
    text: post.content,
    url: `https://btschile.com/comunidad/${params.postId}`,
    datePublished: published,
    author: { "@type": "Person", name: post.authorNickname, url: `https://btschile.com/perfil/${post.authorUid}` },
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.reactionCounts?.total ?? 0 },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: post.commentsCount ?? 0 },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ... resto del componente */}
    </>
  );
}
```
> Meta tags de /comunidad: ver sección 8.5.

---

### 15.7 Página /tienda — JSON-LD (OnlineStore)

**Corrección v3:** `OnlineStore` (subtipo preciso de `Store`/`LocalBusiness` para comercio online).

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineStore",
      "@id": "https://btschile.com/tienda#store",
      "name": "Tienda BTS Chile — Merchandise Oficial",
      "url": "https://btschile.com/tienda",
      "description": "Compra merchandise oficial de BTS en Chile: camisetas, peluches, álbumes, posters y accesorios. Envío a todo Chile. Pago en cuotas.",
      "image": "https://btschile.com/og-tienda.jpg",
      "currenciesAccepted": "USD",
      "paymentAccepted": "PayPal, Mercado Pago, Transferencia Bancaria",
      "priceRange": "$5 - $200 USD",
      "areaServed": {"@type": "Country", "name": "Chile", "identifier": "CL"},
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Catálogo BTS Chile Merch",
        "itemListElement": [
          {"@type": "OfferCatalog", "name": "Ropa BTS",       "description": "Camisetas, hoodies y chaquetas con diseños de BTS"},
          {"@type": "OfferCatalog", "name": "Accesorios BTS", "description": "Llaveros, bolsas, pins y más"},
          {"@type": "OfferCatalog", "name": "Peluches BTS",   "description": "Peluches y figuras de los miembros"},
          {"@type": "OfferCatalog", "name": "Álbumes BTS",    "description": "Álbumes físicos y ediciones especiales"},
          {"@type": "OfferCatalog", "name": "Posters BTS",    "description": "Posters y decoración en distintos tamaños"}
        ]
      },
      "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://btschile.com"},
        {"@type": "ListItem", "position": 2, "name": "Tienda BTS Chile", "item": "https://btschile.com/tienda"}
      ]}
    }
  ]
}
```

---

### 15.8 Página /tienda/[slug] — JSON-LD (Product + Offer)

**Corrección v3 (crítica):** `aggregateRating` **solo se incluye si `product.reviewCount > 0`** con datos
reales de la colección `reviews`. Nunca inventar ratings (política de Google). `itemCondition` variable
para álbumes usados. `shippingDetails` y `hasMerchantReturnPolicy` incluidos (requisitos de Merchant listings).

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": "https://btschile.com/tienda/[slug]#product",
      "name": "[product.name]",
      "description": "[product.description]",
      "sku": "[product.slug]",
      "image": ["[imageURLs[0]]", "[imageURLs[1]]", "[imageURLs[2]]"],
      "brand": {"@type": "Brand", "name": "BTS"},
      "category": "[product.category en español]",
      "color": "[details.colors[0].name — si aplica]",
      "material": "[details.material — si aplica]",
      "offers": {
        "@type": "Offer",
        "@id": "https://btschile.com/tienda/[slug]#offer",
        "url": "https://btschile.com/tienda/[slug]",
        "priceCurrency": "USD",
        "price": "[product.priceUSD]",
        "priceValidUntil": "2027-12-31",
        "availability": "[product.totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock']",
        "itemCondition": "[new → NewCondition | used → UsedCondition | like_new → RefurbishedCondition]",
        "seller": {"@type": "Organization", "name": "BTS Chile", "url": "https://btschile.com"},
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {"@type": "MonetaryAmount", "value": "0", "currency": "USD"},
          "shippingDestination": {"@type": "DefinedRegion", "addressCountry": "CL"},
          "deliveryTime": {"@type": "ShippingDeliveryTime",
            "handlingTime": {"@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "DAY"},
            "transitTime": {"@type": "QuantitativeValue", "minValue": 3, "maxValue": 7, "unitCode": "DAY"}}
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "CL",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 10,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      }
      // ↓ Incluir SOLO si product.reviewCount > 0 (datos reales de `reviews`)
      // "aggregateRating": {"@type": "AggregateRating", "ratingValue": "[product.ratingAvg]", "reviewCount": "[product.reviewCount]", "bestRating": "5", "worstRating": "1"}
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio",  "item": "https://btschile.com"},
        {"@type": "ListItem", "position": 2, "name": "Tienda",  "item": "https://btschile.com/tienda"},
        {"@type": "ListItem", "position": 3, "name": "[product.name]", "item": "https://btschile.com/tienda/[slug]"}
      ]
    }
  ]
}
```
> Obligatorios de `Product`/`Offer` (Google Merchant): `name`, `image`, `offers.price`,
> `offers.priceCurrency`, `offers.availability`. Recomendados: `shippingDetails`,
> `hasMerchantReturnPolicy`, `brand`, `sku`, `aggregateRating` (real).

---

### 15.9 Página /membresia — JSON-LD NUEVO (OfferCatalog de suscripción)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://btschile.com/membresia#page",
      "url": "https://btschile.com/membresia",
      "name": "Membresía ARMY Boom v4 — Beneficios Exclusivos | btschile.com",
      "description": "Únete a la membresía ARMY Boom v4: 1 mes gratis y luego desde $1 USD/mes. Acceso anticipado a entradas, descuentos y contenido exclusivo.",
      "inLanguage": "es-CL",
      "isPartOf": {"@id": "https://btschile.com/#website"},
      "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio",    "item": "https://btschile.com"},
        {"@type": "ListItem", "position": 2, "name": "Membresía", "item": "https://btschile.com/membresia"}
      ]}
    },
    {
      "@type": "Product",
      "@id": "https://btschile.com/membresia#product",
      "name": "Membresía ARMY Boom v4",
      "description": "Suscripción a la comunidad ARMY Chile con beneficios por tier: publicar en comunidad, descuentos en tienda, acceso anticipado a entradas y contenido exclusivo.",
      "brand": {"@type": "Brand", "name": "BTS Chile"},
      "image": "https://btschile.com/og-membresia.jpg",
      "offers": [
        {"@type": "Offer", "name": "ARMY Basic",           "price": "1",  "priceCurrency": "USD", "url": "https://btschile.com/membresia", "availability": "https://schema.org/InStock", "category": "Suscripción mensual", "eligibleDuration": {"@type": "QuantitativeValue", "value": 1, "unitCode": "MON"}},
        {"@type": "Offer", "name": "ARMY Premium",         "price": "12", "priceCurrency": "USD", "url": "https://btschile.com/membresia", "availability": "https://schema.org/InStock", "category": "Suscripción mensual", "eligibleDuration": {"@type": "QuantitativeValue", "value": 1, "unitCode": "MON"}},
        {"@type": "Offer", "name": "ARMY VIP — Boom v4",    "price": "25", "priceCurrency": "USD", "url": "https://btschile.com/membresia", "availability": "https://schema.org/InStock", "category": "Suscripción mensual", "eligibleDuration": {"@type": "QuantitativeValue", "value": 1, "unitCode": "MON"}}
      ]
    }
  ]
}
```

---

### 15.10 Página /perfil/[uid] — JSON-LD NUEVO (ProfilePage)

**Por qué:** Google soporta `ProfilePage`; mejora E-E-A-T de los autores de la comunidad y puede
mostrar tarjetas de perfil. **Nota de indexación:** `/perfil` está en `disallow` por defecto (privacidad).
Si se decide exponer perfiles públicos, quitar de `disallow` y publicar solo datos públicos (nickname,
ciudad, posts aprobados). Nunca incluir email ni fecha de nacimiento en el markup.

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://btschile.com/perfil/[uid]#profile",
  "url": "https://btschile.com/perfil/[uid]",
  "dateCreated": "[user.joinedAt ISO8601]",
  "mainEntity": {
    "@type": "Person",
    "name": "[user.nickname]",
    "image": "[user.photoURL]",
    "url": "https://btschile.com/perfil/[uid]",
    "homeLocation": {"@type": "Place", "name": "[user.city], Chile"},
    "memberOf": {"@type": "Organization", "name": "BTS Chile", "url": "https://btschile.com"},
    "interactionStatistic": {"@type": "InteractionCounter", "interactionType": "https://schema.org/WriteAction", "userInteractionCount": "[user.postsCount]"}
  }
}
```

---

### 15.11 Sitemap.ts dinámico — Next.js 16

**Corrección v3:** se **elimina** `/entradas/comprar` del sitemap (es `noindex`). Se añade `/membresia`
ya presente. `/perfil` NO se incluye (privacidad).

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://btschile.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/entradas`,  lastModified: new Date(), changeFrequency: "hourly",  priority: 0.95 },
    { url: `${baseUrl}/noticias`,  lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${baseUrl}/tienda`,    lastModified: new Date(), changeFrequency: "daily",   priority: 0.80 },
    { url: `${baseUrl}/comunidad`, lastModified: new Date(), changeFrequency: "hourly",  priority: 0.75 },
    { url: `${baseUrl}/membresia`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
  ];

  const newsSnapshot = await getDocs(
    query(collection(db, "news"), where("status", "==", "published"), orderBy("publishedAt", "desc"), limit(100))
  );
  const newsPages: MetadataRoute.Sitemap = newsSnapshot.docs.map((d) => ({
    url: `${baseUrl}/noticias/${d.id}`, lastModified: d.data().updatedAt.toDate(), changeFrequency: "weekly" as const, priority: 0.7,
  }));

  const productsSnapshot = await getDocs(
    query(collection(db, "products"), where("status", "==", "published"), limit(200))
  );
  const productPages: MetadataRoute.Sitemap = productsSnapshot.docs.map((d) => ({
    url: `${baseUrl}/tienda/${d.id}`, lastModified: d.data().updatedAt.toDate(), changeFrequency: "weekly" as const, priority: 0.65,
  }));

  const postsSnapshot = await getDocs(
    query(collection(db, "posts"), where("status", "==", "approved"), orderBy("approvedAt", "desc"), limit(200))
  );
  const postPages: MetadataRoute.Sitemap = postsSnapshot.docs.map((d) => ({
    url: `${baseUrl}/comunidad/${d.id}`, lastModified: d.data().approvedAt.toDate(), changeFrequency: "monthly" as const, priority: 0.5,
  }));

  return [...staticPages, ...newsPages, ...productPages, ...postPages];
}
```

### 15.12 robots.ts — Máximo rastreo + privacidad

**Corrección v3:** `/entradas/comprar` añadido a `disallow` (checkout `noindex`).

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*",
        allow: ["/", "/entradas", "/noticias", "/tienda", "/comunidad", "/membresia"],
        disallow: ["/panel-admin", "/completar-perfil", "/perfil", "/entradas/comprar", "/api", "/buscar"] },
      { userAgent: "Googlebot",
        allow: "/",
        disallow: ["/panel-admin", "/completar-perfil", "/entradas/comprar", "/api"] },
    ],
    sitemap: "https://btschile.com/sitemap.xml",
    host: "https://btschile.com",
  };
}
```

---

## 16. ARQUITECTURA DE ARCHIVOS NEXT.JS 16

```
btschile/
├── app/
│   ├── layout.tsx                  — Layout raíz (nav glass, footer, providers, ThemeProvider)
│   ├── page.tsx                    — Home /
│   ├── entradas/
│   │   ├── page.tsx                — /entradas (ticketera)
│   │   └── comprar/page.tsx        — /entradas/comprar (checkout, noindex)
│   ├── noticias/
│   │   ├── page.tsx                — /noticias (listado)
│   │   └── [slug]/page.tsx         — /noticias/[slug] (artículo)
│   ├── tienda/
│   │   ├── page.tsx                — /tienda (catálogo)
│   │   └── [slug]/page.tsx         — /tienda/[slug] (producto + reseñas)
│   ├── comunidad/
│   │   ├── page.tsx                — /comunidad (feed)
│   │   ├── [postId]/page.tsx       — /comunidad/[postId]
│   │   └── grupos/page.tsx         — /comunidad/grupos
│   ├── membresia/page.tsx          — /membresia (pricing + botón PayPal + gancho "1 mes gratis")
│   ├── premium/page.tsx            — /premium (contenido exclusivo, gated ≥ Premium)
│   ├── api/paypal/
│   │   ├── webhook/route.ts        — Webhook PayPal (verifica firma, activa/renueva/degrada)
│   │   └── subscription/route.ts   — Guarda subscriptionID provisional tras onApprove
│   ├── perfil/[uid]/page.tsx       — /perfil/[uid]
│   ├── completar-perfil/page.tsx   — onboarding (noindex)
│   ├── buscar/page.tsx             — búsqueda interna (noindex)
│   ├── panel-admin/
│   │   ├── layout.tsx              — verifica role=admin (middleware + guard)
│   │   ├── page.tsx                — Dashboard overview
│   │   ├── usuarios/page.tsx
│   │   ├── entradas/page.tsx
│   │   ├── tienda/{page.tsx, nuevo/page.tsx, resenas/page.tsx}
│   │   ├── noticias/{page.tsx, nueva/page.tsx}
│   │   ├── moderacion/page.tsx
│   │   ├── membresias/page.tsx
│   │   ├── cumpleanos/page.tsx
│   │   ├── newsletter/page.tsx
│   │   └── sponsors/page.tsx       — Fase 2
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── layout/        Navbar.tsx · Footer.tsx · MobileMenu.tsx · ThemeToggle.tsx
│   ├── auth/          LoginModal.tsx · AuthProvider.tsx
│   ├── entradas/      StadiumMap.tsx · ZoneTable.tsx · TicketSelector.tsx · CartBar.tsx · Countdown.tsx
│   ├── tienda/        ProductCard.tsx · ProductGallery.tsx · SizeSelector.tsx · ReviewList.tsx
│   ├── comunidad/     PostCard.tsx · PostFeed.tsx · CreatePostSheet.tsx · ReactionPicker.tsx
│   ├── membresia/     PricingCards.tsx · PayPalSubscribeButton.tsx · TrialBadge.tsx
│   ├── admin/         TrialGrantForm.tsx (buscar usuario + plan + días/rango de fechas)
│   ├── noticias/      ArticleCard.tsx · ArticleContent.tsx
│   └── ui/            GlassCard.tsx · PillButton.tsx · SegmentedControl.tsx · Sheet.tsx · Modal.tsx ·
│                      Badge.tsx · Skeleton.tsx · Toast.tsx · Stepper.tsx · CountdownTimer.tsx
│
├── lib/
│   ├── firebase.ts
│   ├── firestore/     users.ts · posts.ts · news.ts · tickets.ts · orders.ts · products.ts · reviews.ts
│   └── utils/         seo.ts (helpers JSON-LD) · formatters.ts · validators.ts
│
├── functions/         — Cloud Functions: onReactionWrite, onReportWrite, onReviewWrite,
│                        birthdayEmailsDaily, orderConfirmationEmail,
│                        grantWelcomeTrial (onCreate users → 1 mes Basic gratis),
│                        grantAdminTrial (callable, valida admin → prueba por días/rango),
│                        paypalWebhook (HTTPS → activa/renueva/degrada por eventos PayPal),
│                        membershipExpiryCron (diaria → degrada a free si venció sin pago activo),
│                        membershipExpiryReminder (email 3 días antes de vencer)
├── hooks/             useAuth.ts · usePosts.ts · useCart.ts · useTheme.ts
├── types/index.ts     — Tipos TS de toda la app (incl. Review, Reaction, Sponsor…)
├── styles/globals.css — tokens de color, utilidades .glass, fuentes
├── public/            logo.png · og-*.jpg · icons/
├── next.config.ts · tailwind.config.ts · tsconfig.json · firestore.rules · firestore.indexes.json
```

---

## 17. DEPENDENCIAS Y VERSIONES

```json
{
  "dependencies": {
    "next": "^16.2.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "firebase": "^12.16.0",
    "typescript": "^5.x",
    "tailwindcss": "^4.x",
    "@tailwindcss/typography": "^0.5.x",
    "@tiptap/react": "^2.x",
    "react-hot-toast": "^2.x",
    "date-fns": "^3.x",
    "zustand": "^5.x",
    "framer-motion": "^11.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@paypal/react-paypal-js": "^8.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/react": "^19.x",
    "eslint": "^9.x",
    "eslint-config-next": "^16.x"
  },
  "engines": { "node": ">=20.0.0" }
}
```

### Variables de Entorno (`.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
NEXT_PUBLIC_SITE_URL=https://btschile.com

# PayPal (suscripciones recurrentes de membresía)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...        # Client ID (público, para el JS SDK / botón)
PAYPAL_CLIENT_SECRET=...                # Secreto (solo servidor)
PAYPAL_WEBHOOK_ID=...                   # Para verificar la firma de los webhooks
PAYPAL_ENV=live                         # "sandbox" | "live"
PAYPAL_PLAN_ID_BASIC=...                # Billing Plan $1/mes
PAYPAL_PLAN_ID_PREMIUM=...              # Billing Plan $12/mes
PAYPAL_PLAN_ID_VIP=...                  # Billing Plan $25/mes
```
> Las variables sin prefijo `NEXT_PUBLIC_` (secreto, webhook id, plan ids) **solo** se usan en el
> servidor (route handlers / Cloud Functions), nunca en el cliente.

### next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: { ppr: true }, // Partial Prerendering (Core Web Vitals)
};

export default nextConfig;
```

---

## RESUMEN EJECUTIVO

| Módulo | Prioridad | Complejidad | Impacto SEO | Impacto Revenue |
|---|---|---|---|---|
| Auth Firebase Google | P0 | Baja | — | Alto |
| /entradas (ticketera) | P0 | Media | 🔥 Muy alto | 🔥 Muy alto |
| /entradas/comprar | P0 | Media | — (noindex) | 🔥 Muy alto |
| Blog /noticias | P1 | Baja | 🔥 Muy alto | Medio |
| Panel Admin | P0 | Alta | — | 🔥 Muy alto |
| Comunidad / Red Social (6 reacciones) | P1 | Alta | Medio | Alto (retención) |
| Membresías (Basic $1, PayPal recurrente) | P1 | Media | Bajo | 🔥 Muy alto |
| Prueba gratis (bienvenida + admin) + auto-expiración | P1 | Media | — | 🔥 Muy alto (conversión) |
| /tienda (+ reseñas) | P2 | Media | Alto | Alto |
| Cumpleaños / Cloud Fn | P2 | Media | — | Medio (retención) |
| WhatsApp grupos | P2 | Baja | Medio | Bajo |
| Sponsors / Clases / Waitlist | Fase 2 | Media | Bajo | Medio |

### Checklist de "listo para desarrollo"
- [ ] Design tokens (color/tipografía/glass) implementados en `globals.css` + `tailwind.config.ts`.
- [ ] Componentes UI base (`GlassCard`, `PillButton`, `SegmentedControl`, `Sheet`, `Stepper`).
- [ ] Firestore Rules (sección 14) desplegadas + índices compuestos para las queries de 13.
- [ ] Cloud Functions: `onReactionWrite`, `onReportWrite`, `onReviewWrite`, cumpleaños, recordatorio
      de membresía, confirmación de pedido.
- [ ] Membresías: `grantWelcomeTrial` (1 mes Basic gratis a usuarios nuevos), `grantAdminTrial`
      (prueba por días/rango desde el dashboard), `membershipExpiryCron` (auto-degradar a free).
- [ ] PayPal: Product + Billing Plans ($1/$12/$25), botón de suscripción nativo, webhook con verificación
      de firma e idempotencia (`paypalEvents`), y prueba con el simulador de webhooks de PayPal.
- [ ] Reglas Firestore: campos de membresía/rol NO auto-editables por el usuario (solo admin/Functions).
- [ ] JSON-LD por página validado en **Rich Results Test** y **Schema Markup Validator**.
- [ ] `sitemap.ts` + `robots.ts` desplegados; Search Console configurado; indexación solicitada.
- [ ] `sameAs` (redes sociales) creados y enlazando al dominio.
- [ ] Core Web Vitals verificados en móvil (LCP/CLS/INP).

**Stack validado (17 de julio de 2026):** Next.js 16.2.x (Turbopack, Node 20+), Firebase JS SDK 12.16.0,
React 19, Tailwind v4.

---

*Documento preparado para el equipo de desarrollo de btschile.com — Versión 3.0, Julio 2026.*
*"Purple you, ARMY Chile 💜"*







