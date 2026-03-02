// client/lib/api.ts
// Base API client for communicating with all backend micro-services

// ─── Service base URLs ──────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const POST_API_BASE_URL =
  process.env.NEXT_PUBLIC_POST_API_URL || "http://localhost:3002/api";

export const PAYMENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:3005/api";

export const POINTS_API_BASE_URL =
  process.env.NEXT_PUBLIC_POINTS_API_URL || "http://localhost:3004/api";

/** Default request timeout in milliseconds (15 s). */
const REQUEST_TIMEOUT_MS = 15_000;

// ─── Types ───────────────────────────────────────────────────────────────────

/** Standard page-based pagination envelope returned by all services. */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  details?: Record<string, string[]>;
  pagination?: Pagination;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** True when the server explicitly flagged the token as expired. */
  get isTokenExpired(): boolean {
    return this.status === 401 && this.code === "TOKEN_EXPIRED";
  }
}

// ─── Token management (in-memory for XSS safety) ────────────────────────────

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

// ─── Auth failure callback ───────────────────────────────────────────────────
// Called when a request fails with 401 AND the token refresh also fails.
// The AuthProvider registers a listener so it can redirect to /login.

type AuthFailureListener = () => void;
let authFailureListener: AuthFailureListener | null = null;

export function onAuthFailure(listener: AuthFailureListener): () => void {
  authFailureListener = listener;
  return () => {
    if (authFailureListener === listener) authFailureListener = null;
  };
}

function notifyAuthFailure(): void {
  authFailureListener?.();
}

// ─── Refresh-token deduplication ─────────────────────────────────────────────
// Prevents N concurrent 401 responses from triggering N separate refreshes.

let inflightRefresh: Promise<string | null> | null = null;

/**
 * Attempt to silently refresh the access token using the httpOnly
 * refresh-token cookie. Concurrent callers share the same in-flight request.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) return null;

      const json = await safeJson<ApiResponse<{ accessToken: string }>>(res);
      if (json?.success && json.data?.accessToken) {
        setAccessToken(json.data.accessToken);
        return json.data.accessToken;
      }

      return null;
    } catch {
      return null;
    } finally {
      inflightRefresh = null;
    }
  })();

  return inflightRefresh;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely parse JSON; returns `null` for non-JSON bodies (e.g. 502 HTML). */
async function safeJson<T>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;

  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Extract `.data` from a successful `ApiResponse`, or throw `ApiError`.
 * Eliminates the repetitive `if (res.data) return res.data; throw …` boilerplate.
 */
export function unwrap<T>(res: ApiResponse<T>, fallbackMsg: string): T {
  if (res.data !== undefined) return res.data;
  throw new ApiError(res.error || res.message || fallbackMsg, 500, res.code);
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

interface FetchOptions extends Omit<RequestInit, "body" | "signal"> {
  body?: unknown;
  /** Attach Authorization header (default: false). */
  auth?: boolean;
  /** Per-request timeout override in ms. */
  timeoutMs?: number;
}

async function request<T>(
  endpoint: string,
  options: FetchOptions = {},
  baseUrl: string = API_BASE_URL
): Promise<ApiResponse<T>> {
  const {
    body,
    auth = false,
    timeoutMs = REQUEST_TIMEOUT_MS,
    headers: extraHeaders,
    ...rest
  } = options;

  // Resolve the user's IANA timezone once (e.g. "Asia/Kolkata").
  // Sent on every request so the server can bucket activity by the user's local date.
  const clientTimezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(clientTimezone ? { "x-timezone": clientTimezone } : {}),
    ...(extraHeaders as Record<string, string>),
  };

  // If this is an auth request but we have no token, try refreshing first
  if (auth && !accessToken) {
    await refreshAccessToken();
  }

  if (auth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Abort on timeout
  const controller = new AbortController();
  const timer = timeoutMs > 0
    ? setTimeout(() => controller.abort(), timeoutMs)
    : undefined;

  const config: RequestInit = {
    ...rest,
    headers,
    signal: controller.signal,
    credentials: "include", // send cookies (refreshToken)
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const url = `${baseUrl}${endpoint}`;

  try {
    const res = await fetch(url, config);

    // 204 No Content — nothing to parse
    if (res.status === 204) {
      return { success: true } as ApiResponse<T>;
    }

    const json = await safeJson<ApiResponse<T>>(res);

    // Non-JSON response (e.g. 502 gateway HTML page)
    if (!json) {
      throw new ApiError(
        `Server returned non-JSON response (${res.status})`,
        res.status
      );
    }

    if (!res.ok || !json.success) {
      throw new ApiError(
        json.error || json.message || `Request failed (${res.status})`,
        res.status,
        json.code,
        json.details
      );
    }

    return json;
  } catch (error) {
    if (error instanceof ApiError) {
      // Auto-retry once on any 401 if this was an auth request.
      // Covers TOKEN_EXPIRED, INVALID_TOKEN, AUTHENTICATION_FAILED (missing header), etc.
      if (error.status === 401 && auth) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry the original request with the fresh token
          return request<T>(endpoint, { ...options, auth: true }, baseUrl);
        }
        // Refresh failed — surface the 401 so the UI can redirect to login
        clearAccessToken();
        notifyAuthFailure();
      }
      throw error;
    }

    // AbortController timeout
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }

    // Network / unknown errors
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  } finally {
    clearTimeout(timer);
  }
}

// ─── Public helpers ──────────────────────────────────────────────────────────

/** Unauthenticated GET */
export function get<T>(endpoint: string) {
  return request<T>(endpoint, { method: "GET" });
}

/** Unauthenticated POST */
export function post<T>(endpoint: string, body?: unknown) {
  return request<T>(endpoint, { method: "POST", body });
}

/** Authenticated GET */
export function authGet<T>(endpoint: string) {
  return request<T>(endpoint, { method: "GET", auth: true });
}

/** Authenticated POST */
export function authPost<T>(endpoint: string, body?: unknown) {
  return request<T>(endpoint, { method: "POST", body, auth: true });
}

/** Authenticated PATCH */
export function authPatch<T>(endpoint: string, body?: unknown) {
  return request<T>(endpoint, { method: "PATCH", body, auth: true });
}

/** Authenticated PUT */
export function authPut<T>(endpoint: string, body?: unknown) {
  return request<T>(endpoint, { method: "PUT", body, auth: true });
}

/** Authenticated DELETE */
export function authDelete<T>(endpoint: string) {
  return request<T>(endpoint, { method: "DELETE", auth: true });
}

// ─── Multi-service client factory ────────────────────────────────────────────

export interface ServiceClient {
  get: <T>(endpoint: string) => Promise<ApiResponse<T>>;
  post: <T>(endpoint: string, body?: unknown) => Promise<ApiResponse<T>>;
  authGet: <T>(endpoint: string) => Promise<ApiResponse<T>>;
  authPost: <T>(endpoint: string, body?: unknown) => Promise<ApiResponse<T>>;
  authPatch: <T>(endpoint: string, body?: unknown) => Promise<ApiResponse<T>>;
  authPut: <T>(endpoint: string, body?: unknown) => Promise<ApiResponse<T>>;
  authDelete: <T>(endpoint: string) => Promise<ApiResponse<T>>;
}

/**
 * Create a service client bound to a specific base URL.
 * Inherits token management, timeout, retry, and error handling from `request()`.
 */
export function createServiceClient(baseUrl: string): ServiceClient {
  return {
    get: <T>(endpoint: string) =>
      request<T>(endpoint, { method: "GET" }, baseUrl),
    post: <T>(endpoint: string, body?: unknown) =>
      request<T>(endpoint, { method: "POST", body }, baseUrl),
    authGet: <T>(endpoint: string) =>
      request<T>(endpoint, { method: "GET", auth: true }, baseUrl),
    authPost: <T>(endpoint: string, body?: unknown) =>
      request<T>(endpoint, { method: "POST", body, auth: true }, baseUrl),
    authPatch: <T>(endpoint: string, body?: unknown) =>
      request<T>(endpoint, { method: "PATCH", body, auth: true }, baseUrl),
    authPut: <T>(endpoint: string, body?: unknown) =>
      request<T>(endpoint, { method: "PUT", body, auth: true }, baseUrl),
    authDelete: <T>(endpoint: string) =>
      request<T>(endpoint, { method: "DELETE", auth: true }, baseUrl),
  };
}

/** Post-service client (port 3002) */
export const postApi = createServiceClient(POST_API_BASE_URL);

/** Payment-service client (port 3005) */
export const paymentApi = createServiceClient(PAYMENT_API_BASE_URL);

/** Points-service client (port 3004) */
export const pointsApi = createServiceClient(POINTS_API_BASE_URL);
