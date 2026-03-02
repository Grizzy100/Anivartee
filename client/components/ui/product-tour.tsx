"use client";

import React, { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { motion, AnimatePresence } from "framer-motion";

interface ProductTourProps {
    steps: Step[];
    tourVersion: string;
}

// Custom tooltip component matching the premium design spec
function TourTooltip({
    index,
    size,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
}: TooltipRenderProps) {
    return (
        <motion.div
            key={index}
            {...tooltipProps}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0b1121] backdrop-blur-xl border border-blue-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-xl p-6 w-[360px] max-w-[90vw] relative z-[10000]"
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
    );
}

import { useProductTour } from "@/lib/contexts/ProductTourContext";

export function ProductTourComponent({
    steps,
    tourVersion
}: ProductTourProps) {
    const [run, setRun] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { tourRequested, setTourRequested, setActiveStep } = useProductTour();

    // Initialize mount state and start tour if no history exists
    useEffect(() => {
        setIsMounted(true);
        const hasSeen = localStorage.getItem(tourVersion);
        if (!hasSeen) {
            setRun(true);
        }
    }, [tourVersion]);

    // Handle manual tour requests
    useEffect(() => {
        if (tourRequested) {
            setRun(true);
            setTourRequested(false); // Reset the trigger
        }
    }, [tourRequested, setTourRequested]);

    // Uncontrolled state management - only track completion
    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, index, type } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (type === "step:after" || type === "error:target_not_found") {
            // "step:after" fires right before moving to the next step. 
            // the `index` provided in `data` will be the index of the step you are LEAVING.
        }

        // On step change, sync the state to Context so other components can react
        if (type === "tooltip" || type === "step:before") {
            setActiveStep(index);
        }

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem(tourVersion, "true");
        }
    };

    if (!isMounted) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
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
            floaterProps={{
                disableAnimation: true,
            }}
            styles={{
                options: {
                    zIndex: 10000,
                    arrowColor: "rgb(59, 130, 246)",
                    overlayColor: "rgba(0, 0, 0, 0.75)",
                },
                spotlight: {
                    backgroundColor: "transparent",
                    borderRadius: "8px",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)",
                }
            }}
        />
    );
}

export const ProductTour = React.memo(ProductTourComponent);
