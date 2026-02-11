'use client';

import { UserStats } from '@/lib/types';
import { formatCount } from '@/lib/formatters';

interface UserStatsCardProps {
  stats: UserStats;
}

export default function UserStatsCard({ stats }: UserStatsCardProps) {
  return (
    <div className="border border-(--border) bg-surface p-4 rounded-sm mx-3 mb-4">
      {/* Avatar and User Info */}
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={stats.avatar} 
          alt={stats.name}
          className="w-12 h-12 rounded-full border-2 border-(--primary)"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary text-sm font-medium truncate">
            {stats.name}
          </h3>
          <p className="text-text-muted text-xs font-display tracking-wide">
            {stats.rank} | {stats.role}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-(--border) mb-3" />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-text-muted text-xs mb-1">Posts</p>
          <p className="text-text-primary text-lg font-display font-semibold">
            {formatCount(stats.postsCount)}
          </p>
        </div>
        <div>
          <p className="text-text-muted text-xs mb-1">Total Likes</p>
          <p className="text-text-primary text-lg font-display font-semibold">
            {formatCount(stats.totalLikes)}
          </p>
        </div>
      </div>
    </div>
  );
}
