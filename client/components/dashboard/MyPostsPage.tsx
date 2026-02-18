"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Loader2, FileText, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SlideTabs } from "@/components/ui/slide-tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FeedContent } from "./FeedContent";
import { feedPostToPostData } from "./adapters";
import { getUserPosts, getMyFactChecks } from "@/lib/api/post";
import { useAuth } from "@/lib/auth/AuthContext";
import type { PostData, DashboardRole } from "./types";
import type { FeedPost } from "@/lib/api/feed";
import type { FactCheckWithPost } from "@/lib/api/post";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Validated", value: "VALIDATED" },
  { label: "Debunked", value: "DEBUNKED" },
] as const;

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Liked", value: "most-liked" },
  { label: "Most Shared", value: "most-shared" },
  { label: "Most Flagged", value: "most-flagged" },
] as const;

// ─── Fact-Check adapter ─────────────────────────────────────────────────────

function factCheckToPostData(fc: FactCheckWithPost): PostData {
  // Use the underlying post data but annotate with the verdict
  const base = feedPostToPostData(fc.post);
  return {
    ...base,
    id: fc.id,
    // Override status with the fact-check verdict
    status: fc.verdict === "VALIDATED" ? "verified" : "debunked",
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface MyPostsPageProps {
  role: DashboardRole;
}

export function MyPostsPage({ role }: MyPostsPageProps) {
  const { user } = useAuth();

  // ── Posts state ──
  const [posts, setPosts] = useState<PostData[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // ── Fact-checks state (fact-checker only) ──
  const [factChecks, setFactChecks] = useState<PostData[]>([]);
  const [fcLoading, setFcLoading] = useState(false);
  const [fcError, setFcError] = useState<string | null>(null);

  // ── Filters ──
  const [activeTab, setActiveTab] = useState("posts");
  const [statusFilter, setStatusFilter] = useState(0); // index into STATUS_FILTERS
  const [sortBy, setSortBy] = useState("newest");

  // ── Load posts ──
  const loadPosts = useCallback(async () => {
    if (!user?.id) return;
    try {
      setPostsLoading(true);
      setPostsError(null);
      const status = STATUS_FILTERS[statusFilter].value;
      const result = await getUserPosts(user.id, 1, 50, {
        status,
        sortBy,
      });
      setPosts(result.posts.map(feedPostToPostData));
    } catch (err) {
      setPostsError(
        err instanceof Error ? err.message : "Failed to load posts"
      );
    } finally {
      setPostsLoading(false);
    }
  }, [user?.id, statusFilter, sortBy]);

  // ── Load fact-checks ──
  const loadFactChecks = useCallback(async () => {
    try {
      setFcLoading(true);
      setFcError(null);
      const result = await getMyFactChecks(1, 50);
      setFactChecks(result.factChecks.map(factCheckToPostData));
    } catch (err) {
      setFcError(
        err instanceof Error ? err.message : "Failed to load fact-checks"
      );
    } finally {
      setFcLoading(false);
    }
  }, []);

  // Fetch on mount & filter change
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Fetch fact-checks when tab is switched to fact-checks
  useEffect(() => {
    if (activeTab === "fact-checks" && role === "factchecker") {
      loadFactChecks();
    }
  }, [activeTab, role, loadFactChecks]);

  // ── Handle post deleted ──
  const handlePostDeleted = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const handleFcDeleted = useCallback((postId: string) => {
    setFactChecks((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  // ── Status filter toolbar buttons ──
  const statusButtons = useMemo(
    () =>
      STATUS_FILTERS.map((f) => ({
        label: f.label,
      })),
    []
  );

  // ── The post list section (shared between both tabs for "posts") ──
  const postsSection = (
    <>
      {/* Status Filter Tabs */}
      <SlideTabs
        tabs={statusButtons}
        activeIndex={statusFilter}
        onActiveChange={setStatusFilter}
        className="mb-4"
      />

      {/* Sort Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="size-3.5" />
              <span>
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ??
                  "Newest"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={sortBy === opt.value ? "font-semibold" : ""}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post list */}
      <FeedContent
        posts={posts}
        role={role}
        loading={postsLoading}
        error={postsError}
        emptyMessage={
          statusFilter === 0
            ? "You haven't created any posts yet."
            : `No ${STATUS_FILTERS[statusFilter].label.toLowerCase()} posts found.`
        }
        onRetry={loadPosts}
        showStatus
        currentUserId={user?.id}
        onPostDeleted={handlePostDeleted}
      />
    </>
  );

  // ── Fact-checks section ──
  const factChecksSection = (
    <FeedContent
      posts={factChecks}
      role={role}
      loading={fcLoading}
      error={fcError}
      emptyMessage="You haven't submitted any fact-checks yet."
      onRetry={loadFactChecks}
      showStatus
      currentUserId={user?.id}
      onPostDeleted={handleFcDeleted}
    />
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold tracking-wide text-foreground">
            My Posts
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {role === "factchecker"
            ? "Manage your posts and review your submitted fact-checks."
            : "View and manage all your submitted posts."}
        </p>
      </div>

      {/* Fact-checkers get tabs: Posts | Fact-Checks */}
      {role === "factchecker" ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="fact-checks">Fact-Checks</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">{postsSection}</TabsContent>
          <TabsContent value="fact-checks">{factChecksSection}</TabsContent>
        </Tabs>
      ) : (
        postsSection
      )}
    </div>
  );
}
