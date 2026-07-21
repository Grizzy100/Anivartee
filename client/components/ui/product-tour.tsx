"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { motion, AnimatePresence } from "framer-motion";

interface ProductTourProps {
    steps: Step[];
    tourVersion: string;
}

// ─── TourTooltip ─────────────────────────────────────────────────────────────
//
// The card shell glides to wherever the next target element is on screen —
// direction is handled entirely by the CSS transition on FLOATER_PROPS.
// Content inside crossfades (opacity only) as the card arrives.


function TourTooltip({
    index,
    size,
    step,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
}: TooltipRenderProps) {
    // Visibility gate: hidden until react-floater commits the correct position.
    // Set to true ONCE on mount, never reset — card stays visible while gliding.
    const [positioned, setPositioned] = useState(false);

    useLayoutEffect(() => {
        let raf1: number;
        let raf2: number;
        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => setPositioned(true));
        });
        return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
    }, []); // runs once on mount only

    return (
        <div {...tooltipProps} className="w-[360px] max-w-[90vw]">
            {/* Shell — glides to the target via FLOATER_PROPS CSS transition */}
            <div
                className="bg-[#0b1121] backdrop-blur-xl border border-blue-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden"
                style={{ visibility: positioned ? "visible" : "hidden" }}
            >
                {/* Content crossfades as the card arrives at the new target */}
                <AnimatePresence mode="sync">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="p-6"
                    >
                        <div className="flex flex-col gap-2">
                            {step.title && (
                                <h3 className="text-lg font-semibold tracking-tight text-white/95">
                                    {step.title}
                                </h3>
                            )}
                            <p className="text-sm leading-relaxed text-blue-100/80">
                                {step.content}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-xs font-medium text-blue-300/50">
                                {index + 1} / {size}
                            </div>
                            <div className="flex items-center gap-2">
                                {!isLastStep && (
                                    <button
                                        type="button"
                                        {...skipProps}
                                        className="text-xs font-medium text-blue-100/40 hover:text-white/90 px-2 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
                                    >
                                        Skip
                                    </button>
                                )}
                                {index > 0 && (
                                    <button
                                        type="button"
                                        {...backProps}
                                        className="text-xs font-medium text-blue-100/60 hover:text-white/90 px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="button"
                                    {...primaryProps}
                                    className="text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                                >
                                    {isLastStep ? "Finish" : "Next"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}


import { useProductTourActions, useProductTourState } from "@/lib/contexts/ProductTourContext";

// ─── Stable constants — defined ONCE at module scope ─────────────────────────
//
// FLOATER_PROPS.styles.floater adds a CSS transition on the transform property
// that react-floater sets when repositioning between step targets. This is what
// creates the "glide" effect — the card travels smoothly from target A to B
// instead of cutting. disableAnimation:true stops react-floater's own
// fade-in/out so it doesn't conflict with our AnimatePresence animation.
const FLOATER_PROPS = {
    disableAnimation: true,
    styles: {
        floater: {
            // Glide the card between targets instead of jumping.
            // react-floater repositions by updating `transform` on this element.
            transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        },
    },
};

const JOYRIDE_STYLES = {
    options: {
        zIndex: 10000,
        arrowColor: "rgb(59, 130, 246)",
        overlayColor: "rgba(0, 0, 0, 0.75)",
    },
    spotlight: {
        backgroundColor: "transparent",
        borderRadius: "8px",
        boxShadow:
            "0 0 0 2px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)",
        transition: "top 400ms cubic-bezier(0.16, 1, 0.3, 1), left 400ms cubic-bezier(0.16, 1, 0.3, 1), width 400ms cubic-bezier(0.16, 1, 0.3, 1), height 400ms cubic-bezier(0.16, 1, 0.3, 1)",
    },
} as const;

// Reducer outside component — a new function reference on every render is
// harmless for useReducer after mount, but keeping it outside is correct.
type TourState = { run: boolean; tourKey: number };
type TourAction = { type: "START" } | { type: "STOP" };

function tourReducer(state: TourState, action: TourAction): TourState {
    switch (action.type) {
        case "START":
            return { run: true, tourKey: state.tourKey + 1 };
        case "STOP":
            return { ...state, run: false };
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductTourComponent({
    steps,
    tourVersion
}: ProductTourProps) {

    const [state, dispatch] = React.useReducer(tourReducer, { run: false, tourKey: 0 });
    const [isMounted, setIsMounted] = useState(false);

    const { tourRequested } = useProductTourState();
    const { setTourRequested } = useProductTourActions();

    // Initialize mount state and start tour if no history exists
    useEffect(() => {
        setIsMounted(true);
        const hasSeen = localStorage.getItem(tourVersion);
        if (!hasSeen) {
            dispatch({ type: "START" });
        }
    }, [tourVersion]);

    // Handle manual tour requests
    useEffect(() => {
        if (tourRequested) {
            dispatch({ type: "START" });
            setTourRequested(false);
        }
    }, [tourRequested, setTourRequested]);

    // Stable callback — dispatches a zero-cost CustomEvent for step changes
    // instead of updating shared React state. Previously, calling setActiveStep
    // on every "tooltip" event caused ProductTourProvider → ProductTourComponent
    // → Joyride to re-render in a cascade on every Next/Back click.
    // Now ProductTourProvider state only changes on tour start/stop.
    const handleJoyrideCallback = useCallback((data: CallBackProps) => {
        const { status, index, type } = data;

        if (type === "tooltip" || type === "step:before") {
            // Notify interested components (e.g. ModerationPage) without
            // touching React state at all.
            window.dispatchEvent(
                new CustomEvent("tour-step-change", { detail: { index } })
            );
        }

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            dispatch({ type: "STOP" });
            localStorage.setItem(tourVersion, "true");
        }
    }, [tourVersion]);

    if (!isMounted) return null;

    return (
        <Joyride
            key={state.tourKey}
            steps={steps}
            run={state.run}
            continuous={true}
            showProgress={false}
            showSkipButton={true}
            disableOverlay={false}
            disableOverlayClose={true}
            scrollToFirstStep={true}
            disableScrolling={false}
            spotlightClicks={false}
            callback={handleJoyrideCallback}
            tooltipComponent={TourTooltip}
            floaterProps={FLOATER_PROPS}
            styles={JOYRIDE_STYLES}
        />
    );
}

export const ProductTour = React.memo(ProductTourComponent);

