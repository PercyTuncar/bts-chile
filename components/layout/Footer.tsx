// Footer glass — internal linking con anchor descriptivo (sitelinks) + sameAs — PRD §3.4, §15.1.
import Link from "next/link";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="glass-nav mt-16 border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3">
        {/* Marca + redes */}
        <div>
          <Link href="/" className="flex items-center gap-1.5 text-lg font-bold">
            btschile.com <span aria-hidden>💜</span>
          </Link>
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            La comunidad oficial de ARMY en Chile. Entradas verificadas, noticias, tienda y
            membresía ARMY Boom v4.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`BTS Chile en ${s.name}`}
                  className="inline-flex items-center rounded-full glass px-3 py-1.5 text-xs font-medium hover:text-brand"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Navegación (anchor descriptivo para sitelinks) */}
        <nav aria-label="Enlaces del sitio">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Explora
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/" className="hover:text-brand">
                Inicio — BTS Chile
              </Link>
            </li>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand">
                  {link.anchor}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Newsletter */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Newsletter ARMY
          </h2>
          <p className="mb-3 text-sm text-text-muted">
            Recibe novedades de entradas y noticias 💜
          </p>
          <NewsletterForm source="footer" />
        </div>
      </div>

      <div className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] py-6 text-center text-xs text-text-muted">
        © 2026 BTS Chile · Comunidad de fans · &quot;Purple you, ARMY Chile 💜&quot;
      </div>
    </footer>
  );
}

export default Footer;
