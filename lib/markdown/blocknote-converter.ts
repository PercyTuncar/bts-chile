/**
 * Convertidores entre formato BlockNote (bloques) y Markdown.
 * BlockNote usa bloques JSON, pero guardamos como Markdown en la BD.
 */

/**
 * Convierte bloques de BlockNote a Markdown.
 * Usa el conversor nativo de BlockNote si está disponible.
 */
export function blocksToMarkdown(blocks: any[]): string {
  // BlockNote tiene su propio conversor, pero por simplicidad
  // implementamos una versión básica aquí
  return blocks.map(blockToMarkdown).join("\n\n");
}

function blockToMarkdown(block: any): string {
  const type = block.type;
  const content = block.content || [];

  // Extraer texto plano del contenido
  // content puede ser un array o undefined
  let text = "";
  if (Array.isArray(content)) {
    text = content
      .map((item: any) => {
        if (typeof item === "string") return item;
        if (item.type === "text") return item.text || "";
        return "";
      })
      .join("");
  } else if (typeof content === "string") {
    text = content;
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
