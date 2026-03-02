import React, { memo, useState, useCallback } from "react";
import {
    ExternalLink,
    ShieldCheck,
    ShieldX,
    CheckCircle2,
    XCircle,
    Quote,
    Heart,
    MessageSquare,
    Share2,
} from "lucide-react";
import { TbFlag3 } from "react-icons/tb";
import { TiBookmark } from "react-icons/ti";
import { QuotedPost } from "./QuotedPost";
import { CommentModal } from "./CommentModal";
import {
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    sharePost,
    flagPost,
    unflagPost,
} from "@/lib/api/post";
import type { PostData, DashboardRole } from "./types";
import type { FactCheckData } from "@/lib/api/feed";

const VERDICT_THEME = {
    VALIDATED: {
        label: "Validated",
        Icon: ShieldCheck,
        StatusIcon: CheckCircle2,
        borderColor: "border-l-emerald-500",
        badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        iconColor: "text-emerald-500",
    },
    DEBUNKED: {
        label: "Debunked",
        Icon: ShieldX,
        StatusIcon: XCircle,
        borderColor: "border-l-red-500",
        badgeBg: "bg-red-500/10 text-red-500 border-red-500/30",
        iconColor: "text-red-500",
    },
} as const;

function rankClasses(level: number): string {
    if (level >= 5) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    if (level >= 3) return "text-violet-500 bg-violet-500/10 border-violet-500/20";
    if (level >= 1) return "text-sky-500 bg-sky-500/10 border-sky-500/20";
    return "text-muted-foreground bg-secondary border-border";
}

interface FactCheckPostCardProps {
    factCheck: FactCheckData;
    originalPost: PostData;
    role: DashboardRole;
}

export const FactCheckPostCard = memo(function FactCheckPostCard({
    factCheck,
    originalPost,
    role,
}: FactCheckPostCardProps) {
    const vTheme =
        factCheck.verdict === "VALIDATED"
            ? VERDICT_THEME.VALIDATED
            : VERDICT_THEME.DEBUNKED;

    const [liked, setLiked] = useState(originalPost.liked);
    const [likeCount, setLikeCount] = useState(originalPost.likes);
    const [saved, setSaved] = useState(originalPost.saved);
    const [flagged, setFlagged] = useState(originalPost.flagged || false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [flagLoading, setFlagLoading] = useState(false);
    const [commentModalOpen, setCommentModalOpen] = useState(false);

    // ── Like ──
    const handleLike = useCallback(async () => {
        if (likeLoading || flagLoading) return;
        setLikeLoading(true);

        const wasLiked = liked;
        const wasFlagged = flagged;

        setLiked(!wasLiked);
        setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

        // Mutually exclusive: turning on like turns off flag
        if (!wasLiked && wasFlagged) {
            setFlagged(false);
        }

        try {
            if (wasLiked) {
                await unlikePost(originalPost.linkId);
            } else {
                await likePost(originalPost.linkId);
            }
        } catch {
            setLiked(wasLiked);
            setFlagged(wasFlagged);
            setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
        } finally {
            setLikeLoading(false);
        }
    }, [liked, flagged, likeLoading, flagLoading, originalPost.linkId]);

    // ── Flag ──
    const handleFlag = useCallback(async () => {
        if (flagLoading || likeLoading) return;
        setFlagLoading(true);

        const wasFlagged = flagged;
        const wasLiked = liked;

        setFlagged(!wasFlagged);

        // Mutually exclusive: turning on flag turns off like
        if (!wasFlagged && wasLiked) {
            setLiked(false);
            setLikeCount((c) => c - 1);
        }

        try {
            if (wasFlagged) {
                await unflagPost(originalPost.linkId);
            } else {
                await flagPost(originalPost.linkId);
            }
        } catch {
            // Revert optimism
            setFlagged(wasFlagged);
            setLiked(wasLiked);
            if (!wasFlagged && wasLiked) {
                setLikeCount((c) => c + 1);
            }
        } finally {
            setFlagLoading(false);
        }
    }, [flagged, liked, flagLoading, likeLoading, originalPost.linkId]);

    // ── Save ──
    const handleSave = useCallback(async () => {
        if (saveLoading) return;
        setSaveLoading(true);

        const wasSaved = saved;
        setSaved(!wasSaved);

        try {
            if (wasSaved) {
                await unsavePost(originalPost.linkId);
            } else {
                await savePost(originalPost.linkId);
            }
        } catch {
            setSaved(wasSaved);
        } finally {
            setSaveLoading(false);
        }
    }, [saved, saveLoading, originalPost.linkId]);

    // ── Share ──
    const handleShare = useCallback(async () => {
        const shareUrl = `${window.location.origin}/post/${originalPost.linkId}`;
        try {
            await sharePost(originalPost.linkId, "OTHER"); // Log share
            if (navigator.share) {
                await navigator.share({
                    title: originalPost.title,
                    text: originalPost.description,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Failed to share:", err);
        }
    }, [originalPost.linkId, originalPost.title, originalPost.description]);

    const engagementRow = (
        <div className="flex items-center gap-6 pt-3 mt-1 border-t border-border">
            <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-1.5 text-xs transition-colors ${liked
                    ? "text-red-500 hover:text-red-400"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{likeCount}</span>
            </button>

            {/* Mutually Exclusive Flag Button */}
            <button
                onClick={handleFlag}
                disabled={flagLoading}
                className={`flex items-center gap-1.5 text-xs transition-colors ${flagged
                    ? "text-orange-500 hover:text-orange-400"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                title="Flag as inappropriate or false"
            >
                <TbFlag3 className={`w-4 h-4 ${flagged ? "fill-current" : ""}`} />
            </button>

            <button
                onClick={() => setCommentModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                <MessageSquare className="w-4 h-4" />
                <span>{originalPost.comments}</span>
            </button>

            <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
            </button>

            <button
                onClick={handleSave}
                disabled={saveLoading}
                className={`flex items-center gap-1.5 text-xs transition-colors ml-auto ${saved
                    ? "text-primary hover:text-primary/80"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                <TiBookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                <span>{saved ? "Saved" : "Save"}</span>
            </button>
        </div>
    );

    const innerUserPost = (
        <div className="mt-4 mb-3 p-3.5 bg-secondary/30 border border-border rounded-md">
            <div className="flex items-center gap-1.5 mb-2.5 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                <Quote className="w-3 h-3" />
                Reviewing Claim
            </div>
            <div className="flex items-center gap-2.5 mb-2">
                {originalPost.author.avatarUrl ? (
                    <img
                        src={originalPost.author.avatarUrl}
                        alt={originalPost.author.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="font-display text-[9px] font-bold text-primary">
                            {originalPost.author.initials}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                        {originalPost.author.name}
                    </span>
                    {originalPost.author.rankName && (
                        <span
                            className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wider ${rankClasses(
                                originalPost.author.rankLevel ?? 0
                            )}`}
                        >
                            {originalPost.author.rankName}
                        </span>
                    )}
                </div>
            </div>
            <h4 className="font-display text-sm font-medium text-foreground leading-snug tracking-wide">
                {originalPost.title}
            </h4>
            {originalPost.quotedPost && <QuotedPost post={originalPost.quotedPost} />}
        </div>
    );

    return (
        <>
            <article
                className={`bg-card border border-border border-l-4 ${vTheme.borderColor} rounded-lg p-5 transition-all shadow-sm hover:shadow-md hover:border-primary/20 relative z-10`}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pr-6">
                    <div className="flex items-center gap-3">
                        {factCheck.factCheckerAuthor?.avatarUrl ? (
                            <img
                                src={factCheck.factCheckerAuthor.avatarUrl}
                                alt={factCheck.factCheckerAuthor.displayName ?? "Fact-Checker"}
                                className={`w-9 h-9 rounded-full object-cover border border-border shrink-0`}
                            />
                        ) : (
                            <div
                                className={`w-9 h-9 rounded-full border border-border flex items-center justify-center bg-background text-xs font-bold shrink-0 ${vTheme.iconColor}`}
                            >
                                {factCheck.factCheckerAuthor
                                    ? (factCheck.factCheckerAuthor.displayName || factCheck.factCheckerAuthor.username)
                                        .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                                    : "FC"}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                    {factCheck.factCheckerAuthor?.displayName
                                        ?? factCheck.factCheckerAuthor?.username
                                        ?? "Fact-Checker"}
                                </span>
                                <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wider ${rankClasses(factCheck.factCheckerAuthor?.rankLevel ?? 2)
                                        }`}
                                >
                                    {factCheck.factCheckerAuthor?.rankName ?? "Verified Reviewer"}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {new Date(factCheck.createdAt).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Verdict Badge near header */}
                    <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold shrink-0 ${vTheme.badgeBg}`}
                    >
                        <vTheme.StatusIcon className="w-3.5 h-3.5" />
                        {vTheme.label}
                    </div>
                </div>

                <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-2 leading-snug tracking-wide">
                    {factCheck.header}
                </h3>

                {factCheck.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {factCheck.description}
                    </p>
                )}

                {factCheck.referenceUrls && factCheck.referenceUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {factCheck.referenceUrls.map((url, i) => (
                            <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 bg-primary/5 px-2.5 py-1 rounded-md transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Source {i + 1}
                            </a>
                        ))}
                    </div>
                )}

                {innerUserPost}

                {engagementRow}
            </article>

            {/* ── Comment Modal ── */}
            <CommentModal
                open={commentModalOpen}
                onClose={() => setCommentModalOpen(false)}
                linkId={originalPost.linkId}
                commentCount={originalPost.comments}
                postTitle={originalPost.title}
            />
        </>
    );
});
