"use client";

import Link from "next/link";
import { TrendingUp, Users, MessageSquare } from "lucide-react";

const STATS = [
  {
    label: "Miembros Activos",
    value: "2,847",
    icon: Users,
    color: "text-purple-500",
  },
  {
    label: "Posts Hoy",
    value: "156",
    icon: MessageSquare,
    color: "text-blue-500",
  },
  {
    label: "Online Ahora",
    value: "423",
    icon: TrendingUp,
    color: "text-green-500",
  },
];

const QUICK_LINKS = [
  { label: "🎟 Comprar Entradas", href: "/entradas" },
  { label: "📰 Últimas Noticias", href: "/noticias" },
  { label: "🛍 Tienda Oficial", href: "/tienda" },
  { label: "💜 Membresía ARMY", href: "/membresia" },
  { label: "❓ Preguntas Frecuentes", href: "/preguntas-frecuentes" },
  { label: "📍 Cómo Llegar", href: "/como-llegar" },
];

export function QuickLinks() {
  return (
    <div className="space-y-4">
      {/* Estadísticas de la comunidad */}
      <div className="glass-card rounded-card p-4">
        <h3 className="text-lg font-semibold mb-4">Comunidad</h3>

        <div className="space-y-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm text-text-muted">{stat.label}</span>
              </div>
              <span className="font-semibold tabular-nums">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enlaces rápidos */}
      <div className="glass-card rounded-card p-4">
        <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>

        <nav className="space-y-1">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm rounded-lg hover:bg-surface/50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
