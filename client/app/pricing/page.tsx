//client\app\pricing\page.tsx
"use client";

import { PricingSection } from "@/components/ui/pricing";

// Define the PricingPlan interface based on the new structure
interface PricingPlan {
    id: string;
    name: string;
    prices: {
        IN: { monthly: number; annual: number };
        SEA: { monthly: number; annual: number };
        GLOBAL: { monthly: number; annual: number };
        EU: { monthly: number; annual: number };
        JP: { monthly: number; annual: number };
        ME: { monthly: number; annual: number };
    };
    period: string;
    features: string[];
    description: string;
    buttonText: string;
    isPopular: boolean;
}

// Data matching the post-service entitlements backend logic
const platformPlans: PricingPlan[] = [
    {
        id: "free-tier-id",
        name: "Free",
        prices: {
            IN: { monthly: 0, annual: 0 },
            SEA: { monthly: 0, annual: 0 },
            GLOBAL: { monthly: 0, annual: 0 },
            EU: { monthly: 0, annual: 0 },
            JP: { monthly: 0, annual: 0 },
            ME: { monthly: 0, annual: 0 },
        },
        period: "mo",
        features: [
            "Access to Basic Dashboard",
            "Vote on Feature Upgrades",
            "Basic Community Access",
        ],
        description: "Perfect for exploring the platform.",
        buttonText: "Continue Free",
        isPopular: false,
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID matching backend auto-seed
        name: "Pro",
        prices: {
            IN: { monthly: 60, annual: 575 },
            SEA: { monthly: 5, annual: 48 },
            GLOBAL: { monthly: 10, annual: 96 },
            EU: { monthly: 8, annual: 76 },
            JP: { monthly: 500, annual: 4800 },
            ME: { monthly: 8, annual: 76 },
        },
        period: "mo",
        features: [
            "Advanced Analytics Dashboard",
            "+1 Extra Post / Edit per day",
            "Exclusive Pro Profile Badge",
            "Priority Support",
        ],
        description: "For active users who want deeper insights.",
        buttonText: "Upgrade to Pro",
        isPopular: true,
    },
];

export default function PricingPage() {
    return (
        <div className=" bg-background">
            <PricingSection
                plans={platformPlans}
                title="Unlock Your Creator Potential"
                description="Choose the plan that's right for you. Free covers the basics, while Pro gives you the insights to grow."
            />
        </div>
    );
}
