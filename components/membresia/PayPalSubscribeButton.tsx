"use client";

// Botón de suscripción PayPal (checkout nativo) — PRD §10.5.
// createSubscription({ plan_id }) con user_action SUBSCRIBE_NOW; onApprove envía el
// subscriptionID provisional a /api/paypal/subscription. La activación real llega por webhook.
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { auth } from "@/lib/firebase";

export function PayPalSubscribeButton({
  planId,
  tierName,
}: {
  planId?: string;
  tierName: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const isDemo = !clientId || clientId.startsWith("mock") || !planId;

  // Modo demo (credenciales mock): no cargamos el SDK de PayPal para no romper la UX.
  if (isDemo) {
    return (
      <button
        type="button"
        onClick={() =>
          toastError("PayPal en modo demo — configura credenciales reales para suscribir.")
        }
        className="h-12 w-full rounded-button bg-[#ffc439] font-semibold text-[#0b0b0f] transition-transform hover:scale-[1.01]"
      >
        Suscribirme a {tierName} (demo)
      </button>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        components: "buttons",
        intent: "subscription",
        vault: true,
      }}
    >
      <PayPalButtons
        style={{ shape: "pill", color: "blue", layout: "vertical", label: "subscribe" }}
        createSubscription={(_data, actions) => {
          const origin =
            typeof window !== "undefined" ? window.location.origin : "";
          return actions.subscription.create({
            plan_id: planId as string,
            custom_id: auth.currentUser?.uid,
            application_context: {
              user_action: "SUBSCRIBE_NOW",
              return_url: `${origin}/membresia`,
              cancel_url: `${origin}/membresia`,
            },
          });
        }}
        onApprove={async (data) => {
          try {
            const token = await auth.currentUser?.getIdToken();
            await fetch("/api/paypal/subscription", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token ?? ""}`,
              },
              body: JSON.stringify({ subscriptionID: data.subscriptionID }),
            });
            toastSuccess("¡Suscripción creada! Activando tu membresía… 💜");
          } catch (err) {
            console.error(err);
            toastError("No se pudo registrar la suscripción.");
          }
        }}
      />
    </PayPalScriptProvider>
  );
}

export default PayPalSubscribeButton;
