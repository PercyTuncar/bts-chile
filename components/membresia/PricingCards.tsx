"use client";

// Pricing estilo Apple — PRD §10.7. Cards glass, tier recomendado destacado,
// toggle mensual/anual, botón PayPal por tier de pago.
import { Check } from "lucide-react";
import { useState } from "react";
import { PayPalSubscribeButton } from "@/components/membresia/PayPalSubscribeButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { TIERS } from "@/lib/membership";
import { formatUSD } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

type Period = "monthly" | "annual";

export function PricingCards() {
  const [period, setPeriod] = useState<Period>("monthly");
  const { isAuthenticated, profile } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <SegmentedControl<Period>
          ariaLabel="Periodicidad"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "monthly", label: "Mensual" },
            { value: "annual", label: "Anual" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => {
          const price = period === "monthly" ? tier.monthlyUSD : tier.annualUSD;
          const isCurrent = profile?.membershipType === tier.key;
          const isPaid = tier.key !== "free";

          return (
            <GlassCard
              key={tier.key}
              className={cn(
                "flex flex-col",
                tier.recommended &&
                  "ring-2 ring-brand shadow-[0_16px_48px_color-mix(in_srgb,var(--brand)_25%,transparent)]",
                tier.accent && "ring-1 ring-[color-mix(in_srgb,var(--accent)_60%,transparent)]",
              )}
            >
              {tier.recommended && (
                <span className="mb-2 inline-flex w-fit rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
                  Popular
                </span>
              )}
              <h3 className="text-h3 font-semibold">{tier.name}</h3>
              <p className="text-sm text-text-muted">{tier.tagline}</p>

              <div className="my-4">
                <span className="text-3xl font-bold tabular-nums">
                  {price === 0 ? "Gratis" : formatUSD(price)}
                </span>
                {price !== 0 && (
                  <span className="text-sm text-text-muted">
                    {" "}
                    /{period === "monthly" ? "mes" : "año"}
                  </span>
                )}
              </div>

              <ul className="mb-5 flex flex-1 flex-col gap-2">
                {tier.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <PillButton variant="secondary" disabled>
                  Tu plan actual
                </PillButton>
              ) : !isPaid ? (
                <PillButton
                  variant="secondary"
                  onClick={() => (isAuthenticated ? undefined : openLogin())}
                >
                  {isAuthenticated ? "Incluido" : "Comenzar gratis"}
                </PillButton>
              ) : isAuthenticated ? (
                <PayPalSubscribeButton planId={tier.planIdMonthly} tierName={tier.name} />
              ) : (
                <PillButton onClick={openLogin}>Entrar para suscribirte</PillButton>
              )}
            </GlassCard>
          );
        })}
      </div>

      {period === "annual" && (
        <p className="text-center text-xs text-text-muted">
          El cobro recurrente vía PayPal se procesa según el plan de facturación configurado.
        </p>
      )}
    </div>
  );
}

export default PricingCards;
