import type { Metadata } from "next";
import { SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de BTS Chile. Lee nuestras políticas antes de usar el sitio.",
  alternates: { canonical: `${SITE_URL}/terminos` },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <article className="prose prose-lg dark:prose-invert">
        <h1>Términos y Condiciones de Uso</h1>

        <p className="lead">
          Última actualización: 23 de agosto de 2026
        </p>

        <h2>1. Aceptación de los Términos</h2>
        <p>
          Al acceder y usar BTS Chile (www.btschile.com), aceptas cumplir con estos términos y condiciones.
          Si no estás de acuerdo, por favor no uses nuestro sitio.
        </p>

        <h2>2. Descripción del Servicio</h2>
        <p>
          BTS Chile es una plataforma comunitaria para fans de BTS en Chile que ofrece:
        </p>
        <ul>
          <li>Venta de entradas para conciertos de BTS</li>
          <li>Noticias y actualizaciones sobre BTS y K-pop</li>
          <li>Tienda de merchandise oficial</li>
          <li>Membresía ARMY Boom v4 con beneficios exclusivos</li>
          <li>Comunidad y foros para conectar con otros fans</li>
        </ul>

        <h2>3. Registro y Cuenta</h2>
        <h3>3.1 Requisitos</h3>
        <p>
          Debes tener al menos 13 años para crear una cuenta. Los menores de 18 años necesitan
          consentimiento de sus padres o tutores.
        </p>

        <h3>3.2 Responsabilidad</h3>
        <p>
          Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Notifícanos
          inmediatamente si detectas uso no autorizado.
        </p>

        <h2>4. Compra de Entradas</h2>
        <h3>4.1 Política de Ventas</h3>
        <ul>
          <li>Todas las ventas son finales</li>
          <li>Los precios están en USD e incluyen impuestos aplicables</li>
          <li>Aceptamos pagos mediante PayPal</li>
          <li>Las entradas son nominativas y no transferibles</li>
        </ul>

        <h3>4.2 Entrega</h3>
        <p>
          Las entradas se entregan electrónicamente a tu correo registrado. Asegúrate de
          proporcionar información correcta.
        </p>

        <h3>4.3 Reembolsos</h3>
        <p>
          Los reembolsos solo se procesan si el evento es cancelado oficialmente. No se aceptan
          devoluciones por cambio de opinión.
        </p>

        <h2>5. Membresía ARMY Boom v4</h2>
        <ul>
          <li>Primer mes gratis, luego desde $1 USD/mes</li>
          <li>Renovación automática mensual</li>
          <li>Puedes cancelar en cualquier momento</li>
          <li>Los beneficios se activan inmediatamente tras el pago</li>
        </ul>

        <h2>6. Contenido del Usuario</h2>
        <h3>6.1 Publicaciones</h3>
        <p>
          Al publicar contenido en nuestra comunidad, garantizas que:
        </p>
        <ul>
          <li>Tienes los derechos necesarios sobre el contenido</li>
          <li>No infringe derechos de terceros</li>
          <li>Cumple con nuestras normas comunitarias</li>
        </ul>

        <h3>6.2 Contenido Prohibido</h3>
        <p>Está prohibido publicar contenido que:</p>
        <ul>
          <li>Sea ilegal, difamatorio o fraudulento</li>
          <li>Contenga discurso de odio o discriminación</li>
          <li>Acose o intimide a otros usuarios</li>
          <li>Contenga spam o publicidad no autorizada</li>
          <li>Infrinja propiedad intelectual</li>
        </ul>

        <h2>7. Propiedad Intelectual</h2>
        <p>
          Todo el contenido del sitio (diseño, texto, gráficos, logos) es propiedad de BTS Chile
          o sus licenciantes y está protegido por leyes de propiedad intelectual.
        </p>

        <h2>8. Limitación de Responsabilidad</h2>
        <p>
          BTS Chile no se hace responsable de:
        </p>
        <ul>
          <li>Cancelaciones o cambios de eventos fuera de nuestro control</li>
          <li>Problemas técnicos durante la compra</li>
          <li>Contenido publicado por usuarios</li>
          <li>Daños indirectos o consecuentes</li>
        </ul>

        <h2>9. Modificaciones del Servicio</h2>
        <p>
          Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del
          servicio en cualquier momento, con o sin previo aviso.
        </p>

        <h2>10. Terminación</h2>
        <p>
          Podemos suspender o terminar tu cuenta si violas estos términos, sin previo aviso y
          sin responsabilidad hacia ti.
        </p>

        <h2>11. Ley Aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de Chile. Cualquier disputa se resolverá en
          los tribunales de Santiago, Chile.
        </p>

        <h2>12. Contacto</h2>
        <p>
          Para preguntas sobre estos términos:
        </p>
        <ul>
          <li>Email: <a href="mailto:legal@btschile.com">legal@btschile.com</a></li>
          <li>Email general: <a href="mailto:contacto@btschile.com">contacto@btschile.com</a></li>
        </ul>
      </article>
    </main>
  );
}
