// client/lib/api/flag.ts
// Flag API – maps to post-service flag routes

import { postApi, unwrap } from "./api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FlagScore {
  linkId: string;
  totalFlags: number;
  weightedScore: number;
}

// ─── API functions ───────────────────────────────────────────────────────────

/** POST /api/posts/:linkId/flag — Flag a post (authenticated, one per user). */
export async function flagPost(linkId: string): Promise<void> {
  await postApi.authPost(`/posts/${linkId}/flag`);
}

/** DELETE /api/posts/:linkId/flag — Remove own flag from a post (authenticated). */
export async function unflagPost(linkId: string): Promise<void> {
  await postApi.authDelete(`/posts/${linkId}/flag`);
}

/** GET /api/posts/:linkId/flag-score — Get the flag score for a post (public). */
export async function getFlagScore(linkId: string): Promise<FlagScore> {
  return unwrap(
    await postApi.get<FlagScore>(`/posts/${linkId}/flag-score`),
    "Failed to fetch flag score"
  );
}
