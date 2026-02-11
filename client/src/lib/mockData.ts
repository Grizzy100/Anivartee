import { UserStats, Post, TrendingItem } from './types';

export const mockUserStats: UserStats = {
  name: 'Alex Richardson',
  avatar: 'https://i.pravatar.cc/150?u=alexrichardson',
  rank: 'Analyst',
  role: 'User',
  postsCount: 47,
  totalLikes: 1284
};

export const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Dr. Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarahchen',
      role: 'Checker',
      badge: 'Verified'
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    heading: 'Climate Data Verification: 2024 Temperature Records',
    description: 'Analysis of global temperature anomalies indicates a statistically significant warming trend over the past decade. Cross-referenced with NOAA, NASA, and ESA datasets. Methodology includes regression analysis and peer-reviewed climate models.',
    proofLinks: [
      'https://climate.nasa.gov/vital-signs/global-temperature/',
      'https://www.noaa.gov/news/2024-annual-climate-report'
    ],
    engagement: {
      likes: 342,
      comments: 67,
      saves: 128,
      isLiked: false,
      isSaved: false
    }
  },
  {
    id: '2',
    author: {
      name: 'Marcus Thompson',
      avatar: 'https://i.pravatar.cc/150?u=marcusthompson',
      role: 'Verified',
      badge: 'Expert'
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    heading: 'Economic Policy Impact Assessment Q4 2025',
    description: 'Comprehensive review of fiscal policy changes and their measurable effects on GDP growth. Data sourced from Federal Reserve, IMF reports, and academic journals. Statistical confidence interval: 95%.',
    proofLinks: [
      'https://www.federalreserve.gov/monetarypolicy.htm',
      'https://www.imf.org/en/Publications'
    ],
    engagement: {
      likes: 256,
      comments: 43,
      saves: 89,
      isLiked: true,
      isSaved: true
    }
  },
  {
    id: '3',
    author: {
      name: 'Elena Rodriguez',
      avatar: 'https://i.pravatar.cc/150?u=elenarodriguez',
      role: 'Checker',
      badge: 'Verified'
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    heading: 'Public Health Data: Vaccination Efficacy Studies',
    description: 'Meta-analysis of 23 peer-reviewed studies examining vaccine effectiveness across multiple demographics. All sources cited are from WHO-approved research institutions. Confidence level: High.',
    proofLinks: [
      'https://www.who.int/publications',
      'https://pubmed.ncbi.nlm.nih.gov/'
    ],
    engagement: {
      likes: 512,
      comments: 94,
      saves: 203,
      isLiked: false,
      isSaved: true
    }
  },
  {
    id: '4',
    author: {
      name: 'James Park',
      avatar: 'https://i.pravatar.cc/150?u=jamespark',
      role: 'User',
    },
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    heading: 'Technology Sector Analysis: AI Investment Trends',
    description: 'Quarterly breakdown of venture capital flows into artificial intelligence startups. Data aggregated from Crunchbase, PitchBook, and SEC filings. Geographic distribution and sector-specific insights included.',
    proofLinks: [
      'https://www.crunchbase.com/',
      'https://www.sec.gov/'
    ],
    engagement: {
      likes: 189,
      comments: 31,
      saves: 67,
      isLiked: false,
      isSaved: false
    }
  },
  {
    id: '5',
    author: {
      name: 'Dr. Amira Patel',
      avatar: 'https://i.pravatar.cc/150?u=amirapatel',
      role: 'Checker',
      badge: 'Verified'
    },
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    heading: 'Education System Performance Metrics 2025',
    description: 'Comparative analysis of standardized test scores, graduation rates, and college readiness indicators across 15 OECD countries. Methodology validated by educational research standards. Peer-reviewed sources only.',
    proofLinks: [
      'https://www.oecd.org/education/',
      'https://nces.ed.gov/'
    ],
    engagement: {
      likes: 428,
      comments: 76,
      saves: 154,
      isLiked: true,
      isSaved: false
    }
  }
];

export const mockTrendingItems: TrendingItem[] = [
  {
    title: 'Global Energy Transition Report',
    status: 'LIVE',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    title: 'Federal Budget Analysis 2026',
    status: 'VERIFIED',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    title: 'Healthcare Reform Data Review',
    status: 'LIVE',
    timestamp: new Date(Date.now() - 5400000).toISOString()
  },
  {
    title: 'Agricultural Production Statistics',
    status: 'VERIFIED',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

// Fact-checker specific posts - posts pending review
export const mockPendingPosts: Post[] = [
  {
    id: 'p1',
    author: {
      name: 'Tom Hanks',
      avatar: 'https://i.pravatar.cc/150?u=tomhanks',
      role: 'User',
    },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    heading: 'Renewable Energy Adoption in Southeast Asia',
    description: 'Recent data suggests that solar energy capacity in Southeast Asia has increased by 340% over the last 5 years. This claim is based on industry reports and government statistics.',
    proofLinks: [
      'https://example.com/solar-data',
      'https://example.com/asia-renewables'
    ],
    engagement: {
      likes: 45,
      comments: 12,
      saves: 23,
      isLiked: false,
      isSaved: false
    }
  },
  {
    id: 'p2',
    author: {
      name: 'Lisa Wang',
      avatar: 'https://i.pravatar.cc/150?u=lisawang',
      role: 'User',
    },
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    heading: 'Cryptocurrency Market Trends Q1 2026',
    description: 'Bitcoin transaction volume has declined 28% compared to Q4 2025, according to blockchain analytics. This shift indicates potential market consolidation.',
    proofLinks: [
      'https://example.com/blockchain-stats'
    ],
    engagement: {
      likes: 78,
      comments: 34,
      saves: 56,
      isLiked: false,
      isSaved: false
    }
  },
  {
    id: 'p3',
    author: {
      name: 'Michael Foster',
      avatar: 'https://i.pravatar.cc/150?u=michaelfoster',
      role: 'User',
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    heading: 'Urban Air Quality Improvements 2020-2026',
    description: 'Major cities have reported average PM2.5 reductions of 18% since implementing stricter emissions standards. Data compiled from EPA and WHO sources.',
    proofLinks: [
      'https://www.epa.gov/',
      'https://www.who.int/air-quality'
    ],
    engagement: {
      likes: 134,
      comments: 28,
      saves: 91,
      isLiked: false,
      isSaved: false
    }
  }
];
