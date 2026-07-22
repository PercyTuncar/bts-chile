# Mejoras en Posts de la Red Social

## Problemas Resueltos

### Problema 1: No se podía aplicar color a texto en negrita

**Síntoma:**
- Seleccionabas texto
- Aplicabas **negrita**
- Intentabas aplicar **color**
- El color no se aplicaba o reemplazaba la negrita

**Causa:**
La extensión `Color` de Tiptap no estaba configurada para trabajar con `textStyle`, lo que causaba conflictos con otras marcas como `bold`, `italic`, etc.

**Solución:**
```typescript
// ANTES (conflicto)
Color,

// DESPUÉS (correcto)
Color.configure({
  types: ['textStyle'],
}),
```

**Resultado:**
✅ Ahora puedes aplicar color a texto en negrita
✅ Funciona con italic + color
✅ Funciona con negrita + italic + color
✅ Todas las marcas son compatibles

---

### Problema 2: Imágenes adjuntas se recortaban

**Síntoma:**
- Subías una imagen vertical o cuadrada
- La imagen se recortaba con `object-cover`
- No se veía completa
- Diseño poco atractivo

**Causa:**
El componente `SmartImage` usaba:
```typescript
className="object-cover"  // ← Recorta la imagen
```

Con `fill` mode de Next.js Image, esto recorta la imagen para llenar el contenedor.

---

## Solución: Nuevo Componente PostImage

**Archivo:** `components/comunidad/PostImage.tsx`

### Características

1. **Detecta el aspect ratio de la imagen**
   - Vertical: `width / height < 0.8`
   - Cuadrada: `0.8 <= width / height <= 1.2`
   - Horizontal: `width / height > 1.2`

2. **Diseño adaptativo según tipo de imagen**

#### Para Imágenes Verticales/Cuadradas

```jsx
<div className="relative w-full" style={{ minHeight: "400px", maxHeight: "600px" }}>
  {/* Background blur hermoso */}
  <div className="absolute inset-0">
    <Image
      src={src}
      fill
      className="object-cover blur-3xl scale-110 opacity-30"
    />
  </div>

  {/* Imagen principal centrada sin recortar */}
  <div className="relative flex items-center justify-center p-4">
    <Image
      src={src}
      width={dimensions.width}
      height={dimensions.height}
      className="max-h-[600px] w-auto max-w-full object-contain"
    />
  </div>
</div>
```

**Efecto visual:**
- Background: La misma imagen con blur 3xl, escala 110%, opacity 30%
- Foreground: Imagen completa centrada
- Padding: 1rem alrededor
- Altura: Entre 400px y 600px

#### Para Imágenes Horizontales

```jsx
<div className="relative w-full">
  <Image
    src={src}
    width={dimensions.width}
    height={dimensions.height}
    className="w-full h-auto"
    style={{ maxHeight: "600px", objectFit: "contain" }}
  />
</div>
```

**Diseño normal** sin blur, la imagen se muestra completa.

---

## Comparación Visual

### ANTES (SmartImage con object-cover)

```
┌─────────────────────┐
│  ╔═══════════════╗  │
│  ║    RECORTE    ║  │ ← Imagen recortada
│  ║               ║  │
│  ╚═══════════════╝  │
└─────────────────────┘
```

**Problemas:**
❌ Imagen recortada
❌ Pierde contenido importante
❌ Se ve mal en vertical

### DESPUÉS (PostImage con blur background)

**Imagen Vertical:**
```
┌─────────────────────────────┐
│ ░░░░░░ BLUR BACKGROUND ░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░  ╔═══════╗  ░░░░░░░░│
│ ░░░░░░  ║       ║  ░░░░░░░░│ ← Imagen completa
│ ░░░░░░  ║ FOTO  ║  ░░░░░░░░│    centrada
│ ░░░░░░  ║       ║  ░░░░░░░░│
│ ░░░░░░  ╚═══════╝  ░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────┘
```

**Imagen Horizontal:**
```
┌───────────────────────────────┐
│ ╔═════════════════════════╗  │
│ ║   FOTO COMPLETA         ║  │ ← Sin recortar
│ ╚═════════════════════════╝  │
└───────────────────────────────┘
```

**Ventajas:**
✅ Imagen completa visible
✅ Background blur hermoso
✅ Efecto profesional
✅ Funciona en todos los aspectos

---

## Detalles Técnicos

### Detección de Dimensiones

```typescript
const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  setDimensions({ 
    width: img.naturalWidth, 
    height: img.naturalHeight 
  });
  setLoaded(true);
};

const aspectRatio = dimensions ? dimensions.width / dimensions.height : 1;
const isVertical = aspectRatio < 0.8;
const isSquare = aspectRatio >= 0.8 && aspectRatio <= 1.2;
```

### Skeleton Mientras Carga

```typescript
{!loaded && <Skeleton className="aspect-[4/3] w-full" rounded="rounded-2xl" />}
```

Muestra un skeleton con aspect ratio 4:3 mientras carga la imagen real.

### Imagen Oculta para Dimensiones

```typescript
{!loaded && (
  <img
    src={src}
    onLoad={handleLoad}
    className="absolute inset-0 opacity-0 pointer-events-none"
  />
)}
```

Usa una imagen oculta para obtener las dimensiones naturales antes de renderizar.

---

## Estilos del Background Blur

```typescript
className="object-cover blur-3xl scale-110 opacity-30"
```

| Propiedad | Valor | Efecto |
|-----------|-------|--------|
| `object-cover` | - | Llena el contenedor |
| `blur-3xl` | `blur(64px)` | Blur muy suave |
| `scale-110` | `scale(1.1)` | Evita bordes visibles |
| `opacity-30` | `opacity: 0.3` | Sutil, no distrae |

---

## Uso en PostCard

**ANTES:**
```tsx
{post.imageURL && (
  <Link href={`/comunidad/${post.id}`}>
    <SmartImage 
      src={post.imageURL} 
      fill 
      sizes="(max-width:768px) 100vw, 600px" 
    />
  </Link>
)}
```

**DESPUÉS:**
```tsx
{post.imageURL && (
  <Link href={`/comunidad/${post.id}`}>
    <PostImage 
      src={post.imageURL} 
      alt={post.content || "Imagen del post"} 
    />
  </Link>
)}
```

---

## Problema del Color + Negrita - Explicación Técnica

### ¿Por qué no funcionaba?

En Tiptap, las **marcas** (marks) son decoraciones de texto como:
- `bold`
- `italic`
- `strike`
- `code`
- `textStyle` (para color)

Por defecto, `Color` no especificaba que debía aplicarse a través de `textStyle`, lo que causaba conflictos.

### Configuración Correcta

```typescript
extensions: [
  StarterKit.configure({ heading: false }),
  TextStyle,  // ← Base para estilos de texto
  Color.configure({
    types: ['textStyle'],  // ← IMPORTANTE
  }),
  Link.configure({ ... }),
],
```

Ahora `Color` sabe que debe trabajar con `textStyle`, lo que permite:
- Aplicar color sin remover bold
- Aplicar bold sin remover color
- Combinar múltiples marcas

---

## Ejemplos de Uso

### Color + Negrita

1. **Escribir texto:** "BTS en Chile"
2. **Seleccionar** "BTS"
3. **Aplicar negrita** (Ctrl+B o botón B)
4. **Mantener selección**
5. **Aplicar color morado**
6. **Resultado:** **<span style="color: #8b2fc9">BTS</span>** en Chile ✅

### Color + Italic + Negrita

1. **Escribir:** "ARMY forever"
2. **Seleccionar** "ARMY"
3. **Aplicar negrita**
4. **Aplicar italic**
5. **Aplicar color rosa**
6. **Resultado:** ***<span style="color: #ec4899">ARMY</span>*** forever ✅

---

## Testing

### Probar Color + Negrita

1. Ve a `/comunidad`
2. Haz clic en "Crear publicación"
3. Escribe texto
4. Selecciona una palabra
5. Haz clic en **B** (negrita)
6. Sin deseleccionar, haz clic en 🎨 (paleta)
7. Selecciona un color
8. ✅ El texto debe tener negrita + color

### Probar Imágenes

1. **Imagen Vertical:**
   - Subir una foto de perfil (vertical)
   - Ver el post
   - ✅ Debe mostrar background blur + imagen completa

2. **Imagen Horizontal:**
   - Subir una foto panorámica
   - Ver el post
   - ✅ Debe mostrar imagen completa sin blur

3. **Imagen Cuadrada:**
   - Subir una foto 1:1
   - Ver el post
   - ✅ Debe mostrar background blur + imagen completa

---

## Resumen

### Problema 1: Color + Negrita
✅ **Resuelto** - Configurar Color con `types: ['textStyle']`

### Problema 2: Imágenes Recortadas
✅ **Resuelto** - Nuevo componente PostImage con:
- Detección automática de aspect ratio
- Background blur para verticales/cuadradas
- Diseño normal para horizontales
- Skeleton mientras carga
- Altura adaptativa (400-600px)

### Mejoras UX/UI
✅ Editor más potente (color + negrita funciona)
✅ Imágenes hermosas con blur background
✅ Diseño adaptativo según imagen
✅ Experiencia visual profesional
✅ Carga progresiva con skeleton

**Los posts ahora se ven y funcionan mucho mejor 💜**
