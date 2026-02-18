"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Plus, Loader2, Link2, ShieldCheck, ShieldX } from "lucide-react";
import {
  submitVerdict,
  getDraft,
  saveDraft,
  type SubmitVerdictPayload,
  type FactCheckVerdict,
} from "@/lib/api/factChecker";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VerdictModalProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  onVerdictSubmitted?: (postId: string, verdict: FactCheckVerdict) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VerdictModal({
  open,
  onClose,
  postId,
  postTitle,
  onVerdictSubmitted,
}: VerdictModalProps) {
  const [verdict, setVerdict] = useState<FactCheckVerdict | null>(null);
  const [header, setHeader] = useState("");
  const [description, setDescription] = useState("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headerRef = useRef<HTMLInputElement>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load saved draft ──
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingDraft(true);

    getDraft(postId)
      .then((draft) => {
        if (cancelled || !draft) return;
        if (draft.verdict)
          setVerdict(draft.verdict as FactCheckVerdict);
        if (draft.header) setHeader(draft.header);
        if (draft.description) setDescription(draft.description);
        if (draft.referenceUrls) setReferenceUrls(draft.referenceUrls);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingDraft(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, postId]);

  // ── Auto-save draft (debounced 2s) ──
  useEffect(() => {
    if (!open || loadingDraft) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);

    draftTimerRef.current = setTimeout(() => {
      saveDraft(postId, {
        verdict: verdict ?? undefined,
        header: header || undefined,
        description: description || undefined,
        referenceUrls: referenceUrls.length > 0 ? referenceUrls : undefined,
      }).catch(() => {});
    }, 2000);

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [open, loadingDraft, verdict, header, description, referenceUrls, postId]);

  // ── Reset on close ──
  useEffect(() => {
    if (!open) {
      setVerdict(null);
      setHeader("");
      setDescription("");
      setReferenceUrls([]);
      setUrlInput("");
      setError(null);
    }
  }, [open]);

  // ── Focus header on open ──
  useEffect(() => {
    if (open && !loadingDraft) {
      setTimeout(() => headerRef.current?.focus(), 100);
    }
  }, [open, loadingDraft]);

  // ── Escape ──
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ── Body scroll lock ──
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // ── Add reference URL ──
  const addUrl = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setError("Please enter a valid URL");
      return;
    }
    if (referenceUrls.length >= 3) {
      setError("Maximum 3 reference URLs allowed");
      return;
    }
    if (referenceUrls.includes(trimmed)) {
      setError("Duplicate URL");
      return;
    }
    setReferenceUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
    setError(null);
  }, [urlInput, referenceUrls]);

  const removeUrl = (index: number) => {
    setReferenceUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ──
  const handleSubmit = useCallback(async () => {
    if (!verdict) {
      setError("Please select a verdict");
      return;
    }
    if (header.length < 6 || header.length > 150) {
      setError("Header must be 6–150 characters");
      return;
    }
    if (description && (description.length < 10 || description.length > 500)) {
      setError("Description must be 10–500 characters (or leave empty)");
      return;
    }
    if (referenceUrls.length < 1) {
      setError("At least 1 reference URL is required");
      return;
    }

    const payload: SubmitVerdictPayload = {
      verdict,
      header,
      description: description || undefined,
      referenceUrls,
    };

    try {
      setSubmitting(true);
      setError(null);
      await submitVerdict(postId, payload);
      onVerdictSubmitted?.(postId, verdict);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit verdict");
    } finally {
      setSubmitting(false);
    }
  }, [verdict, header, description, referenceUrls, postId, onVerdictSubmitted, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">
              Submit Verdict
            </h2>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {postTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loadingDraft ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            {/* Verdict selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Verdict
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setVerdict("VALIDATED"); setError(null); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all text-sm font-medium cursor-pointer ${
                    verdict === "VALIDATED"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                      : "border-border hover:border-emerald-500/40 text-muted-foreground hover:text-emerald-600"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Validated
                </button>
                <button
                  onClick={() => { setVerdict("DEBUNKED"); setError(null); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all text-sm font-medium cursor-pointer ${
                    verdict === "DEBUNKED"
                      ? "border-red-500 bg-red-500/10 text-red-600"
                      : "border-border hover:border-red-500/40 text-muted-foreground hover:text-red-600"
                  }`}
                >
                  <ShieldX className="w-4 h-4" />
                  Debunked
                </button>
              </div>
            </div>

            {/* Header */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Review Header <span className="text-destructive">*</span>
              </label>
              <input
                ref={headerRef}
                type="text"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
                placeholder="Brief summary of your review…"
                maxLength={150}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {header.length}/150
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of your findings…"
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {description.length}/500
              </p>
            </div>

            {/* Reference URLs */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Reference URLs <span className="text-destructive">*</span>
                <span className="normal-case font-normal ml-1">(1–3)</span>
              </label>
              {referenceUrls.map((url, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 mb-1.5 text-xs"
                >
                  <Link2 className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1 text-foreground/80">
                    {url}
                  </span>
                  <button
                    onClick={() => removeUrl(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {referenceUrls.length < 3 && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addUrl();
                      }
                    }}
                    placeholder="https://source.example.com"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    onClick={addUrl}
                    className="px-2 py-1.5 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !verdict}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {submitting
                ? "Submitting…"
                : verdict === "VALIDATED"
                  ? "Validate Post"
                  : verdict === "DEBUNKED"
                    ? "Debunk Post"
                    : "Select a Verdict"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
