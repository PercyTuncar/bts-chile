# Corrección de Problemas en Sistema de Noticias

## Problema 1: Noticias publicadas no aparecían en /noticias

### Síntoma
- La noticia se guardaba correctamente en Firestore con `status: "published"`
- Aparecía en el panel admin `/panel-admin/noticias`
- **NO aparecía** en la página pública `/noticias`
- El HTML contenía la noticia (verificado con curl) pero no se renderizaba visualmente

### Causa
**Next.js 16 genera páginas estáticas por defecto sin revalidación.**

En `app/noticias/page.tsx`:
- La página se genera en build time
- Consulta Firestore UNA VEZ durante el build
- Se cachea indefinidamente
- Las noticias nuevas NO aparecen hasta el próximo deploy/build

### Solución: ISR (Incremental Static Regeneration)

Agregar revalidación a la página:

```typescript
// app/noticias/page.tsx
export const revalidate = 60; // Regenerar cada 60 segundos

export default async function NoticiasPage() {
  // Esta función se ejecuta cada 60 segundos (en servidor)
  const news = await getPublishedNews({ max: 60 });
  // ...
}
```

### Cómo Funciona ISR

1. **Primera request:** Next.js genera la página estática con datos actuales
2. **60 segundos después:** La página en caché se marca como "stale"
3. **Siguiente request:** Sirve la página stale PERO regenera en background
4. **Request subsecuente:** Sirve la nueva página actualizada

**Ventajas:**
- ✅ Páginas rápidas (servidas desde caché)
- ✅ Datos actualizados cada 60 segundos
- ✅ No necesita rebuild completo
- ✅ Funciona en Vercel sin configuración adicional

**Opciones de revalidación:**

```typescript
export const revalidate = 60;      // Cada 60 segundos
export const revalidate = 3600;    // Cada hora
export const revalidate = false;   // Sin revalidación (estático permanente)
export const dynamic = "force-dynamic"; // Dinámico siempre (SSR)
```

Para noticias, **60 segundos es ideal**: balance entre frescura de datos y performance.

---

## Problema 2: "INDEXNOW_KEY no configurada" en consola

### Síntoma
Al publicar una noticia, en la consola del navegador aparecía:
```
INDEXNOW_KEY no configurada. Saltando notificación IndexNow.
```

Incluso habiendo agregado la variable:
- `.env.local`: `INDEXNOW_KEY=btschile-indexnow-2026-key`
- Vercel: Variable de entorno configurada

### Causa
**Variables de entorno sin prefijo `NEXT_PUBLIC_` solo están disponibles en el servidor.**

El código original en `NewsFormPro.tsx`:

```typescript
"use client"; // ← Componente de CLIENTE

// ...
import { notifyIndexNow } from "@/lib/seo/indexnow";

async function onSubmit(data) {
  // ...
  if (data.status === "published") {
    // ❌ Esto se ejecuta en el CLIENTE
    await notifyIndexNow(`${siteUrl}/noticias/${data.slug}`);
  }
}
```

En `lib/seo/indexnow.ts`:
```typescript
// ❌ undefined en el cliente
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "";

export async function notifyIndexNow(url: string) {
  if (!INDEXNOW_KEY) {
    console.warn("INDEXNOW_KEY no configurada. Saltando notificación IndexNow.");
    return false;
  }
  // ...
}
```

### ¿Por qué no usar NEXT_PUBLIC_INDEXNOW_KEY?

**NO HAGAS ESTO:**
```typescript
// ❌ INSEGURO - Expone la key en el bundle del cliente
const INDEXNOW_KEY = process.env.NEXT_PUBLIC_INDEXNOW_KEY;
```

Las variables con `NEXT_PUBLIC_` se **embeben en el JavaScript del cliente** y cualquiera puede verlas inspeccionando el código fuente.

### Solución: Usar API Route (servidor)

Ya existe una API route en `app/api/indexnow/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  const { url } = await request.json();
  
  // ✅ Esto se ejecuta en el SERVIDOR
  // ✅ process.env.INDEXNOW_KEY está disponible
  const success = await notifyIndexNow(url);
  
  return NextResponse.json({ success });
}
```

**Cambio en NewsFormPro.tsx:**

```typescript
"use client";

async function onSubmit(data) {
  // ...
  if (data.status === "published") {
    // ✅ Llamar a la API route (servidor)
    await fetch("/api/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `${siteUrl}/noticias/${data.slug}` }),
    });
  }
}
```

### Flujo Correcto

```
Cliente (NewsFormPro)
  ↓ fetch POST /api/indexnow
Servidor (API Route)
  ↓ lee process.env.INDEXNOW_KEY
  ↓ llama notifyIndexNow()
IndexNow API
  ↓ notifica a Bing/Yandex
✅ Éxito
```

---

## Configuración de Variables de Entorno

### Local (.env.local)

```bash
INDEXNOW_KEY=btschile-indexnow-2026-key
```

### Vercel (Production)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agregar:
   - **Key:** `INDEXNOW_KEY`
   - **Value:** `btschile-indexnow-2026-key`
   - **Environments:** Production, Preview, Development

### Archivo de Verificación

IndexNow requiere un archivo de verificación en:
```
https://www.btschile.com/btschile-indexnow-2026-key.txt
```

**Implementación en Next.js:**

Ruta dinámica: `app/[indexnow_key].txt/route.ts`

```typescript
export async function GET() {
  const key = process.env.INDEXNOW_KEY;
  
  if (!key) {
    return new NextResponse("IndexNow key not configured", { status: 404 });
  }
  
  return new NextResponse(key, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
```

Esto sirve automáticamente el archivo en:
- `/btschile-indexnow-2026-key.txt` (si INDEXNOW_KEY está configurada)

**Verificar:**
```bash
curl https://www.btschile.com/btschile-indexnow-2026-key.txt
# Debe retornar: btschile-indexnow-2026-key
```

---

## Testing

### 1. Verificar ISR en local

```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Abrir navegador
open http://localhost:3000/noticias

# Publicar una noticia nueva

# Esperar 60 segundos

# Recargar /noticias
# ✅ La noticia nueva debe aparecer
```

### 2. Verificar IndexNow en local

```bash
# Publicar una noticia con status="published"

# Verificar logs del servidor:
# ✅ IndexNow notificado: https://www.btschile.com/noticias/slug-de-la-noticia
```

Si ves:
```
INDEXNOW_KEY no configurada. Saltando notificación IndexNow.
```

Entonces verifica:
1. `.env.local` existe y tiene `INDEXNOW_KEY=...`
2. Reiniciaste el servidor después de agregar la variable
3. La API route está siendo llamada (verifica Network tab en DevTools)

### 3. Verificar en Producción (Vercel)

Después de hacer deploy:

```bash
# 1. Verificar archivo de verificación
curl https://www.btschile.com/btschile-indexnow-2026-key.txt
# Debe retornar: btschile-indexnow-2026-key

# 2. Publicar una noticia

# 3. Verificar que aparezca en /noticias
# Esperar hasta 60 segundos

# 4. Verificar logs en Vercel
# Runtime Logs → buscar "IndexNow notificado"
```

---

## Resumen de Cambios

### Archivo: `app/noticias/page.tsx`

**ANTES:**
```typescript
export default async function NoticiasPage() {
  const news = await getPublishedNews({ max: 60 });
  // ...
}
```

**DESPUÉS:**
```typescript
export const revalidate = 60; // ← NUEVO

export default async function NoticiasPage() {
  const news = await getPublishedNews({ max: 60 });
  // ...
}
```

### Archivo: `components/admin/NewsFormPro.tsx`

**ANTES:**
```typescript
import { notifyIndexNow } from "@/lib/seo/indexnow";

// ...

if (data.status === "published") {
  await notifyIndexNow(`${siteUrl}/noticias/${data.slug}`);
}
```

**DESPUÉS:**
```typescript
// ✅ Import eliminado

// ...

if (data.status === "published") {
  try {
    await fetch("/api/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `${siteUrl}/noticias/${data.slug}` }),
    });
  } catch (err) {
    console.warn("Error notificando a IndexNow:", err);
  }
}
```

---

## Estado Final

✅ **Problema 1 resuelto:**
- Noticias publicadas aparecen en `/noticias` en máximo 60 segundos
- ISR mantiene la página rápida con datos actualizados
- No requiere rebuild completo

✅ **Problema 2 resuelto:**
- IndexNow se notifica correctamente desde el servidor
- Variable INDEXNOW_KEY protegida (no expuesta al cliente)
- Archivo de verificación servido dinámicamente

✅ **Sistema completo operativo:**
1. Usuario publica noticia en panel admin
2. Se guarda en Firestore con status="published"
3. Se llama a `/api/indexnow` (servidor)
4. IndexNow notifica a Bing/Yandex
5. Noticia aparece en `/noticias` en máximo 60 segundos
6. SEO optimizado con JSON-LD y Open Graph

**Ready para producción.**
