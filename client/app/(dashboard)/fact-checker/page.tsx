"use client";

import { FeedContent } from "@/components/dashboard/FeedContent";
import { useFeedLoader } from "@/components/dashboard/useFeedLoader";
import { feedPostToPostData } from "@/components/dashboard/adapters";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { getHomeFeed } from "@/lib/api/feed";

// Stable fetcher — avoids re-creating on every render
const fetchFeedItems = () => getHomeFeed().then((r) => r.posts);

export default function FactCheckerDashboardPage() {
  const { posts, loading, error, retry, setSearchQuery } = useFeedLoader(
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
      />
    </>
  );
}
