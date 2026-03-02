"use client";
// client/lib/hooks/useAchievements.ts
// Fetches unlocked achievements on mount, diffs against localStorage,
// and surfaces newly unlocked ones as toasts.

import { useCallback, useEffect, useState } from "react";
import { getMyAchievements, type AchievementKey } from "@/lib/api/achievements";

const STORAGE_KEY = "anivartee:seen_achievements";

function getSeenAchievements(): Set<AchievementKey> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return new Set((JSON.parse(raw ?? "[]") as AchievementKey[]));
    } catch {
        return new Set();
    }
}

function saveSeenAchievements(seen: Set<AchievementKey>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
    } catch { /* Storage might be unavailable in certain SSR contexts */ }
}

export function useAchievements() {
    const [toasts, setToasts] = useState<AchievementKey[]>([]);

    useEffect(() => {
        let cancelled = false;

        getMyAchievements()
            .then(({ unlocked }) => {
                if (cancelled) return;
                const seen = getSeenAchievements();
                const fresh = unlocked.filter((k) => !seen.has(k));

                if (fresh.length > 0) {
                    // Show toasts for newly seen achievements
                    setToasts(fresh);

                    // Mark all current achievements as seen
                    const updated = new Set([...seen, ...unlocked]);
                    saveSeenAchievements(updated);
                }
            })
            .catch(() => { /* achievements are non-critical */ });

        return () => { cancelled = true; };
    }, []);

    const dismissToast = useCallback((key: AchievementKey) => {
        setToasts((prev) => prev.filter((k) => k !== key));
    }, []);

    return { toasts, dismissToast };
}
