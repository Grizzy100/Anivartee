'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

export default function CalendarCard() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="bg-surface border border-(--border) rounded-sm p-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-lg"
      />
    </div>
  );
}
