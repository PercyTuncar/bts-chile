# INSTRUCCIONES PARA CREAR IMÁGENES SEO

## Imágenes Open Graph requeridas (1200x630px)

### 1. /public/og-home.jpg
**Tamaño**: 1200 x 630 px
**Contenido**:
- Logo BTS Chile (centrado arriba)
- Texto principal: "BTS Chile 2026"
- Subtexto: "Entradas 100% Seguras | Estadio Nacional"
- Fondo: Degradado morado (#8b2fc9) con corazones sutiles
- Colores: Texto blanco sobre fondo oscuro/morado

### 2. /public/og-entradas.jpg
**Tamaño**: 1200 x 630 px
**Contenido**:
- Logo BTS Chile (esquina superior)
- Texto principal: "Entradas BTS Chile 2026"
- Subtexto: "14, 16 y 17 Octubre • Estadio Nacional"
- Precio destacado: "Desde $299 USD"
- Icono de ticket/entrada
- Fondo: Imagen del Estadio Nacional con overlay morado

### 3. /public/og-noticias.jpg
**Tamaño**: 1200 x 630 px
**Contenido**:
- Logo BTS Chile
- Texto principal: "Noticias BTS Chile 💜"
- Subtexto: "Conciertos, Música y ARMY"
- Iconos: periódico, música, corazón
- Fondo: Collage de BTS con overlay

### 4. /public/logo-600x60.png
**Tamaño**: 600 x 60 px (EXACTO - requerido Google News)
**Contenido**:
- Logo horizontal BTS Chile
- Texto "BTS Chile" legible
- Fondo transparente o blanco
- Alta resolución

### 5. /public/logo.png
**Tamaño**: 512 x 512 px
**Contenido**:
- Logo cuadrado BTS Chile
- Fondo transparente
- Para Organization schema

---

## Herramientas recomendadas:
1. **Canva** (gratis): https://www.canva.com/
   - Plantilla "Facebook Post" (1200x630)
   - Usar colores marca: #8b2fc9 (morado brand)
   
2. **Figma** (gratis): https://www.figma.com/
   - Más control profesional
   
3. **Photoshop/GIMP** (avanzado)

---

## Colores de marca BTS Chile:
- **Brand Purple**: #8b2fc9
- **Brand Soft**: #f3e8ff
- **Text**: #0f0f14 (oscuro) / #fafafc (claro)
- **Background**: #fafafc (light) / #0f0f14 (dark)

---

## Imágenes para artículos de noticias:

Para cada artículo de noticia, idealmente tener 3 aspectos:
- **16:9** (1200x675px) - Hero image principal
- **4:3** (1200x900px) - Para redes sociales
- **1:1** (1200x1200px) - Para Google Discover y Top Stories

Estas se suben a Firebase Storage y se referencian en el CMS.

---

## Checklist de validación:

Una vez creadas las imágenes:

1. ✅ Tamaños exactos (usar herramienta: https://www.iloveimg.com/resize-image)
2. ✅ Formato correcto (JPG para fotos, PNG para logos)
3. ✅ Peso optimizado (<200KB cada una)
4. ✅ Texto legible en móvil y desktop
5. ✅ Colores de marca consistentes
6. ✅ Logo visible y centrado

---

## Validación de OG Images:

Después de subirlas, validar con:
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

---

## ALTERNATIVA RÁPIDA (si no tienes diseñador):

Usa placeholders temporales mientras consigues las imágenes finales:
- https://placehold.co/1200x630/8b2fc9/ffffff?text=BTS+Chile+2026
- Reemplaza con imágenes profesionales lo antes posible

---

## PRIORIDAD:

1. **CRÍTICO**: og-home.jpg, og-entradas.jpg, logo-600x60.png
2. **IMPORTANTE**: og-noticias.jpg, logo.png
3. **OPCIONAL**: Imágenes adicionales para artículos individuales
