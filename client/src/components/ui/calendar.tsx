"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={{
        month: "w-full",
        month_caption: "flex justify-center items-center h-10 relative mb-4",
        caption_label: "text-sm font-display font-semibold text-text-primary tracking-wider",
        button_previous: "absolute left-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-sm text-text-muted hover:bg-surface-elevated transition-colors",
        button_next: "absolute right-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-sm text-text-muted hover:bg-surface-elevated transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-text-muted w-9 font-normal text-[11px] uppercase tracking-wide",
        week: "flex w-full mt-1",
        day: "h-9 w-9 p-0 font-normal hover:bg-surface-elevated hover:text-text-primary rounded-sm transition-colors inline-flex items-center justify-center text-text-primary text-sm cursor-pointer",
        day_button: "h-full w-full",
        selected: "bg-(--primary) text-white hover:bg-(--primary) hover:text-white font-semibold",
        today: "bg-surface-elevated text-text-primary font-semibold",
        outside: "text-text-muted opacity-40",
        disabled: "text-text-muted opacity-30 cursor-not-allowed hover:bg-transparent",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
