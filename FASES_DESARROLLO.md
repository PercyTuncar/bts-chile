# FASES DE DESARROLLO — btschile.com

> **Documento de planificación estratégica (Fase Cero).**
> Deriva 1:1 del `PRD_BTSChile.md` (v3.1). Ordena la construcción de forma **dependencia-primero**:
> ninguna funcionalidad se construye antes de que exista aquello de lo que depende (datos → reglas →
> auth → lógica de negocio → vistas). Cada fase lista: **objetivo**, **entregables**, **referencia al
> PRD**, **dependencias** y **criterio de aceptación (Done)**.
>
> **Regla transversal (aplica a TODAS las fases):**
> - **Mock data:** todo secreto/credencial de terceros (Firebase, PayPal, plan_ids, webhook id) usa
>   valores de ejemplo en `.env.local` para que el proyecto **compile y navegue sin errores**. La lógica
>   real queda cableada; solo faltan las credenciales productivas.
> - **SEO nace con cada página:** ninguna página se da por terminada sin su `H1` único, `generateMetadata`
>   (title/description/OG/Twitter/canonical) y su bloque JSON-LD server-side (§15). Los helpers viven en
>   `lib/utils/seo.ts` desde la Fase 2.
> - **Estética Apple-Glass:** toda vista usa exclusivamente los componentes de `components/ui` y los tokens
>   del Design System (§3). Nada de estilos ad-hoc fuera del sistema.
> - **Accesibilidad AA + Core Web Vitals** (§3.3, §3.5) se validan al cerrar cada fase con UI.

---

## Mapa de dependencias (resumen visual)

```
F0 Fundación ──> F1 Design System ──> F2 Datos+Reglas+SEO base ──> F3 Auth+Usuarios
                                                                        │
        ┌───────────────────────────────────────────────────────────────┤
        v                                                                v
   F4 Cloud Functions base                                        F5 Membresías + PayPal
        │                                                                │
        └──────────────────────────┬─────────────────────────────────────┘
                                    v
                            F6 Layout & Home shell
                                    │
        ┌───────────────┬──────────┼───────────────┬───────────────┐
        v               v          v               v               v
   F7 Entradas    F9 Comunidad  F10 Noticias   F11 Tienda      (usan F2–F6)
   F8 Checkout    (6 reacciones)
        └───────────────┴──────────┴───────────────┴───────────────┘
                                    v
                     F12 Panel Admin (gobierna todas las colecciones)
                                    v
                     F13 SEO estructural (sitemap/robots/validación)
                                    v
                 F14 Cumpleaños & Newsletter ──> F15 Pulido (CWV/A11y/QA) ──> F16 Fase 2 (stubs)
```

---

## FASE 0 — Fundación del Proyecto y Compilación Limpia

**Objetivo:** un proyecto Next.js 16 que **compila y arranca** sin errores, con toda la config base y
mock data de credenciales. Cero features todavía.

**Entregables:**
- Scaffolding: `create-next-app` (TypeScript, Tailwind, App Router, Turbopack) — §2.1.
- Dependencias exactas de §17: `firebase@12.16`, `next@16.2.7`, `framer-motion`, `react-hook-form`, `zod`,
  `zustand`, `date-fns`, `react-hot-toast`, `@paypal/react-paypal-js`, `@tailwindcss/typography`,
  `@tiptap/react`.
- `next.config.ts` con `remotePatterns` (firebasestorage, googleusercontent) + `experimental.ppr: true` (§17).
- `.env.local` **con valores mock** para las 7 vars de Firebase + PayPal (client id, secret, webhook id,
  `PAYPAL_ENV=sandbox`, plan ids Basic/Premium/VIP) — §17.
- `lib/firebase.ts` (init idempotente: `db`, `auth`, `storage`, `googleProvider`) — §2.2.
- Estructura de carpetas vacía pero completa según §16 (`app/`, `components/`, `lib/`, `functions/`,
  `hooks/`, `types/`, `styles/`, `public/`).
- `tsconfig.json` con alias `@/*`.

**Dependencias:** ninguna.
**Done:** `npm run dev` y `npm run build` pasan sin errores; el sitio muestra una página en blanco/placeholder.

---

## FASE 1 — Design System "Apple-Glass Morado" + Biblioteca UI Base

**Objetivo:** materializar el sistema visual antes de cualquier pantalla, para que todas las vistas nazcan
consistentes.

**Entregables:**
- `styles/globals.css`: tokens de color (claro/oscuro) como CSS variables (§3.2.A), utilidad `.glass` y
  variantes `.glass-nav/.glass-card/.glass-modal/.glass-sheet` (§3.2.B), gradiente "aurora morada".
- `tailwind.config.ts` (v4) mapeando tokens; escala tipográfica estilo apple.com (§3.2.C); radios/grid 8px
  (§3.2.D).
- Fuentes con `next/font` self-hosted: `Inter` (UI/Display) + `Noto Sans KR`, `display: swap`, subsetting (§3.5).
- **Theming**: `hooks/useTheme.ts` + `ThemeToggle.tsx`, `prefers-color-scheme` + persistencia `localStorage` (§3.2.A).
- Respeto a `prefers-reduced-motion` como utilidad global de motion (§3.2.E).
- **Biblioteca `components/ui`** (§3.2.G): `GlassCard`, `PillButton` (primario/secundario/ghost),
  `SegmentedControl`, `Sheet` (bottom sheet móvil), `Modal` (glass, focus trap, Esc/backdrop), `Badge`,
  `Toast` (react-hot-toast glass), `Skeleton` (shimmer), `Stepper`, `CountdownTimer`.

**Dependencias:** F0.
**Done:** página de "kitchen sink" interna renderiza todos los componentes en claro/oscuro, con foco
visible (anillo morado), targets ≥44px y contraste AA. (Página de demo se elimina antes del release.)

---

## FASE 2 — Modelo de Datos, Reglas de Seguridad, Índices y SEO Base

**Objetivo:** definir la base de datos y su seguridad **antes** de construir vistas (regla del PRD: "la base
de datos debe estructurarse antes de construir las vistas").

**Entregables:**
- `types/index.ts`: tipos TS de las **13 colecciones** y subcolecciones (§13): `User`, `Post`, `Reaction`,
  `Comment`, `Report`, `News`, `Ticket`, `Order`, `Product`, `StoreOrder`, `Membership`, `PaypalEvent`,
  `Newsletter`, `WhatsappGroup`, `Raffle`, `Review`, + Fase 2 (`Sponsor`, `Waitlist`, `Class`). Incluye
  enums de `membershipType`/`membershipStatus`/`membershipSource`, categorías, estados de orden, etc.
- `lib/firestore/*`: helpers de acceso por colección (`users.ts`, `posts.ts`, `news.ts`, `tickets.ts`,
  `orders.ts`, `products.ts`, `reviews.ts`) — solo lecturas/escrituras tipadas, sin UI (§16).
- `firestore.rules`: reglas **exactas** de §14.1 (funciones `isAdmin()`, `membership()`,
  `membershipFieldsUnchanged()`; endurecimiento anti-escalada de privilegios; `paypalEvents` bloqueado a cliente).
- `firestore.indexes.json`: índices compuestos para las queries críticas (§13.1): cumpleaños
  (`birthMonth`+`birthDay`), `membershipType != free` + `membershipExpiry`, `role == admin`, feeds por
  `status`+fecha, news/products/posts publicados por fecha.
- `lib/utils/seo.ts`: helpers para inyectar JSON-LD server-side (`<script type="application/ld+json">`),
  builders de `BreadcrumbList`, `Organization`, etc. (§15 nota técnica).
- `lib/utils/formatters.ts` (precios USD, fechas `America/Santiago`, tiempo relativo) y `validators.ts`
  (esquemas zod reutilizables).

**Dependencias:** F0 (F1 en paralelo).
**Done:** reglas e índices compilan/despliegan contra el emulador; tipos sin errores; helper SEO produce
JSON-LD válido en un test manual.

---

## FASE 3 — Autenticación Google + Usuarios + Onboarding

**Objetivo:** identidad y perfil, prerequisito de todo lo social, transaccional y de membresía.

**Entregables:**
- `components/auth/AuthProvider.tsx` (React Context + Zustand) + `hooks/useAuth.ts`; carga `users/{uid}` al
  estado global; `onSnapshot` sobre el propio doc para refrescar membresía en vivo (§4.1, §10.4).
- `LoginModal.tsx`: modal glass / bottom sheet, botón oficial Google, `signInWithPopup`,
  `setPersistence(browserLocalPersistence)`, focus trap, Esc/backdrop (§4.1).
- Flujo nuevo usuario → `/completar-perfil` (`noindex`): DatePicker `birthDate` (obligatorio), nickname,
  país/ciudad, foto (Google o upload a `Storage/avatars/{uid}`); onboarding tipo iOS con `Stepper`; al
  guardar crea `users/{uid}` con esquema §13.1 (incl. `birthMonth`/`birthDay` derivados) (§4.2).
- Usuario existente → redirect al origen o `/`; cierre de sesión desde menú avatar (§4.1).
- `/perfil/[uid]`: cabecera glass, avatar con anillo, badges de membresía (etiqueta "Prueba" si `isTrial`,
  🎂 el día de cumpleaños), grid de posts aprobados, botón editar solo dueño; JSON-LD `ProfilePage` (§4.2,
  §15.10) — recordando `disallow` de `/perfil` por privacidad (§15.12).

**Dependencias:** F1, F2.
**Done:** login/logout funciona; usuario nuevo completa perfil y se crea su doc con reglas respetadas;
perfil renderiza con su JSON-LD.

---

## FASE 4 — Cloud Functions Base (lógica servidor no manipulable)

**Objetivo:** dejar operativa la lógica de servidor de la que dependen membresías y contadores, antes de
las vistas que la consumen. Con mock de credenciales de email/PayPal.

**Entregables (`functions/`, 2nd gen):**
- `grantWelcomeTrial` — trigger `onCreate` de `users/{uid}`: si `!hasUsedWelcomeTrial`, otorga 1 mes de
  ARMY Basic (`membershipExpiry = joinedAt + 30d` server-side, zona `America/Santiago`),
  `membershipSource: "welcome_trial"`, `isTrial: true`, `hasUsedWelcomeTrial: true`; registra en
  `memberships` (§4.2, §10.3).
- `onReactionWrite` — recalcula `posts/{postId}.reactionCounts` (§8.1.A, §13.2).
- `onReportWrite` — recalcula `reportCount`/`isReported` (§8.2, §13.2).
- `onReviewWrite` — actualiza `products/{slug}.ratingAvg`/`reviewCount` (solo `approved`) (§13.12).
- `membershipExpiryCron` — diaria 00:15 `America/Santiago`: degrada a `free` a vencidos sin PayPal activo (§10.6).
- `membershipExpiryReminder` — email 3 días antes de vencer (§10.6).
- `birthdayEmailsDaily` — 08:00 Chile, query cumpleaños + Trigger Email (§4.6).
- `orderConfirmationEmail` — email de confirmación de pedido (§6.1).

**Dependencias:** F2, F3.
**Done:** funciones desplegadas en emulador; crear un usuario dispara `grantWelcomeTrial` y se refleja en su
doc; los contadores se recalculan al escribir reacciones/reportes de prueba.

---

## FASE 5 — Sistema de Membresías + PayPal Recurrente

**Objetivo:** el motor de ingresos recurrentes y la puerta que habilita publicar en comunidad.

**Entregables:**
- `/membresia`: pricing estilo Apple (3–4 cards glass, tier recomendado con glow + "Popular", toggle
  mensual/anual con `SegmentedControl`), beneficios por tier, tabla comparativa; gancho visible "1 mes
  gratis" y "$1 USD/mes"; JSON-LD OfferCatalog (§10.1–10.2, §10.7–10.8, §15.9).
- `components/membresia/PayPalSubscribeButton.tsx` (`@paypal/react-paypal-js`): `createSubscription({plan_id})`,
  `user_action: SUBSCRIBE_NOW`, `custom_id = uid`; `onApprove` → POST interno (§10.5).
- `app/api/paypal/subscription/route.ts`: guarda `paypalSubscriptionId` + `membershipStatus: "pending"`
  provisional (§10.5).
- `app/api/paypal/webhook/route.ts` (o Cloud Function HTTPS): verificación de firma con `PAYPAL_WEBHOOK_ID`,
  **idempotencia vía `paypalEvents`**, mapeo `subscriptionID→uid`, acciones por evento (ACTIVATED,
  PAYMENT.SALE.COMPLETED, PAYMENT.FAILED, SUSPENDED, CANCELLED/EXPIRED) sobre `users/{uid}`, log en
  `memberships` (§10.5, §13.8.A).
- `TrialBadge.tsx`: "Prueba ARMY Basic — quedan X días" + CTA "$1/mes" (§10.3).
- Método de respaldo (transferencia manual): activación manual desde admin (`membershipSource: "manual"`) (§10.5).

**Dependencias:** F3, F4. (Credenciales PayPal = mock; el flujo queda cableado y verificable con el
simulador de webhooks.)
**Done:** botón PayPal renderiza en sandbox mock; webhook procesa eventos simulados con idempotencia y
actualiza la membresía; el trial se muestra y degrada correctamente.

---

## FASE 6 — Layout Global, Navegación y Home Shell

**Objetivo:** el chasis compartido (navbar/footer/menú/tema) e internal linking base para SEO/sitelinks.

**Entregables:**
- `app/layout.tsx`: providers (Auth, Theme, Toast), navbar glass sticky, footer glass con **todos** los
  enlaces del menú con anchor descriptivo (internal linking, §3.4).
- `components/layout/`: `Navbar.tsx` (CTA "Entradas" pill), `Footer.tsx`, `MobileMenu.tsx` (sheet),
  `ThemeToggle.tsx` (§3.1, §3.3).
- Home `/`: hero aurora morada + `CountdownTimer` + partículas 💜 (parallax sutil, reduced-motion),
  secciones full-bleed (Evento/teaser mapa, preview comunidad, tienda destacada, mini pricing, últimas 3
  noticias), reveal en scroll; JSON-LD `@graph` completo del Home (WebSite, Organization, WebPage,
  ItemList/SiteNavigationElement, MusicEvent) + meta tags (§15.1).

**Dependencias:** F1, F2, F3. (Las secciones que consumen datos aún vacíos usan Skeleton/estado vacío.)
**Done:** navegación entre rutas funciona; Home valida su JSON-LD en Rich Results Test; sticky/tema/mobile OK.

---

## FASE 7 — Ticketera `/entradas`

**Objetivo:** la página de mayor impacto SEO y revenue (P0).

**Entregables:**
- Colección `tickets` (16 zonas §5.2/§13.4) con `paymentLinks`, `mapCoordinates`, `availableDates`.
- Secciones §5.2: hero + countdown + badges; info del evento; **mapa SVG interactivo** del Estadio Nacional
  (zonas por disponibilidad 🟢🟡🔴, tooltip glass, cada zona `<button>` con `aria-label`, teclado);
  `SegmentedControl` de fecha; tabla de zonas/precios (números tabulares); selector cantidad (máx 3) y
  cuotas; mini-carrito flotante sticky; acordeón FAQ (8 preguntas **visibles** = las del JSON-LD); banner
  newsletter (`source: "entradas_banner"`).
- `components/entradas/`: `StadiumMap`, `ZoneTable`, `TicketSelector`, `CartBar`, `Countdown`.
- SEO: H1 único, meta tags (§5.4) y JSON-LD completo (EventSeries + 2 MusicEvent + 16 Offers + Breadcrumb +
  FAQPage) (§15.2).

**Dependencias:** F2, F6.
**Done:** admin (temporal/seed) puede poblar zonas; el mapa selecciona zona y sincroniza el selector; JSON-LD
del evento válido; FAQ visible coincide con el markup.

---

## FASE 8 — Checkout `/entradas/comprar`

**Objetivo:** convertir la selección en un pedido, con la matemática canónica del PRD.

**Entregables:**
- Guard de login (modal Google si no autenticado) (§6.1).
- `Stepper` de 4 pasos en `GlassCard`, resumen sticky que recalcula en vivo con la **fórmula canónica**:
  `serviceFee = round(subtotal×0.10,2)`, cuotas sobre el TOTAL (§6.1).
- Paso 2 datos comprador pre-rellenados (nombre, RUT/pasaporte, email, teléfono) con react-hook-form + zod.
- Paso 3 método de pago (PayPal/MercadoPago/transferencia/efectivo) como tarjetas glass; selección de link
  correcto desde `tickets/{zoneId}.paymentLinks` según método+cuotas (§6.1).
- Paso 4 confirmación + checkbox mercado secundario → crea `orders/{orderId}` (`pending_payment`) y abre link
  externo en nueva pestaña (§6.1, §13.5).
- SEO: `noindex, follow`; excluida de sitemap y añadida a robots disallow; JSON-LD informativo `Service`/
  `WebPage` sin datos personales (§6.3, §15.3, §15.11, §15.12).

**Dependencias:** F3, F7.
**Done:** un pedido de prueba se crea con totales/cuotas correctos y `status: pending_payment`; página marcada
`noindex`.

---

## FASE 9 — Comunidad / Red Social (sistema de 6 reacciones)

**Objetivo:** retención; requiere Auth + membresía (F3/F5) + Cloud Functions de contadores (F4).

**Entregables:**
- Colección `posts` + subcolecciones `reactions/{uid}`, `comments/{commentId}`, `reports/{uid}` (§13.2).
- `/comunidad`: header con stats y "+ Publicar" (solo membresía ≥ Basic; Free ve CTA a `/membresia`); feed
  de `GlassCard` (`onSnapshot`, límite 20 + "Cargar más"); tabs de categoría; sidebar (ARMY del mes,
  eventos, grupos, banner membresía) (§8.1).
- **Sistema de 6 reacciones** (`ReactionPicker.tsx`): picker flotante glass, toggle/reemplazo, bounce,
  top-3 + total, accesible (`role="menu"`, flechas, `aria-pressed`) (§8.1.A).
- `CreatePostSheet.tsx`: bottom sheet glass, texto ≤500 (contador), upload imagen ≤5MB →
  `Storage/community/{uid}/{ts}`, categorías; crea post `status: pending` (§4.3).
- `/comunidad/[postId]`: reacciones expandidas, comentarios (≤200), botón reporte →
  `posts/{postId}/reports/{uid}`, compartir, breadcrumb; JSON-LD `DiscussionForumPosting` +
  `CollectionPage` (§8.2, §15.6).
- `/comunidad/grupos`: CRUD-consumo de `whatsappGroups` (grid glass por región, QR en modal) (§4.4, §13.10).
- `components/comunidad/`: `PostCard`, `PostFeed`, `CreatePostSheet`, `ReactionPicker`; `hooks/usePosts.ts`.

**Dependencias:** F3, F4, F5, F6.
**Done:** publicar exige membresía; reacciones actualizan contadores en tiempo real; post individual válido
en Rich Results; reportes registran y notifican.

---

## FASE 10 — Blog `/noticias`

**Objetivo:** alto impacto SEO (P1), autónomo respecto a otras colecciones.

**Entregables:**
- Colección `news` (§13.3).
- `/noticias`: portada editorial estilo Apple Newsroom, tabs de categoría, grid de tarjetas, destacado en
  banner, búsqueda interna Firestore básica; JSON-LD `Blog` (§9.2, §9.4, §15.4).
- `/noticias/[slug]`: columna de lectura (`@tailwindcss/typography`), imagen destacada, badge Admin, fecha,
  relacionados, barra de progreso; JSON-LD `NewsArticle` + Breadcrumb, OG `type=article` (§9.3, §9.5, §15.5).
- `components/noticias/`: `ArticleCard`, `ArticleContent`.

**Dependencias:** F2, F6. (Creación de contenido vive en el admin, F12; aquí se consume.)
**Done:** listado y artículo renderizan con SEO; artículo válido para Article rich result.

---

## FASE 11 — Tienda `/tienda` + Reseñas

**Objetivo:** e-commerce de merch con página de producto estilo Apple (P2, pero dependencias listas).

**Entregables:**
- Colecciones `products` (6 categorías con `details` dinámicos §13.6), `storeOrders` (§13.7), `reviews` (§13.12).
- `/tienda`: hero destacados (carrusel), filtros (categoría/precio/novedad/más vendido), grid glass, badges
  NUEVO/AGOTADO; JSON-LD `OnlineStore` (§7.3, §15.7).
- `/tienda/[slug]`: galería con zoom/thumbnails, `SegmentedControl` talla/color, sticky buy bar, descuento de
  membresía (precio tachado + badge tier), **sección de reseñas** (`ReviewList`), "Agregar al carrito";
  carrito persistente `localStorage` (`hooks/useCart.ts`); JSON-LD `Product+Offer` con `shippingDetails`/
  `hasMerchantReturnPolicy` y `aggregateRating` **solo si `reviewCount>0`** (§7.5, §15.8).
- Checkout de tienda reutilizando el flujo de links de pago (§7.1) → `storeOrders`.
- `components/tienda/`: `ProductCard`, `ProductGallery`, `SizeSelector`, `ReviewList`.

**Dependencias:** F3, F4 (`onReviewWrite`), F6.
**Done:** producto renderiza por categoría; reseña aprobada actualiza rating; JSON-LD de producto válido sin
inventar ratings.

---

## FASE 12 — Panel Admin Dashboard `/panel-admin`

**Objetivo:** gobierno de todas las colecciones (P0); se construye tras existir las colecciones que gestiona.

**Entregables:**
- Protección: middleware Next + guard `role == "admin"` + reglas Firestore; ruta `noindex` (§11).
- `layout.tsx` con sidebar glass; secciones (§11.1):
  - **Overview** (KPIs, badges de pendientes, cumpleaños, actividad).
  - **Usuarios** (tabla, filtros, cambiar rol/membresía, desactivar, export CSV).
  - **Entradas** (zonas: stock/precio/links de pago; pedidos; subir ticket; cambio de estado).
  - **Tienda** (`nuevo` con formulario dinámico por categoría; editar/archivar; `resenas` moderación).
  - **Noticias** (`nueva` con Tiptap; borradores; programar; archivar).
  - **Moderación** (pendientes/aprobados/rechazados/reportados; aprobar/rechazar con razón; grupos WhatsApp).
  - **Membresías** (activas/vencidas/por vencer; estado PayPal; activación manual; **"Pruebas Gratuitas"**
    con `TrialGrantForm.tsx`: buscar usuario, plan, días **o** rango de fechas → Callable `grantAdminTrial`,
    tabla de pruebas activas con revocar) (§10.4, §11.1).
  - **Cumpleaños** (calendario glass del mes).
  - **Newsletter** (lista + export CSV).
- Callable Cloud Function `grantAdminTrial` (valida `role == admin`, escribe membresía + `memberships`) (§10.4).
- `components/admin/`: `TrialGrantForm.tsx`.

**Dependencias:** F3–F11 (gestiona sus colecciones).
**Done:** admin puede crear/moderar contenido de cada módulo; otorgar/revocar pruebas; no-admin es bloqueado
por middleware y reglas.

---

## FASE 13 — SEO Estructural, Sitemap y Robots

**Objetivo:** cerrar la capa SEO transversal y validar todo el structured data (los JSON-LD por página ya se
hicieron en cada fase; aquí se consolidan y validan).

**Entregables:**
- `app/sitemap.ts` dinámico (estáticas + news/products/posts publicados; **sin** `/entradas/comprar` ni
  `/perfil`) (§15.11).
- `app/robots.ts` (allow rutas prioritarias; disallow `/panel-admin`, `/completar-perfil`, `/perfil`,
  `/entradas/comprar`, `/api`, `/buscar`) (§15.12).
- Auditoría de internal linking (header/footer, anchor descriptivo) y `sameAs` (§3.4).
- Validación de **cada** JSON-LD en Rich Results Test + Schema Markup Validator (§15 reglas de oro).
- Página `/buscar` (UX interna, `noindex`) (§3.4).

**Dependencias:** F6–F12.
**Done:** sitemap/robots servidos correctamente; todos los bloques JSON-LD válidos; checklist SEO del PRD
cubierto.

---

## FASE 14 — Cumpleaños & Newsletter (cierre de retención)

**Objetivo:** completar los ganchos de marketing/retención.

**Entregables:**
- Integración Firebase Extension "Trigger Email" (mock config) para `birthdayEmailsDaily` y correos de
  membresía/pedido (§4.6, §10.6).
- Badge 🎂 en perfil el día del cumpleaños; vista admin de cumpleaños del mes (§4.6, §11.1).
- Colección `newsletter` con `source` (footer/entradas_banner/comunidad) y export CSV en admin (§13.9, §11.1).

**Dependencias:** F3, F4, F12.
**Done:** suscripción a newsletter persiste con su `source`; emails de cumpleaños se disparan en emulador.

---

## FASE 15 — Pulido: Core Web Vitals, Accesibilidad y QA

**Objetivo:** cumplir metas de rendimiento/accesibilidad y dejar el producto "listo para desarrollo/deploy".

**Entregables:**
- Core Web Vitals móvil p75: LCP < 2.5s, CLS < 0.1, INP < 200ms (`next/image` con `sizes`/`priority` solo en
  LCP, skeletons que reservan espacio, PPR, `next/font`, diferir JS) (§3.5).
- Accesibilidad WCAG 2.1 AA: alt text, foco visible, targets ≥44px, teclado en modales/sheets/picker,
  `aria-*`, contraste AA sobre glass (§3.3).
- Estados vacíos y de error cuidados en todas las listas; toasts glass; skeletons shimmer (§3.3).
- Repaso del checklist "listo para desarrollo" del PRD (§Resumen ejecutivo).

**Dependencias:** todas las anteriores con UI.
**Done:** checklist del PRD marcado; auditoría Lighthouse móvil dentro de metas.

---

## FASE 16 — Fase 2 (stubs preparados, no activos)

**Objetivo:** dejar la arquitectura lista para lo diferido, sin construir features completas.

**Entregables (esquema mínimo §13.13, §12):**
- Colecciones `sponsors`, `waitlist`, `classes`, `raffles` (+ subcolección tickets) con tipos y reglas.
- `/panel-admin/sponsors` (CRUD básico de banners).
- Placeholders de `/clases`, lista de espera premium y sorteos, cableados pero ocultos/flag-off.

**Dependencias:** F2, F12.
**Done:** colecciones y reglas existen; el resto del sitio no se rompe; features marcadas como Fase 2.

---

## Trazabilidad PRD → Fase (checklist maestro)

| Ítem del PRD | Fase |
|---|---|
| Stack, config, `.env` mock, `next.config` (§2, §17) | F0 |
| Design System, `.glass`, UI lib, tema (§3) | F1 |
| Modelo Firestore, reglas, índices, tipos, seo.ts (§13, §14) | F2 |
| Auth Google, perfil, onboarding, `/perfil` (§4.1–4.2, §15.10) | F3 |
| Cloud Functions (reacciones, reportes, reseñas, trial bienvenida, expiración, cumpleaños, pedidos) (§4.6, §10.3, §10.6, §13) | F4 |
| Membresías, PayPal SDK + webhook + idempotencia, `/membresia` (§10, §15.9) | F5 |
| Layout, navbar/footer, Home + JSON-LD (§3.1, §15.1) | F6 |
| `/entradas` mapa/zonas/carrito/FAQ + JSON-LD (§5, §15.2) | F7 |
| `/entradas/comprar` fórmula/orders/noindex (§6, §15.3) | F8 |
| Comunidad, 6 reacciones, comentarios, reportes, grupos (§4.3–4.4, §8, §15.6) | F9 |
| `/noticias` listado y artículo (§9, §15.4–15.5) | F10 |
| `/tienda` + producto + reseñas (§7, §15.7–15.8) | F11 |
| Panel Admin completo + `grantAdminTrial` (§11, §10.4) | F12 |
| Sitemap, robots, validación SEO, `/buscar` (§15.11–15.12, §3.4) | F13 |
| Cumpleaños + newsletter (§4.6, §13.9) | F14 |
| Core Web Vitals, A11y, QA (§3.3, §3.5) | F15 |
| Sponsors/Waitlist/Classes/Raffles (§12, §13.13) | F16 |

---

*Planificación Fase Cero — btschile.com. Pendiente de aprobación antes de codificar vistas. "Purple you, ARMY Chile 💜"*
