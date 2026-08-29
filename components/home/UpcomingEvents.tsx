"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock } from "lucide-react";

const EVENTS = [
  {
    id: 1,
    title: "BTS Chile 2026",
    date: "14 Oct 2026",
    time: "20:00 hrs",
    location: "Estadio Nacional",
    type: "Concierto",
    color: "bg-purple-500",
  },
  {
    id: 2,
    title: "BTS Chile 2026",
    date: "16 Oct 2026",
    time: "20:00 hrs",
    location: "Estadio Nacional",
    type: "Concierto",
    color: "bg-purple-500",
  },
  {
    id: 3,
    title: "BTS Chile 2026",
    date: "17 Oct 2026",
    time: "20:00 hrs",
    location: "Estadio Nacional",
    type: "Concierto",
    color: "bg-purple-500",
  },
];

export function UpcomingEvents() {
  return (
    <div className="glass-card rounded-card p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-brand" />
        Próximos Eventos
      </h3>

      <div className="space-y-3">
        {EVENTS.map((event) => (
          <Link
            key={event.id}
            href="/entradas"
            className="block group"
          >
            <div className="flex gap-3 p-3 rounded-lg hover:bg-surface/50 transition-colors">
              <div className={`${event.color} w-1 rounded-full flex-shrink-0`} />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-brand transition-colors">
                  {event.title}
                </p>

                <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  <span>{event.date} • {event.time}</span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                  <MapPin className="w-3 h-3" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/entradas"
        className="block mt-4 text-center text-sm text-brand hover:text-brand-strong font-medium transition-colors"
      >
        Ver todas las fechas →
      </Link>
    </div>
  );
}
