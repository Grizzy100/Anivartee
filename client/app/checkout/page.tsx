'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { paymentApi } from '@/lib/api/api';
import { Loader2 } from 'lucide-react';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, status } = useAuth();

    const [error, setError] = useState<string | null>(null);

    const planId = searchParams.get('plan');
    const regionTier = searchParams.get('region');

    useEffect(() => {
        if (status === 'loading') return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!planId) {
            setError('No plan selected. Please return to the pricing page.');
            return;
        }

        const createCheckoutSession = async () => {
            try {
                // Call the payment service which will return the Stripe Session URL
                const response = await paymentApi.authPost<{ checkoutUrl: string }>('/subscriptions/start', {
                    planId,
                    ...(regionTier ? { regionTier } : {})
                });

                if (response.data?.checkoutUrl) {
                    window.location.href = response.data.checkoutUrl;
                } else {
                    throw new Error('No checkout URL received from the server.');
                }

            } catch (err: any) {
                console.error("Failed to start checkout:", err);
                setError(err.message || 'Failed to initialize checkout session. Please try again.');
            }
        };

        createCheckoutSession();
    }, [planId, regionTier, isAuthenticated, status, router]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md w-full">
                    <h2 className="text-xl font-semibold mb-2">Checkout Error</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => router.push('/pricing')}
                        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Return to Pricing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-semibold text-foreground">Preparing Checkout...</h1>
            <p className="text-muted-foreground mt-2">Connecting to our secure payment provider</p>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <h1 className="text-2xl font-semibold text-foreground">Preparing Checkout...</h1>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
