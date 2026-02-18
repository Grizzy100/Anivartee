// client/lib/api/activity.ts
// Activity API – maps to post-service /api/activity/* routes
// Backend requires `?year=&month=` query params (validated by calendarQuerySchema)

import { postApi } from "./api";

// ─── Types (aligned with backend activityService.getCalendar response) ───────

/** Per-day breakdown returned inside CalendarResponse.details */
export interface DayDetail {
  posts: number;
  edits: number;
  factChecks: number;
}

/** Shape returned by GET /api/activity/calendar */
export interface CalendarResponse {
  year: number;
  month: number;
  /** Dates with activity, e.g. ["2026-02-01", "2026-02-14"] */
  activeDays: string[];
  /** Keyed by "YYYY-MM-DD" */
  details: Record<string, DayDetail>;
}

// ─── API functions ───────────────────────────────────────────────────────────

/**
 * GET /api/activity/calendar — Authenticated user's activity calendar.
 * Backend requires `year` and `month` query params (Zod-validated).
 *
 * @param year  — Calendar year (e.g. 2026). Defaults to current year.
 * @param month — Calendar month (1–12). Defaults to current month.
 */
export async function getActivityCalendar(
  year?: number,
  month?: number
): Promise<CalendarResponse> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;

  const res = await postApi.authGet<CalendarResponse>(
    `/activity/calendar?year=${y}&month=${m}`
  );
  return res.data ?? { year: y, month: m, activeDays: [], details: {} };
}
