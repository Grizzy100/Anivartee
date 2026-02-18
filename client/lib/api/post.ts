// client/lib/api/post.ts
// Post API – maps to post-service /api/posts/* and interaction routes

import { postApi, unwrap, DEFAULT_PAGINATION } from "./api";
import type { Pagination } from "./api";
import type { FeedPost, LinkCategory } from "./feed";

// ─── Types (aligned with post-service validators) ────────────────────────────

/** POST /api/posts – createPostSchema */
export interface CreatePostPayload {
  title: string;
  url: string;
  description?: string;
  category?: LinkCategory;
  screenRecordingUrl?: string;
  sources?: string[];
}

/** PATCH /api/posts/:id – updatePostSchema */
export interface UpdatePostPayload {
  title?: string;
  description?: string;
  category?: LinkCategory;
}

export interface PaginatedUserPosts {
  posts: FeedPost[];
  pagination: Pagination;
}

/** POST /api/posts/:linkId/share – createShareSchema */
export type SharePlatform = "TWITTER" | "FACEBOOK" | "WHATSAPP" | "OTHER";

/** POST /api/posts/:linkId/view – createViewSchema */
export interface TrackViewPayload {
  sessionId?: string;
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/** POST /api/posts — Create a new post (authenticated). */
export async function createPost(payload: CreatePostPayload): Promise<FeedPost> {
  return unwrap(
    await postApi.authPost<FeedPost>("/posts", payload),
    "Failed to create post"
  );
}

/** GET /api/posts/user/:userId — Posts by a specific user with optional filters. */
export async function getUserPosts(
  userId: string,
  page = 1,
  pageSize = 20,
  options?: { status?: string; sortBy?: string }
): Promise<PaginatedUserPosts> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (options?.status) params.set("status", options.status);
  if (options?.sortBy) params.set("sortBy", options.sortBy);

  const res = await postApi.get<FeedPost[]>(
    `/posts/user/${userId}?${params.toString()}`
  );
  return {
    posts: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}

/** GET /api/posts/:id — Get a single post (optionalAuth). */
export async function getPost(id: string): Promise<FeedPost> {
  return unwrap(
    await postApi.get<FeedPost>(`/posts/${id}`),
    "Failed to fetch post"
  );
}

/** PATCH /api/posts/:id — Update a post (authenticated, owner only). */
export async function updatePost(
  id: string,
  payload: UpdatePostPayload
): Promise<FeedPost> {
  return unwrap(
    await postApi.authPatch<FeedPost>(`/posts/${id}`, payload),
    "Failed to update post"
  );
}

/** DELETE /api/posts/:id — Delete a post (authenticated, owner only). */
export async function deletePost(id: string): Promise<void> {
  await postApi.authDelete(`/posts/${id}`);
}

// ─── Likes ───────────────────────────────────────────────────────────────────

/** POST /api/posts/:linkId/like — Like a post. */
export async function likePost(linkId: string): Promise<void> {
  await postApi.authPost(`/posts/${linkId}/like`);
}

/** DELETE /api/posts/:linkId/like — Unlike a post. */
export async function unlikePost(linkId: string): Promise<void> {
  await postApi.authDelete(`/posts/${linkId}/like`);
}

// ─── Saves / Bookmarks ──────────────────────────────────────────────────────

/** POST /api/posts/:linkId/save — Save/bookmark a post. */
export async function savePost(linkId: string): Promise<void> {
  await postApi.authPost(`/posts/${linkId}/save`);
}

/** DELETE /api/posts/:linkId/save — Unsave a post. */
export async function unsavePost(linkId: string): Promise<void> {
  await postApi.authDelete(`/posts/${linkId}/save`);
}

/** GET /api/saved — Get all saved/bookmarked posts (page-based). */
export async function getSavedPosts(
  page = 1,
  pageSize = 20
): Promise<PaginatedUserPosts> {
  const res = await postApi.authGet<FeedPost[]>(
    `/saved?page=${page}&pageSize=${pageSize}`
  );
  return {
    posts: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}

// ─── Views & Shares ─────────────────────────────────────────────────────────

/** POST /api/posts/:linkId/view — Track a post view (optionalAuth). */
export async function trackView(
  linkId: string,
  payload?: TrackViewPayload
): Promise<void> {
  await postApi.post(`/posts/${linkId}/view`, payload ?? {});
}

/** POST /api/posts/:linkId/share — Track a share (authenticated). */
export async function sharePost(
  linkId: string,
  platform?: SharePlatform
): Promise<void> {
  await postApi.authPost(
    `/posts/${linkId}/share`,
    platform ? { platform } : {}
  );
}

// ─── My Fact-Checks ─────────────────────────────────────────────────────────

export interface FactCheckWithPost {
  id: string;
  postId: string;
  factCheckerId: string;
  verdict: "VALIDATED" | "DEBUNKED";
  header: string;
  description: string | null;
  referenceUrls: string[];
  createdAt: string;
  post: FeedPost;
}

export interface PaginatedFactChecks {
  factChecks: FactCheckWithPost[];
  pagination: Pagination;
}

/** GET /api/my-fact-checks — Get fact-checks submitted by current user. */
export async function getMyFactChecks(
  page = 1,
  pageSize = 20
): Promise<PaginatedFactChecks> {
  const res = await postApi.authGet<FactCheckWithPost[]>(
    `/my-fact-checks?page=${page}&pageSize=${pageSize}`
  );
  return {
    factChecks: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}
