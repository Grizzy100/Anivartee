"use client";
// client/components/ui/AchievementToast.tsx
// Premium achievement toast notification component

import { useEffect, useState } from "react";
import { Trophy, Flame, Shield, BookOpen, X } from "lucide-react";
import type { AchievementKey } from "@/lib/api/achievements";

// ─── Achievement Metadata ────────────────────────────────────────────────────

const ACHIEVEMENT_META: Record<AchievementKey, {
    title: string;
    description: string;
    points: number;
    Icon: React.FC<{ className?: string }>;
    gradient: string;
    iconColor: string;
}> = {
    FIRST_POST: {
        title: "First Post!",
        description: "You made your debut on the platform. Welcome!",
        points: 10,
        Icon: BookOpen,
        gradient: "from-sky-500/20 to-blue-600/10",
        iconColor: "text-sky-400",
    },
    STREAK_7_DAYS: {
        title: "7-Day Streak",
        description: "You posted every day for a week. You're on fire!",
        points: 50,
        Icon: Flame,
        gradient: "from-orange-500/20 to-red-600/10",
        iconColor: "text-orange-400",
    },
    STREAK_1_MONTH: {
        title: "Monthly Champion",
        description: "Posted on 20+ unique days this month. Incredible consistency!",
        points: 200,
        Icon: Shield,
        gradient: "from-violet-500/20 to-purple-600/10",
        iconColor: "text-violet-400",
    },
    PROLIFIC_25: {
        title: "Prolific Poster",
        description: "You have submitted 25+ posts. Your voice matters here.",
        points: 100,
        Icon: Trophy,
        gradient: "from-amber-500/20 to-yellow-600/10",
        iconColor: "text-amber-400",
    },
};

// ─── Single Toast ────────────────────────────────────────────────────────────

interface AchievementToastItemProps {
    achievementKey: AchievementKey;
    index: number;
    onDismiss: (key: AchievementKey) => void;
}

function AchievementToastItem({ achievementKey, index, onDismiss }: AchievementToastItemProps) {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const meta = ACHIEVEMENT_META[achievementKey];

    useEffect(() => {
        // Stagger entrance by index
        const enterTimer = setTimeout(() => setVisible(true), index * 300);

        // Auto-dismiss after 5s
        const exitTimer = setTimeout(() => {
            setExiting(true);
            setTimeout(() => onDismiss(achievementKey), 400);
        }, 5000 + index * 300);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
        };
    }, [achievementKey, index, onDismiss]);

    const { title, description, points, Icon, gradient, iconColor } = meta;

    return (
        <div
            className={`
        relative w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden
        transition-all duration-400 ease-out
        ${visible && !exiting ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
      `}
        >
            {/* Accent gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`} />

            <div className="relative flex items-start gap-3 p-4">
                {/* Icon */}
                <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
                        🏆 Achievement Unlocked
                    </p>
                    <p className="text-sm font-bold text-foreground leading-tight">{title}</p>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">{description}</p>
                    <p className={`text-[10px] font-semibold mt-1.5 ${iconColor}`}>
                        +{points} pts earned
                    </p>
                </div>

                {/* Dismiss button */}
                <button
                    onClick={() => {
                        setExiting(true);
                        setTimeout(() => onDismiss(achievementKey), 400);
                    }}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                    aria-label="Dismiss"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Auto-dismiss progress bar */}
            <div className={`h-0.5 ${iconColor.replace("text-", "bg-")} opacity-30 w-full`}>
                <div
                    className={`h-full ${iconColor.replace("text-", "bg-")} origin-left`}
                    style={{
                        animation: `shrink ${5}s linear ${index * 0.3}s both`,
                    }}
                />
            </div>

            <style jsx>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
        </div>
    );
}

// ─── Toast Container ─────────────────────────────────────────────────────────

interface AchievementToastProps {
    toasts: AchievementKey[];
    onDismiss: (key: AchievementKey) => void;
}

export function AchievementToast({ toasts, onDismiss }: AchievementToastProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map((key, i) => (
                <div key={key} className="pointer-events-auto">
                    <AchievementToastItem
                        achievementKey={key}
                        index={i}
                        onDismiss={onDismiss}
                    />
                </div>
            ))}
        </div>
    );
}
