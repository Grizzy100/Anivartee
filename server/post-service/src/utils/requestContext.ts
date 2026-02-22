//server\post-service\src\utils\requestContext.ts
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Request-scoped context propagated through async chains via AsyncLocalStorage.
 * Any code running within a request (even fire-and-forget promises) can read
 * the store set by the timezone middleware without explicit parameter threading.
 */
interface RequestContext {
  /** IANA timezone string from the `x-timezone` header, e.g. "Asia/Kolkata". */
  timezone?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Read the caller's timezone from the current request context.
 * Falls back to `'UTC'` when no context is available (e.g. cron jobs).
 */
export function getRequestTimezone(): string {
  return requestContext.getStore()?.timezone || 'UTC';
}
