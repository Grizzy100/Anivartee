// client/lib/api/achievements.ts
// Achievement API — maps to post-service GET /api/posts/me/achievements

import { postApi } from "./api";

export type AchievementKey =
    | "FIRST_POST"
    | "STREAK_7_DAYS"
    | "STREAK_1_MONTH"
    | "PROLIFIC_25";

export interface AchievementsResponse {
    unlocked: AchievementKey[];
}

/** GET /api/posts/me/achievements */
export async function getMyAchievements(): Promise<AchievementsResponse> {
    const res = await postApi.authGet<AchievementsResponse>("/posts/me/achievements");
    return res.data ?? { unlocked: [] };
}
