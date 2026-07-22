"use client";

// Onboarding tipo iOS (Stepper) — crea/edita users/{uid} (PRD §4.2).
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { Stepper } from "@/components/ui/Stepper";
import { Combobox } from "@/components/ui/Combobox";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import {
  createUserProfile,
  isUsernameAvailable,
  slugifyUsername,
  updateUserProfile,
} from "@/lib/firestore/users";
import { avatarPath, uploadImage } from "@/lib/storage";
import { profileSchema, type ProfileInput } from "@/lib/utils/validators";
import { COUNTRIES, getCitiesByCountry } from "@/lib/data/countries";

function toInputDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CompletarPerfilForm() {
  const { firebaseUser, profile, status } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const router = useRouter();

  const isEdit = !!profile;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Estado para las ciudades dinámicas según el país
  const [selectedCountry, setSelectedCountry] = useState(profile?.country ?? "CL");
  const [availableCities, setAvailableCities] = useState<string[]>(() =>
    getCitiesByCountry(profile?.country ?? "CL")
  );

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      birthDate: profile?.birthDate ? toInputDate(profile.birthDate.toDate()) : "",
      nickname: profile?.nickname ?? "",
      username:
        profile?.username ??
        slugifyUsername(profile?.nickname || firebaseUser?.displayName || ""),
      city: profile?.city ?? "",
      country: profile?.country ?? "CL",
    },
  });

  const watchCountry = watch("country");
  const watchCity = watch("city");

  // Actualizar ciudades cuando cambia el país
  useEffect(() => {
    if (watchCountry) {
      const cities = getCitiesByCountry(watchCountry);
      setAvailableCities(cities);
      setSelectedCountry(watchCountry);

      // Si la ciudad actual no está en la nueva lista, resetear
      if (watchCity && !cities.includes(watchCity)) {
        setValue("city", "");
      }
    }
  }, [watchCountry, watchCity, setValue]);

  const photoPreview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );
  const currentAvatar =
    photoPreview ||
    profile?.customPhotoURL ||
    profile?.photoURL ||
    firebaseUser?.photoURL ||
    null;

  if (status === "loading") {
    return <main className="mx-auto max-w-md px-6 py-16 text-center text-text-muted">Cargando…</main>;
  }

  if (status !== "authenticated" || !firebaseUser) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="mb-3 text-h2 font-semibold">Inicia sesión primero</h1>
        <p className="mb-6 text-text-muted">
          Debes entrar con Google para completar tu perfil.
        </p>
        <PillButton onClick={openLogin}>Entrar</PillButton>
      </main>
    );
  }

  async function onSubmit(values: ProfileInput) {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      const [y, m, d] = values.birthDate.split("-").map(Number);
      const birthDate = new Date(y, m - 1, d);

      // Verifica disponibilidad del username (el batch la garantiza atómicamente después).
      const available = await isUsernameAvailable(values.username, firebaseUser.uid);
      if (!available) {
        toastError("Ese nombre de usuario ya está en uso. Elige otro.");
        setSaving(false);
        return;
      }

      let customPhotoURL = profile?.customPhotoURL ?? null;
      if (photoFile) {
        customPhotoURL = await uploadImage(
          avatarPath(firebaseUser.uid, photoFile.name),
          photoFile,
        );
      }

      if (isEdit) {
        await updateUserProfile(firebaseUser.uid, {
          nickname: values.nickname || firebaseUser.displayName || "",
          username: values.username,
          city: values.city,
          country: values.country,
          customPhotoURL,
          birthDate,
        });
        toastSuccess("Perfil actualizado 💜");
      } else {
        await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? "",
          nickname: values.nickname || firebaseUser.displayName || "",
          username: values.username,
          photoURL: firebaseUser.photoURL ?? "",
          customPhotoURL,
          birthDate,
          city: values.city,
          country: values.country,
        });
        toastSuccess("¡Perfil creado! Bienvenida a BTS Chile 💜");
      }
      router.push(`/perfil/${values.username}`);
    } catch (err) {
      console.error(err);
      toastError("No se pudo guardar tu perfil. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function goToStep2() {
    const ok = await trigger(["birthDate", "city", "country"]);
    if (ok) setStep(1);
  }

  return (
    <main className="aurora min-h-screen px-6 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-h1 font-bold tracking-tight">
          {isEdit ? "Editar perfil" : "Completa tu perfil"}
        </h1>
        <p className="mb-6 text-text-muted">
          Un último paso para unirte a la comunidad ARMY 💜
        </p>

        <Stepper steps={["Tus datos", "Tu identidad ARMY"]} current={step} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {step === 0 && (
            <GlassCard className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Fecha de nacimiento *</span>
                <input
                  type="date"
                  {...register("birthDate")}
                  className="h-12 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4"
                />
                {errors.birthDate && (
                  <span className="text-sm text-danger">{errors.birthDate.message}</span>
                )}
              </label>

              {/* Selector de País con búsqueda */}
              <Combobox
                label="País *"
                value={COUNTRIES.find((c) => c.code === watchCountry)?.name || ""}
                onChange={(countryName) => {
                  const country = COUNTRIES.find((c) => c.name === countryName);
                  if (country) {
                    setValue("country", country.code, { shouldValidate: true });
                  }
                }}
                options={COUNTRIES.map((c) => c.name)}
                placeholder="Selecciona tu país"
                emptyMessage="No se encontró el país"
                error={errors.country?.message}
              />

              {/* Selector de Ciudad con búsqueda dinámica */}
              <Combobox
                label="Ciudad / Región / Provincia *"
                value={watchCity || ""}
                onChange={(city) => setValue("city", city, { shouldValidate: true })}
                options={availableCities}
                placeholder="Selecciona tu ciudad o región"
                emptyMessage="No se encontraron resultados"
                error={errors.city?.message}
                disabled={!watchCountry}
              />

              <PillButton fullWidth onClick={goToStep2}>
                Continuar
              </PillButton>
            </GlassCard>
          )}

          {step === 1 && (
            <GlassCard className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-3">
                <span className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-brand-soft">
                  {currentAvatar ? (
                    <Image
                      src={currentAvatar}
                      alt="Tu avatar"
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized={!!photoPreview}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-brand-soft text-3xl">
                      💜
                    </span>
                  )}
                </span>
                <label className="cursor-pointer text-sm font-medium text-brand hover:underline">
                  Cambiar foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <p className="text-xs text-text-muted">
                  Puedes usar tu foto de Google o subir una.
                </p>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Apodo / nombre artístico</span>
                <input
                  type="text"
                  placeholder="Ej: ARMY Jung"
                  {...register("nickname")}
                  className="h-12 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4"
                />
                {errors.nickname && (
                  <span className="text-sm text-danger">{errors.nickname.message}</span>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Nombre de usuario * (único)</span>
                <div className="flex h-12 items-center rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-surface px-4">
                  <span className="text-text-muted">@</span>
                  <input
                    type="text"
                    placeholder="army_jung"
                    autoCapitalize="none"
                    autoCorrect="off"
                    {...register("username")}
                    className="h-full flex-1 bg-transparent pl-1 outline-none"
                  />
                </div>
                <span className="text-xs text-text-muted">
                  Tu perfil será btschile.com/perfil/{"{usuario}"} · 3-20 caracteres (a-z, 0-9, _)
                </span>
                {errors.username && (
                  <span className="text-sm text-danger">{errors.username.message}</span>
                )}
              </label>

              <div className="flex gap-3">
                <PillButton variant="secondary" onClick={() => setStep(0)}>
                  Atrás
                </PillButton>
                <PillButton type="submit" fullWidth disabled={saving}>
                  {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear perfil"}
                </PillButton>
              </div>
            </GlassCard>
          )}
        </form>
      </div>
    </main>
  );
}
