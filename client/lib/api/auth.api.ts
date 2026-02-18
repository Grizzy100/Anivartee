// client/lib/auth.api.ts
// Auth API – maps 1:1 to user-service /api/auth/* routes

import {
  post,
  setAccessToken,
  clearAccessToken,
  refreshAccessToken,
  unwrap,
  API_BASE_URL,
  ApiError,
} from "../api/api";
import { getProfile, type UserProfile } from "./profile.api";

// ─── Request types (mirror backend validators) ──────────────────────────────

export type UserRole = "USER" | "FACT_CHECKER";

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  image?: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  passwordConfirmation: string;
}

// ─── Response types (mirror backend controller responses) ────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole | "ADMIN";
  avatarUrl: string | null;
}

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

const FORGOT_PW_MSG =
  "If an account with that email exists, a password reset link has been sent";

/**
 * Common flow for signup & signin:
 * 1. Call auth endpoint → store access token
 * 2. Fetch full profile (needed by AuthContext)
 * 3. Return both the lightweight AuthUser and the full UserProfile
 */
async function authenticate(
  endpoint: string,
  payload: SignupPayload | SigninPayload
): Promise<{ user: AuthUser; profile: UserProfile }> {
  const res = await post<AuthResult>(endpoint, payload);
  const { accessToken, user } = unwrap(res, "Authentication failed");
  setAccessToken(accessToken);

  // Fetch full profile so AuthContext can be updated immediately
  const profile = await getProfile();
  return { user, profile };
}

// ─── API functions ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 *
 * Registers a new user. On success the access token is stored in memory and
 * the refresh token is set as an httpOnly cookie by the backend.
 */
export function signup(payload: SignupPayload): Promise<{ user: AuthUser; profile: UserProfile }> {
  return authenticate("/auth/signup", payload);
}

/**
 * POST /api/auth/signin
 *
 * Authenticates an existing user. Stores access token in memory;
 * refresh token is set via httpOnly cookie.
 */
export function signin(payload: SigninPayload): Promise<{ user: AuthUser; profile: UserProfile }> {
  return authenticate("/auth/signin", payload);
}

/**
 * POST /api/auth/refresh
 *
 * Silently refreshes the access token using the httpOnly cookie.
 * Returns `true` if a new token was obtained, `false` otherwise.
 */
export async function refresh(): Promise<boolean> {
  const token = await refreshAccessToken();
  return token !== null;
}

/**
 * POST /api/auth/logout
 *
 * Logs out the current user — clears the access token in memory and
 * the refresh-token cookie on the server.
 */
export async function logout(): Promise<void> {
  try {
    await post("/auth/logout");
  } catch {
    // Best-effort — even if the server call fails we still clear local state
  } finally {
    clearAccessToken();
  }
}

/**
 * POST /api/auth/forgot-password
 *
 * Sends a password-reset email (if the account exists). Always resolves with
 * a generic message to avoid leaking whether an email is registered.
 */
export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<{ message: string }> {
  try {
    const res = await post<never>("/auth/forgot-password", payload);
    return { message: res.message || FORGOT_PW_MSG };
  } catch {
    // Backend intentionally returns 200 even on missing emails
    return { message: FORGOT_PW_MSG };
  }
}

/**
 * POST /api/auth/reset-password
 *
 * Resets the user's password using the token from the reset email.
 * Throws `ApiError` on invalid/expired tokens.
 */
export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<{ message: string }> {
  const res = await post<never>("/auth/reset-password", payload);
  return { message: res.message || "Password reset successful" };
}

/**
 * Returns the Google OAuth initiation URL.
 * The user should be redirected to this URL in the browser.
 */
export function getGoogleOAuthUrl(): string {
  return `${API_BASE_URL}/auth/google`;
}
