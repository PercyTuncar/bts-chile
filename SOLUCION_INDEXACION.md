# Solución al Error de Indexación en Google Search Console

## Problema Identificado

Google Search Console reportaba el error: **"La página no está indexada: Error de redirección"** para `https://btschile.com/entradas`.

### Causa Raíz

Había una **inconsistencia de canonicalización** entre:

1. **Vercel**: Redirige automáticamente con 308 Permanent Redirect:
   - `https://btschile.com/entradas` → `https://www.btschile.com/entradas`

2. **Código de la aplicación**: Todas las URLs canónicas apuntaban a:
   - `https://btschile.com/entradas` (sin www)

Este conflicto creaba un bucle de canonicalización que Google detectaba como "Error de redirección".

### Por qué Vercel usa www

Según la [documentación oficial de Vercel](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting):

> "We recommend using the `www` subdomain as your primary domain, with a redirect from the non-`www` domain to it. This allows the Vercel CDN more control over incoming traffic for improved reliability, speed, and security."

## Cambios Realizados

### 1. Actualización de la URL base en el código

**Archivo: `lib/utils/seo.ts`**
```typescript
// Antes:
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://btschile.com";

// Después:
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.btschile.com";
```

### 2. Actualización de variables de entorno

**Archivo: `.env.local`**
```env
# Antes:
NEXT_PUBLIC_SITE_URL=https://btschile.com

# Después:
NEXT_PUBLIC_SITE_URL=https://www.btschile.com
```

**Archivo: `.env.example`**
```env
# Antes:
NEXT_PUBLIC_SITE_URL=https://btschile.com

# Después:
NEXT_PUBLIC_SITE_URL=https://www.btschile.com
```

## Pasos para Completar la Solución

### 1. Actualizar la Variable de Entorno en Vercel

**IMPORTANTE**: Debes actualizar la variable de entorno en el panel de Vercel:

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Busca `NEXT_PUBLIC_SITE_URL`
4. Cámbiala de `https://btschile.com` a `https://www.btschile.com`
5. Aplica el cambio a **Production**, **Preview** y **Development**

### 2. Redeploy de la Aplicación

Después de actualizar la variable de entorno:

```bash
git add .
git commit -m "fix: cambiar URL canónica a www.btschile.com para resolver error de indexación en GSC"
git push origin main
```

O fuerza un redeploy desde el panel de Vercel.

### 3. Solicitar Reindexación en Google Search Console

1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Usa la herramienta de inspección de URLs
3. Ingresa: `https://www.btschile.com/entradas`
4. Haz clic en **"Solicitar indexación"**
5. Espera 2-7 días para que Google revalide la página

### 4. Verificar la Corrección

Después del deploy, verifica que todo esté correcto:

```bash
# Verificar que la URL canónica es correcta
curl -s https://www.btschile.com/entradas | grep -i "canonical"

# Debe mostrar:
# <link rel="canonical" href="https://www.btschile.com/entradas"/>
```

## Archivos Afectados Automáticamente

Estos archivos ya usan la constante `SITE_URL`, por lo que se actualizarán automáticamente:

- ✅ `app/layout.tsx` - Metadata base
- ✅ `app/entradas/page.tsx` - URLs canónicas y OpenGraph
- ✅ `app/robots.ts` - Sitemap y host
- ✅ `app/sitemap.ts` - Todas las URLs del sitemap
- ✅ Todos los archivos de páginas que usan `SITE_URL`

## Resultado Esperado

Después de estos cambios:

1. ✅ Todas las URLs canónicas apuntarán a `https://www.btschile.com/*`
2. ✅ Vercel seguirá redirigiendo `btschile.com` → `www.btschile.com`
3. ✅ Google verá consistencia: redirección → URL canónica coinciden
4. ✅ El error "Error de redirección" desaparecerá
5. ✅ La página `/entradas` se indexará correctamente

## Referencias

- [Why Google Isn't Indexing Your Next.js Site](https://yusufhansacak.medium.com/why-google-isnt-indexing-your-next-js-site-and-how-to-find-out-in-3-seconds-90048f481e49)
- [Vercel: Deploying & Redirecting Domains](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
- [Google: Error de redirección](https://support.google.com/webmasters/answer/9012289#redirect_error)

## Notas Importantes

- ⚠️ No elimines la redirección 308 de Vercel, es correcta y beneficiosa
- ⚠️ No uses ambas versiones (con y sin www) como canónicas
- ✅ La solución correcta es alinear todo el código para usar www como primaria
