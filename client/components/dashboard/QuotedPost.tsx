"use client";

import { memo } from "react";
import { AlertCircle } from "lucide-react";
import type { QuotedPostData } from "./types";

// ─── QuotedPost ──────────────────────────────────────────────────────────────

interface QuotedPostProps {
  post: QuotedPostData;
}

/**
 * Renders a nested quoted-post card.
 *
 * - Smaller avatar + author line
 * - Post title & truncated description
 * - No engagement counters or action buttons
 * - Clicking navigates to the original post
 * - Graceful placeholder when content is unavailable
 */
export const QuotedPost = memo(function QuotedPost({ post }: QuotedPostProps) {
  if (post.unavailable) {
    return (
      <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs">
            This post is no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={`/posts/${post.linkId}`}
      className="mt-3 block rounded-lg border border-border/60 bg-muted/20 p-3.5 transition-colors hover:border-primary/30 hover:bg-muted/40 cursor-pointer group"
      onClick={(e) => {
        // Prevent parent card clicks from triggering
        e.stopPropagation();
      }}
    >
      {/* Author row */}
      <div className="flex items-center gap-2 mb-2">
        {/* Smaller avatar */}
        {post.author.avatarUrl ? (
          <img
            src={post.author.avatarUrl}
            alt={post.author.name}
            className="w-5 h-5 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-[7px] font-bold text-primary">
              {post.author.initials}
            </span>
          </div>
        )}

        <span className="text-xs font-semibold text-foreground/80 truncate">
          {post.author.name}
        </span>

        {post.author.role && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground uppercase tracking-wider shrink-0">
            {post.author.role}
          </span>
        )}

        <span className="text-[10px] text-muted-foreground/50 ml-auto shrink-0">
          {post.timestamp}
        </span>
      </div>

      {/* Content */}
      <h4 className="text-xs font-semibold text-foreground/90 leading-snug mb-1 line-clamp-1 group-hover:text-primary/90 transition-colors">
        {post.title}
      </h4>
      {post.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {post.description}
        </p>
      )}
    </a>
  );
});
