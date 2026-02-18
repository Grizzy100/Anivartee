// client/lib/api/factChecker.ts
// Fact-Checker / Moderation API – maps to post-service moderation routes
// Types aligned with post-service Prisma schema & validators

import { ApiError, postApi, unwrap, DEFAULT_PAGINATION } from "./api";
import type { Pagination } from "./api";
import type { FeedPost } from "./feed";

// ─── Enums (from Prisma) ────────────────────────────────────────────────────

export type QueueStatus = "PENDING" | "CLAIMED" | "COMPLETED" | "REMOVED";
export type ClaimStatus = "ACTIVE" | "COMPLETED" | "EXPIRED" | "ABANDONED";
export type FactCheckVerdict = "VALIDATED" | "DEBUNKED";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ModerationQueueItem {
  id: string;
  postId: string;
  userId: string;
  status: QueueStatus;
  priority: number;
  addedAt: string;
  /** Joined post data (when included by the API) */
  post?: FeedPost;
  /** Joined claim info */
  claim?: ClaimRecord | null;
}

export interface PaginatedQueue {
  items: ModerationQueueItem[];
  pagination: Pagination;
}

export interface ClaimRecord {
  id: string;
  queueId: string;
  postId: string;
  factCheckerId: string;
  claimedAt: string;
  expiresAt: string;
  status: ClaimStatus;
}

/** POST /api/moderation/posts/:postId/verdict – submitVerdictSchema */
export interface SubmitVerdictPayload {
  verdict: FactCheckVerdict;
  header: string;
  description?: string;
  referenceUrls: string[];
}

/** PUT /api/moderation/posts/:postId/draft – saveDraftSchema */
export interface VerdictDraft {
  verdict?: string;
  header?: string;
  description?: string;
  referenceUrls?: string[];
}

export interface FactCheck {
  id: string;
  postId: string;
  factCheckerId: string;
  verdict: FactCheckVerdict;
  header: string;
  description: string | null;
  referenceUrls: string[];
  createdAt: string;
}

/** POST /api/posts/:linkId/fact-checks – createFactCheckSchema */
export interface CreateFactCheckPayload {
  verdict: FactCheckVerdict;
  header: string;
  description?: string;
  referenceUrls: string[];
}

// ─── Moderation Queue ───────────────────────────────────────────────────────

/** GET /api/moderation/queue — Fetch the moderation queue (FACT_CHECKER / ADMIN). */
export async function getModerationQueue(
  page = 1,
  pageSize = 20
): Promise<PaginatedQueue> {
  const res = await postApi.authGet<ModerationQueueItem[]>(
    `/moderation/queue?page=${page}&pageSize=${pageSize}`
  );
  return {
    items: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}

/** GET /api/moderation/queue/claimed — Posts claimed by the current user. */
export async function getMyClaimedPosts(
  page = 1,
  pageSize = 20
): Promise<PaginatedQueue> {
  const res = await postApi.authGet<ModerationQueueItem[]>(
    `/moderation/queue/claimed?page=${page}&pageSize=${pageSize}`
  );
  return {
    items: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}

/** GET /api/moderation/queue/:id — Fetch a single queue item. */
export async function getQueueItem(id: string): Promise<ModerationQueueItem> {
  return unwrap(
    await postApi.authGet<ModerationQueueItem>(`/moderation/queue/${id}`),
    "Failed to fetch queue item"
  );
}

// ─── Claims ─────────────────────────────────────────────────────────────────

/** POST /api/moderation/posts/:postId/claim — Claim a post for review. */
export async function claimPost(postId: string): Promise<ClaimRecord> {
  return unwrap(
    await postApi.authPost<ClaimRecord>(`/moderation/posts/${postId}/claim`),
    "Failed to claim post"
  );
}

/** DELETE /api/moderation/posts/:postId/claim — Abandon a claimed post. */
export async function abandonClaim(postId: string): Promise<void> {
  await postApi.authDelete(`/moderation/posts/${postId}/claim`);
}

/** GET /api/moderation/posts/:postId/claim — Get the active claim for a post. */
export async function getActiveClaim(
  postId: string
): Promise<ClaimRecord | null> {
  try {
    return unwrap(
      await postApi.authGet<ClaimRecord>(`/moderation/posts/${postId}/claim`),
      "Failed to fetch active claim"
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

// ─── Verdicts ───────────────────────────────────────────────────────────────

/** POST /api/moderation/posts/:postId/verdict — Submit a verdict. */
export async function submitVerdict(
  postId: string,
  payload: SubmitVerdictPayload
): Promise<FactCheck> {
  return unwrap(
    await postApi.authPost<FactCheck>(
      `/moderation/posts/${postId}/verdict`,
      payload
    ),
    "Failed to submit verdict"
  );
}

// ─── Drafts ─────────────────────────────────────────────────────────────────

/** PUT /api/moderation/posts/:postId/draft — Save a verdict draft. */
export async function saveDraft(
  postId: string,
  payload: VerdictDraft
): Promise<VerdictDraft> {
  return unwrap(
    await postApi.authPut<VerdictDraft>(
      `/moderation/posts/${postId}/draft`,
      payload
    ),
    "Failed to save draft"
  );
}

/** GET /api/moderation/posts/:postId/draft — Get a saved verdict draft. */
export async function getDraft(postId: string): Promise<VerdictDraft | null> {
  try {
    return unwrap(
      await postApi.authGet<VerdictDraft>(`/moderation/posts/${postId}/draft`),
      "Failed to fetch draft"
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

// ─── Fact-Checks (public read, FACT_CHECKER/ADMIN write) ────────────────────

/** POST /api/posts/:linkId/fact-checks — Create a fact-check. */
export async function createFactCheck(
  linkId: string,
  payload: CreateFactCheckPayload
): Promise<FactCheck> {
  return unwrap(
    await postApi.authPost<FactCheck>(`/posts/${linkId}/fact-checks`, payload),
    "Failed to create fact-check"
  );
}

/** GET /api/posts/:linkId/fact-checks — Get fact-checks for a post (public). */
export async function getFactChecks(linkId: string): Promise<FactCheck[]> {
  const res = await postApi.get<FactCheck[]>(`/posts/${linkId}/fact-checks`);
  return res.data ?? [];
}
