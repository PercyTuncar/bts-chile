# PLAN SEO COMPLETO - BTS CHILE 2026

## INVESTIGACIÓN REALIZADA

### Fuentes Oficiales Consultadas:
1. **Next.js Official SEO Documentation** - [Next.js Learn SEO](https://nextjs.org/learn/seo)
2. **Google Search Essentials** - [Google Search Essentials](https://developers.google.com/search/docs/essentials)
3. **Schema.org Event & Offer** - [Schema.org](https://schema.org)
4. **Google Search Console Guide** - [Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start)
5. **Next.js Metadata API** - [Metadata & OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

---

## 45+ PUNTOS CRÍTICOS PARA RANKING #1 EN GOOGLE CHILE

### 🎯 PALABRAS CLAVE OBJETIVO:
- **Primaria Home**: "bts chile"
- **Primaria Entradas**: "entradas bts chile"
- **Secundarias**: "bts chile 2026", "concierto bts chile", "bts santiago", "entradas bts estadio nacional"

---

## A. ESTRUCTURA HTML Y ELEMENTOS SEMÁNTICOS (15 puntos)

### ✅ YA IMPLEMENTADO:
1. ✅ Estructura semántica correcta (header, main, nav, section, article)
2. ✅ Jerarquía H1-H6 correcta
3. ✅ Un solo H1 por página
4. ✅ lang="es-CL" en <html>
5. ✅ Skip to content link para accesibilidad
6. ✅ Breadcrumbs navegacionales visibles

### ❌ FALTA IMPLEMENTAR:
7. ❌ **Meta theme-color** para PWA
8. ❌ **Atributos alt** en todas las imágenes (revisar)
9. ❌ **Role attributes** explícitos donde sea necesario
10. ❌ **Schema markup para imágenes** (ImageObject completo)
11. ❌ **Semantic landmarks** mejorados (banner, contentinfo, complementary)
12. ❌ **Heading structure** en componentes individuales
13. ❌ **Focus management** mejorado
14. ❌ **ARIA labels** en elementos interactivos
15. ❌ **Structured data para Organization** en footer

---

## B. METADATA Y OPEN GRAPH (10 puntos)

### ✅ YA IMPLEMENTADO:
16. ✅ Title tags únicos por página
17. ✅ Meta descriptions
18. ✅ Open Graph básico (title, description, image)
19. ✅ Canonical URLs
20. ✅ metadataBase configurado

### ❌ FALTA MEJORAR:
21. ❌ **Open Graph images** faltantes (crear og-home.jpg, og-entradas.jpg, og-noticias.jpg)
22. ❌ **Twitter Card meta tags** completos (twitter:site, twitter:creator)
23. ❌ **Facebook App ID** (fb:app_id)
24. ❌ **article:author** y **article:publisher** en noticias
25. ❌ **og:locale:alternate** para otros idiomas potenciales
26. ❌ **Meta robots refinado** (max-snippet, max-image-preview)

---

## C. JSON-LD STRUCTURED DATA (12 puntos)

### ✅ YA IMPLEMENTADO:
27. ✅ Organization schema
28. ✅ WebSite schema
29. ✅ BreadcrumbList
30. ✅ NewsArticle básico
31. ✅ Event/EventSeries para conciertos

### ❌ FALTA MEJORAR:
32. ❌ **LocalBusiness** schema (dirección física si existe)
33. ❌ **FAQPage** schema completo en todas las páginas relevantes
34. ❌ **Product** schema para tienda con Offers
35. ❌ **AggregateRating** cuando tengas reseñas reales
36. ❌ **VideoObject** si agregas videos
37. ❌ **HowTo** schema para guías
38. ❌ **SiteNavigationElement** mejorado
39. ❌ **SpeakableSpecification** para búsqueda por voz
40. ❌ **Publisher logo** 600x60px (requerido Google News)
41. ❌ **ImageObject** con licencia y autor

---

## D. IMÁGENES Y MULTIMEDIA (5 puntos)

### ❌ TODOS FALTANTES:
42. ❌ **Imágenes OG optimizadas** (1200x630px)
43. ❌ **Logo 600x60px** para Google News
44. ❌ **Imágenes múltiples aspectos** para artículos (16:9, 4:3, 1:1)
45. ❌ **WebP/AVIF** con fallbacks
46. ❌ **Lazy loading** con priority en above-fold

---

## E. RENDIMIENTO Y CORE WEB VITALS (8 puntos)

### ⚠️ PARCIAL:
47. ⚠️ **PPR (Partial Prerendering)** desactivado - ACTIVAR
48. ⚠️ **Font optimization** - mejorar (preload, font-display)
49. ❌ **Preload critical resources** (LCP images)
50. ❌ **Resource hints** (dns-prefetch, preconnect para Firebase)
51. ❌ **Service Worker** para PWA offline
52. ❌ **Compression** (Brotli en server)
53. ❌ **Critical CSS** inline
54. ❌ **Image sizing** explícito en todos los casos

---

## F. CONTENIDO Y PALABRAS CLAVE (5 puntos)

### ⚠️ MEJORAR:
55. ⚠️ **Densidad keyword** en H1, primer párrafo, URL
56. ⚠️ **LSI keywords** (términos relacionados: ARMY, K-pop, BTS members)
57. ⚠️ **Long-tail keywords** en contenido (preguntas frecuentes)
58. ⚠️ **Internal linking** con anchor text descriptivo
59. ⚠️ **Contenido mínimo 1000+ palabras** en páginas clave

---

## G. ARCHIVOS TÉCNICOS SEO (5 puntos)

### ✅ YA IMPLEMENTADO:
60. ✅ robots.txt dinámico
61. ✅ sitemap.xml dinámico
62. ✅ news-sitemap.xml

### ❌ FALTA:
63. ❌ **IndexNow** implementation completa
64. ❌ **RSS Feed** para noticias

---

## H. MOBILE Y UX (3 puntos)

### ✅ YA IMPLEMENTADO:
65. ✅ Responsive design
66. ✅ viewport configurado

### ❌ MEJORAR:
67. ❌ **Touch targets** mínimo 48x48px
68. ❌ **Font size** mínimo 16px en móvil

---

## I. SEGURIDAD Y CONFIANZA (3 puntos)

69. ❌ **HTTPS** verificado (debe estar en producción)
70. ❌ **Security headers** (CSP, X-Frame-Options, HSTS)
71. ❌ **Privacy Policy** y **Terms** linkeados en footer

---

## J. LOCAL SEO CHILE (5 puntos)

72. ❌ **hreflang** para es-CL explícito
73. ❌ **LocalBusiness** con coordenadas GPS
74. ❌ **GeoCoordinates** en Event schema
75. ❌ **Address** en múltiples formatos
76. ❌ **Google My Business** (si aplica)

---

## PRIORIDADES DE IMPLEMENTACIÓN

### 🔴 CRÍTICO (impacto inmediato ranking):
1. Crear imágenes OG faltantes (42)
2. Completar JSON-LD Event con ofertas detalladas (32-34)
3. Mejorar meta descriptions con keywords (55-56)
4. Activar PPR para Core Web Vitals (47)
5. Implementar FAQPage schema (33)

### 🟡 IMPORTANTE (ranking medio plazo):
6. Logo 600x60 para Google News (43)
7. Imágenes múltiples aspectos (44)
8. Resource hints Firebase (50)
9. Internal linking optimizado (58)
10. Local SEO completo (72-76)

### 🟢 COMPLEMENTARIO (refinamiento):
11. VideoObject si hay videos (36)
12. SpeakableSpecification (39)
13. Service Worker PWA (51)
14. Security headers (70)
15. RSS feed (64)

---

## CAMBIOS ESPECÍFICOS A REALIZAR

### 1. app/layout.tsx
- Agregar meta theme-color
- Mejorar viewport
- Agregar preconnect Firebase
- Agregar Organization schema en footer

### 2. app/page.tsx (Home)
- Optimizar H1 con keyword "bts chile"
- Primer párrafo con keyword
- Mejorar internal linking
- Agregar FAQPage schema

### 3. app/entradas/page.tsx
- H1 optimizado "Entradas BTS Chile 2026"
- Mejorar Event schema con Offer completo
- Agregar GeoCoordinates
- Imágenes con aspectos múltiples

### 4. app/noticias/[slug]/page.tsx
- Completar NewsArticle con todos los campos
- Logo 600x60
- Imágenes 1:1, 4:3, 16:9
- article:author y article:publisher

### 5. Crear archivos faltantes:
- /public/og-home.jpg (1200x630)
- /public/og-entradas.jpg (1200x630)
- /public/og-noticias.jpg (1200x630)
- /public/logo-600x60.png
- /app/rss.xml/route.ts

### 6. next.config.ts
- Activar PPR (cacheComponents: true) después de refactor
- Configurar headers de seguridad

### 7. lib/utils/seo.ts
- Agregar helpers para FAQPage
- Agregar helpers para LocalBusiness
- Agregar helpers para Product/Offer

---

## VERIFICACIÓN POST-IMPLEMENTACIÓN

### Herramientas a usar:
1. ✅ Google Search Console
2. ✅ Google Rich Results Test
3. ✅ PageSpeed Insights
4. ✅ Schema.org Validator
5. ✅ Lighthouse CI
6. ✅ Screaming Frog (crawl completo)
7. ✅ Ahrefs/SEMrush (keywords tracking)

### Métricas objetivo:
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Mobile Score**: > 95
- **Desktop Score**: > 98
- **Valid structured data**: 100%

---

## TIMELINE SUGERIDO

### Semana 1: CRÍTICO
- Imágenes OG
- JSON-LD completo
- Meta descriptions optimizadas

### Semana 2: IMPORTANTE
- Logo Google News
- Local SEO
- Internal linking

### Semana 3: REFINAMIENTO
- PWA completo
- Security headers
- Monitoreo y ajustes

---

## NOTAS IMPORTANTES

⚠️ **MANTENER FUNCIONALIDAD**: Todos los cambios son aditivos, NO romper features existentes
⚠️ **CONSISTENCIA**: Mismo name/logo en todos los schemas
⚠️ **CHILE FOCUS**: Todos los schemas con addressCountry: "CL", inLanguage: "es-CL"
⚠️ **KEYWORDS NATURALES**: No keyword stuffing, mantener UX
⚠️ **INDEXNOW**: Enviar actualizaciones a Bing/Yandex automáticamente
