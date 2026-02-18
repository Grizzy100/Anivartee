// Barrel export for dashboard components
// Usage: import { DashboardLayout, Feed, PostCard } from "@/components/dashboard"

export { DashboardLayout } from "./DashboardLayout";
export { Sidebar } from "./Sidebar";
export { UserStatsCard } from "./UserStatsCard";
export { PostCard } from "./PostCard";
export { Feed } from "./Feed";
export { FeedContent } from "./FeedContent";
export { CalendarWidget } from "./CalendarWidget";
export { TrendingPanel } from "./TrendingPanel";
export { DashboardTopBar } from "./DashboardTopBar";
export { CreatePostModal } from "./CreatePostModal";
export { CommentSection } from "./CommentSection";
export { CommentModal } from "./CommentModal";
export { QuotedPost } from "./QuotedPost";
export { MyPostsPage } from "./MyPostsPage";

// Utilities
export { useFeedLoader } from "./useFeedLoader";
export {
  feedPostToPostData,
  queueItemToPostData,
  getInitials,
} from "./adapters";

// Types
export type { PostData, PostAuthorDisplay, DashboardRole, QuotedPostData } from "./types";
