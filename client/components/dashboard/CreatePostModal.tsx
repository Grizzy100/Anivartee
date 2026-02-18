"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X, Link2, Plus, Loader2 } from "lucide-react";
import { createPost, type CreatePostPayload } from "@/lib/api/post";
import type { LinkCategory } from "@/lib/api/feed";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful post creation so the feed can refresh. */
  onCreated?: () => void;
}

const CATEGORIES: { value: LinkCategory; label: string }[] = [
  { value: "SOCIAL", label: "Social" },
  { value: "WAR", label: "War" },
  { value: "FOOD", label: "Food" },
  { value: "OTHER", label: "Other" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function CreatePostModal({ open, onClose, onCreated }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LinkCategory>("OTHER");
  const [sources, setSources] = useState<string[]>([]);
  const [sourceInput, setSourceInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-focus title on open
  useEffect(() => {
    if (open) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset form on close
  useEffect(() => {
    if (!open) {
      setTitle("");
      setUrl("");
      setDescription("");
      setCategory("OTHER");
      setSources([]);
      setSourceInput("");
      setError(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const addSource = useCallback(() => {
    const trimmed = sourceInput.trim();
    if (trimmed && !sources.includes(trimmed)) {
      setSources((prev) => [...prev, trimmed]);
      setSourceInput("");
    }
  }, [sourceInput, sources]);

  const removeSource = useCallback((idx: number) => {
    setSources((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !url.trim()) return;

      setSubmitting(true);
      setError(null);

      try {
        const payload: CreatePostPayload = {
          title: title.trim(),
          url: url.trim(),
          ...(description.trim() && { description: description.trim() }),
          category,
          ...(sources.length > 0 && { sources }),
        };

        await createPost(payload);
        onClose();
        onCreated?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create post");
      } finally {
        setSubmitting(false);
      }
    },
    [title, url, description, category, sources, onClose, onCreated]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-sm font-bold tracking-wide text-foreground uppercase">
            Create Post
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the claim?"
              className="w-full h-9 bg-secondary/50 text-foreground placeholder:text-muted-foreground/50 border border-border text-sm px-3 rounded-md outline-none transition-colors focus:border-primary/50"
              maxLength={150}
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Source URL <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full h-9 bg-secondary/50 text-foreground placeholder:text-muted-foreground/50 border border-border text-sm pl-9 pr-3 rounded-md outline-none transition-colors focus:border-primary/50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the claim or context..."
              rows={3}
              className="w-full bg-secondary/50 text-foreground placeholder:text-muted-foreground/50 border border-border text-sm px-3 py-2 rounded-md outline-none transition-colors focus:border-primary/50 resize-none"
              maxLength={400}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Category
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    category === cat.value
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Sources */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Additional Sources
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSource();
                  }
                }}
                placeholder="https://..."
                className="flex-1 h-8 bg-secondary/50 text-foreground placeholder:text-muted-foreground/50 border border-border text-xs px-3 rounded-md outline-none transition-colors focus:border-primary/50"
              />
              <button
                type="button"
                onClick={addSource}
                className="h-8 px-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {sources.map((src, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-md"
                  >
                    <span className="max-w-[180px] truncate">{src}</span>
                    <button
                      type="button"
                      onClick={() => removeSource(i)}
                      className="text-primary/60 hover:text-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || !title.trim() || !url.trim()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Posting…
                </>
              ) : (
                "Publish"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
