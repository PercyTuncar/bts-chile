/**
 * Convertidores entre formato BlockNote (bloques) y Markdown.
 * BlockNote usa bloques JSON, pero guardamos como Markdown en la BD.
 */

/**
 * Convierte colores de BlockNote a valores CSS.
 * BlockNote usa nombres como "purple", "blue", etc.
 */
function convertBlockNoteColor(color: string): string {
  const colorMap: Record<string, string> = {
    default: "inherit",
    gray: "#9ca3af",
    brown: "#92400e",
    red: "#dc2626",
    orange: "#ea580c",
    yellow: "#ca8a04",
    green: "#16a34a",
    blue: "#2563eb",
    purple: "#8b2fc9", // Color de marca
    pink: "#ec4899",
  };

  return colorMap[color] || color;
}

/**
 * Convierte bloques de BlockNote a Markdown.
 * Usa el conversor nativo de BlockNote si está disponible.
 */
export function blocksToMarkdown(blocks: any[]): string {
  // DEBUG: Ver estructura de bloques
  console.log("=== BLOCKS TO MARKDOWN DEBUG ===");
  console.log("Total blocks:", blocks.length);

  // Mostrar TODOS los bloques con detalle completo
  blocks.forEach((block, index) => {
    console.log(`\n--- Block ${index} ---`);
    console.log("Type:", block.type);
    console.log("Props:", JSON.stringify(block.props, null, 2));
    console.log("Content array:", JSON.stringify(block.content, null, 2));

    // Detallar cada item de content
    if (Array.isArray(block.content)) {
      block.content.forEach((item: any, itemIndex: number) => {
        console.log(`  Content item ${itemIndex}:`, {
          type: item.type,
          text: item.text,
          styles: item.styles,
          hasTextColor: !!item.styles?.textColor,
          hasBackgroundColor: !!item.styles?.backgroundColor,
        });
      });
    }
  });

  const result = blocks.map(blockToMarkdown).join("\n\n");

  console.log("\n=== MARKDOWN RESULT ===");
  console.log(result);
  console.log("=== END DEBUG ===\n");

  return result;
}

function blockToMarkdown(block: any): string {
  const type = block.type;
  const content = block.content || [];
  const props = block.props || {};

  // DEBUG: Ver contenido del bloque
  if (Array.isArray(content) && content.length > 0) {
    console.log("=== BLOCK CONTENT ===");
    console.log("Type:", type);
    console.log("Content item 0:", JSON.stringify(content[0], null, 2));
  }

  // Extraer texto con estilos (negrita, cursiva, colores, etc.)
  let text = "";
  if (Array.isArray(content)) {
    text = content
      .map((item: any) => {
        if (typeof item === "string") return item;
        if (item.type === "text") {
          let txt = item.text || "";
          const styles = item.styles || {};

          // DEBUG: Ver estilos
          if (Object.keys(styles).length > 0) {
            console.log("=== STYLES FOUND ===");
            console.log("Text:", txt);
            console.log("Styles:", styles);
          }

          // Aplicar estilos inline (a nivel de texto)
          // Bold
          if (styles.bold) {
            txt = `**${txt}**`;
          }

          // Italic
          if (styles.italic) {
            txt = `*${txt}*`;
          }

          // Underline (usar HTML)
          if (styles.underline) {
            txt = `<u>${txt}</u>`;
          }

          // Strike through
          if (styles.strike) {
            txt = `~~${txt}~~`;
          }

          // Code inline
          if (styles.code) {
            txt = "`" + txt + "`";
          }

          // Color de texto a nivel inline (si existe)
          if (styles.textColor) {
            txt = `<span style="color: ${styles.textColor}">${txt}</span>`;
          }

          // Background color inline (si existe)
          if (styles.backgroundColor) {
            txt = `<span style="background-color: ${styles.backgroundColor}">${txt}</span>`;
          }

          return txt;
        }
        return "";
      })
      .join("");
  } else if (typeof content === "string") {
    text = content;
  }

  // Aplicar colores a nivel de bloque (desde props)
  const hasBlockTextColor = props.textColor && props.textColor !== "default";
  const hasBlockBackgroundColor = props.backgroundColor && props.backgroundColor !== "default";

  if (hasBlockTextColor || hasBlockBackgroundColor) {
    let style = "";
    if (hasBlockTextColor) {
      // Convertir color de BlockNote a CSS
      const color = convertBlockNoteColor(props.textColor);
      style += `color: ${color};`;
    }
    if (hasBlockBackgroundColor) {
      const bgColor = convertBlockNoteColor(props.backgroundColor);
      style += `background-color: ${bgColor};`;
    }
    text = `<span style="${style}">${text}</span>`;
  }

  switch (type) {
    case "heading":
      const level = (block.props as any)?.level || 2;
      return `${"#".repeat(level)} ${text}`;

    case "paragraph":
      return text;

    case "bulletListItem":
      return `- ${text}`;

    case "numberedListItem":
      return `1. ${text}`;

    case "checkListItem":
      const checked = (block.props as any)?.checked;
      return `- [${checked ? "x" : " "}] ${text}`;

    case "table":
      // Implementación simple de tabla Markdown
      return convertTableToMarkdown(block);

    case "image":
      const url = (block.props as any)?.url || "";
      const alt = (block.props as any)?.caption || "";
      return `![${alt}](${url})`;

    case "quote": // BlockNote usa "quote" no "blockquote"
      return `> ${text}`;

    default:
      return text;
  }
}

function convertTableToMarkdown(block: any): string {
  // Implementación básica de tabla
  // BlockNote guarda las tablas de forma especial
  return "| Columna 1 | Columna 2 |\n|-----------|-----------|";
}

/**
 * Convierte Markdown a bloques de BlockNote.
 * Parsea Markdown y genera estructura de bloques JSON.
 */
export function markdownToBlocks(markdown: string): any[] {
  const lines = markdown.split("\n");
  const blocks: any[] = [];
  let currentList: { type: "bullet" | "numbered"; items: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // Línea vacía: cerrar lista si existe
      if (currentList) {
        currentList.items.forEach((item) => {
          blocks.push({
            id: crypto.randomUUID(),
            type: currentList!.type === "bullet" ? "bulletListItem" : "numberedListItem",
            content: [{ type: "text", text: item, styles: {} }],
            children: [],
          } as any);
        });
        currentList = null;
      }
      continue;
    }

    // Encabezados
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];

      // Solo permitir H2 y H3 (no H1)
      if (level >= 2 && level <= 3) {
        blocks.push({
          id: crypto.randomUUID(),
          type: "heading",
          content: [{ type: "text", text, styles: {} }],
          children: [],
          props: { level },
        } as any);
      }
      continue;
    }

    // Lista con viñetas
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "bullet") {
        if (currentList) {
          // Cerrar lista anterior
          currentList.items.forEach((item) => {
            blocks.push({
              id: crypto.randomUUID(),
              type: "numberedListItem",
              content: [{ type: "text", text: item, styles: {} }],
              children: [],
            } as any);
          });
        }
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Lista numerada
    const numberedMatch = line.match(/^\d+\.\s+(.+)/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== "numbered") {
        if (currentList) {
          // Cerrar lista anterior
          currentList.items.forEach((item) => {
            blocks.push({
              id: crypto.randomUUID(),
              type: "bulletListItem",
              content: [{ type: "text", text: item, styles: {} }],
              children: [],
            } as any);
          });
        }
        currentList = { type: "numbered", items: [] };
      }
      currentList.items.push(numberedMatch[1]);
      continue;
    }

    // Cita
    const quoteMatch = line.match(/^>\s+(.+)/);
    if (quoteMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: "quote",
        content: [{ type: "text", text: quoteMatch[1], styles: {} }],
        children: [],
      } as any);
      continue;
    }

    // Imagen
    const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: "image",
        content: [],
        children: [],
        props: {
          url: imageMatch[2],
          caption: imageMatch[1],
        },
      } as any);
      continue;
    }

    // Párrafo normal
    blocks.push({
      id: crypto.randomUUID(),
      type: "paragraph",
      content: [{ type: "text", text: line, styles: {} }],
      children: [],
    } as any);
  }

  // Cerrar lista final si existe
  if (currentList) {
    currentList.items.forEach((item) => {
      blocks.push({
        id: crypto.randomUUID(),
        type: currentList!.type === "bullet" ? "bulletListItem" : "numberedListItem",
        content: [{ type: "text", text: item, styles: {} }],
        children: [],
      } as any);
    });
  }

  return blocks;
}

/**
 * Extrae el texto plano de bloques BlockNote (para contar palabras, etc.)
 */
export function blocksToPlainText(blocks: any[]): string {
  return blocks
    .map((block) => {
      const content = block.content || [];
      return content
        .map((item: any) => {
          if (typeof item === "string") return item;
          if (item.type === "text") return item.text || "";
          return "";
        })
        .join("");
    })
    .join(" ");
}
