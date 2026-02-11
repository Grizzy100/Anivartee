'use client';

import { TrendingItem } from '@/lib/types';
import { formatTimestamp } from '@/lib/formatters';
import { TrendingUp } from 'lucide-react';

interface TrendingSectionProps {
  items: TrendingItem[];
}

export default function TrendingSection({ items }: TrendingSectionProps) {
  return (
    <div className="bg-surface border border-(--border) rounded-sm p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-(--secondary)" />
        <h3 className="text-text-primary text-sm font-display font-semibold tracking-wide">
          TRENDING NOW
        </h3>
      </div>

      {/* Trending Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={index}
            className="pb-3 border-b border-(--border) last:border-0 last:pb-0 hover:bg-surface-elevated/30 -mx-2 px-2 py-2 rounded-xs transition-colors cursor-pointer"
          >
            {/* Title and Status */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="text-text-primary text-xs font-medium leading-snug flex-1">
                {item.title}
              </h4>
              <span 
                className={`
                  text-[10px] font-display font-bold px-2 py-0.5 rounded-xs shrink-0
                  ${item.status === 'LIVE' 
                    ? 'bg-(--warning)/10 text-(--warning)' 
                    : 'bg-(--success)/10 text-(--success)'
                  }
                `}
              >
                {item.status}
              </span>
            </div>
            
            {/* Timestamp */}
            <p className="text-text-muted text-[11px]">
              {formatTimestamp(item.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
