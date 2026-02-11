/**
 * Authoritative rank configuration for Anivartee.
 * All other services use PointsClient to fetch rank data from here.
 *
 * User ranks:    NOVICE → CONTRIBUTOR → RESEARCHER → TRUSTED
 * Checker ranks: APPRENTICE → ANALYST → INVESTIGATOR → SPECIALIST → SENTINEL
 */

export interface RankConfig {
  rank: string;
  minPoints: number;
  maxHeaderLength: number;
  maxDescriptionLength: number;
  postsPerDay: number;
  flagsPerDay: number;
  postPoints: number;
  flagWeight: number;
  penaltyPoints: number;
}

export const USER_RANKS: Record<string, RankConfig> = {
  TRUSTED: {
    rank: 'Trusted',
    minPoints: 1500,
    maxHeaderLength: 50,
    maxDescriptionLength: 200,
    postsPerDay: 5,
    flagsPerDay: 7,
    postPoints: 9,
    flagWeight: 2,
    penaltyPoints: -70
  },
  RESEARCHER: {
    rank: 'Researcher',
    minPoints: 750,
    maxHeaderLength: 50,
    maxDescriptionLength: 140,
    postsPerDay: 5,
    flagsPerDay: 5,
    postPoints: 7,
    flagWeight: 1.3,
    penaltyPoints: -30
  },
  CONTRIBUTOR: {
    rank: 'Contributor',
    minPoints: 300,
    maxHeaderLength: 30,
    maxDescriptionLength: 100,
    postsPerDay: 3,
    flagsPerDay: 3,
    postPoints: 4,
    flagWeight: 0.8,
    penaltyPoints: -15
  },
  NOVICE: {
    rank: 'Novice',
    minPoints: 0,
    maxHeaderLength: 20,
    maxDescriptionLength: 60,
    postsPerDay: 2,
    flagsPerDay: 2,
    postPoints: 3,
    flagWeight: 0.5,
    penaltyPoints: -3
  }
};

export const CHECKER_RANKS: Record<string, RankConfig> = {
  SENTINEL: {
    rank: 'Sentinel',
    minPoints: 1500,
    maxHeaderLength: 50,
    maxDescriptionLength: 350,
    postsPerDay: 5,
    flagsPerDay: 10,
    postPoints: 4,
    flagWeight: 3.5,
    penaltyPoints: -60
  },
  SPECIALIST: {
    rank: 'Specialist',
    minPoints: 800,
    maxHeaderLength: 50,
    maxDescriptionLength: 290,
    postsPerDay: 5,
    flagsPerDay: 10,
    postPoints: 4,
    flagWeight: 2,
    penaltyPoints: -30
  },
  INVESTIGATOR: {
    rank: 'Investigator',
    minPoints: 400,
    maxHeaderLength: 40,
    maxDescriptionLength: 240,
    postsPerDay: 4,
    flagsPerDay: 7,
    postPoints: 4,
    flagWeight: 1.5,
    penaltyPoints: -16
  },
  ANALYST: {
    rank: 'Analyst',
    minPoints: 200,
    maxHeaderLength: 30,
    maxDescriptionLength: 180,
    postsPerDay: 3,
    flagsPerDay: 5,
    postPoints: 4,
    flagWeight: 1.2,
    penaltyPoints: -8
  },
  APPRENTICE: {
    rank: 'Apprentice',
    minPoints: 0,
    maxHeaderLength: 20,
    maxDescriptionLength: 140,
    postsPerDay: 2,
    flagsPerDay: 3,
    postPoints: 4,
    flagWeight: 1,
    penaltyPoints: -4
  }
};

/** Ordered high → low for rank computation */
export const ORDERED_USER_RANKS = ['TRUSTED', 'RESEARCHER', 'CONTRIBUTOR', 'NOVICE'] as const;
export const ORDERED_CHECKER_RANKS = ['SENTINEL', 'SPECIALIST', 'INVESTIGATOR', 'ANALYST', 'APPRENTICE'] as const;
