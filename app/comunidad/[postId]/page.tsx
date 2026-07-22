import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumGallery } from "@/components/comunidad/AlbumGallery";
import { CommentsSection } from "@/components/comunidad/CommentsSection";
import { PollView } from "@/components/comunidad/PollView";
import { PostContent } from "@/components/comunidad/PostContent";
import { PostImage } from "@/components/comunidad/PostImage";
import { PostDetailActions } from "@/components/comunidad/PostDetailActions";
import { ReactionPicker } from "@/components/comunidad/ReactionPicker";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdminBadge, MembershipBadge } from "@/components/ui/Badge";
import { getPost } from "@/lib/firestore/posts";
import { CATEGORY_LABEL } from "@/lib/comunidad/reactions";
import { formatRelative, toISOString } from "@/lib/utils/formatters";
import { absoluteUrl, buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";
import type { Post } from "@/types";

type Params = { params: Promise<{ postId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { postId } = await params;
  let post: Post | null = null;
  try {
    post = await getPost(postId);
  } catch {
    post = null;
  }
  if (!post) return { title: "Publicación", robots: { index: false } };
  const title = (post.content ?? "").slice(0, 60);
  return {
    title: { absolute: `ARMY opina: ${title}… — Comunidad BTS Chile` },
    description: (post.content ?? "").slice(0, 160),
    alternates: { canonical: absoluteUrl(`/comunidad/${postId}`) },
    openGraph: {
      title: `${title}… — Comunidad BTS Chile`,
      images: post.imageURL ? [post.imageURL] : [`${SITE_URL}/og-comunidad.jpg`],
      type: "article",
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { postId } = await params;
  let post: Post | null = null;
  try {
    post = await getPost(postId);
  } catch {
    post = null;
  }
  if (!post || post.status !== "approved") notFound();

  const created = post.approvedAt ?? post.createdAt;
  const published = created ? toISOString(created) : new Date().toISOString();
  const url = absoluteUrl(`/comunidad/${postId}`);
  const headline = (post.content ?? "").slice(0, 60);

  const jsonLd = buildGraph([
    {
      "@type": "DiscussionForumPosting",
      "@id": `${url}#post`,
      headline,
      text: post.content,
      url,
      datePublished: published,
      dateModified: published,
      inLanguage: "es-CL",
      author: {
        "@type": "Person",
        name: post.authorNickname,
        url: absoluteUrl(`/perfil/${post.authorUsername || post.authorUid}`),
        image: post.authorPhotoURL || undefined,
      },
      publisher: {
        "@type": "Organization",
        name: "BTS Chile",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
      image: post.imageURL || undefined,
      keywords: `${CATEGORY_LABEL[post.category]}, BTS, ARMY Chile, K-pop`,
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: post.reactionCounts?.total ?? 0,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CommentAction",
          userInteractionCount: post.commentsCount ?? 0,
        },
      ],
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
    buildBreadcrumbList([
      { name: "Inicio", path: "/" },
      { name: "Comunidad", path: "/comunidad" },
      { name: `${(post.content ?? "").slice(0, 40)}`, path: `/comunidad/${postId}` },
    ]),
  ]);

  const createdDate = created?.toDate ? created.toDate() : new Date();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <JsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand">Inicio</Link> ›{" "}
        <Link href="/comunidad" className="hover:text-brand">Comunidad</Link> › <span>{headline}…</span>
      </nav>

      <article
        className={
          post.authorRole === "admin"
            ? "glass-card aurora rounded-card p-6 ring-1 ring-[color-mix(in_srgb,var(--brand)_45%,transparent)] shadow-[0_10px_36px_color-mix(in_srgb,var(--brand)_18%,transparent)]"
            : "glass-card rounded-card p-6"
        }
      >
        <div className="mb-4 flex items-center gap-3">
          <Link
            href={`/perfil/${post.authorUsername || post.authorUid}`}
            className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ${
              post.authorRole === "admin" ? "ring-accent" : "ring-brand"
            }`}
          >
            {post.authorPhotoURL ? (
              <Image src={post.authorPhotoURL} alt={post.authorNickname} fill sizes="44px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-brand-soft">💜</span>
            )}
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/perfil/${post.authorUsername || post.authorUid}`} className="font-semibold hover:text-brand">
                {post.authorNickname}
              </Link>
              {post.authorRole === "admin" ? (
                <AdminBadge />
              ) : (
                <MembershipBadge type={post.authorMembership} />
              )}
            </div>
            <p className="text-xs text-text-muted">
              {formatRelative(createdDate)} · {CATEGORY_LABEL[post.category]}
            </p>
          </div>
        </div>

        <h1 className="sr-only">{headline}…</h1>
        {post.content && (
          <div className="text-lg">
            <PostContent content={post.content} richContent={post.richContent} />
          </div>
        )}

        {(post.type ?? "text") === "poll" && post.poll && (
          <div className="mt-4">
            <PollView postId={postId} poll={post.poll} />
          </div>
        )}

        {(post.type ?? "text") === "album" && post.images && post.images.length > 0 && (
          <div className="mt-4">
            <AlbumGallery images={post.images} />
          </div>
        )}

        {post.imageURL && (
          <div className="mt-4">
            <PostImage src={post.imageURL} alt={headline} />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-4 border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] pt-4">
          <ReactionPicker postId={postId} counts={post.reactionCounts} />
          <PostDetailActions postId={postId} shareUrl={url} shareText={`ARMY opina: ${headline}…`} authorUid={post.authorUid} />
        </div>
      </article>

      <CommentsSection postId={postId} />
    </main>
  );
}
