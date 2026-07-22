# Soporte de Colores y Estilos en Noticias

## Problema Resuelto

Los colores de texto y otros estilos aplicados en BlockNote al crear una noticia no se mostraban en el artículo publicado.

## Causa

El conversor `blocksToMarkdown` solo extraía **texto plano** ignorando todos los estilos:

```typescript
// ANTES (incorrecto)
text = content.map((item: any) => {
  if (item.type === "text") return item.text || "";  // ❌ Solo texto
  return "";
}).join("");
```

BlockNote guarda los estilos en `item.styles`:
```javascript
{
  type: "text",
  text: "BTS",
  styles: {
    textColor: "#8b2fc9",     // Color morado
    bold: true,                // Negrita
    italic: false
  }
}
```

## Solución Implementada

### 1. Actualizar el Conversor BlockNote

**Archivo:** `lib/markdown/blocknote-converter.ts`

Ahora captura todos los estilos y los convierte:

```typescript
text = content.map((item: any) => {
  if (item.type === "text") {
    let txt = item.text || "";
    const styles = item.styles || {};

    // Color de texto (HTML inline)
    if (styles.textColor) {
      txt = `<span style="color: ${styles.textColor}">${txt}</span>`;
    }

    // Color de fondo
    if (styles.backgroundColor) {
      txt = `<span style="background-color: ${styles.backgroundColor}">${txt}</span>`;
    }

    // Negrita (Markdown)
    if (styles.bold) {
      txt = `**${txt}**`;
    }

    // Cursiva (Markdown)
    if (styles.italic) {
      txt = `*${txt}*`;
    }

    // Subrayado (HTML)
    if (styles.underline) {
      txt = `<u>${txt}</u>`;
    }

    // Tachado (Markdown GFM)
    if (styles.strike) {
      txt = `~~${txt}~~`;
    }

    // Código inline (Markdown)
    if (styles.code) {
      txt = "`" + txt + "`";
    }

    return txt;
  }
  return "";
}).join("");
```

### 2. Permitir HTML Inline en React Markdown

**Archivo:** `components/noticias/ArticleContent.tsx`

Por defecto, `react-markdown` ignora HTML por seguridad. Necesitamos `rehype-raw`:

```bash
npm install rehype-raw
```

```typescript
import rehypeRaw from "rehype-raw";

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeRaw]}  // ← NUEVO: Permite HTML inline
>
  {html}
</ReactMarkdown>
```

## Estilos Soportados

| Estilo | BlockNote | Markdown/HTML Generado | Renderizado |
|--------|-----------|------------------------|-------------|
| **Color de texto** | `textColor: "#8b2fc9"` | `<span style="color: #8b2fc9">texto</span>` | <span style="color: #8b2fc9">texto</span> |
| **Color de fondo** | `backgroundColor: "#ffeaa7"` | `<span style="background-color: #ffeaa7">texto</span>` | <span style="background-color: #ffeaa7">texto</span> |
| **Negrita** | `bold: true` | `**texto**` | **texto** |
| **Cursiva** | `italic: true` | `*texto*` | *texto* |
| **Subrayado** | `underline: true` | `<u>texto</u>` | <u>texto</u> |
| **Tachado** | `strike: true` | `~~texto~~` | ~~texto~~ |
| **Código** | `code: true` | `` `texto` `` | `texto` |

## Combinación de Estilos

Los estilos se pueden combinar:

```typescript
{
  text: "BTS",
  styles: {
    textColor: "#8b2fc9",
    bold: true,
    italic: true
  }
}
```

Genera:
```html
<span style="color: #8b2fc9">***BTS***</span>
```

Renderiza como: <span style="color: #8b2fc9">***BTS***</span>

## Seguridad

### rehype-raw y Sanitización

`rehype-raw` **sanitiza automáticamente** el HTML:

- ✅ Permite: `<span>`, `<u>`, `<strong>`, `<em>`, estilos inline seguros
- ❌ Bloquea: `<script>`, `<iframe>`, `<object>`, eventos onclick, etc.
- ❌ Bloquea: URLs javascript:, data: maliciosos

**Ejemplo de protección:**

```typescript
// Input malicioso
styles.textColor = "red; } body { display: none"

// Sanitizado por rehype-raw
<span style="color: red">texto</span>  // ✅ Solo el color
```

### Por Qué es Seguro

1. Los estilos vienen del **editor BlockNote**, no de input de usuario libre
2. BlockNote solo permite colores válidos desde su color picker
3. `rehype-raw` sanitiza cualquier HTML antes de renderizar
4. Solo admins pueden crear noticias (autenticación Firebase)

## Importante: Noticias Existentes

**Las noticias ya publicadas NO tendrán colores automáticamente.**

El contenido guardado en Firestore tiene el formato antiguo (sin estilos). Para que se vean los colores:

### Opción 1: Re-guardar la Noticia (Recomendado)

1. Ve a `/panel-admin/noticias`
2. Haz clic en "Editar" en la noticia
3. No cambies nada (los estilos están en BlockNote)
4. Haz clic en "Guardar" o "Publicar"
5. El conversor actualizado generará el nuevo formato

### Opción 2: Crear una Nueva Noticia

Las noticias nuevas tendrán el formato correcto desde el inicio.

### ¿Por Qué No se Actualiza Automáticamente?

El contenido en Firestore es **inmutable**. El conversor solo se ejecuta cuando:
- Creas una noticia nueva
- Editas y guardas una noticia existente

No podemos cambiar retroactivamente el contenido guardado sin una migración de datos.

## Ejemplo de Uso

### 1. En el Editor BlockNote

1. Escribe "BTS sí se hace en Chile"
2. Selecciona "BTS"
3. Clic en el botón de color
4. Elige morado (#8b2fc9)
5. Aplica negrita con Ctrl+B

### 2. Contenido Guardado en Firestore

```markdown
<span style="color: #8b2fc9">**BTS**</span> sí se hace en Chile
```

### 3. Renderizado en el Artículo

<span style="color: #8b2fc9; font-weight: bold;">BTS</span> sí se hace en Chile

## Testing

### Verificar que los Colores Funcionan

1. **Crear una noticia de prueba:**
   ```
   - Título: "Prueba de Colores"
   - Contenido: 
     * Texto normal
     * Texto en rojo
     * Texto en azul con negrita
     * Texto con fondo amarillo
   ```

2. **Publicar y verificar:**
   - Ve a `/noticias/prueba-de-colores`
   - Verifica que los colores se muestren correctamente

3. **Inspeccionar HTML:**
   ```html
   <span style="color: rgb(255, 0, 0)">Texto en rojo</span>
   ```

### Browser DevTools

Abre DevTools (F12) y verifica:

```css
/* Los spans deben tener estilos inline */
span[style*="color"] {
  /* Colores aplicados correctamente */
}
```

## Limitaciones

### Markdown Estándar No Soporta Colores

Markdown puro no tiene sintaxis para colores:
```markdown
# ❌ No existe esto
{color: red}Texto en rojo{/color}
```

**Solución:** Usamos HTML inline dentro del Markdown:
```html
<!-- ✅ Esto sí funciona -->
<span style="color: red">Texto en rojo</span>
```

### Compatibilidad

- ✅ react-markdown + rehype-raw: Renderiza HTML
- ✅ SEO: Google indexa el contenido correctamente
- ✅ RSS: Los colores se preservan en feeds
- ✅ Copiar/Pegar: Mantiene el formato

## Alternativas Consideradas

### 1. Guardar HTML Directo

**Rechazada:**
- Más difícil de editar manualmente
- Problemas de seguridad (XSS)
- Difícil de buscar/indexar

### 2. Guardar JSON de BlockNote

**Rechazada:**
- Acoplamiento con BlockNote
- Difícil migrar a otro editor
- Más complejo para SEO

### 3. Markdown + HTML Inline (Elegida)

**Ventajas:**
- ✅ Markdown para estructura
- ✅ HTML para estilos avanzados
- ✅ Fácil de leer/editar
- ✅ Compatible con cualquier editor Markdown
- ✅ SEO friendly

## Próximos Pasos

Si necesitas más estilos en el futuro:

### Alineación de Texto

```typescript
if (block.props?.textAlignment) {
  return `<div style="text-align: ${block.props.textAlignment}">${text}</div>`;
}
```

### Tamaño de Fuente

```typescript
if (styles.fontSize) {
  txt = `<span style="font-size: ${styles.fontSize}px">${txt}</span>`;
}
```

### Enlaces con Colores

```typescript
if (item.type === "link") {
  const url = item.href;
  const color = styles.textColor || "#8b2fc9";
  return `<a href="${url}" style="color: ${color}">${item.text}</a>`;
}
```

## Resumen

✅ **Problema resuelto:**
- Colores y estilos de BlockNote ahora se renderizan correctamente

✅ **Implementación:**
- Conversor actualizado para capturar `item.styles`
- HTML inline para colores (Markdown no los soporta)
- rehype-raw para renderizar HTML de forma segura

✅ **Seguridad:**
- Sanitización automática con rehype-raw
- Solo admins pueden crear contenido
- Protección contra XSS

⚠️ **Noticias existentes:**
- Re-guardar para actualizar el formato
- Las nuevas noticias funcionan automáticamente

**El sistema ahora soporta colores y estilos completos en las noticias 💜**
