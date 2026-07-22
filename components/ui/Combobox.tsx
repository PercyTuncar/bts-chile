"use client";

/**
 * Combobox con búsqueda para seleccionar opciones de una lista.
 * Usado en selectores de país y ciudad.
 */

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  emptyMessage?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  emptyMessage = "No se encontraron resultados",
  label,
  error,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opciones según búsqueda
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Focus en input cuando se abre
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (option: string) => {
    onChange(option);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-text">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-2 rounded-full border bg-surface px-4 text-left transition-colors",
          error ? "border-danger" : "border-border hover:border-brand",
          disabled && "cursor-not-allowed opacity-50",
          open && "border-brand ring-2 ring-brand/20"
        )}
      >
        <span className={cn("flex-1 truncate", !value && "text-text-muted")}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <X
              className="h-4 w-4 text-text-muted hover:text-text"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-text-muted transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {error && (
        <span className="mt-1 block text-sm text-danger">{error}</span>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-2xl border border-border bg-surface shadow-xl">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border p-3">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
            />
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-text-muted">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-brand-soft",
                    value === option && "bg-brand-soft text-brand font-medium"
                  )}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Combobox;
