//server\points-service\src\config\ranks.ts
// export interface RankConfig {
//   rank: string;
//   minPoints: number;
//   maxHeaderLength: number;
//   maxDescriptionLength: number;
//   postsPerDay: number;
//   editsPerDay: number;
//   commentEditWindowHours: number | null; // null = unlimited
//   flagsPerDay: number;
//   postPoints: number;
//   flagWeight: number;
//   penaltyPoints: number;
// }

// export const USER_RANKS: Record<string, RankConfig> = {
//   TRUSTED: {
//     rank: 'Trusted',
//     minPoints: 1500,
//     maxHeaderLength: 150,
//     maxDescriptionLength: 400,
//     postsPerDay: 5,
//     editsPerDay: 4,
//     commentEditWindowHours: null,
//     // Previous code commented out for reference
//     /*
//     export interface RankConfig {
//       rank: string;
//       minPoints: number;
//       maxHeaderLength: number;
//       maxDescriptionLength: number;
//       postsPerDay: number;
//       editsPerDay: number;
//       commentEditWindowHours: number | null; // null = unlimited
//       flagsPerDay: number;
//       postPoints: number;
//       flagWeight: number;
//       penaltyPoints: number;
//     }

//     export const USER_RANKS: Record<string, RankConfig> = {
//       TRUSTED: {
//         rank: 'Trusted',
//         minPoints: 1500,
//         maxHeaderLength: 150,
//         maxDescriptionLength: 400,
//         postsPerDay: 5,
//         editsPerDay: 4,
//         commentEditWindowHours: null,
//         flagsPerDay: 7,
//         postPoints: 9,
//         flagWeight: 2,
//         penaltyPoints: -70
//       },
//       RESEARCHER: {
//         rank: 'Researcher',
//         minPoints: 750,
//         maxHeaderLength: 130,
//         maxDescriptionLength: 350,
//         postsPerDay: 5,
//         editsPerDay: 4,
//         commentEditWindowHours: null,
//         flagsPerDay: 5,
//         postPoints: 7,
//         flagWeight: 1.3,
//         penaltyPoints: -30
//       },
//       CONTRIBUTOR: {
//         rank: 'Contributor',
//         minPoints: 300,
//         maxHeaderLength: 100,
//         maxDescriptionLength: 300,
//         postsPerDay: 3,
//         editsPerDay: 2,
//         commentEditWindowHours: 12,
//         flagsPerDay: 3,
//         postPoints: 4,
//         flagWeight: 0.8,
//         penaltyPoints: -15
//       },
//       NOVICE: {
//         rank: 'Novice',
//         minPoints: 0,
//         maxHeaderLength: 80,
//         maxDescriptionLength: 200,
//         postsPerDay: 2,
//         editsPerDay: 1,
//         commentEditWindowHours: 12,
//         flagsPerDay: 2,
//         postPoints: 3,
//         flagWeight: 0.5,
//         penaltyPoints: -3
//       }
//     };

//     export const CHECKER_RANKS: Record<string, RankConfig> = {
//       SENTINEL: {
//         rank: 'Sentinel',
//         // ...
//       }
//     };
//     */

  
export interface RankConfig {
  rank: string;
  minPoints: number;
  maxHeaderLength: number;
  maxDescriptionLength: number;
  postsPerDay: number;
  editsPerDay: number;
  commentEditWindowHours: number | null; // null = unlimited
  flagsPerDay: number;
  postPoints: number;
  flagWeight: number;
  penaltyPoints: number;
}

export const USER_RANKS: Record<string, RankConfig> = {
  NOVICE: {
    rank: 'Novice',
    minPoints: 0,
    maxHeaderLength: 80,
    maxDescriptionLength: 200,
    postsPerDay: 2,
    editsPerDay: 1,
    commentEditWindowHours: 12,
    flagsPerDay: 2,
    postPoints: 2,
    flagWeight: 1.0,
    penaltyPoints: -20
  },
  CONTRIBUTOR: {
    rank: 'Contributor',
    minPoints: 400,
    maxHeaderLength: 100,
    maxDescriptionLength: 300,
    postsPerDay: 3,
    editsPerDay: 2,
    commentEditWindowHours: 24,
    flagsPerDay: 4,
    postPoints: 3,
    flagWeight: 1.2,
    penaltyPoints: -40
  },
  RESEARCHER: {
    rank: 'Researcher',
    minPoints: 1200,
    maxHeaderLength: 120,
    maxDescriptionLength: 350,
    postsPerDay: 4,
    editsPerDay: 3,
    commentEditWindowHours: 48,
    flagsPerDay: 6,
    postPoints: 4,
    flagWeight: 1.4,
    penaltyPoints: -70
  },
  TRUSTED: {
    rank: 'Trusted',
    minPoints: 3000,
    maxHeaderLength: 140,
    maxDescriptionLength: 400,
    postsPerDay: 5,
    editsPerDay: 4,
    commentEditWindowHours: null,
    flagsPerDay: 8,
    postPoints: 4,
    flagWeight: 1.6,
    penaltyPoints: -120
  },
  ELITE: {
    rank: 'Elite',
    minPoints: 7000,
    maxHeaderLength: 160,
    maxDescriptionLength: 500,
    postsPerDay: 6,
    editsPerDay: 5,
    commentEditWindowHours: null,
    flagsPerDay: 10,
    postPoints: 5,
    flagWeight: 1.8,
    penaltyPoints: -200
  },
  LEGEND: {
    rank: 'Legend',
    minPoints: 15000,
    maxHeaderLength: 180,
    maxDescriptionLength: 600,
    postsPerDay: 7,
    editsPerDay: 6,
    commentEditWindowHours: null,
    flagsPerDay: 12,
    postPoints: 5,
    flagWeight: 2.0,
    penaltyPoints: -350
  }
};

export const CHECKER_RANKS: Record<string, RankConfig> = {
  APPRENTICE: {
    rank: 'Apprentice',
    minPoints: 0,
    maxHeaderLength: 100,
    maxDescriptionLength: 250,
    postsPerDay: 2,
    editsPerDay: 1,
    commentEditWindowHours: 24,
    flagsPerDay: 4,
    postPoints: 2,
    flagWeight: 1.2,
    penaltyPoints: -30
  },
  ANALYST: {
    rank: 'Analyst',
    minPoints: 600,
    maxHeaderLength: 120,
    maxDescriptionLength: 350,
    postsPerDay: 3,
    editsPerDay: 2,
    commentEditWindowHours: null,
    flagsPerDay: 6,
    postPoints: 3,
    flagWeight: 1.5,
    penaltyPoints: -60
  },
  INVESTIGATOR: {
    rank: 'Investigator',
    minPoints: 1800,
    maxHeaderLength: 140,
    maxDescriptionLength: 400,
    postsPerDay: 4,
    editsPerDay: 3,
    commentEditWindowHours: null,
    flagsPerDay: 8,
    postPoints: 3,
    flagWeight: 2.0,
    penaltyPoints: -120
  },
  SPECIALIST: {
    rank: 'Specialist',
    minPoints: 5000,
    maxHeaderLength: 160,
    maxDescriptionLength: 500,
    postsPerDay: 5,
    editsPerDay: 4,
    commentEditWindowHours: null,
    flagsPerDay: 10,
    postPoints: 4,
    flagWeight: 2.5,
    penaltyPoints: -250
  },
  SENTINEL: {
    rank: 'Sentinel',
    minPoints: 12000,
    maxHeaderLength: 180,
    maxDescriptionLength: 600,
    postsPerDay: 6,
    editsPerDay: 5,
    commentEditWindowHours: null,
    flagsPerDay: 14,
    postPoints: 4,
    flagWeight: 3.0,
    penaltyPoints: -400
  },
  GUARDIAN: {
    rank: 'Guardian',
    minPoints: 25000,
    maxHeaderLength: 200,
    maxDescriptionLength: 700,
    postsPerDay: 7,
    editsPerDay: 6,
    commentEditWindowHours: null,
    flagsPerDay: 18,
    postPoints: 5,
    flagWeight: 3.5,
    penaltyPoints: -600
  }
};