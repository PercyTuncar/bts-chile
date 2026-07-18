"use client";

// Partículas de corazones 💜 muy sutiles para el hero del home — PRD §3.2.F.
// Baja opacidad, GPU-friendly; se desactivan con prefers-reduced-motion.
import { motion, useReducedMotion } from "framer-motion";

const HEARTS = [
  { left: "8%", delay: 0, duration: 9, size: 18 },
  { left: "22%", delay: 1.5, duration: 11, size: 14 },
  { left: "40%", delay: 0.8, duration: 10, size: 22 },
  { left: "58%", delay: 2.2, duration: 12, size: 16 },
  { left: "74%", delay: 1.1, duration: 9.5, size: 20 },
  { left: "88%", delay: 0.4, duration: 10.5, size: 14 },
];

export function HeartsBackground() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {HEARTS.map((h, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 select-none"
          style={{ left: h.left, fontSize: h.size, opacity: 0.12 }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: -320, opacity: [0, 0.14, 0] }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          💜
        </motion.span>
      ))}
    </div>
  );
}

export default HeartsBackground;
