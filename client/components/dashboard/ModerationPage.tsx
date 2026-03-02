"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ShieldAlert, Loader2, AlertCircle, Inbox, RefreshCw, X } from "lucide-react";
import { SlideTabs } from "@/components/ui/slide-tabs";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import { PostCard } from "./PostCard";
import { VerdictModal } from "./VerdictModal";
import { queueItemToPostData } from "./adapters";
import {
  getModerationQueue,
  getMyClaimedPosts,
  claimPost,
  abandonClaim,
  type ModerationQueueItem,
  type FactCheckVerdict,
} from "@/lib/api/factChecker";
import type { Pagination } from "@/lib/api/api";
import type { PostData } from "./types";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const TABS = [
  { label: "Queue" },
  { label: "Claimed" },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface QueueState {
  items: ModerationQueueItem[];
  posts: PostData[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  page: number;
}

const EMPTY_STATE: QueueState = {
  items: [],
  posts: [],
  pagination: null,
  loading: true,
  error: null,
  page: 1,
};

// ─── Component ───────────────────────────────────────────────────────────────

import { IoMdHelpCircleOutline } from "react-icons/io";
import { useProductTour } from "@/lib/contexts/ProductTourContext";

export default function ModerationPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const { startTour, activeStep } = useProductTour();

  // Watch the Product Tour step. Step index 2 is "Submitting a Verdict" which takes place on the Claimed tab.
  useEffect(() => {
    if (activeStep === 2) {
      setTabIndex(1); // Auto-switch to Claimed tab
    }
  }, [activeStep]);

  // ── Queue tab state ──
  const [queue, setQueue] = useState<QueueState>({ ...EMPTY_STATE });
  // ── Claimed tab state ──
  const [claimed, setClaimed] = useState<QueueState>({ ...EMPTY_STATE });

  // ── Post currently claiming (shows spinner on the button) ──
  const [claimingPostId, setClaimingPostId] = useState<string | null>(null);
  // ── Post being abandoned ──
  const [abandoningPostId, setAbandoningPostId] = useState<string | null>(null);

  // ── Verdict modal ──
  const [verdictTarget, setVerdictTarget] = useState<{
    postId: string;
    title: string;
  } | null>(null);

  // ── Toast-style transient message ──
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function showToast(msg: string) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchQueue = useCallback(async (page = 1) => {
    setQueue((s) => ({ ...s, loading: true, error: null, page }));
    try {
      const res = await getModerationQueue(page, PAGE_SIZE);
      const posts = res.items.map(queueItemToPostData);
      setQueue({ items: res.items, posts, pagination: res.pagination, loading: false, error: null, page });
    } catch (err: any) {
      setQueue((s) => ({ ...s, loading: false, error: err.message || "Failed to load queue" }));
    }
  }, []);

  const fetchClaimed = useCallback(async (page = 1) => {
    setClaimed((s) => ({ ...s, loading: true, error: null, page }));
    try {
      const res = await getMyClaimedPosts(page, PAGE_SIZE);
      const posts = res.items.map(queueItemToPostData);
      setClaimed({ items: res.items, posts, pagination: res.pagination, loading: false, error: null, page });
    } catch (err: any) {
      setClaimed((s) => ({ ...s, loading: false, error: err.message || "Failed to load claimed posts" }));
    }
  }, []);

  // ── Initial loads ──
  useEffect(() => { fetchQueue(); }, [fetchQueue]);
  useEffect(() => { fetchClaimed(); }, [fetchClaimed]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleClaim = useCallback(
    async (postId: string) => {
      setClaimingPostId(postId);
      try {
        await claimPost(postId);
        // Remove from queue list
        setQueue((s) => {
          const next = s.items.filter((i) => i.postId !== postId);
          return { ...s, items: next, posts: next.map(queueItemToPostData) };
        });
        // Refresh claimed so the new item appears
        await fetchClaimed(claimed.page);
        showToast("Post claimed — you have 30 minutes to review");
      } catch (err: any) {
        showToast(err.message || "Failed to claim post");
      } finally {
        setClaimingPostId(null);
      }
    },
    [fetchClaimed, claimed.page]
  );

  const handleIgnore = useCallback(
    (postId: string) => {
      // Locally dismiss from queue (doesn't hit backend – just UI ignore)
      setQueue((s) => {
        const next = s.items.filter((i) => i.postId !== postId);
        return { ...s, items: next, posts: next.map(queueItemToPostData) };
      });
      showToast("Post ignored");
    },
    []
  );

  const handleAbandon = useCallback(
    async (postId: string) => {
      setAbandoningPostId(postId);
      try {
        await abandonClaim(postId);
        // Remove from claimed
        setClaimed((s) => {
          const next = s.items.filter((i) => i.postId !== postId);
          return { ...s, items: next, posts: next.map(queueItemToPostData) };
        });
        // Refresh queue so it reappears
        await fetchQueue(queue.page);
        showToast("Claim abandoned — post returned to queue");
      } catch (err: any) {
        showToast(err.message || "Failed to abandon claim");
      } finally {
        setAbandoningPostId(null);
      }
    },
    [fetchQueue, queue.page]
  );

  const handleVerdictSubmitted = useCallback(
    (postId: string, verdict: FactCheckVerdict) => {
      // Remove from claimed list
      setClaimed((s) => {
        const next = s.items.filter((i) => i.postId !== postId);
        return { ...s, items: next, posts: next.map(queueItemToPostData) };
      });
      showToast(
        verdict === "VALIDATED" ? "Post validated ✓" : "Post debunked ✗"
      );
    },
    []
  );

  // ── Current tab data ──
  const current = tabIndex === 0 ? queue : claimed;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold tracking-wide text-foreground">
              Moderation
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-7">
            Review and verify community submissions
          </p>
        </div>

        <button
          onClick={startTour}
          className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
          title="Help Tour"
        >
          <IoMdHelpCircleOutline className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div id="tour-moderation-tabs" className="w-fit">
        <SlideTabs
          tabs={[...TABS]}
          activeIndex={tabIndex}
          onActiveChange={setTabIndex}
          className="mb-5"
        />
      </div>

      {/* Content */}
      {current.loading ? (
        <div className="flex items-center justify-center py-20">
          <BouncingDots dots={3} message={tabIndex === 0 ? "Loading queue…" : "Loading claimed posts…"} />
        </div>
      ) : current.error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-sm text-destructive">{current.error}</p>
          <button
            onClick={() => (tabIndex === 0 ? fetchQueue(current.page) : fetchClaimed(current.page))}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      ) : current.posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Inbox className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {tabIndex === 0
              ? "No posts awaiting verification right now."
              : "You haven't claimed any posts yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {current.posts.map((post, i) => {
            const item = current.items[i];
            const postId = item?.postId ?? post.linkId;

            return (
              <div key={post.id} className="relative">
                <PostCard
                  post={post}
                  role="factchecker"
                  showStatus
                />
                {/* Action bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border">
                  {tabIndex === 0 ? (
                    <>
                      <button
                        id="tour-claim-btn"
                        onClick={() => handleClaim(postId)}
                        disabled={claimingPostId === postId}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {claimingPostId === postId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : null}
                        Claim
                      </button>
                      <button
                        onClick={() => handleIgnore(postId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground"
                      >
                        Ignore
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        id="tour-validate-btn"
                        onClick={() =>
                          setVerdictTarget({ postId, title: post.title })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      >
                        Validate
                      </button>
                      <button
                        id="tour-debunk-btn"
                        onClick={() =>
                          setVerdictTarget({ postId, title: post.title })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Debunk
                      </button>
                      <button
                        onClick={() => handleAbandon(postId)}
                        disabled={abandoningPostId === postId}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground ml-auto"
                      >
                        {abandoningPostId === postId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : null}
                        Abandon
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {current.pagination && current.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 pb-2">
              <button
                onClick={() =>
                  tabIndex === 0
                    ? fetchQueue(current.page - 1)
                    : fetchClaimed(current.page - 1)
                }
                disabled={current.page <= 1}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {current.page} of {current.pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  tabIndex === 0
                    ? fetchQueue(current.page + 1)
                    : fetchClaimed(current.page + 1)
                }
                disabled={current.page >= current.pagination.totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Verdict modal */}
      <VerdictModal
        open={!!verdictTarget}
        onClose={() => setVerdictTarget(null)}
        postId={verdictTarget?.postId ?? ""}
        postTitle={verdictTarget?.title ?? ""}
        onVerdictSubmitted={handleVerdictSubmitted}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background shadow-lg text-sm text-foreground animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toast}
          <button onClick={() => setToast(null)} className="hover:text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
