"use client";

import { useState } from "react";
import {
    ShieldCheck,
    ShieldX,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    Clock,
    Quote,
} from "lucide-react";
import type { FactCheckData } from "@/lib/api/feed";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatReviewDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function timeSince(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function getDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const VERDICT_CONFIG = {
    VALIDATED: {
        label: "Validated",
        Icon: ShieldCheck,
        StatusIcon: CheckCircle2,
        borderColor: "border-l-emerald-500",
        badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        iconColor: "text-emerald-500",
        accentBg: "bg-emerald-500/5",
        dotColor: "bg-emerald-500",
    },
    DEBUNKED: {
        label: "Debunked",
        Icon: ShieldX,
        StatusIcon: XCircle,
        borderColor: "border-l-red-500",
        badgeBg: "bg-red-500/10 text-red-500 border-red-500/30",
        iconColor: "text-red-500",
        accentBg: "bg-red-500/5",
        dotColor: "bg-red-500",
    },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface FactCheckCardProps {
    factCheck: FactCheckData;
    postTitle: string;
}

export function FactCheckCard({ factCheck, postTitle }: FactCheckCardProps) {
    const [expanded, setExpanded] = useState(false);
    const cfg = VERDICT_CONFIG[factCheck.verdict];
    const { Icon, StatusIcon, borderColor, badgeBg, iconColor, accentBg, dotColor } = cfg;

    const hasDescription = factCheck.description && factCheck.description.trim().length > 0;
    const hasRefs = factCheck.referenceUrls && factCheck.referenceUrls.length > 0;

    return (
        <div className="relative ml-6 mt-0">
            {/* ── Connector line from parent ── */}
            <div className="absolute -left-[17px] top-0 bottom-0 w-px bg-border" />
            <div className="absolute -left-[21px] top-5 w-2.5 h-px bg-border" />
            <div className={`absolute -left-[25px] top-4 w-2.5 h-2.5 rounded-full border-2 border-background ${dotColor}`} />

            {/* ── Card ── */}
            <article
                className={`relative rounded-xl border border-border border-l-2 ${borderColor} ${accentBg} backdrop-blur-sm overflow-hidden`}
            >
                {/* ── Top strip ── */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-background/30">
                    <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Official Verification Result
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground/60">
                            {timeSince(factCheck.createdAt)}
                        </span>
                    </div>
                </div>

                <div className="p-4 space-y-3.5">
                    {/* ── Fact-checker identity row ── */}
                    <div className="flex items-start justify-between gap-3">
                        {/* Avatar + identity */}
                        <div className="flex items-center gap-3">
                            {/* Avatar placeholder (no profile data in feed) */}
                            <div className={`w-8 h-8 rounded-full border border-border flex items-center justify-center ${iconColor} bg-background text-[11px] font-bold shrink-0`}>
                                FC
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold text-foreground">
                                        Fact-Checker
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wider text-violet-500 bg-violet-500/10 border-violet-500/20">
                                        Verified Reviewer
                                    </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground block mt-0.5">
                                    {formatReviewDate(factCheck.createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Verdict badge */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${badgeBg} shrink-0`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {cfg.label}
                        </div>
                    </div>

                    {/* ── Referencing label ── */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 bg-background/40 rounded-md px-3 py-1.5 border border-border/40">
                        <Quote className="w-3 h-3 shrink-0" />
                        <span>Reviewing claim: </span>
                        <span className="font-medium text-foreground/70 truncate">&ldquo;{postTitle}&rdquo;</span>
                    </div>

                    {/* ── Review summary headline ── */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground leading-snug">
                            {factCheck.header}
                        </h4>
                    </div>

                    {/* ── Description (expandable) ── */}
                    {hasDescription && (
                        <div>
                            <p
                                className={`text-xs text-muted-foreground leading-relaxed ${!expanded ? "line-clamp-3" : ""
                                    }`}
                            >
                                {factCheck.description}
                            </p>
                            {factCheck.description!.length > 180 && (
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 mt-1.5 transition-colors font-medium"
                                >
                                    {expanded ? (
                                        <>
                                            <ChevronUp className="w-3 h-3" /> Collapse
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-3 h-3" /> Read full analysis
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Evidence / Sources ── */}
                    {hasRefs && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
                                Evidence &amp; References
                            </p>
                            <div className="space-y-1">
                                {factCheck.referenceUrls.map((url, i) => (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 group"
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1 min-w-0">
                                            {getDomain(url)}
                                        </span>
                                        <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Footer audit line ── */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/30">
                        <span className="text-[10px] text-muted-foreground/50 font-mono">
                            Review ID: {factCheck.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase ${iconColor}`}>
                            {cfg.label} ·{" "}
                            <span className="text-muted-foreground/50 font-normal">
                                {new Date(factCheck.createdAt).toLocaleDateString("en-IN")}
                            </span>
                        </span>
                    </div>
                </div>
            </article>
        </div>
    );
}
