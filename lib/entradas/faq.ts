// FAQ de /entradas — PRD §5.8 / §15.2. Contenido VISIBLE (acordeón) = JSON-LD FAQPage.
export interface FaqItem {
  question: string;
  answer: string;
}

export const ENTRADAS_FAQ: FaqItem[] = [
  {
    question: "¿Cómo compro entradas para BTS Chile 2026 en btschile.com?",
    answer:
      "Selecciona tu zona y fecha en el mapa del Estadio Nacional, elige la cantidad (máximo 3 entradas) y el número de cuotas (1, 2 o 3). En /entradas/comprar completa tus datos y realiza el pago. Las entradas llegan a tu email en 24-48 horas hábiles.",
  },
  {
    question: "¿Son seguras las entradas de btschile.com?",
    answer:
      "Sí. Solo el administrador de btschile.com vende las entradas, eliminando el riesgo de estafas. Cada entrada es verificada antes de ser entregada al comprador vía email.",
  },
  {
    question: "¿Puedo comprar entradas BTS Chile en cuotas?",
    answer:
      "Sí, puedes pagar en 1, 2 o 3 cuotas a través de PayPal o Mercado Pago. Al seleccionar las cuotas se muestra el monto exacto por pago antes de confirmar.",
  },
  {
    question: "¿Cuánto cuestan las entradas para BTS en Santiago?",
    answer:
      "Los precios van desde $299 USD (Pacífico Lateral) hasta $1,784 USD (Pacífico Medio), según la zona del Estadio Nacional. La zona Cancha Andes está disponible desde $949 USD.",
  },
  {
    question: "¿Cuándo es el concierto de BTS en Chile 2026?",
    answer:
      "BTS se presenta el viernes 16 y sábado 17 de octubre de 2026 en el Estadio Nacional Julio Martínez Prádanos, Santiago de Chile, en el BTS WORLD TOUR ARIRANG.",
  },
  {
    question: "¿Qué zonas quedan disponibles para BTS Chile?",
    answer:
      "La zona Cancha Andes ($949 USD) tiene disponibilidad limitada para ambas fechas. El resto está agotado en el mercado oficial.",
  },
  {
    question: "¿Cómo me llegan las entradas de BTS Chile?",
    answer:
      "Una vez confirmado tu pago, btschile.com te envía la entrada en formato digital (PDF o imagen) a tu email registrado en 24 a 48 horas hábiles.",
  },
  {
    question: "¿Puedo comprar entradas BTS Chile sin membresía ARMY?",
    answer:
      "Sí, no necesitas membresía para comprar entradas. Solo debes registrarte con tu cuenta de Google y completar el proceso de compra.",
  },
];
