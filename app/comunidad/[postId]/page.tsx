import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumGallery } from "@/components/comunidad/AlbumGallery";
import { CommentsSection } from "@/components/comunidad/CommentsSection";
import { PollView } from "@/components/comunidad/PollView";
import { PostContent } from "@/components/comunidad/PostContent";
import { PostHeader } from "@/components/comunidad/PostHeader";
import { PostImage } from "@/components/comunidad/PostImage";
import { ReactionPicker } from "@/components/comunidad/ReactionPicker";
import { ShareButton } from "@/components/comunidad/ShareButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPost } from "@/lib/firestore/posts";
import { CATEGORY_LABEL } from "@/lib/comunidad/reactions";
import { formatRelative, toISOString } from "@/lib/utils/formatters";
import { absoluteUrl, buildBreadcrumbList, buildGraph, SITE_URL } from "@/lib/utils/seo";
import { cn } from "@/lib/utils/cn";
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
    <main className="mx-auto max-w-7xl px-6 py-10">
      <JsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand">Inicio</Link> ›{" "}
        <Link href="/comunidad" className="hover:text-brand">Comunidad</Link> › <span>{headline}…</span>
      </nav>

      {/* Layout de 2 columnas en desktop, 1 columna en móvil */}
      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-180px)]">
        {/* Columna izquierda: Imagen o Álbum (solo visible en desktop) */}
        {(post.imageURL || ((post.type ?? "text") === "album" && post.images && post.images.length > 0)) && (
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-surface lg:rounded-2xl lg:p-4">
            {post.imageURL ? (
              <PostImage src={post.imageURL} alt={headline} className="lg:max-h-full" />
            ) : (
              <AlbumGallery images={post.images!} />
            )}
          </div>
        )}

        {/* Columna derecha: Contenido y comentarios */}
        <article
          className={cn(
            "lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden",
            post.authorRole === "admin"
              ? "glass-card aurora rounded-card p-6 ring-1 ring-[color-mix(in_srgb,var(--brand)_45%,transparent)] shadow-[0_10px_36px_color-mix(in_srgb,var(--brand)_18%,transparent)]"
              : "glass-card rounded-card p-6"
          )}
        >
          {/* Contenido scrolleable en desktop */}
          <div className="lg:flex-1 lg:overflow-y-auto lg:pr-2">
            <PostHeader
              postId={postId}
              authorUid={post.authorUid}
              authorUsername={post.authorUsername}
              authorNickname={post.authorNickname}
              authorPhotoURL={post.authorPhotoURL}
              authorRole={post.authorRole}
              authorMembership={post.authorMembership}
              createdAt={createdDate}
              category={post.category}
              isAurora={post.authorRole === "admin"}
            />

            <h1 className="sr-only">{headline}…</h1>
            {post.content && (
              <div className="text-lg mb-4">
                <PostContent content={post.content} richContent={post.richContent} />
              </div>
            )}

            {/* Imagen en móvil */}
            {post.imageURL && (
              <div className="mb-4 lg:hidden">
                <PostImage src={post.imageURL} alt={headline} />
              </div>
            )}

            {/* Acciones justo debajo de la imagen en móvil, arriba en desktop */}
            <div className="flex items-center justify-between border-y border-[color-mix(in_srgb,var(--text)_8%,transparent)] py-3 mb-4 lg:hidden">
              <ReactionPicker postId={postId} counts={post.reactionCounts} />
              <ShareButton url={url} text={`ARMY opina: ${headline}…`} />
            </div>

            {(post.type ?? "text") === "poll" && post.poll && (
              <div className="mt-4">
                <PollView postId={postId} poll={post.poll} />
              </div>
            )}

            {/* Álbum en móvil */}
            {(post.type ?? "text") === "album" && post.images && post.images.length > 0 && (
              <div className="mb-4 lg:hidden">
                <AlbumGallery images={post.images} />
              </div>
            )}

            {/* Sección de comentarios */}
            <div className="lg:mt-6">
              <CommentsSection postId={postId} />
            </div>
          </div>

          {/* Acciones fijas solo en desktop */}
          <div className="hidden lg:flex mt-4 items-center justify-between border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] pt-4 flex-shrink-0">
            <ReactionPicker postId={postId} counts={post.reactionCounts} />
            <ShareButton url={url} text={`ARMY opina: ${headline}…`} />
          </div>
        </article>
      </div>
    </main>
  );
}
