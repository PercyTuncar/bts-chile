import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ImageValidationRequest {
  imageData: string; // Base64
  requiredWidth?: number;
  requiredHeight?: number;
  aspectRatio?: "16:9" | "1:1" | "1.91:1" | "16:9-twitter"; // 1.91:1 es OG, 16:9-twitter es 1200x675
  minWidth?: number;
}

interface ImageValidationResponse {
  valid: boolean;
  width: number;
  height: number;
  aspectRatio: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageValidationRequest = await request.json();
    const { imageData, requiredWidth, requiredHeight, aspectRatio, minWidth } = body;

    if (!imageData) {
      return NextResponse.json(
        { valid: false, error: "No se proporcionó imagen" } as ImageValidationResponse,
        { status: 400 }
      );
    }

    // Decodificar base64
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Obtener metadatos de la imagen con Sharp
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        {
          valid: false,
          width: 0,
          height: 0,
          aspectRatio: 0,
          error: "No se pudieron leer las dimensiones de la imagen",
        } as ImageValidationResponse,
        { status: 400 }
      );
    }

    const { width, height } = metadata;
    const ratio = width / height;

    // Validar ancho mínimo
    if (minWidth && width < minWidth) {
      return NextResponse.json({
        valid: false,
        width,
        height,
        aspectRatio: ratio,
        error: `La imagen debe tener al menos ${minWidth}px de ancho (actual: ${width}px)`,
      } as ImageValidationResponse);
    }

    // Validar dimensiones exactas
    if (requiredWidth && requiredHeight) {
      if (width !== requiredWidth || height !== requiredHeight) {
        return NextResponse.json({
          valid: false,
          width,
          height,
          aspectRatio: ratio,
          error: `La imagen debe ser ${requiredWidth}×${requiredHeight}px (actual: ${width}×${height}px)`,
        } as ImageValidationResponse);
      }
    }

    // Validar aspect ratio
    if (aspectRatio) {
      let expectedRatio: number;
      let ratioName: string;
      let tolerance = 0.05; // 5% de tolerancia

      switch (aspectRatio) {
        case "16:9":
          expectedRatio = 16 / 9; // ~1.778
          ratioName = "16:9";
          break;
        case "1:1":
          expectedRatio = 1;
          ratioName = "1:1 (cuadrada)";
          break;
        case "1.91:1":
          expectedRatio = 1.91; // Open Graph
          ratioName = "1.91:1 (Open Graph 1200×630)";
          break;
        case "16:9-twitter":
          expectedRatio = 16 / 9; // 1200×675
          ratioName = "16:9 (Twitter 1200×675)";
          break;
        default:
          expectedRatio = 16 / 9;
          ratioName = "16:9";
      }

      const ratioDiff = Math.abs(ratio - expectedRatio);
      if (ratioDiff > tolerance) {
        return NextResponse.json({
          valid: false,
          width,
          height,
          aspectRatio: ratio,
          error: `La imagen debe tener ratio ${ratioName} (actual: ${ratio.toFixed(2)}:1)`,
        } as ImageValidationResponse);
      }
    }

    // Todo correcto
    return NextResponse.json({
      valid: true,
      width,
      height,
      aspectRatio: ratio,
    } as ImageValidationResponse);
  } catch (error) {
    console.error("Error validando imagen:", error);
    return NextResponse.json(
      {
        valid: false,
        width: 0,
        height: 0,
        aspectRatio: 0,
        error: "Error procesando la imagen. Asegúrate de que sea un formato válido (JPG, PNG, WebP).",
      } as ImageValidationResponse,
      { status: 500 }
    );
  }
}
