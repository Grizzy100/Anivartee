import React from "react";
import { PostCard } from "./PostCard";
import { FactCheckPostCard } from "./FactCheckPostCard";
import type { PostData, DashboardRole } from "./types";

interface FeedProps {
  posts: PostData[];
  role: DashboardRole;
  /** Force status badge visibility on all posts */
  showStatus?: boolean;
  /** Current user's ID — enables delete on owned posts */
  currentUserId?: string;
  /** Callback when a post is deleted */
  onPostDeleted?: (postId: string) => void;
  /**
   * When true, fact-check verdict cards are suppressed and only the
   * underlying PostCard is rendered. Use this in "My Posts" so users
   * aren't shown the fact-checker's UI for their own posts.
   */
  hideFactCheckCards?: boolean;
}

export function Feed({ posts, role, showStatus, currentUserId, onPostDeleted, hideFactCheckCards }: FeedProps) {
  return (
    <div id="tour-feed" className="space-y-4 pb-8">
      {posts.map((post) => (
        <React.Fragment key={post.id}>
          {!hideFactCheckCards && post.factChecks && post.factChecks.length > 0 && (
            <FactCheckPostCard
              factCheck={post.factChecks[0]}
              originalPost={post}
              role={role}
            />
          )}
          <PostCard
            post={post}
            role={role}
            showStatus={showStatus}
            isOwner={!!currentUserId && post.userId === currentUserId}
            onDeleted={onPostDeleted}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
