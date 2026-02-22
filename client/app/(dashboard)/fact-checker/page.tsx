"use client";

import { FeedContent } from "@/components/dashboard/FeedContent";
import { useFeedLoader } from "@/components/dashboard/useFeedLoader";
import { feedPostToPostData } from "@/components/dashboard/adapters";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { getHomeFeed } from "@/lib/api/feed";
import { useAuth } from "@/lib/auth/AuthContext";

// Stable fetcher — avoids re-creating on every render
const fetchFeedItems = () => getHomeFeed().then((r) => r.posts);

export default function FactCheckerDashboardPage() {
  const { user } = useAuth();
  const { posts, loading, error, retry, removePost, setSearchQuery } = useFeedLoader(
    fetchFeedItems,
    feedPostToPostData
  );

  return (
    <>
      <DashboardTopBar
        role="factchecker"
        onSearch={setSearchQuery}
        onPostCreated={retry}
      />

      <FeedContent
        posts={posts}
        role="factchecker"
        loading={loading}
        error={error}
        emptyMessage="No posts found."
        onRetry={retry}
        currentUserId={user?.id}
        onPostDeleted={removePost}
      />
    </>
  );
}
