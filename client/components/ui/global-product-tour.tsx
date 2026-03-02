"use client";

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

    const steps = isModeration
        ? getModerationTourSteps()
        : getDashboardTourSteps(user?.role?.toLowerCase() || "user");

    const tourVersion = isModeration
        ? "moderation-tour-v1"
        : "dashboard-tour-v3";

    return (
        <ProductTourProvider>
            {children}
            <ProductTour steps={steps} tourVersion={tourVersion} />
        </ProductTourProvider>
    );
}
