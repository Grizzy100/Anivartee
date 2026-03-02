//client\components\ui\pricing.tsx
"use client";

import { motion, useSpring } from "framer-motion";
import React, {
    useState,
    useRef,
    useEffect,
    createContext,
    useContext,
} from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Check } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/lib/auth/AuthContext";
import { useGeolocation, type RegionTier } from "@/lib/hooks/useGeolocation";
import { GiLaurelCrown, GiFireGem } from "react-icons/gi";


// --- UTILITY FUNCTIONS ---

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function useMediaQuery(query: string) {
    const [value, setValue] = useState(false);

    useEffect(() => {
        function onChange(event: MediaQueryListEvent) {
            setValue(event.matches);
        }

        const result = matchMedia(query);
        result.addEventListener("change", onChange);
        setValue(result.matches);

        return () => result.removeEventListener("change", onChange);
    }, [query]);

    return value;
}

// --- BASE UI COMPONENTS (BUTTON) ---

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = "Button";

// --- INTERACTIVE STARFIELD ---

function Star({
    mousePosition,
    containerRef,
}: {
    mousePosition: { x: number | null; y: number | null };
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const [isMounted, setIsMounted] = useState(false);
    const [initialPos, setInitialPos] = useState({
        top: '0%',
        left: '0%',
    });
    const [randomDimensions, setRandomDimensions] = useState({
        width: '2px',
        height: '2px',
        duration: 3,
        delay: 0,
    });

    const springConfig = { stiffness: 100, damping: 15, mass: 0.1 };
    const springX = useSpring(0, springConfig);
    const springY = useSpring(0, springConfig);

    useEffect(() => {
        setInitialPos({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
        });
        setRandomDimensions({
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 5,
        });
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (
            !isMounted ||
            !containerRef.current ||
            mousePosition.x === null ||
            mousePosition.y === null
        ) {
            springX.set(0);
            springY.set(0);
            return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const starX =
            containerRect.left +
            (parseFloat(initialPos.left) / 100) * containerRect.width;
        const starY =
            containerRect.top +
            (parseFloat(initialPos.top) / 100) * containerRect.height;

        const deltaX = mousePosition.x - starX;
        const deltaY = mousePosition.y - starY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const radius = 600; // Radius of magnetic influence

        if (distance < radius) {
            const force = 1 - distance / radius;
            const pullX = deltaX * force * 0.5;
            const pullY = deltaY * force * 0.5;
            springX.set(pullX);
            springY.set(pullY);
        } else {
            springX.set(0);
            springY.set(0);
        }
    }, [mousePosition, initialPos, containerRef, springX, springY, isMounted]);

    if (!isMounted) {
        return null;
    }

    return (
        <motion.div
            className="absolute bg-foreground rounded-full"
            style={{
                top: initialPos.top,
                left: initialPos.left,
                width: randomDimensions.width,
                height: randomDimensions.height,
                x: springX,
                y: springY,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
                duration: randomDimensions.duration,
                repeat: Infinity,
                delay: randomDimensions.delay,
            }}
        />
    );
}

function InteractiveStarfield() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState<{
        x: number | null;
        y: number | null;
    }>({ x: null, y: null });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };
        const handleMouseLeave = () => {
            setMousePosition({ x: null, y: null });
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseLeave);
            return () => {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, [containerRef]);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {Array.from({ length: 150 }).map((_, i) => (
                    <Star
                        key={`star-${i}`}
                        mousePosition={mousePosition}
                        containerRef={containerRef}
                    />
                ))}
            </div>
        </div>
    );
}

// --- PRICING COMPONENT LOGIC ---

// Interfaces
export interface PricingPlan {
    id: string; // The backend planId
    name: string;
    prices: Record<RegionTier, { monthly: number; annual: number }>;
    period: string;
    features: string[];
    description: string;
    buttonText: string;
    isPopular?: boolean;
}

interface PricingSectionProps {
    plans: PricingPlan[];
    title?: string;
    description?: string;
}

// Context for state management
const PricingContext = createContext<{
    isMonthly: boolean;
    setIsMonthly: (value: boolean) => void;
    currentRegion: RegionTier;
}>({
    isMonthly: true,
    setIsMonthly: () => { },
    currentRegion: "GLOBAL",
});

export function PricingSection({
    plans,
    title = "Simple, Transparent Pricing",
    description = "Choose the plan that's right for you. All plans include our core features and support.",
}: PricingSectionProps) {
    const { regionTier } = useGeolocation();
    const [isMonthly, setIsMonthly] = useState(true);

    return (
        <PricingContext.Provider value={{ isMonthly, setIsMonthly, currentRegion: regionTier }}>
            <div
                className="relative w-full bg-background dark:bg-neutral-950 py-8 sm:py-12"
            >
                <InteractiveStarfield />
                <div className="relative z-10 container mx-auto px-4 md:px-6 ">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
                        <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl bg-gradient-to-r from-gray-600 via-white to-gray-600 bg-clip-text text-transparent">
                            {title}
                        </h2>
                        <p className="text-muted-foreground text-md whitespace-pre-line">
                            {description}
                        </p>
                    </div>
                    <PricingToggle />
                    <div className="mt-10 flex flex-col md:flex-row justify-center items-start gap-6 max-w-2xl mx-auto">
                        {plans.map((plan, index) => (
                            <PricingCard key={index} plan={plan} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </PricingContext.Provider>
    );
}

// Pricing Toggle Component
function PricingToggle() {
    const { isMonthly, setIsMonthly } = useContext(PricingContext);
    const confettiRef = useRef<HTMLDivElement>(null);
    const monthlyBtnRef = useRef<HTMLButtonElement>(null);
    const annualBtnRef = useRef<HTMLButtonElement>(null);

    const [pillStyle, setPillStyle] = useState({});

    useEffect(() => {
        const btnRef = isMonthly ? monthlyBtnRef : annualBtnRef;
        if (btnRef.current) {
            setPillStyle({
                width: btnRef.current.offsetWidth,
                transform: `translateX(${btnRef.current.offsetLeft}px)`,
            });
        }
    }, [isMonthly]);

    const handleToggle = (monthly: boolean) => {
        if (isMonthly === monthly) return;
        setIsMonthly(monthly);

        if (!monthly && confettiRef.current) {
            const rect = annualBtnRef.current?.getBoundingClientRect();
            if (!rect) return;

            const originX = (rect.left + rect.width / 2) / window.innerWidth;
            const originY = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
                particleCount: 80,
                spread: 80,
                origin: { x: originX, y: originY },
                colors: [
                    "hsl(var(--primary))",
                    "hsl(var(--background))",
                    "hsl(var(--accent))",
                ],
                ticks: 300,
                gravity: 1.2,
                decay: 0.94,
                startVelocity: 30,
            });
        }
    };

    return (
        <div className="flex justify-center">
            <div
                ref={confettiRef}
                className="relative flex w-fit items-center rounded-full bg-muted p-[3px]"
            >
                <motion.div
                    className="absolute left-0 top-0 h-full rounded-full bg-primary"
                    style={pillStyle}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                />

                <button
                    ref={monthlyBtnRef}
                    onClick={() => handleToggle(true)}
                    className={cn(
                        "relative z-10 rounded-full px-3 py-[4px] text-xs font-medium transition-colors",
                        isMonthly
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Monthly
                </button>

                <button
                    ref={annualBtnRef}
                    onClick={() => handleToggle(false)}
                    className={cn(
                        "relative z-10 rounded-full px-3 py-[4px] text-xs font-medium transition-colors",
                        !isMonthly
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Annual
                    <span
                        className={cn(
                            "hidden sm:inline ml-1",
                            !isMonthly ? "text-primary-foreground/80" : ""
                        )}
                    >
                        (Save 20%)
                    </span>
                </button>
            </div>
        </div>
    );
}

// Pricing Card Component
function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
    const { isMonthly, currentRegion } = useContext(PricingContext);
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const { isAuthenticated } = useAuth();

    // Safety check fallback just in case currentRegion isn't mapped properly
    const regionPricing = plan.prices[currentRegion] || plan.prices['GLOBAL'];
    const activePrice = isMonthly ? regionPricing.monthly : regionPricing.annual;

    // Currency Map
    const currencyMap: Record<RegionTier, string> = {
        IN: 'INR',
        SEA: 'USD',
        GLOBAL: 'USD',
        EU: 'EUR',
        JP: 'JPY',
        ME: 'USD'
    };
    const currencyCode = currencyMap[currentRegion] || 'USD';

    // When the user clicks Upgrade, construct the checkout URL with both the Plan ID and their Region Tier
    // so the backend can fetch the specific, localized plan
    const checkoutUrl = `/checkout?plan=${plan.id}&region=${currentRegion}`;

    // If not authenticated, send them to login but pass the checkout URL so they return immediately after!
    const targetHref = isAuthenticated
        ? checkoutUrl
        : `/login?redirect=${encodeURIComponent(checkoutUrl)}`;

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{
                y: plan.isPopular && isDesktop ? -20 : 0,
                opacity: 1,
            }}
            viewport={{ once: true }}
            transition={{
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: index * 0.15,
            }}
            className={cn(
                "rounded-sm p-6 flex flex-col relative flex-1 w-full md:max-w-md",
                plan.isPopular
                    ? "border-1 border-primary shadow-xl"
                    : "border border-border",
            )}
        >
            {plan.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="bg-primary py-1.5 px-2 rounded-full flex items-center gap-1.5">
                        <GiLaurelCrown className="text-primary-foreground h-5 w-5 fill-current" />
                        <span className="text-primary-foreground text-xs font-semibold">
                            Popular
                        </span>
                    </div>
                </div>
            )}
            <div className="flex-1 flex flex-col text-center">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground">
                    {plan.description}
                </p>
                <div className="mt-3 flex items-baseline justify-center gap-x-1">
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                        <NumberFlow
                            value={activePrice}
                            format={{
                                style: "currency",
                                currency: currencyCode,
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            }}
                            className="font-variant-numeric: tabular-nums"
                        />
                    </span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                        / {isMonthly ? "mo" : "yr"}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    {isMonthly ? "Billed Monthly" : "Billed Annually"}
                </p>

                <ul
                    role="list"
                    className="mt-8 space-y-3 text-md leading-6 text-left text-muted-foreground"
                >
                    {plan.features.map((feature: string) => (
                        <li key={feature} className="flex gap-x-3 items-center">
                            <GiFireGem
                                className="h-4 w-4 flex-none text-primary"
                                aria-hidden="true"
                            />
                            {feature}
                        </li>
                    ))}
                </ul>

                <div className="mt-auto pt-8">
                    <Link
                        href={targetHref}
                        className={cn(
                            buttonVariants({
                                variant: plan.isPopular ? "default" : "outline",
                                size: "sm",
                            }),
                            "w-full max-w-[220px] mx-auto",
                        )}
                    >
                        {plan.buttonText}
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
