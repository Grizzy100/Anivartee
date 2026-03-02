"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import { CreatePostModal } from "./CreatePostModal";
import type { DashboardRole } from "./types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardTopBarProps {
  role: DashboardRole;
  /** Called when the search query changes (debounced). */
  onSearch: (query: string) => void;
  /** Called after a new post is created so the feed can refresh. */
  onPostCreated?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
import { IoMdHelpCircleOutline } from "react-icons/io";
import { useProductTour } from "@/lib/contexts/ProductTourContext";

/**
 * Top bar that sits above the feed — intentionally designed to *not* look
 * like a navbar. It blends into the feed header area with a minimal,
 * ghost-style search input and a subtle create-post CTA.
 */
export function DashboardTopBar({
  role,
  onSearch,
  onPostCreated,
}: DashboardTopBarProps) {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { startTour } = useProductTour();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced search
  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(value), 250);
    },
    [onSearch]
  );

  // Cleanup debounce on unmount
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const clearSearch = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  const heading =
    role === "factchecker" ? "Your Feed" : "Your Feed";
  const subtitle =
    role === "factchecker"
      ? "Latest verified knowledge and analysis"
      : "Latest verified knowledge and analysis";

  return (
    <>
      <div className="mb-6 space-y-4">
        {/* Row: heading + actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold tracking-wide text-foreground">
              {heading}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Help Tour */}
            <button
              onClick={startTour}
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              title="Help Tour"
              id="tour-help-button"
            >
              <IoMdHelpCircleOutline className="w-5 h-5" />
            </button>

            {/* Create Post */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-semibold rounded-md
                bg-primary/10 text-primary border border-primary/20
                hover:bg-primary/20 hover:border-primary/30
                transition-all duration-200"
              id="tour-post-button"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Post</span>
            </button>
          </div>
        </div>

        {/* Search — ghost-style, blends with feed */}
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? "text-primary" : "text-muted-foreground/50"
              }`}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search posts..."
            className={`w-full h-9 pl-10 pr-8 text-sm bg-transparent border rounded-md outline-none transition-all duration-200 ${searchFocused
                ? "border-primary/30 text-foreground placeholder:text-muted-foreground/60"
                : "border-border/50 text-foreground placeholder:text-muted-foreground/40"
              }`}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={onPostCreated}
      />
    </>
  );
}
