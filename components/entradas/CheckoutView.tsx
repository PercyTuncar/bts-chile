"use client";

// Checkout de entradas — PRD §6. Stepper 4 pasos, fórmula canónica, links de pago, orders.
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { Stepper } from "@/components/ui/Stepper";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { createTicketOrder } from "@/lib/firestore/orders";
import { computeTicketPricing, formatUSD } from "@/lib/utils/formatters";
import { checkoutBuyerSchema, type CheckoutBuyerInput } from "@/lib/utils/validators";
import type { EventDate, PaymentMethod, TicketPaymentLinks } from "@/types";
import type { ZoneData } from "@/lib/entradas/zones";

const STEPS = ["Resumen", "Datos", "Pago", "Confirmar"];

const PAYMENT_METHODS: {
  key: PaymentMethod;
  label: string;
  online: boolean;
  desc: string;
  disabled?: boolean;
}[] = [
  { key: "paypal", label: "PayPal", online: true, desc: "Link de pago seguro por zona." },
  { key: "mercadopago", label: "Mercado Pago", online: true, desc: "Link de pago directo.", disabled: true },
  { key: "transfer", label: "Transferencia Bancaria", online: false, desc: "Te mostramos los datos bancarios.", disabled: true },
  { key: "efectivo", label: "Efectivo (Khipu / CajaVecina)", online: false, desc: "Instrucciones de pago en efectivo.", disabled: true },
];

const EVENT_DATE_LABEL: Record<EventDate, string> = {
  "2026-10-14": "Miércoles 14 de octubre de 2026",
  "2026-10-16": "Viernes 16 de octubre de 2026",
  "2026-10-17": "Sábado 17 de octubre de 2026",
  both: "Todas las fechas (14, 16 y 17 de octubre de 2026)",
};

function paymentLinkKey(method: PaymentMethod, installments: number): string {
  const suffix = installments === 1 ? "cuota" : "cuotas";
  return `${method}_${installments}${suffix}`;
}

export function CheckoutView({
  zone,
  quantity,
  installments,
  eventDate,
  paymentLinks,
}: {
  zone: ZoneData;
  quantity: number;
  installments: number;
  eventDate: EventDate;
  paymentLinks: TicketPaymentLinks;
}) {
  const { status, firebaseUser, profile } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const pricing = computeTicketPricing(zone.priceUSD, quantity, installments);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CheckoutBuyerInput>({
    resolver: zodResolver(checkoutBuyerSchema),
    defaultValues: {
      buyerName: profile?.displayName ?? firebaseUser?.displayName ?? "",
      buyerEmail: profile?.email ?? firebaseUser?.email ?? "",
      buyerRut: "",
      buyerPhone: "",
    },
  });

  // Guard de sesión (§6.1).
  if (status !== "authenticated" || !firebaseUser) {
    return (
      <GlassCard className="mx-auto max-w-md text-center">
        <h2 className="mb-2 text-h3 font-semibold">Inicia sesión para comprar</h2>
        <p className="mb-5 text-text-muted">
          Necesitas una cuenta para completar tu compra de entradas.
        </p>
        <PillButton onClick={openLogin}>Entrar con Google</PillButton>
      </GlassCard>
    );
  }

  const resolvedLink = method ? (paymentLinks[paymentLinkKey(method, installments) as keyof TicketPaymentLinks] ?? "") : "";
  const canContinueToConfirmation = method === "paypal" && Boolean(resolvedLink);

  async function handlePlaceOrder() {
    if (!firebaseUser || method !== "paypal" || !resolvedLink) return;
    const buyer = getValues();
    setPlacing(true);
    try {
      const orderId = await createTicketOrder({
        buyerUid: firebaseUser.uid,
        buyerName: buyer.buyerName,
        buyerEmail: buyer.buyerEmail,
        buyerPhone: buyer.buyerPhone,
        buyerRut: buyer.buyerRut,
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        quantity,
        installments,
        pricePerTicketUSD: zone.priceUSD,
        subtotalUSD: pricing.subtotalUSD,
        serviceFeeUSD: pricing.serviceFeeUSD,
        totalUSD: pricing.totalUSD,
        installmentAmountUSD: pricing.installmentAmountUSD,
        eventDate,
        paymentMethod: method,
        paymentLinkUsed: resolvedLink,
      });
      setPlacedOrderId(orderId);
      toastSuccess("¡Pedido creado! 💜");
      if (resolvedLink) window.open(resolvedLink, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toastError("No se pudo crear el pedido. Inténtalo de nuevo.");
    } finally {
      setPlacing(false);
    }
  }

  // Pantalla de confirmación post-pedido.
  if (placedOrderId) {
    return (
      <GlassCard className="mx-auto max-w-lg text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success" aria-hidden />
        <h2 className="text-h2 font-semibold">¡Pedido registrado!</h2>
        <p className="mt-2 text-text-muted">
          Tu pedido <b>{placedOrderId}</b> está pendiente de pago. Envía tu comprobante al WhatsApp
          del admin o a pagos@btschile.com. Recibirás tus entradas por email en 24-48 horas hábiles.
        </p>
        {method && !PAYMENT_METHODS.find((m) => m.key === method)?.online && (
          <div className="mt-4 rounded-2xl bg-brand-soft p-4 text-left text-sm">
            {method === "transfer" ? (
              <>
                <p className="font-semibold">Datos de transferencia</p>
                <p>Banco Estado · Cuenta Corriente 000000000 · BTS Chile SpA · pagos@btschile.com</p>
              </>
            ) : (
              <>
                <p className="font-semibold">Pago en efectivo</p>
                <p>Solicita el código Khipu/CajaVecina escribiendo a pagos@btschile.com.</p>
              </>
            )}
          </div>
        )}
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      {/* Columna principal */}
      <div className="flex flex-col gap-6">
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <GlassCard>
            <h2 className="mb-4 text-h3 font-semibold">Resumen de tu pedido</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Evento" value='BTS WORLD TOUR "ARIRANG" — Santiago' />
              <Row label="Fecha" value={EVENT_DATE_LABEL[eventDate]} />
              <Row label="Recinto" value="Estadio Nacional, Santiago" />
              <Row label="Zona" value={zone.zoneName} />
              <Row label="Cantidad" value={`${quantity} ${quantity === 1 ? "entrada" : "entradas"}`} />
              <Row label="Precio unitario" value={formatUSD(zone.priceUSD)} />
            </dl>
            <div className="mt-5">
              <PillButton onClick={() => setStep(1)}>Continuar</PillButton>
            </div>
          </GlassCard>
        )}

        {step === 1 && (
          <GlassCard className="flex flex-col gap-4">
            <h2 className="text-h3 font-semibold">Datos del comprador</h2>
            <Field label="Nombre completo" error={errors.buyerName?.message}>
              <input {...register("buyerName")} className={inputCls} />
            </Field>
            <Field label="RUT / Pasaporte" error={errors.buyerRut?.message}>
              <input {...register("buyerRut")} className={inputCls} placeholder="12.345.678-9" />
            </Field>
            <Field label="Email de confirmación" error={errors.buyerEmail?.message}>
              <input {...register("buyerEmail")} type="email" className={inputCls} />
            </Field>
            <Field label="Teléfono (WhatsApp)" error={errors.buyerPhone?.message}>
              <input {...register("buyerPhone")} className={inputCls} placeholder="+56 9 1234 5678" />
            </Field>
            <div className="flex gap-3">
              <PillButton variant="secondary" onClick={() => setStep(0)}>
                Atrás
              </PillButton>
              <PillButton
                fullWidth
                onClick={async () => {
                  const ok = await trigger();
                  if (ok) setStep(2);
                }}
              >
                Continuar
              </PillButton>
            </div>
          </GlassCard>
        )}

        {step === 2 && (
          <GlassCard className="flex flex-col gap-3">
            <h2 className="text-h3 font-semibold">Método de pago</h2>
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.key}
                type="button"
                disabled={m.disabled}
                onClick={() => setMethod(m.key)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  method === m.key
                    ? "border-brand bg-brand-soft"
                    : "border-[color-mix(in_srgb,var(--text)_12%,transparent)] hover:border-brand disabled:hover:border-[color-mix(in_srgb,var(--text)_12%,transparent)]"
                }`}
              >
                <span>
                  <span className="font-medium">{m.label}</span>
                  <span className="block text-sm text-text-muted">
                    {m.disabled ? "Próximamente disponible." : m.desc}
                  </span>
                </span>
                <span
                  className={`h-5 w-5 rounded-full border-2 ${
                    method === m.key ? "border-brand bg-brand" : "border-text-muted"
                  }`}
                  aria-hidden
                />
              </button>
            ))}
            {method === "paypal" && !resolvedLink && (
              <p className="text-sm text-warning">
                PayPal aún no tiene un enlace de pago configurado para esta zona y número de cuotas.
              </p>
            )}
            <div className="flex gap-3">
              <PillButton variant="secondary" onClick={() => setStep(1)}>
                Atrás
              </PillButton>
              <PillButton fullWidth disabled={!canContinueToConfirmation} onClick={() => setStep(3)}>
                Continuar
              </PillButton>
            </div>
          </GlassCard>
        )}

        {step === 3 && (
          <GlassCard className="flex flex-col gap-4">
            <h2 className="text-h3 font-semibold">Confirmación</h2>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[var(--brand)]"
              />
              <span>
             Tras confirmar el pago entiendo que esta es una venta de mercado secundario y que las entradas serán
                entregadas vía QUENTRO dentro de los últimos 30 hábiles previos al evento. No hay reembolsos ni cambios de fecha.
              </span>
            </label>
            <div className="flex gap-3">
              <PillButton variant="secondary" onClick={() => setStep(2)}>
                Atrás
              </PillButton>
              <PillButton fullWidth disabled={!accepted || placing} onClick={handlePlaceOrder}>
                {placing ? "Procesando…" : "Proceder al pago 💜"}
              </PillButton>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Resumen sticky */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <GlassCard>
          <h3 className="mb-3 text-h3 font-semibold">Resumen</h3>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label={`Subtotal (${quantity} ×)`} value={formatUSD(pricing.subtotalUSD)} />
            <Row label="Comisión de servicio (10%)" value={formatUSD(pricing.serviceFeeUSD)} />
            <div className="my-1 border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)]" />
            <Row label="Total" value={formatUSD(pricing.totalUSD)} strong />
            {installments > 1 && (
              <Row
                label={`${installments} cuotas de`}
                value={formatUSD(pricing.installmentAmountUSD)}
              />
            )}
          </dl>
        </GlassCard>
      </div>
    </div>
  );
}

const inputCls =
  "h-12 w-full rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-muted">{label}</dt>
      <dd className={`tabular-nums ${strong ? "text-lg font-bold" : "font-medium"}`}>{value}</dd>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  );
}

export default CheckoutView;
