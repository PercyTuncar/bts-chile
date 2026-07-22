import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditProfileButton } from "@/components/auth/EditProfileButton";
import { FollowButton } from "@/components/comunidad/FollowButton";
import { MessageButton } from "@/components/comunidad/MessageButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { MembershipBadge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { getApprovedPostsByAuthor } from "@/lib/firestore/posts";
import { getUserByUsernameAdmin } from "@/lib/firestore/users.server";
import { formatDateLong, toISOString } from "@/lib/utils/formatters";
import { absoluteUrl, SITE_URL } from "@/lib/utils/seo";
import { getCountryName } from "@/lib/data/countries";
import type { Post, User, WithId } from "@/types";

type Params = { params: Promise<{ username: string }> };

// Perfil público: privacidad por defecto → noindex (§15.10). Se expone JSON-LD ProfilePage
// por si se decide publicar perfiles; nunca incluye email ni fecha de nacimiento.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  let user: User | null = null;
  try {
    user = await getUserByUsernameAdmin(username);
  } catch {
    user = null;
  }
  const name = user?.nickname || "Perfil ARMY";
  const handle = user?.username || username;
  return {
    title: `${name} (@${handle}) — Comunidad BTS Chile`,
    description: `Perfil de ${name} en la comunidad ARMY Chile.`,
    robots: { index: false, follow: true },
    alternates: { canonical: absoluteUrl(`/perfil/${handle}`) },
  };
}

function isBirthdayToday(user: User): boolean {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return user.birthMonth === month && user.birthDay === day;
}

export default async function PerfilPage({ params }: Params) {
  const { username } = await params;

  let user: User | null = null;
  let posts: WithId<Post>[] = [];
  try {
    user = await getUserByUsernameAdmin(username);
    if (user) posts = await getApprovedPostsByAuthor(user.uid);
  } catch (err) {
    console.warn("Perfil: lectura Firestore falló", err);
  }

  if (!user) notFound();

  const handle = user.username || username;
  const avatar = user.customPhotoURL || user.photoURL || null;
  const birthday = isBirthdayToday(user);
  const url = absoluteUrl(`/perfil/${handle}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    dateCreated: toISOString(user.joinedAt),
    mainEntity: {
      "@type": "Person",
      name: user.nickname,
      alternateName: `@${handle}`,
      image: avatar ?? undefined,
      url,
      homeLocation: { "@type": "Place", name: `${user.city}, ${getCountryName(user.country)}` },
      memberOf: { "@type": "Organization", name: "BTS Chile", url: SITE_URL },
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WriteAction",
        userInteractionCount: user.postsCount,
      },
    },
  };

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <JsonLd data={jsonLd} />

      {/* Cabecera glass */}
      <GlassCard className="aurora flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <span className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-brand">
          {avatar ? (
            <Image src={avatar} alt={user.nickname} fill sizes="112px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-soft text-4xl">
              💜
            </span>
          )}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-h1 font-bold tracking-tight">{user.nickname}</h1>
            <MembershipBadge type={user.membershipType} isTrial={user.isTrial} />
            {birthday && (
              <span className="rounded-full bg-brand-soft px-2.5 py-1 text-sm" title="¡Feliz cumpleaños!">
                🎂
              </span>
            )}
          </div>
          <p className="mt-0.5 text-brand">@{handle}</p>
          <p className="mt-1 text-text-muted">
            {user.city}, {getCountryName(user.country)} · Se unió el {formatDateLong(user.joinedAt)}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start">
            <span><b className="tabular-nums">{user.followersCount ?? 0}</b> <span className="text-text-muted">seguidores</span></span>
            <span><b className="tabular-nums">{user.followingCount ?? 0}</b> <span className="text-text-muted">siguiendo</span></span>
            <span><b className="tabular-nums">{user.postsCount}</b> <span className="text-text-muted">publicaciones</span></span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <EditProfileButton profileUid={user.uid} />
          <FollowButton targetUid={user.uid} targetUsername={handle} />
          <MessageButton
            target={{ uid: user.uid, username: handle, nickname: user.nickname, photoURL: avatar }}
          />
        </div>
      </GlassCard>

      {/* Grid de posts aprobados */}
      <h2 className="mb-4 mt-10 text-h2 font-semibold">Publicaciones</h2>
      {posts.length === 0 ? (
        <GlassCard className="text-center text-text-muted">
          Todavía no hay publicaciones aprobadas 💜
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/comunidad/${post.id}`}>
              <GlassCard hover className="h-full">
                {post.imageURL && (
                  <span className="relative mb-3 block aspect-video overflow-hidden rounded-xl">
                    <Image
                      src={post.imageURL}
                      alt=""
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </span>
                )}
                <p className="line-clamp-3 text-sm">{post.content}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
