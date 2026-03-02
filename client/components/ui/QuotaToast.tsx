"use client";
// client/components/ui/QuotaToast.tsx
// Toast notification shown when a user's daily ranked post quota is reached.

import { useEffect, useState } from "react";
import { Zap, X } from "lucide-react";

interface QuotaToastProps {
  /** Controls visibility from the parent (DashboardLayout). */
  visible: boolean;
  onDismiss: () => void;
}

export function QuotaToast({ visible, onDismiss }: QuotaToastProps) {
  const [rendered, setRendered] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Mount so the enter animation plays
  useEffect(() => {
    if (visible) {
      setExiting(false);
      setRendered(true);
    }
  }, [visible]);

  // Auto-dismiss after 4 s
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => dismiss(), 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function dismiss() {
    setExiting(true);
    setTimeout(() => {
      setRendered(false);
      onDismiss();
    }, 350);
  }

  if (!rendered) return null;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-60 w-80 pointer-events-auto
        bg-card border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden
        transition-all duration-350 ease-out
        ${!exiting ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
      `}
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-500/15 to-orange-600/8 pointer-events-none" />

      <div className="relative flex items-start gap-3 p-4">
        {/* Icon */}
        <div className="mt-0.5 shrink-0 text-amber-400">
          <Zap className="w-5 h-5" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
            ⚡ Daily Limit
          </p>
          <p className="text-sm font-bold text-foreground leading-tight">
            Per day quota reached
          </p>
          <p className="text-xs text-muted-foreground leading-snug mt-0.5">
            You&apos;ve hit your ranked post limit for today. Level up your rank to post more or try again tomorrow.
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-amber-500/20 w-full">
        <div
          className="h-full bg-amber-400 origin-left"
          style={{ animation: "quota-shrink 4s linear both" }}
        />
      </div>

      <style jsx>{`
        @keyframes quota-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
