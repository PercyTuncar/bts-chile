"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

export function WhatsAppPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Páginas donde se debe mostrar el popup
  const SHOW_ON_PAGES = ["/", "/entradas", "/noticias", "/tienda", "/comunidad", "/membresia"];

  useEffect(() => {
    // Verificar si estamos en una página donde se debe mostrar
    const shouldShow = SHOW_ON_PAGES.includes(pathname);

    if (shouldShow) {
      // Mostrar el popup después de 3 segundos
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Si no estamos en una página válida, ocultar el popup
      setIsVisible(false);
    }
  }, [pathname]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleJoinGroup = () => {
    window.open("https://chat.whatsapp.com/CWjRdwsDxMHFo3c4CrGwjv", "_blank");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-scale-in"
        role="dialog"
        aria-labelledby="whatsapp-popup-title"
        aria-modal="true"
      >
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Contenido */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icono de WhatsApp */}
            <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 32 32"
                className="w-10 h-10"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16 0C7.164 0 0 7.164 0 16c0 2.825.738 5.488 2.031 7.806L.7 29.3l5.694-1.494A15.936 15.936 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm8.281 22.719c-.344.969-2.031 1.781-2.794 1.894-.75.113-1.706.169-2.75-.169a25.118 25.118 0 01-2.5-.919c-4.4-1.9-7.262-6.338-7.481-6.631-.219-.294-1.794-2.387-1.794-4.556 0-2.169 1.137-3.237 1.544-3.681.406-.444.887-.556 1.181-.556.294 0 .588.006.844.013.269.013.631-.1.988.756.356.856 1.231 3 1.344 3.219.113.219.188.475.037.769-.15.294-.225.481-.444.737-.219.256-.463.575-.663.769-.219.219-.444.456-.188.894.256.431 1.144 1.888 2.456 3.056 1.688 1.506 3.1 1.975 3.538 2.194.444.219.7.181.956-.113.256-.294 1.1-1.281 1.394-1.725.294-.444.588-.369.994-.219.406.15 2.569 1.213 3.006 1.431.438.219.731.325.838.506.106.181.106 1.044-.238 2.013z" />
              </svg>
            </div>

            {/* Título */}
            <h2
              id="whatsapp-popup-title"
              className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white"
            >
              Únete a nuestro grupo de WhatsApp
            </h2>

            {/* Descripción */}
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
              Recibe actualizaciones exclusivas sobre el show de Bruno Mars en Perú
            </p>

            {/* Botón de acción */}
            <button
              onClick={handleJoinGroup}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg
                viewBox="0 0 32 32"
                className="w-5 h-5"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16 0C7.164 0 0 7.164 0 16c0 2.825.738 5.488 2.031 7.806L.7 29.3l5.694-1.494A15.936 15.936 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm8.281 22.719c-.344.969-2.031 1.781-2.794 1.894-.75.113-1.706.169-2.75-.169a25.118 25.118 0 01-2.5-.919c-4.4-1.9-7.262-6.338-7.481-6.631-.219-.294-1.794-2.387-1.794-4.556 0-2.169 1.137-3.237 1.544-3.681.406-.444.887-.556 1.181-.556.294 0 .588.006.844.013.269.013.631-.1.988.756.356.856 1.231 3 1.344 3.219.113.219.188.475.037.769-.15.294-.225.481-.444.737-.219.256-.463.575-.663.769-.219.219-.444.456-.188.894.256.431 1.144 1.888 2.456 3.056 1.688 1.506 3.1 1.975 3.538 2.194.444.219.7.181.956-.113.256-.294 1.1-1.281 1.394-1.725.294-.444.588-.369.994-.219.406.15 2.569 1.213 3.006 1.431.438.219.731.325.838.506.106.181.106 1.044-.238 2.013z" />
              </svg>
              Unirme al Grupo
            </button>

            {/* Texto pequeño */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Serás redirigido a WhatsApp
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
