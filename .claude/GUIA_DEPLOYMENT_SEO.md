# GUÍA DE DEPLOYMENT Y VERIFICACIÓN SEO - BTS CHILE

## ✅ BUILD EXITOSO

El proyecto compila correctamente con todas las mejoras SEO implementadas.

```
Route (app)                      Revalidate  Expire
├ ○ /                            -           1y       (Home - SEO optimizado)
├ ○ /entradas                    -           1y       (Entradas - SEO optimizado)
├ ○ /noticias                    1m          1y       (Noticias - ISR 60s)
├ ○ /rss.xml                     1h          1y       (RSS Feed - NUEVO)
├ ○ /sitemap.xml                 1h          1y       (Sitemap - mejorado)
└ ƒ /noticias/[slug]                                  (Artículos - SEO optimizado)
```

---

## 🚀 PASOS PARA DEPLOYMENT

### 1. Variables de Entorno (Producción)

Agrega estas variables en tu plataforma de hosting (Vercel/Netlify/etc):

```env
# SEO - Site URL (CRÍTICO)
NEXT_PUBLIC_SITE_URL=https://www.btschile.com

# SEO - Site Verification (Opcional pero recomendado)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=tu-codigo-google-aqui
NEXT_PUBLIC_BING_VERIFICATION=tu-codigo-bing-aqui
NEXT_PUBLIC_YANDEX_VERIFICATION=tu-codigo-yandex-aqui

# Firebase (ya deberías tenerlas)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... resto de Firebase config
```

#### ¿Cómo obtener códigos de verificación?

**Google Search Console:**
1. Ve a https://search.google.com/search-console
2. Agrega propiedad → URL prefix: https://www.btschile.com
3. Método de verificación: "HTML tag"
4. Copia el código: `<meta name="google-site-verification" content="ABC123..."/>`
5. Usa solo el valor `ABC123...` en la variable de entorno

**Bing Webmaster Tools:**
1. Ve a https://www.bing.com/webmasters
2. Agregar sitio → Verificar con meta tag
3. Copia el código y úsalo en NEXT_PUBLIC_BING_VERIFICATION

---

### 2. Reemplazar Imágenes Placeholder

**ANTES DE DEPLOY A PRODUCCIÓN**, reemplaza los placeholders:

```bash
/public/og-home.jpg          (1200x630px) - Imagen principal OG
/public/og-entradas.jpg      (1200x630px) - Para página de entradas
/public/og-noticias.jpg      (1200x630px) - Para página de noticias
/public/logo-600x60.png      (600x60px)   - CRÍTICO para Google News
/public/logo.png             (512x512px)  - Para Organization schema
```

Ver instrucciones detalladas en: `.claude/IMAGENES_SEO_INSTRUCCIONES.md`

**Herramientas rápidas:**
- Canva: https://www.canva.com/ (plantilla "Facebook Post" = 1200x630)
- Figma: https://www.figma.com/
- Adobe Express: https://www.adobe.com/express/

**Colores de marca:**
- Brand Purple: `#8b2fc9`
- Background Light: `#fafafc`
- Background Dark: `#0f0f14`

---

### 3. Deploy a Producción

#### Si usas Vercel:
```bash
# Desde la raíz del proyecto
vercel --prod

# O push a main y Vercel auto-deploya
git add .
git commit -m "feat: SEO optimization complete - 45+ improvements"
git push origin main
```

#### Si usas otro hosting:
```bash
npm run build
# Luego sube la carpeta .next/ según tu plataforma
```

---

## 🔍 VERIFICACIÓN POST-DEPLOYMENT

### PASO 1: Validar Estructura HTML

Abre tu sitio en producción y verifica:

1. **Home**: https://www.btschile.com
   - Ver código fuente (Ctrl+U)
   - Buscar `<script type="application/ld+json">` → Debe haber varios bloques JSON-LD
   - Verificar que `<meta property="og:image"` apunta a tu imagen OG
   - Verificar `<link rel="alternate" type="application/rss+xml"`

2. **Entradas**: https://www.btschile.com/entradas
   - Ver código fuente
   - Buscar EventSeries schema
   - Verificar AggregateOffer con precios

3. **Noticias**: https://www.btschile.com/noticias
   - Ver código fuente
   - Buscar Blog schema

4. **Artículo individual**: https://www.btschile.com/noticias/[cualquier-slug]
   - Ver código fuente
   - Buscar NewsArticle schema
   - Verificar datePublished tiene timezone

---

### PASO 2: Validadores Oficiales

#### Google Rich Results Test
1. Ve a: https://search.google.com/test/rich-results
2. Pega cada URL:
   - https://www.btschile.com
   - https://www.btschile.com/entradas
   - https://www.btschile.com/noticias
3. Click "Test URL"
4. Espera resultados → Debe mostrar:
   - ✅ Organization
   - ✅ WebSite
   - ✅ Event/EventSeries
   - ✅ FAQPage
   - ✅ BreadcrumbList

**Si hay errores:** Copia el JSON-LD y pégalo en https://validator.schema.org/

#### Facebook Sharing Debugger
1. Ve a: https://developers.facebook.com/tools/debug/
2. Pega: https://www.btschile.com
3. Click "Debug"
4. Verifica:
   - ✅ Imagen OG se muestra (1200x630)
   - ✅ Título correcto
   - ✅ Descripción correcta
5. Si la imagen no aparece: Click "Scrape Again"

#### Twitter Card Validator
1. Ve a: https://cards-dev.twitter.com/validator
2. Pega: https://www.btschile.com
3. Verifica preview de card

#### LinkedIn Post Inspector
1. Ve a: https://www.linkedin.com/post-inspector/
2. Pega: https://www.btschile.com
3. Verifica preview

---

### PASO 3: Google Search Console

#### Enviar Sitemap
1. Ve a: https://search.google.com/search-console
2. Sitemaps → "Add a new sitemap"
3. Agrega:
   - `sitemap.xml`
   - `news-sitemap.xml`
4. Click "Submit"

#### Solicitar Indexación
1. En Search Console → URL Inspection
2. Ingresa:
   - https://www.btschile.com
   - https://www.btschile.com/entradas
   - https://www.btschile.com/noticias
3. Click "Request Indexing" en cada una

#### Monitorear Cobertura
- Ve a: Coverage → espera 24-48 horas
- Debe mostrar páginas indexadas sin errores

---

### PASO 4: PageSpeed Insights

1. Ve a: https://pagespeed.web.dev/
2. Analiza: https://www.btschile.com
3. Verifica móvil y desktop
4. **Objetivos Core Web Vitals:**
   - LCP (Largest Contentful Paint): < 2.5s ✅
   - FID (First Input Delay): < 100ms ✅
   - CLS (Cumulative Layout Shift): < 0.1 ✅

Si hay problemas:
- Optimizar imágenes (WebP/AVIF)
- Activar PPR cuando refactorices
- Verificar preload de recursos críticos

---

### PASO 5: Verificar RSS Feed

1. Abre: https://www.btschile.com/rss.xml
2. Debe mostrar XML válido con últimas 50 noticias
3. Validar con: https://validator.w3.org/feed/
4. Suscríbete en Feedly para probar: https://feedly.com/

---

## 📊 MONITOREO CONTINUO

### Google Search Console (diario/semanal)

Métricas clave a seguir:

1. **Performance**
   - Impresiones totales (tendencia ↗)
   - Clicks totales (tendencia ↗)
   - CTR promedio (objetivo: >3%)
   - Posición promedio (objetivo: <10)

2. **Queries principales** (objetivo ranking):
   - "bts chile" → Top 3
   - "entradas bts chile" → Top 1
   - "bts chile 2026" → Top 1
   - "concierto bts chile" → Top 3
   - "bts estadio nacional" → Top 5

3. **Pages** con más impresiones:
   - /entradas debe tener alto CTR
   - /noticias debe crecer en impresiones

4. **Coverage**
   - Páginas válidas sin errores
   - Si hay "Excluded": investigar por qué

---

### Google Analytics 4 (configurar)

```bash
# Instalar
npm install @next/third-parties

# Agregar en app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

// En el <body>
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

Métricas a seguir:
- Sesiones orgánicas (Google Search)
- Tasa de rebote por página
- Conversiones (compras de entradas)
- Páginas más visitadas

---

### Herramientas adicionales (opcional)

**Ahrefs / SEMrush / Ubersuggest:**
- Tracking de rankings por keyword
- Análisis de backlinks
- Competencia (otros sitios BTS Chile)

**Google Trends:**
- Monitorear volumen de búsqueda "bts chile"
- Ajustar contenido según tendencias

---

## 🎯 KPIs DE ÉXITO (30 días)

### Objetivos realistas primer mes:

| Métrica | Baseline | Objetivo 30d | Objetivo 90d |
|---------|----------|--------------|--------------|
| Impresiones GSC | 0 | 5,000+ | 50,000+ |
| Clicks orgánicos | 0 | 200+ | 2,000+ |
| CTR promedio | - | 3%+ | 5%+ |
| Posición "entradas bts chile" | - | Top 10 | Top 3 |
| Páginas indexadas | 0 | 100+ | 200+ |
| Core Web Vitals (móvil) | - | 90+ | 95+ |

---

## 🐛 TROUBLESHOOTING

### Problema: Imágenes OG no aparecen en Facebook

**Solución:**
1. Facebook Debugger → "Scrape Again"
2. Verificar que las imágenes sean accesibles públicamente
3. Verificar tamaño exacto 1200x630px
4. Verificar que no estén bloqueadas en robots.txt

### Problema: JSON-LD da errores en validator

**Solución:**
1. Copiar el JSON-LD de la página
2. Pegarlo en https://validator.schema.org/
3. Corregir campos faltantes según el error
4. Los warnings (advertencias) son OK, solo los errors importan

### Problema: Google no indexa las páginas

**Solución:**
1. Verificar que robots.txt permite Googlebot
2. Verificar sitemap.xml se carga correctamente
3. Request indexing manualmente en Search Console
4. Esperar 3-7 días (Google es lento al inicio)

### Problema: Core Web Vitals bajos

**Solución:**
1. Optimizar imágenes → usar WebP, lazy loading
2. Reducir JavaScript → code splitting
3. Preload recursos críticos (fonts, hero images)
4. Activar PPR cuando refactorices
5. Usar CDN (Cloudflare/Vercel Edge)

---

## 📝 CHECKLIST FINAL DE LANZAMIENTO

Antes de anunciar el sitio públicamente:

- [ ] Variables de entorno configuradas (SITE_URL, verificaciones)
- [ ] Imágenes OG profesionales reemplazadas
- [ ] Logo 600x60 para Google News creado
- [ ] Build exitoso sin errores TypeScript
- [ ] Deployed a producción
- [ ] URLs funcionan correctamente
- [ ] Rich Results Test validado (home, entradas, noticias)
- [ ] Facebook Debugger validado
- [ ] Twitter Card validado
- [ ] Sitemap enviado a Search Console
- [ ] Páginas principales indexadas solicitadas
- [ ] RSS feed accesible y válido
- [ ] PageSpeed Insights > 90 móvil
- [ ] Google Analytics configurado
- [ ] Todos los links internos funcionan
- [ ] Formularios funcionan (newsletter, contacto)
- [ ] Compra de entradas funciona end-to-end

---

## 🎉 RESULTADO ESPERADO

Con todas estas mejoras implementadas correctamente, en 30-90 días deberías ver:

✅ **Ranking Top 5** para "entradas bts chile"
✅ **Ranking Top 10** para "bts chile"
✅ **5,000+ impresiones** mensuales en Google
✅ **200+ clicks orgánicos** mensuales
✅ **Rich snippets** en resultados de búsqueda (FAQ, Event)
✅ **Aparición en Google Discover** (noticias)
✅ **CTR 3-5%** desde búsqueda orgánica

---

**¡Éxito con el lanzamiento! 💜**

Para dudas o problemas, revisa:
- `.claude/PLAN_SEO_COMPLETO.md` - Plan detallado
- `.claude/RESUMEN_MEJORAS_SEO.md` - Todas las mejoras
- `.claude/IMAGENES_SEO_INSTRUCCIONES.md` - Crear imágenes

