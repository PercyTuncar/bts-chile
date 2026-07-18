"use client";

import { useState } from "react";
import { AdminCard, AdminSection, downloadCSV, Loading } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { PillButton } from "@/components/ui/PillButton";
import { MembershipBadge } from "@/components/ui/Badge";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import {
  getAllUsers,
  setUserActive,
  setUserMembershipManual,
  setUserRole,
} from "@/lib/firestore/users";
import type { MembershipType } from "@/types";

export default function UsuariosPage() {
  const { data, loading, reload } = useAdminData(getAllUsers);
  const [filter, setFilter] = useState("");

  if (loading || !data) return <Loading />;

  const users = data.filter(
    (u) =>
      u.email?.toLowerCase().includes(filter.toLowerCase()) ||
      u.nickname?.toLowerCase().includes(filter.toLowerCase()) ||
      u.city?.toLowerCase().includes(filter.toLowerCase()),
  );

  async function act(fn: () => Promise<void>, msg: string) {
    try {
      await fn();
      toastSuccess(msg);
      reload();
    } catch (err) {
      console.error(err);
      toastError("No se pudo aplicar el cambio.");
    }
  }

  return (
    <AdminSection
      title="Usuarios"
      description={`${data.length} usuarios registrados`}
      actions={
        <PillButton
          variant="secondary"
          onClick={() =>
            downloadCSV(
              "usuarios-btschile.csv",
              [
                ["Nickname", "Email", "Ciudad", "Membresía", "Rol", "Cumpleaños"],
                ...data.map((u) => [
                  u.nickname,
                  u.email,
                  u.city,
                  u.membershipType,
                  u.role,
                  `${u.birthDay}/${u.birthMonth}`,
                ]),
              ],
            )
          }
        >
          Export CSV
        </PillButton>
      }
    >
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Buscar por email, nickname o ciudad…"
        className="h-11 max-w-md rounded-full border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4"
      />

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-text-muted">
            <tr>
              <th className="p-2">Usuario</th>
              <th className="p-2">Ciudad</th>
              <th className="p-2">Membresía</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)]">
                <td className="p-2">
                  <p className="font-medium">{u.nickname}</p>
                  <p className="text-xs text-text-muted">{u.email}</p>
                </td>
                <td className="p-2">{u.city}</td>
                <td className="p-2">
                  <select
                    defaultValue={u.membershipType}
                    onChange={(e) =>
                      act(
                        () =>
                          setUserMembershipManual(
                            u.id,
                            e.target.value as MembershipType,
                            e.target.value === "free"
                              ? null
                              : new Date(Date.now() + 30 * 864e5),
                          ),
                        "Membresía actualizada",
                      )
                    }
                    className="rounded-lg border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-2 py-1"
                  >
                    <option value="free">free</option>
                    <option value="basic">basic</option>
                    <option value="premium">premium</option>
                    <option value="vip">vip</option>
                  </select>
                  <div className="mt-1">
                    <MembershipBadge type={u.membershipType} isTrial={u.isTrial} />
                  </div>
                </td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      className="rounded-full glass px-2 py-1 text-xs"
                      onClick={() =>
                        act(
                          () => setUserRole(u.id, u.role === "admin" ? "user" : "admin"),
                          "Rol actualizado",
                        )
                      }
                    >
                      {u.role === "admin" ? "Quitar admin" : "Hacer admin"}
                    </button>
                    <button
                      className="rounded-full glass px-2 py-1 text-xs"
                      onClick={() =>
                        act(() => setUserActive(u.id, !u.isActive), "Estado actualizado")
                      }
                    >
                      {u.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </AdminSection>
  );
}
