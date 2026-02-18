// client/lib/api/user.ts
// User Dashboard API — aggregates data for the /dashboard/user view

import { getHomeFeed, type PaginatedPosts } from "./feed";
import { getProfile, type UserProfile } from "./profile.api";
import { getMyRank, type UserRankData } from "./points";
import { getActivityCalendar, type CalendarResponse } from "./activity";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserDashboardData {
  profile: UserProfile;
  feed: PaginatedPosts;
  rank: UserRankData | null;
  activity: CalendarResponse;
}

// ─── API functions ───────────────────────────────────────────────────────────

/**
 * Fetches all data required for the user dashboard landing page.
 * Runs requests concurrently via `Promise.allSettled` so a partial failure
 * (e.g. points-service is down) doesn't break the entire dashboard.
 */
export async function getUserDashboard(): Promise<UserDashboardData> {
  const [profile, feed, rank, activity] = await Promise.allSettled([
    getProfile(),
    getHomeFeed(),
    getMyRank(),
    getActivityCalendar(),
  ]);

  return {
    profile:
      profile.status === "fulfilled"
        ? profile.value
        : ({} as UserProfile),
    feed:
      feed.status === "fulfilled"
        ? feed.value
        : {
            posts: [],
            pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
          },
    rank: rank.status === "fulfilled" ? rank.value : null,
    activity: activity.status === "fulfilled"
      ? activity.value
      : { year: new Date().getFullYear(), month: new Date().getMonth() + 1, activeDays: [], details: {} },
  };
}
