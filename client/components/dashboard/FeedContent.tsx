import { Feed } from "./Feed";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import type { PostData, DashboardRole } from "./types";

interface FeedContentProps {
  posts: PostData[];
  role: DashboardRole;
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  onRetry: () => void;
  /** Force status badge visibility on all posts */
  showStatus?: boolean;
  /** Current user's ID — enables delete on owned posts */
  currentUserId?: string;
  /** Callback when a post is deleted */
  onPostDeleted?: (postId: string) => void;
}

/**
 * Shared feed renderer that handles loading, error, empty, and populated
 * states identically across user and fact-checker dashboards.
 */
export function FeedContent({
  posts,
  role,
  loading,
  error,
  emptyMessage,
  onRetry,
  showStatus,
  currentUserId,
  onPostDeleted,
}: FeedContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <BouncingDots className="w-2.5 h-2.5 bg-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={onRetry}
          className="text-xs text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Feed
      posts={posts}
      role={role}
      showStatus={showStatus}
      currentUserId={currentUserId}
      onPostDeleted={onPostDeleted}
    />
  );
}
