# Plan de Implementación: Sistema de Noticias Profesional

## Estado: EN PROGRESO

---

## 1. Dependencias a instalar

```bash
npm install @blocknote/core @blocknote/react @blocknote/mantine
npm install react-hook-form zod @hookform/resolvers
npm install sharp
npm install remark remark-gfm react-markdown
```

---

## 2. Estructura de archivos a crear/modificar

### A. Tipos y validaciones
- [x] `types/index.ts` - Extender interface News con nuevos campos SEO
- [ ] `lib/validation/news-schema.ts` - Schema Zod completo para validación

### B. Componentes del editor
- [ ] `components/admin/BlockNoteEditor.tsx` - Editor tipo Notion
- [ ] `components/admin/ImageUploadField.tsx` - Upload con validación de dimensiones
- [ ] `components/admin/NewsFormPro.tsx` - Formulario completo nuevo
- [ ] `components/admin/PreviewPanel.tsx` - Panel de vistas previas
- [ ] `components/admin/GooglePreview.tsx` - Vista SERP de Google
- [ ] `components/admin/SocialPreview.tsx` - Vista tarjetas sociales
- [ ] `components/admin/SEOChecklist.tsx` - Checklist en vivo

### C. API Routes
- [ ] `app/api/og/route.tsx` - Generación dinámica de OG images
- [ ] `app/api/validate-image/route.ts` - Validación de dimensiones con Sharp
- [ ] `app/api/indexnow/route.ts` - Webhook IndexNow

### D. Sitemaps
- [ ] `app/news-sitemap.xml/route.ts` - Sitemap dinámico 48h

### E. Utilidades
- [ ] `lib/seo/json-ld.ts` - Generadores de NewsArticle y NewsMediaOrganization
- [ ] `lib/seo/indexnow.ts` - Cliente IndexNow
- [ ] `lib/markdown/blocknote-converter.ts` - Conversión bloques ↔ Markdown

### F. Página de artículo mejorada
- [ ] `app/noticias/[slug]/page.tsx` - Actualizar con JSON-LD completo

---

## 3. Checklist de implementación

### Fase 1: Setup y tipos ✅
- [x] Analizar estructura actual
- [ ] Extender tipos News
- [ ] Crear schemas Zod

### Fase 2: Editor BlockNote
- [ ] Implementar BlockNoteEditor con límites (no H1)
- [ ] Conversión Markdown ↔ Bloques
- [ ] Integrar en formulario

### Fase 3: Sistema de imágenes
- [ ] Campo hero 16:9 (ya existe, validar)
- [ ] Campo imagen cuadrada 1:1 (nueva)
- [ ] Campo imagen OG 1200×630 (nueva)
- [ ] Campo imagen Twitter 1200×675 (nueva, opcional)
- [ ] Validación Sharp en API route

### Fase 4: Vistas previas en vivo
- [ ] Vista previa del post
- [ ] Vista previa Google SERP
- [ ] Vista previa redes sociales
- [ ] SEO Checklist con semáforo

### Fase 5: JSON-LD y SEO
- [ ] Generador NewsArticle
- [ ] Generador NewsMediaOrganization (home)
- [ ] Integrar en página de artículo
- [ ] news-sitemap.xml dinámico

### Fase 6: Indexación
- [ ] IndexNow webhook
- [ ] Integrar en flujo de publicación

### Fase 7: UI/UX
- [ ] Layout 2 columnas (65% editor / 35% previews)
- [ ] Secciones colapsables SEO y OG
- [ ] Panel sticky de previews
- [ ] Deshabilitar guardar si checklist falla

---

## 4. Campos del nuevo modelo News

```typescript
interface News {
  // Básicos (ya existen)
  slug: string;
  title: string; // H1, máx 100 chars
  excerpt: string; // Meta description, máx 160 chars
  content: string; // MARKDOWN (no HTML)
  category: NewsCategory;
  tags: string[];
  authorUid: string;
  authorName: string;
  status: NewsStatus;
  
  // Imágenes (extendido)
  featuredImageURL: string; // Hero 16:9, ≥1200px ancho
  seoImageSquareURL: string; // 1:1, ≥1200×1200px (NUEVO)
  ogImageURL: string; // 1200×630px (NUEVO)
  twitterImageURL?: string; // 1200×675px (NUEVO, opcional)
  imageAlt: string; // Alt text (NUEVO)
  
  // SEO (extendido)
  metaTitle?: string; // Si difiere del title (NUEVO)
  metaDescription: string; // Renombrar excerpt (ya existe)
  
  // JSON-LD (nuevo)
  articleSection?: string; // Para NewsArticle
  
  // Timestamps
  publishedAt: Timestamp | null;
  dateModified: Timestamp | null; // Solo cambios reales de contenido
  scheduledFor: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Analytics
  viewCount: number;
  readingTimeMinutes: number;
}
```

---

## 5. Validaciones críticas (bloquean publicación)

- [ ] Título ≤ 100 caracteres
- [ ] Meta descripción ≤ 160 caracteres
- [ ] Headline para JSON-LD ≤ 110 caracteres
- [ ] Hero image ≥ 1200px ancho, ratio 16:9
- [ ] SEO image ≥ 1200×1200px, ratio 1:1
- [ ] OG image = 1200×630px exacto
- [ ] Twitter image = 1200×675px (si se proporciona)
- [ ] Contenido tiene al menos 1 H2
- [ ] datePublished tiene timezone
- [ ] JSON-LD válido y parseable

---

## Próximos pasos inmediatos:

1. Extender tipos en `types/index.ts`
2. Crear schemas de validación Zod
3. Implementar BlockNoteEditor básico
4. Crear campo de imagen con validación Sharp

