// Shared types for dashboard components
// Used across both user and fact-checker dashboards

export interface PostAuthorDisplay {
  name: string;
  initials: string;
  role: string;
  avatarUrl?: string | null;
  rankName?: string;
  rankLevel?: number;
}

export interface PostData {
  id: string;
  /** The post's `id` in the backend — used for like/save/comment API calls. */
  linkId: string;
  /** The post author's userId — used for ownership checks */
  userId?: string;
  author: PostAuthorDisplay;
  timestamp: string;
  title: string;
  description: string;
  proofLinks?: string[];
  likes: number;
  comments: number;
  shares?: number;
  flags?: number;
  /** Whether the current user has liked this post. */
  liked: boolean;
  /** Whether the current user has saved/bookmarked this post. */
  saved: boolean;
  status?: "verified" | "under-review" | "pending" | "debunked" | "flagged";
  /** Optional quoted / referenced post (for quote-posts) */
  quotedPost?: QuotedPostData | null;
}

/** Minimal post data for a nested quoted post. */
export interface QuotedPostData {
  id: string;
  linkId: string;
  author: PostAuthorDisplay;
  timestamp: string;
  title: string;
  description: string;
  /** null = content was deleted or unavailable */
  unavailable?: boolean;
}

export type DashboardRole = "user" | "factchecker";
