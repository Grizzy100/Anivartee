'use client';

import CalendarCard from './CalendarCard';
import TrendingSection from './TrendingSection';
import { mockTrendingItems } from '@/lib/mockData';

export default function RightPanel() {
  return (
    <aside className="fixed right-0 top-0 bottom-0 w-[320px] bg-app-bg border-l border-(--border) p-6 overflow-y-auto scrollbar-hidden">
      <div className="space-y-6">
        {/* Calendar Card */}
        <CalendarCard />

        {/* Trending Section */}
        <TrendingSection items={mockTrendingItems} />

        {/* Additional Info */}
        <div className="bg-surface border border-(--border) rounded-sm p-4">
          <h4 className="text-text-primary text-xs font-display font-semibold mb-2 tracking-wide">
            PLATFORM STATUS
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Active Checkers</span>
              <span className="text-(--success) font-display font-semibold">287</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Verified Today</span>
              <span className="text-(--primary) font-display font-semibold">1,432</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Pending Review</span>
              <span className="text-(--warning) font-display font-semibold">89</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
