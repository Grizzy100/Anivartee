"use client";

import {
  memo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type FormEvent,
} from "react";
import {
  MessageSquare,
  ThumbsUp,
  Reply,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
} from "lucide-react";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import {
  getComments,
  createComment,
  likeComment,
  unlikeComment,
  type Comment,
} from "@/lib/api/comment";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyComments() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <MessageSquare className="w-4.5 h-4.5 text-muted-foreground/60" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          No perspectives recorded yet.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Contribute the first insight.
        </p>
      </div>
    </div>
  );
}

// ─── Comment Input ───────────────────────────────────────────────────────────

interface CommentInputProps {
  linkId: string;
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit: (comment: Comment) => void;
  onCancel?: () => void;
}

function CommentInput({
  linkId,
  parentId,
  placeholder = "Add your perspective\u2026",
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [content]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = content.trim();
      if (!trimmed || submitting) return;

      setSubmitting(true);
      try {
        const comment = await createComment(linkId, {
          content: trimmed,
          parentId,
        });
        setContent("");
        onSubmit(comment);
      } catch {
        // Could integrate toast here — silently fail for now
      } finally {
        setSubmitting(false);
      }
    },
    [content, submitting, linkId, parentId, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[10px] font-semibold text-primary">You</span>
      </div>

      <div className="flex-1 min-w-0">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={1}
          maxLength={500}
          className="w-full resize-none bg-secondary/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all duration-150"
        />
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground mt-1.5 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={!content.trim() || submitting}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shrink-0 mt-0.5"
      >
        {submitting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
      </button>
    </form>
  );
}

// ─── Single Comment ──────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  linkId: string;
  depth?: number;
  onNewReply: (parentId: string, reply: Comment) => void;
}

function CommentItem({
  comment,
  linkId,
  depth = 0,
  onNewReply,
}: CommentItemProps) {
  const [liked, setLiked] = useState(comment.liked ?? false);
  const [likeCount, setLikeCount] = useState(comment._count?.likes ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [repliesExpanded, setRepliesExpanded] = useState(true);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const authorName = comment.author?.displayName ?? comment.author?.username ?? "Anonymous";
  const initials = getInitials(authorName);

  const handleLike = useCallback(async () => {
    if (likeLoading) return;
    setLikeLoading(true);

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      if (wasLiked) {
        await unlikeComment(comment.id);
      } else {
        await likeComment(comment.id);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setLikeLoading(false);
    }
  }, [liked, likeLoading, comment.id]);

  const handleReplySubmit = useCallback(
    (reply: Comment) => {
      onNewReply(comment.id, reply);
      setShowReplyInput(false);
      setRepliesExpanded(true);
    },
    [comment.id, onNewReply]
  );

  // Cap visual nesting at 3 levels
  const nestLevel = Math.min(depth, 3);

  return (
    <div
      className={`group ${nestLevel > 0 ? "ml-8 pl-4 border-l border-border/50" : ""}`}
    >
      <div className="flex items-start gap-3 py-3 rounded-md transition-colors duration-150 hover:bg-muted/30 -mx-2 px-2">
        {/* Avatar */}
        {comment.author?.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt={authorName}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">
              {initials}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold text-foreground leading-none">
              {authorName}
            </span>
            <span className="text-[11px] text-muted-foreground/60">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="text-sm text-foreground/85 leading-relaxed mt-1.5 max-w-prose">
            {comment.content}
          </p>

          {/* Action row */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1 text-[11px] transition-colors duration-150 ${
                liked
                  ? "text-primary font-medium"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`}
              />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {depth < 3 && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors duration-150"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Inline reply input */}
          {showReplyInput && (
            <div className="mt-3">
              <CommentInput
                linkId={linkId}
                parentId={comment.id}
                placeholder="Write a reply\u2026"
                autoFocus
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyInput(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div>
          <button
            onClick={() => setRepliesExpanded(!repliesExpanded)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground ml-11 mb-1 transition-colors duration-150"
          >
            {repliesExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            <span>
              {comment.replies!.length}{" "}
              {comment.replies!.length === 1 ? "reply" : "replies"}
            </span>
          </button>

          {repliesExpanded && (
            <div>
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  linkId={linkId}
                  depth={depth + 1}
                  onNewReply={onNewReply}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Comment Section (main export) ───────────────────────────────────────────

interface CommentSectionProps {
  linkId: string;
  /** Total count displayed in the header (from PostData.comments). */
  commentCount: number;
}

export const CommentSection = memo(function CommentSection({
  linkId,
  commentCount: initialCount,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(initialCount);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Fetch comments ──
  const fetchComments = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const res = await getComments(linkId, pageNum, 10);
        if (append) {
          setComments((prev) => [...prev, ...res.comments]);
        } else {
          setComments(res.comments);
        }
        setTotalPages(res.pagination.totalPages);
        setTotalComments(res.pagination.total);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [linkId]
  );

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  // ── New root comment ──
  const handleRootComment = useCallback((comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
    setTotalComments((c) => c + 1);
  }, []);

  // ── New reply (insert into nested tree) ──
  const handleNewReply = useCallback(
    (parentId: string, reply: Comment) => {
      const insertReply = (list: Comment[]): Comment[] =>
        list.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies ?? []), reply],
            };
          }
          if (c.replies?.length) {
            return { ...c, replies: insertReply(c.replies) };
          }
          return c;
        });

      setComments(insertReply);
      setTotalComments((c) => c + 1);
    },
    []
  );

  // ── Load more ──
  const handleLoadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    fetchComments(next, true);
  }, [loadingMore, page, totalPages, fetchComments]);

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      {/* ── Input area ── */}
      <div className="p-4 border-b border-border">
        <CommentInput linkId={linkId} onSubmit={handleRootComment} />
      </div>

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Comments
          {totalComments > 0 && (
            <span className="ml-1.5 text-foreground/70">
              ({totalComments})
            </span>
          )}
        </h4>
      </div>

      {/* ── Comment list ── */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <BouncingDots dots={3} className="w-2 h-2 bg-muted-foreground/50" />
          </div>
        ) : comments.length === 0 ? (
          <EmptyComments />
        ) : (
          <div className="divide-y divide-border/40">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                linkId={linkId}
                onNewReply={handleNewReply}
              />
            ))}
          </div>
        )}

        {/* ── Load more ── */}
        {!loading && page < totalPages && (
          <div className="flex justify-center pt-3">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 px-3 py-1.5 rounded-md hover:bg-muted/50"
            >
              {loadingMore ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              <span>Load more</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
