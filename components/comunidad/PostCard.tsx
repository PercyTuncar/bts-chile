"use client";

// Tarjeta de post del feed — PRD §8.1.
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AlbumGallery } from "@/components/comunidad/AlbumGallery";
import { PollView } from "@/components/comunidad/PollView";
import { PostContent } from "@/components/comunidad/PostContent";
import { ReactionPicker } from "@/components/comunidad/ReactionPicker";
import { AdminBadge, MembershipBadge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SmartImage } from "@/components/ui/SmartImage";
import { CATEGORY_LABEL } from "@/lib/comunidad/reactions";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatters";
import type { Post, WithId } from "@/types";

export function PostCard({ post }: { post: WithId<Post> }) {
  const created = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
  const isAdmin = post.authorRole === "admin";

  return (
    <GlassCard
      className={cn(
        "flex flex-col gap-3",
        // Post de admin: se resalta con anillo y halo brand para diferenciarlo.
        isAdmin &&
          "aurora ring-1 ring-[color-mix(in_srgb,var(--brand)_45%,transparent)] shadow-[0_10px_36px_color-mix(in_srgb,var(--brand)_18%,transparent)]",
      )}
    >
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Link
          href={`/perfil/${post.authorUsername ?? post.authorUid}`}
          className={cn(
            "relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2",
            isAdmin ? "ring-accent" : "ring-brand",
          )}
        >
          {post.authorPhotoURL ? (
            <Image src={post.authorPhotoURL} alt={post.authorNickname} fill sizes="40px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-soft">💜</span>
          )}
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/perfil/${post.authorUsername ?? post.authorUid}`} className="font-semibold hover:text-brand">
              {post.authorNickname}
            </Link>
            {isAdmin ? <AdminBadge /> : <MembershipBadge type={post.authorMembership} />}
          </div>
          <p className="text-xs text-text-muted">{formatRelative(created)}</p>
        </div>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
          {CATEGORY_LABEL[post.category]}
        </span>
      </div>

      {/* Contenido */}
      {post.content && (
        <PostContent content={post.content} richContent={post.richContent} clamp />
      )}

      {(post.type ?? "text") === "poll" && post.poll && (
        <PollView postId={post.id} poll={post.poll} />
      )}

      {(post.type ?? "text") === "album" && post.images && post.images.length > 0 && (
        <AlbumGallery images={post.images} preview postHref={`/comunidad/${post.id}`} />
      )}

      {post.imageURL && (
        <Link href={`/comunidad/${post.id}`} className="block">
          <SmartImage src={post.imageURL} alt="" fill sizes="(max-width:768px) 100vw, 600px" />
        </Link>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <ReactionPicker postId={post.id} counts={post.reactionCounts} />
        <Link
          href={`/comunidad/${post.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span className="tabular-nums">{post.commentsCount}</span>
        </Link>
      </div>
    </GlassCard>
  );
}

export default PostCard;
