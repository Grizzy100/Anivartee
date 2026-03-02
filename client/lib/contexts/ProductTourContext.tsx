"use client";

import React, { createContext, useContext, useState } from "react";

interface ProductTourContextProps {
    startTour: () => void;
    tourRequested: boolean;
    setTourRequested: (val: boolean) => void;
    activeStep: number;
    setActiveStep: (step: number) => void;
}

const ProductTourContext = createContext<ProductTourContextProps | undefined>(
    undefined
);

export function ProductTourProvider({ children }: { children: React.ReactNode }) {
    const [tourRequested, setTourRequested] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const startTour = () => {
        setTourRequested(true);
        setActiveStep(0);
    };

    return (
        <ProductTourContext.Provider
            value={{ startTour, tourRequested, setTourRequested, activeStep, setActiveStep }}
        >
            {children}
        </ProductTourContext.Provider>
    );
}

export function useProductTour() {
    const context = useContext(ProductTourContext);
    if (!context) {
        throw new Error("useProductTour must be used within a ProductTourProvider");
    }
    return context;
}
