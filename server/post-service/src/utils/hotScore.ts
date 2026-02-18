/**
 * Reddit-style epoch hot score algorithm.
 *
 * Formula:
 *   log10(max(engagement, 1)) × statusMultiplier + (createdAtEpoch - PLATFORM_EPOCH) / 86400
 *
 * - engagement = likes + comments×2 + views×0.01
 * - PLATFORM_EPOCH = 2025-01-01T00:00:00Z  (1735689600)
 * - The time component is an additive constant so newer posts start higher.
 * - Status multiplier rewards verified content and penalises flagged/debunked.
 */

// 2025-01-01T00:00:00 UTC in seconds
const PLATFORM_EPOCH = 1735689600;

const STATUS_MULTIPLIERS: Record<string, number> = {
  VALIDATED: 1.5,
  UNDER_REVIEW: 1.2,
  PENDING: 1.0,
  DEBUNKED: 0.8,
  FLAGGED: 0.5,
};

export interface HotScoreInput {
  likes: number;
  comments: number;
  views: number;
  status: string;
  createdAt: Date;
}

export function computeHotScore(input: HotScoreInput): number {
  const { likes, comments, views, status, createdAt } = input;

  const engagement = likes + comments * 2 + views * 0.01;
  const engagementScore = Math.log10(Math.max(engagement, 1));

  const multiplier = STATUS_MULTIPLIERS[status] ?? 1.0;

  const createdAtEpoch = Math.floor(createdAt.getTime() / 1000);
  const timeScore = (createdAtEpoch - PLATFORM_EPOCH) / 86400;

  return engagementScore * multiplier + timeScore;
}
