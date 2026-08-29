"use client";

import { Cake } from "lucide-react";
import { useEffect, useState } from "react";

interface Birthday {
  id: number;
  member: string;
  date: string;
  month: number;
  day: number;
  daysUntil: number;
  image: string;
}

const MEMBER_BIRTHDAYS = [
  { member: "Jin", month: 12, day: 4, image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg" },
  { member: "Suga", month: 3, day: 9, image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg" },
  { member: "J-Hope", month: 2, day: 18, image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg" },
  { member: "RM", month: 9, day: 12, image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg" },
  { member: "Jimin", month: 10, day: 13, image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg" },
  { member: "V", month: 12, day: 30, image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg" },
  { member: "Jungkook", month: 9, day: 1, image: "https://cdn-blog.joinnus.com/wp-content/uploads/2026/03/18171412/portada-bts-lanzamiento-de-album-arirang-info.jpg" },
];

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

function calculateDaysUntil(month: number, day: number): number {
  const today = new Date();
  const currentYear = today.getFullYear();

  // Crear fecha del cumpleaños este año
  let birthdayThisYear = new Date(currentYear, month - 1, day);

  // Si ya pasó este año, usar el próximo año
  if (birthdayThisYear < today) {
    birthdayThisYear = new Date(currentYear + 1, month - 1, day);
  }

  // Calcular diferencia en días
  const diffTime = birthdayThisYear.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function BirthdayWidget() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  useEffect(() => {
    // Calcular días hasta cada cumpleaños
    const birthdaysWithDays = MEMBER_BIRTHDAYS.map((b, index) => ({
      id: index + 1,
      member: b.member,
      date: `${b.day} de ${MONTH_NAMES[b.month - 1]}`,
      month: b.month,
      day: b.day,
      daysUntil: calculateDaysUntil(b.month, b.day),
      image: b.image,
    }));

    // Ordenar por proximidad (menor días primero)
    const sortedBirthdays = birthdaysWithDays.sort((a, b) => a.daysUntil - b.daysUntil);

    // Mostrar solo los 2 más próximos
    setBirthdays(sortedBirthdays.slice(0, 2));
  }, []);

  if (birthdays.length === 0) return null;

  return (
    <div className="glass-card rounded-card p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Cake className="w-5 h-5 text-brand" />
        Próximos Cumpleaños
      </h3>

      <div className="space-y-3">
        {birthdays.map((birthday) => (
          <div
            key={birthday.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-brand-soft/20 dark:bg-brand-soft/5"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface flex-shrink-0">
              <img
                src={birthday.image}
                alt={birthday.member}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{birthday.member}</p>
              <p className="text-xs text-text-muted">{birthday.date}</p>
              <p className="text-xs text-brand mt-0.5">
                {birthday.daysUntil === 0 ? "¡Hoy!" : birthday.daysUntil === 1 ? "Mañana" : `En ${birthday.daysUntil} días`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
