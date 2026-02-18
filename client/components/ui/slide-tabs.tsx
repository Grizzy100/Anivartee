"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SlideTab {
  label: string;
  icon?: React.ReactNode;
}

interface SlideTabsProps {
  tabs: SlideTab[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  className?: string;
}

interface CursorRect {
  left: number;
  width: number;
}

export function SlideTabs({
  tabs,
  activeIndex = 0,
  onActiveChange,
  className,
}: SlideTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [cursor, setCursor] = useState<CursorRect | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const el = tabRefs.current[activeIndex];
    if (!container || !el) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = el.getBoundingClientRect();

    setCursor({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [activeIndex]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5",
        className,
      )}
    >
      {/* Sliding cursor */}
      {cursor && (
        <motion.div
          className="absolute top-0.5 bottom-0.5 rounded-md bg-primary shadow-sm"
          initial={false}
          animate={{ left: cursor.left, width: cursor.width }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={index}
            ref={(el) => { tabRefs.current[index] = el; }}
            onClick={() => onActiveChange?.(index)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors duration-200 cursor-pointer",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
