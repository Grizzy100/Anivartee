"use client";

import { useEffect, useCallback } from "react";
import { X, MessageSquare } from "lucide-react";
import { CommentSection } from "./CommentSection";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CommentModalProps {
  open: boolean;
  onClose: () => void;
  linkId: string;
  commentCount: number;
  postTitle?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CommentModal({
  open,
  onClose,
  linkId,
  commentCount,
  postTitle,
}: CommentModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 max-h-[85vh] bg-card border border-border rounded-lg shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-4 h-4 text-primary shrink-0" />
            <h2 className="font-display text-sm font-bold tracking-wide text-foreground uppercase truncate">
              {postTitle ? `Comments — ${postTitle}` : "Comments"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary shrink-0 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable comment body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <CommentSection linkId={linkId} commentCount={commentCount} />
        </div>
      </div>
    </div>
  );
}
