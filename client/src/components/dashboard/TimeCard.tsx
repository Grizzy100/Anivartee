'use client';

import { useState, useEffect } from 'react';
import { formatCurrentTime, formatCurrentDate } from '@/lib/formatters';

export default function TimeCard() {
  const [time, setTime] = useState('00:00');
  const [date, setDate] = useState('');

  useEffect(() => {
    // Initial set
    setTime(formatCurrentTime());
    setDate(formatCurrentDate());

    // Update every second
    const interval = setInterval(() => {
      setTime(formatCurrentTime());
      setDate(formatCurrentDate());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface border border-(--border) rounded-sm p-5">
      {/* Current Time */}
      <div className="mb-3">
        <p className="text-text-muted text-xs mb-1 tracking-wide">
          SYSTEM TIME
        </p>
        <p className="text-text-primary text-4xl font-display font-bold tracking-wider">
          {time}
        </p>
      </div>

      {/* Date */}
      <div className="pt-3 border-t border-(--border)">
        <p className="text-text-muted text-xs leading-relaxed">
          {date}
        </p>
      </div>
    </div>
  );
}
