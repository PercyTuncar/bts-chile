import type { Metadata } from "next";
import { SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de BTS Chile. Conoce cómo protegemos y manejamos tu información personal.",
  alternates: { canonical: `${SITE_URL}/privacidad` },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <article className="prose prose-lg dark:prose-invert">
        <h1>Política de Privacidad</h1>

        <p className="lead">
          Última actualización: 23 de agosto de 2026
        </p>

        <h2>1. Información que Recopilamos</h2>
        <p>
          En BTS Chile recopilamos la siguiente información:
        </p>
        <ul>
          <li><strong>Información de cuenta:</strong> nombre, correo electrónico, nombre de usuario</li>
          <li><strong>Información de perfil:</strong> foto de perfil, biografía, redes sociales</li>
          <li><strong>Información de compra:</strong> historial de pedidos, preferencias de entradas</li>
          <li><strong>Información técnica:</strong> dirección IP, tipo de navegador, dispositivo</li>
        </ul>

        <h2>2. Cómo Usamos tu Información</h2>
        <p>Utilizamos tu información personal para:</p>
        <ul>
          <li>Procesar tus compras de entradas y productos</li>
          <li>Gestionar tu membresía ARMY Boom v4</li>
          <li>Enviarte noticias y actualizaciones (con tu consentimiento)</li>
          <li>Mejorar nuestros servicios y experiencia de usuario</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>

        <h2>3. Compartir Información</h2>
        <p>
          No vendemos tu información personal. Solo compartimos datos con:
        </p>
        <ul>
          <li><strong>Procesadores de pago:</strong> PayPal para transacciones seguras</li>
          <li><strong>Proveedores de servicios:</strong> Firebase (Google) para autenticación y base de datos</li>
          <li><strong>Autoridades:</strong> cuando sea legalmente requerido</li>
        </ul>

        <h2>4. Cookies y Tecnologías Similares</h2>
        <p>
          Usamos cookies para mejorar tu experiencia. Puedes gestionar las cookies desde tu navegador.
        </p>

        <h2>5. Tus Derechos</h2>
        <p>Tienes derecho a:</p>
        <ul>
          <li>Acceder a tu información personal</li>
          <li>Corregir información incorrecta</li>
          <li>Solicitar la eliminación de tu cuenta</li>
          <li>Exportar tus datos</li>
          <li>Oponerte al procesamiento de tus datos</li>
        </ul>

        <h2>6. Seguridad</h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para proteger tu información,
          incluyendo encriptación SSL/TLS, autenticación Firebase, y almacenamiento seguro en la nube.
        </p>

        <h2>7. Retención de Datos</h2>
        <p>
          Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario
          para cumplir con obligaciones legales.
        </p>

        <h2>8. Menores de Edad</h2>
        <p>
          Nuestro servicio está dirigido a personas mayores de 13 años. Si eres menor de 18 años,
          necesitas el consentimiento de tus padres o tutores.
        </p>

        <h2>9. Cambios a esta Política</h2>
        <p>
          Podemos actualizar esta política. Te notificaremos de cambios significativos por correo
          electrónico o mediante un aviso en el sitio.
        </p>

        <h2>10. Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política de privacidad, contáctanos en:
        </p>
        <ul>
          <li>Email: <a href="mailto:privacidad@btschile.com">privacidad@btschile.com</a></li>
          <li>Dirección: Santiago, Chile</li>
        </ul>
      </article>
    </main>
  );
}
