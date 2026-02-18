// client/lib/profile.api.ts
// Profile API – maps 1:1 to user-service /api/me routes (authenticated)

import { authGet, authPatch, authPost, authPut, unwrap } from "../api/api";

// ─── Types (mirror backend validators & Prisma models) ──────────────────────

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: "USER" | "FACT_CHECKER" | "ADMIN";
  status: "ACTIVE" | "DISABLED";
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  emailVerified: boolean;
  createdAt: string;
  userProfile: {
    firstName: string | null;
    lastName: string | null;
    state: string | null;
    country: string | null;
  } | null;
  factCheckerProfile: Record<string, unknown> | null;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
  state?: string;
  country?: string;
  organization?: string;
}

export interface AvatarUploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
}

export interface UpdateAvatarPayload {
  avatarUrl: string;
  avatarPublicId: string;
}

export interface AvatarUpdateResult {
  avatarUrl: string;
  avatarPublicId: string;
}

// ─── API functions ───────────────────────────────────────────────────────────
// All functions below throw `ApiError` on failure. The 401 auto-retry logic
// in api.ts handles expired tokens transparently.

/**
 * GET /api/me — Fetches the authenticated user's full profile.
 */
export async function getProfile(): Promise<UserProfile> {
  const res = await authGet<UserProfile>("/me");
  return unwrap(res, "Failed to fetch profile");
}

/**
 * PATCH /api/me — Partial update of authenticated user's profile.
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const res = await authPatch<UserProfile>("/me", payload);
  return unwrap(res, "Failed to update profile");
}

/**
 * POST /api/me/avatar/signature — Cloudinary signed-upload params.
 * Use the returned signature to upload directly from the browser,
 * then call `updateAvatar` with the resulting URL and public ID.
 */
export async function getAvatarUploadSignature(): Promise<AvatarUploadSignature> {
  const res = await authPost<AvatarUploadSignature>("/me/avatar/signature");
  return unwrap(res, "Failed to generate upload signature");
}

/**
 * PUT /api/me/avatar — Persist the avatar URL & public ID after upload.
 */
export async function updateAvatar(
  payload: UpdateAvatarPayload
): Promise<AvatarUpdateResult> {
  const res = await authPut<AvatarUpdateResult>("/me/avatar", payload);
  return unwrap(res, "Failed to update avatar");
}
