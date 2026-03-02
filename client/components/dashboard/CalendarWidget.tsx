"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calender";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import {
  getActivityCalendar,
  type CalendarResponse,
  type DayDetail,
} from "@/lib/api/activity";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMPTY_CALENDAR: CalendarResponse = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  activeDays: [],
  details: {},
};

/** Format a Date as YYYY-MM-DD using local timezone (avoids UTC shift from toISOString). */
function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Sum all activity counts for one day. */
function totalActivity(d: DayDetail): number {
  return d.posts + d.edits + d.factChecks;
}

/** Intensity class based on total activity (GitHub-style heat). */
function intensityDot(total: number): string {
  if (total === 0) return "";
  if (total <= 2) return "bg-blue-400 shadow-[0_0_4px_1px_rgba(96,165,250,0.6)]";
  if (total <= 5) return "bg-blue-500 shadow-[0_0_6px_2px_rgba(59,130,246,0.7)]";
  return "bg-blue-500 shadow-[0_0_8px_3px_rgba(59,130,246,0.8)]";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CalendarWidget({ className }: { className?: string }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendar, setCalendar] = useState<CalendarResponse>(EMPTY_CALENDAR);
  const [loading, setLoading] = useState(false);

  // Track the currently visible month so we fetch new data on navigation
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  // Fetch activity for the visible month
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getActivityCalendar(viewYear, viewMonth + 1) // API uses 1-indexed month
      .then((data) => {
        if (!cancelled) setCalendar(data);
      })
      .catch(() => {
        if (!cancelled) setCalendar(EMPTY_CALENDAR);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewYear, viewMonth]);

  // details is already keyed by "YYYY-MM-DD"
  const details = calendar.details;

  // renderDay: overlay an activity-intensity dot below the day number
  const renderDay = useCallback(
    (day: number, date: Date) => {
      const key = toLocalDateKey(date);
      const entry = details[key];
      const total = entry ? totalActivity(entry) : 0;
      const dot = intensityDot(total);

      return (
        <span className="flex flex-col items-center gap-0.5">
          <span>{day}</span>
          {dot && (
            <span
              className={`h-1 w-1 rounded-full ${dot}`}
              aria-label={`${total} activities`}
            />
          )}
        </span>
      );
    },
    [details]
  );

  // When the user navigates the Calendar, track the new month/year
  const handleSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setViewMonth(date.getMonth());
    setViewYear(date.getFullYear());
  }, []);

  // Sync when month arrows / pickers are used (no day click needed)
  const handleMonthChange = useCallback((year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);
  }, []);

  // Selected-day detail panel
  const selectedKey = toLocalDateKey(selectedDate);
  const selectedActivity = details[selectedKey];

  return (
    <div id="tour-calendar" className={className}>
      <Calendar
        selected={selectedDate}
        onSelect={handleSelect}
        onMonthChange={handleMonthChange}
        size="sm"
        alwaysOnTop={false}
        renderDay={renderDay}
        className="shadow-none border-0 p-0 max-w-none"
      />

      {/* Activity summary for selected day */}
      <div className="mt-3 rounded-lg border border-border bg-card p-3 text-xs space-y-1.5">
        <p className="font-semibold text-foreground tracking-wide uppercase text-[10px]">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <BouncingDots dots={3} className="w-1.5 h-1.5 bg-muted-foreground" />
          </div>
        ) : selectedActivity ? (
          <ul className="space-y-1 text-muted-foreground">
            <StatRow label="Posts created" value={selectedActivity.posts} />
            <StatRow label="Posts edited" value={selectedActivity.edits} />
            <StatRow
              label="Fact-checked"
              value={selectedActivity.factChecks}
            />
          </ul>
        ) : (
          <p className="text-muted-foreground">No activity</p>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <li className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </li>
  );
}
