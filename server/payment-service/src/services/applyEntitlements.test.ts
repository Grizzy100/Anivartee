import { applyEntitlements, type RankConfig } from './applyEntitlements.js';
import type { SubscriptionEntitlements } from './entitlements.service.js';

describe('applyEntitlements', () => {
  const baseRank: RankConfig = {
    postsPerDay: 5,
    editsPerDay: 3,
    postPoints: 10,
    flagWeight: 1,
    penaltyPoints: 5,
    minPoints: 100,
  };

  const subEntitlements: SubscriptionEntitlements = {
    extraPosts: 1,
    extraEdits: 1,
    hasAnalytics: true,
    hasDrafts: true,
    hasProBadge: true,
  };

  it('increases postsPerDay and editsPerDay only', () => {
    const result = applyEntitlements(baseRank, subEntitlements);

    expect(result.postsPerDay).toBe(baseRank.postsPerDay + 1);
    expect(result.editsPerDay).toBe(baseRank.editsPerDay + 1);
    expect(result.postPoints).toBe(baseRank.postPoints);
    expect(result.flagWeight).toBe(baseRank.flagWeight);
    expect(result.penaltyPoints).toBe(baseRank.penaltyPoints);
    expect(result.minPoints).toBe(baseRank.minPoints);
  });

  it('returns rank unchanged when entitlements are zero', () => {
    const none: SubscriptionEntitlements = {
      extraPosts: 0,
      extraEdits: 0,
      hasAnalytics: false,
      hasDrafts: false,
      hasProBadge: false,
    };

    const result = applyEntitlements(baseRank, none);
    expect(result).toEqual(baseRank);
  });
});

