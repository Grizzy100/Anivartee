'use client';

import { Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="h-16 border-b border-(--border) bg-surface sticky top-0 z-10 px-6 flex items-center">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search posts, topics, fact-checkers..."
            className="
              w-full h-10 pl-10 pr-4 
              bg-surface-elevated border border-(--border) 
              rounded-sm text-sm text-text-primary placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent
              transition-all
            "
          />
        </div>
      </div>

      {/* Right Section - could add notifications, profile menu later */}
      <div className="ml-6 flex items-center gap-4">
        {/* Placeholder for future elements */}
      </div>
    </nav>
  );
}
