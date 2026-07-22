"use client";

/**
 * Campo de upload de imagen con validación de dimensiones usando Sharp (API).
 * Muestra preview, validación en tiempo real y feedback visual.
 */

import Image from "next/image";
import { useState } from "react";
import { X, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ImageUploadFieldProps {
  label: string;
  description: string;
  value: string | null; // URL actual
  onChange: (url: string | null, file: File | null) => void;
  aspectRatio?: "16:9" | "1:1" | "1.91:1" | "16:9-twitter";
  requiredWidth?: number;
  requiredHeight?: number;
  minWidth?: number;
  required?: boolean;
}

interface ValidationResult {
  valid: boolean;
  width: number;
  height: number;
  aspectRatio: number;
  error?: string;
}

export function ImageUploadField({
  label,
  description,
  value,
  onChange,
  aspectRatio,
  requiredWidth,
  requiredHeight,
  minWidth,
  required = false,
}: ImageUploadFieldProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Crear preview
    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
    setFile(selectedFile);
    setValidating(true);
    setValidation(null);

    try {
      // Leer el archivo como base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        // Validar con la API
        const response = await fetch("/api/validate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: base64,
            aspectRatio,
            requiredWidth,
            requiredHeight,
            minWidth,
          }),
        });

        const result: ValidationResult = await response.json();
        setValidation(result);
        setValidating(false);

        if (result.valid) {
          // Imagen válida, notificar al padre
          onChange(previewUrl, selectedFile);
        } else {
          // Imagen inválida, limpiar
          onChange(null, null);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Error validando imagen:", error);
      setValidating(false);
      setValidation({
        valid: false,
        width: 0,
        height: 0,
        aspectRatio: 0,
        error: "Error al procesar la imagen",
      });
    }
  }

  function handleRemove() {
    setFile(null);
    setPreview(null);
    setValidation(null);
    onChange(null, null);
  }

  const hasImage = preview || value;
  const isValid = validation?.valid ?? (value ? true : false);
  const showError = validation && !validation.valid;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </label>
        {validation && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              validation.valid ? "text-success" : "text-danger"
            )}
          >
            {validation.valid ? (
              <>
                <CheckCircle className="h-3 w-3" />
                {validation.width}×{validation.height}px
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Inválida
              </>
            )}
          </span>
        )}
      </div>

      <p className="text-xs text-text-muted">{description}</p>

      {hasImage ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border-2 transition-colors",
            validating
              ? "border-warning"
              : isValid
              ? "border-success"
              : showError
              ? "border-danger"
              : "border-[color-mix(in_srgb,var(--text)_12%,transparent)]"
          )}
        >
          <div
            className={cn(
              "relative bg-[color-mix(in_srgb,var(--text)_5%,transparent)]",
              aspectRatio === "16:9" && "aspect-video",
              aspectRatio === "1:1" && "aspect-square",
              aspectRatio === "1.91:1" && "aspect-[1.91/1]",
              aspectRatio === "16:9-twitter" && "aspect-video"
            )}
          >
            <Image
              src={preview || value || ""}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized={!!file}
            />
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Eliminar imagen"
          >
            <X className="h-4 w-4" />
          </button>

          {validating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs font-medium">Validando...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[color-mix(in_srgb,var(--text)_24%,transparent)] py-12 text-text-muted transition-colors hover:border-brand hover:text-brand">
          <Upload className="h-10 w-10" />
          <div className="text-center">
            <p className="text-sm font-medium">Haz clic para subir</p>
            <p className="mt-1 text-xs">{description}</p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      {showError && validation && (
        <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Error de validación</p>
            <p className="mt-0.5 text-xs">{validation.error}</p>
            {validation.width > 0 && (
              <p className="mt-1 text-xs opacity-80">
                Dimensiones actuales: {validation.width}×{validation.height}px
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploadField;
