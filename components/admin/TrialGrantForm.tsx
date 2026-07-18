"use client";

// Otorgar pruebas gratuitas (por días o rango de fechas) — PRD §10.4, §11.1.
import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PillButton } from "@/components/ui/PillButton";
import { AdminCard } from "@/components/admin/ui";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { grantAdminTrial } from "@/lib/functions";
import type { User, WithId } from "@/types";

const input = "h-10 w-full rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-3";

export function TrialGrantForm({
  users,
  onGranted,
}: {
  users: WithId<User>[];
  onGranted: () => void;
}) {
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<WithId<User> | null>(null);
  const [plan, setPlan] = useState<"basic" | "premium" | "vip">("basic");
  const [mode, setMode] = useState<"days" | "range">("days");
  const [days, setDays] = useState(30);
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const matches =
    search.length > 1 && !target
      ? users
          .filter(
            (u) =>
              u.email?.toLowerCase().includes(search.toLowerCase()) ||
              u.nickname?.toLowerCase().includes(search.toLowerCase()),
          )
          .slice(0, 6)
      : [];

  async function grant() {
    if (!target) return toastError("Selecciona un usuario.");
    setSaving(true);
    try {
      await grantAdminTrial({
        targetUid: target.id,
        plan,
        ...(mode === "days"
          ? { days }
          : { endDateMs: endDate ? new Date(endDate).getTime() : undefined }),
      });
      toastSuccess(`Prueba ${plan} otorgada a ${target.nickname}`);
      setTarget(null);
      setSearch("");
      onGranted();
    } catch (err) {
      console.error(err);
      toastError("No se pudo otorgar la prueba (¿función desplegada?).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminCard className="flex flex-col gap-4">
      <h2 className="font-semibold">🎁 Otorgar prueba gratuita</h2>

      <div className="relative">
        <input
          className={input}
          placeholder="Buscar usuario por email o nickname…"
          value={target ? `${target.nickname} (${target.email})` : search}
          onChange={(e) => {
            setTarget(null);
            setSearch(e.target.value);
          }}
        />
        {matches.length > 0 && (
          <ul className="glass-modal absolute z-10 mt-1 w-full rounded-xl p-1">
            {matches.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-soft"
                  onClick={() => setTarget(u)}
                >
                  {u.nickname} — {u.email}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          Plan:
          <select className="rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2 py-1" value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)}>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="vip">VIP</option>
          </select>
        </label>
        <SegmentedControl<"days" | "range">
          ariaLabel="Modalidad"
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: "days", label: "Por días" },
            { value: "range", label: "Por fecha" },
          ]}
        />
        {mode === "days" ? (
          <input type="number" className="h-10 w-24 rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2" value={days} onChange={(e) => setDays(Number(e.target.value))} />
        ) : (
          <input type="date" className="h-10 rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        )}
      </div>

      <PillButton onClick={grant} disabled={saving || !target}>
        {saving ? "Otorgando…" : "Otorgar prueba"}
      </PillButton>
    </AdminCard>
  );
}

export default TrialGrantForm;
