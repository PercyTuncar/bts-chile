// Sanitizador allowlist para el HTML enriquecido de los posts (Tiptap) — §8.1, §14.1.
// Funciona en servidor y cliente (solo strings, sin DOMParser) porque PostContent se
// renderiza también en SSR. Estrategia: NO se deja pasar el tag original, se RECONSTRUYE
// con una lista blanca de etiquetas y sin atributos (salvo `href` seguro en <a>). Así,
// aunque la entrada sea maliciosa, la salida solo contiene etiquetas/atributos permitidos
// → elimina manejadores de eventos (onerror/onclick), estilos y protocolos peligrosos.

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li", "h3", "h4", "blockquote", "code", "pre",
  "a", "span", "img",
]);

const SAFE_HREF = /^(https?:\/\/|mailto:|\/|#)/i;
// Color seguro: hex (#fff / #ffffff / #ffffffff), rgb()/rgba() o nombre css (letras).
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d.,\s%]+\)|[a-z]+)$/i;

function attrValue(attrs: string, name: string): string {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const m = attrs.match(re);
  return (m?.[2] ?? m?.[3] ?? m?.[4] ?? "").trim();
}

function cleanAnchor(attrs: string): string {
  const href = attrValue(attrs, "href");
  if (href && SAFE_HREF.test(href)) {
    const safe = href.replace(/"/g, "&quot;");
    return `<a href="${safe}" rel="noopener noreferrer nofollow" target="_blank">`;
  }
  return "<a>";
}

function cleanImage(attrs: string): string {
  const src = attrValue(attrs, "src");
  if (!src || !/^https:\/\//i.test(src)) return ""; // sin src seguro → se descarta la imagen
  const safeSrc = src.replace(/"/g, "&quot;");
  const alt = attrValue(attrs, "alt").replace(/"/g, "&quot;");
  return `<img src="${safeSrc}" alt="${alt}" loading="lazy">`;
}

/** Mantiene solo `style="color:..."` con un color válido; descarta el resto del style. */
function cleanSpan(attrs: string): string {
  const style = attrValue(attrs, "style");
  const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
  const color = colorMatch?.[1]?.trim();
  if (color && SAFE_COLOR.test(color)) {
    return `<span style="color:${color.replace(/"/g, "")}">`;
  }
  return "<span>";
}

/** Devuelve HTML seguro con solo las etiquetas de formato permitidas. */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return (
    html
      // Elimina bloques peligrosos completos (contenido incluido).
      .replace(/<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
      // Elimina comentarios.
      .replace(/<!--[\s\S]*?-->/g, "")
      // Reconstruye cada etiqueta desde cero.
      .replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_m, slash, name, attrs) => {
        const tag = String(name).toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) return ""; // etiqueta no permitida → se descarta, el texto queda
        if (slash) return tag === "img" || tag === "br" ? "" : `</${tag}>`;
        if (tag === "br") return "<br>";
        if (tag === "img") return cleanImage(attrs);
        if (tag === "a") return cleanAnchor(attrs);
        if (tag === "span") return cleanSpan(attrs);
        return `<${tag}>`;
      })
  );
}
