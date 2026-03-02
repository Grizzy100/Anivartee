import type { SubscriptionEntitlements } from './entitlements.service.js';

export interface RankConfig {
  postsPerDay: number;
  editsPerDay: number;
  postPoints: number;
  flagWeight: number;
  penaltyPoints: number;
  minPoints: number;
}

export function applyEntitlements(
  rank: RankConfig,
  entitlements: SubscriptionEntitlements
): RankConfig {
  return {
    ...rank,
    postsPerDay: rank.postsPerDay + entitlements.extraPosts,
    editsPerDay: rank.editsPerDay + entitlements.extraEdits,
  };
}

