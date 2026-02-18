import { PostCard } from "./PostCard";
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
}

export function Feed({ posts, role, showStatus, currentUserId, onPostDeleted }: FeedProps) {
  return (
    <div className="space-y-4 pb-8">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          role={role}
          showStatus={showStatus}
          isOwner={!!currentUserId && post.userId === currentUserId}
          onDeleted={onPostDeleted}
        />
      ))}
    </div>
  );
}
