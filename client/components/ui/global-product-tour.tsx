"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ProductTour } from "@/components/ui/product-tour";
import { getDashboardTourSteps } from "@/lib/tours/dashboard-tour";
import { getModerationTourSteps } from "@/lib/tours/moderation-tour";
import { ProductTourProvider } from "@/lib/contexts/ProductTourContext";
import { useAuth } from "@/lib/auth/AuthContext";

export function GlobalProductTourProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();

    const isModeration = pathname?.includes("/moderation");
    const userRole = user?.role?.toLowerCase() || "user";

    // Memoize so ProductTour's React.memo is not defeated on every render.
    // Without this, getDashboardTourSteps() returns a new array reference on
    // every pathname change or auth state update, forcing Joyride to re-init.
    const steps = useMemo(
        () => isModeration ? getModerationTourSteps() : getDashboardTourSteps(userRole),
        [isModeration, userRole]
    );

    const tourVersion = isModeration ? "moderation-tour-v1" : "dashboard-tour-v3";

    return (
        <ProductTourProvider>
            {children}
            <ProductTour steps={steps} tourVersion={tourVersion} />
        </ProductTourProvider>
    );
}
