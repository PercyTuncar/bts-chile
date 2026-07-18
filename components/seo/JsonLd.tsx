// Inyector de JSON-LD server-side — PRD §15 (nota técnica).
// Renderiza el <script type="application/ld+json"> dentro de un Server Component
// para que Google lo lea sin ejecutar JS.
import { jsonLdString, type JsonLdData } from "@/lib/utils/seo";

export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
    />
  );
}

export default JsonLd;
