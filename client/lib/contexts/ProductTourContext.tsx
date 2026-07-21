"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

// ─── Why activeStep was removed ───────────────────────────────────────────────
//
// Previously, handleJoyrideCallback called setActiveStep(index) on every
// "tooltip" event. This updated ProductTourProvider's state on every step
// change, causing ProductTourProvider → ProductTourComponent → Joyride to
// re-render in a cascade.
//
// ModerationPage was the only consumer of activeStep — it just needed to know
// when step 2 was reached to auto-switch a tab. That's a one-way notification,
// not shared state. It now listens to a DOM CustomEvent ("tour-step-change")
// dispatched by handleJoyrideCallback, which costs zero React re-renders.
//
// Result: ProductTourProvider state only changes when the tour is started or
// stopped — not on every Next/Back click.

interface ProductTourState {
    tourRequested: boolean;
}

interface ProductTourActions {
    startTour: () => void;
    setTourRequested: (val: boolean) => void;
}

const ProductTourStateCtx = createContext<ProductTourState | undefined>(undefined);
const ProductTourActionsCtx = createContext<ProductTourActions | undefined>(undefined);

export function ProductTourProvider({ children }: { children: React.ReactNode }) {
    const [tourRequested, setTourRequested] = useState(false);

    const startTour = useCallback(() => {
        setTourRequested(true);
    }, []);

    const actions = useMemo(() => ({ startTour, setTourRequested }), [startTour]);
    const state = useMemo(() => ({ tourRequested }), [tourRequested]);

    return (
        <ProductTourActionsCtx.Provider value={actions}>
            <ProductTourStateCtx.Provider value={state}>{children}</ProductTourStateCtx.Provider>
        </ProductTourActionsCtx.Provider>
    );
}

export function useProductTourActions() {
    const ctx = useContext(ProductTourActionsCtx);
    if (!ctx) throw new Error("useProductTourActions must be used within a ProductTourProvider");
    return ctx;
}

export function useProductTourState() {
    const ctx = useContext(ProductTourStateCtx);
    if (!ctx) throw new Error("useProductTourState must be used within a ProductTourProvider");
    return ctx;
}

