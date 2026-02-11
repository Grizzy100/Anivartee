export type UserRole = 'User' | 'Checker' | 'Verified' | 'Admin';
export type PostStatus = 'LIVE' | 'VERIFIED' | 'PENDING' | 'REJECTED';
export type NavigationItem = 'Home' | 'My Posts' | 'My Profile' | 'Subscription' | 'Settings';

export interface UserStats {
  name: string;
  avatar: string;
  rank: string;
  role: UserRole;
  postsCount: number;
  totalLikes: number;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: UserRole;
    badge?: string;
  };
  timestamp: string;
  heading: string;
  description: string;
  proofLinks: string[];
  engagement: {
    likes: number;
    comments: number;
    saves: number;
    isLiked: boolean;
    isSaved: boolean;
  };
}

export interface TrendingItem {
  title: string;
  status: 'LIVE' | 'VERIFIED';
  timestamp: string;
}
