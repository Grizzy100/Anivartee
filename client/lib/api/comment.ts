// client/lib/api/comment.ts
// Comment API – maps to post-service comment & comment-like routes

import { postApi, unwrap, DEFAULT_PAGINATION } from "./api";
import type { Pagination } from "./api";

// ─── Types (aligned with post-service Prisma Comment model) ──────────────────

export interface Comment {
  id: string;
  linkId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Nested replies – present when the API includes them */
  replies?: Comment[];
  /** Enriched author info – present when feed controller joins user data */
  author?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  /** Like count */
  _count?: {
    likes: number;
  };
  /** Whether current user has liked this comment */
  liked?: boolean;
}

export interface PaginatedComments {
  comments: Comment[];
  pagination: Pagination;
}

/** POST /api/posts/:linkId/comments – createCommentSchema */
export interface CreateCommentPayload {
  content: string;
  /** UUID of the parent comment for replies */
  parentId?: string;
}

/** PATCH /api/comments/:id – updateCommentSchema */
export interface UpdateCommentPayload {
  content: string;
}

// ─── API functions ───────────────────────────────────────────────────────────

/** POST /api/posts/:linkId/comments — Create a comment on a post (authenticated). */
export async function createComment(
  linkId: string,
  payload: CreateCommentPayload
): Promise<Comment> {
  return unwrap(
    await postApi.authPost<Comment>(`/posts/${linkId}/comments`, payload),
    "Failed to create comment"
  );
}

/** GET /api/posts/:linkId/comments — List comments for a post (page-based). */
export async function getComments(
  linkId: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedComments> {
  const res = await postApi.get<Comment[]>(
    `/posts/${linkId}/comments?page=${page}&pageSize=${pageSize}`
  );
  return {
    comments: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}

/** PATCH /api/comments/:id — Update a comment (authenticated, owner only). */
export async function updateComment(
  id: string,
  payload: UpdateCommentPayload
): Promise<Comment> {
  return unwrap(
    await postApi.authPatch<Comment>(`/comments/${id}`, payload),
    "Failed to update comment"
  );
}

/** DELETE /api/comments/:id — Delete a comment (authenticated, owner only). */
export async function deleteComment(id: string): Promise<void> {
  await postApi.authDelete(`/comments/${id}`);
}

// ─── Comment Likes ───────────────────────────────────────────────────────────

/** POST /api/comments/:commentId/like — Like a comment (authenticated). */
export async function likeComment(commentId: string): Promise<void> {
  await postApi.authPost(`/comments/${commentId}/like`);
}

/** DELETE /api/comments/:commentId/like — Unlike a comment (authenticated). */
export async function unlikeComment(commentId: string): Promise<void> {
  await postApi.authDelete(`/comments/${commentId}/like`);
}
