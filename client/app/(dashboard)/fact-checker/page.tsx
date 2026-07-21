"use client";

import { FeedContent } from "@/components/dashboard/FeedContent";
import { useFeedContext } from "@/components/dashboard/FeedContext";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { useAuth } from "@/lib/auth/AuthContext";

export default function FactCheckerDashboardPage() {
  const { user } = useAuth();
  const { posts, loading, error, retry, removePost, setSearchQuery } = useFeedContext();

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
