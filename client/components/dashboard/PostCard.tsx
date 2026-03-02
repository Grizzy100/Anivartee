"use client";

import { memo, useState, useCallback } from "react";
import {
  Heart,
  Bookmark,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Clock,
  Share2,
  Trash2,
  MoreHorizontal,
  Loader2,
  Flag,
} from "lucide-react";
import { TbFlag3 } from "react-icons/tb";
import { TiBookmark } from "react-icons/ti";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  sharePost,
  deletePost,
  flagPost,
  unflagPost,
} from "@/lib/api/post";
import { ApiError } from "@/lib/api/api";
import { CommentModal } from "./CommentModal";
import { QuotedPost } from "./QuotedPost";
import type { PostData, DashboardRole } from "./types";

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    classes: "text-emerald-600 bg-emerald-600/10",
  },
  "under-review": {
    icon: Clock,
    label: "Under Review",
    classes: "text-amber-500 bg-amber-500/10",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    classes: "text-muted-foreground bg-secondary",
  },
  debunked: {
    icon: ShieldCheck,
    label: "Debunked",
    classes: "text-red-500 bg-red-500/10",
  },
  flagged: {
    icon: ShieldCheck,
    label: "Flagged",
    classes: "text-orange-500 bg-orange-500/10",
  },
};

function StatusBadge({
  status,
}: {
  status: keyof typeof STATUS_CONFIG;
}) {
  const { icon: Icon, label, classes } = STATUS_CONFIG[status];

  return (
    <span
      className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md ${classes}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

// ─── Rank badge colour helper ────────────────────────────────────────────────

function rankClasses(level: number): string {
  if (level >= 5) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  if (level >= 3) return "text-violet-500 bg-violet-500/10 border-violet-500/20";
  if (level >= 1) return "text-sky-500 bg-sky-500/10 border-sky-500/20";
  return "text-muted-foreground bg-secondary border-border";
}

// ─── PostCard ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: PostData;
  role: DashboardRole;
  /** Force status badge visibility regardless of role (e.g. on My Posts page) */
  showStatus?: boolean;
  /** Whether the current user owns this post (enables delete) */
  isOwner?: boolean;
  /** Callback when post is deleted so parent can remove it from the list */
  onDeleted?: (postId: string) => void;
}

export const PostCard = memo(function PostCard({
  post,
  role,
  showStatus,
  isOwner,
  onDeleted,
}: PostCardProps) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.saved);
  const [flagged, setFlagged] = useState(post.flagged || false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Like ──
  const handleLike = useCallback(async () => {
    if (likeLoading || flagLoading) return;
    setLikeLoading(true);

    const wasLiked = liked;
    const wasFlagged = flagged;

    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    // Mutually exclusive: turning on like turns off flag
    if (!wasLiked && wasFlagged) {
      setFlagged(false);
    }

    try {
      if (wasLiked) {
        await unlikePost(post.linkId);
      } else {
        await likePost(post.linkId);
      }
    } catch {
      setLiked(wasLiked);
      setFlagged(wasFlagged);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setLikeLoading(false);
    }
  }, [liked, flagged, likeLoading, flagLoading, post.linkId]);

  // ── Flag ──
  const handleFlag = useCallback(async () => {
    if (flagLoading || likeLoading) return;
    setFlagLoading(true);

    const wasFlagged = flagged;
    const wasLiked = liked;

    setFlagged(!wasFlagged);

    // Mutually exclusive: turning on flag turns off like
    if (!wasFlagged && wasLiked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
    }

    try {
      if (wasFlagged) {
        await unflagPost(post.linkId);
      } else {
        await flagPost(post.linkId);
      }
    } catch {
      // Revert optimism
      setFlagged(wasFlagged);
      setLiked(wasLiked);
      if (!wasFlagged && wasLiked) {
        setLikeCount((c) => c + 1);
      }
    } finally {
      setFlagLoading(false);
    }
  }, [flagged, liked, flagLoading, likeLoading, post.linkId]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    if (saveLoading) return;
    setSaveLoading(true);

    const wasSaved = saved;
    setSaved(!wasSaved);

    try {
      if (wasSaved) {
        await unsavePost(post.linkId);
      } else {
        await savePost(post.linkId);
      }
    } catch {
      setSaved(wasSaved);
    } finally {
      setSaveLoading(false);
    }
  }, [saved, saveLoading, post.linkId]);

  // ── Share ──
  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.origin + `/posts/${post.linkId}`,
        });
        await sharePost(post.linkId);
      } else {
        await navigator.clipboard.writeText(
          window.location.origin + `/posts/${post.linkId}`
        );
        await sharePost(post.linkId, "OTHER");
      }
    } catch {
      // User cancelled share or clipboard failed
    }
  }, [post.linkId, post.title, post.description]);

  // ── Delete ──
  const handleDelete = useCallback(async () => {
    if (deleting) return;
    if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(post.linkId);
      onDeleted?.(post.id);
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 401
          ? "Session expired — please log in again to delete."
          : "Failed to delete post. Please try again.";
      setDeleteError(msg);
      setTimeout(() => setDeleteError(null), 5000);
    } finally {
      setDeleting(false);
    }
  }, [deleting, post.linkId, post.id, onDeleted]);

  return (
    <>
      <article className="bg-card border border-border rounded-lg p-5 transition-colors hover:border-primary/20">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="font-display text-[10px] font-bold text-primary">
                  {post.author.initials}
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {post.author.name}
                </span>

                {/* Rank badge */}
                {post.author.rankName && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wider ${rankClasses(post.author.rankLevel ?? 0)}`}
                  >
                    {post.author.rankName}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {post.timestamp}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status badge */}
            {(showStatus || role === "factchecker") && post.status && (
              <StatusBadge status={post.status} />
            )}

            {/* Overflow menu (delete, etc.) */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-500 focus:text-red-500"
                  >
                    {deleting ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                    )}
                    {deleting ? "Deleting…" : "Delete Post"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* ── Delete error ── */}
        {deleteError && (
          <p className="text-xs text-red-500 mb-2">{deleteError}</p>
        )}

        {/* ── Content ── */}
        <h3 className="font-display text-sm font-semibold text-foreground mb-2 leading-snug tracking-wide">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {post.description}
        </p>

        {/* ── Proof Links ── */}
        {post.proofLinks && post.proofLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.proofLinks.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 bg-primary/5 px-2.5 py-1 rounded-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Source {i + 1}
              </a>
            ))}
          </div>
        )}

        {/* ── Quoted / Referenced Post ── */}
        {post.quotedPost && <QuotedPost post={post.quotedPost} />}

        {/* ── Actions ── */}
        <div className="flex items-center gap-6 pt-3 mt-1 border-t border-border">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 text-xs transition-colors ${liked
              ? "text-red-500 hover:text-red-400"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
          </button>

          {/* Mutually Exclusive Flag Button */}
          <button
            onClick={handleFlag}
            disabled={flagLoading}
            className={`flex items-center gap-1.5 text-xs transition-colors ${flagged
              ? "text-orange-500 hover:text-orange-400"
              : "text-muted-foreground hover:text-foreground"
              }`}
            title="Flag as inappropriate or false"
          >
            <TbFlag3 className={`w-4 h-4 ${flagged ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => setCommentModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saveLoading}
            className={`flex items-center gap-1.5 text-xs transition-colors ml-auto ${saved
              ? "text-primary hover:text-primary/80"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <TiBookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </article>

      {/* ── Comment Modal ── */}
      <CommentModal
        open={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        linkId={post.linkId}
        commentCount={post.comments}
        postTitle={post.title}
      />
    </>
  );
});
