'use client';

import { useState, useEffect } from 'react';

export type RegionTier = 'IN' | 'SEA' | 'GLOBAL' | 'EU' | 'JP' | 'ME';

export function useGeolocation() {
    const [regionTier, setRegionTier] = useState<RegionTier>('GLOBAL');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                // Using our Next.js rewrite proxy to avoid ad-blockers blocking api.country.is directly
                const response = await fetch('/api/geo');
                if (!response.ok) throw new Error('Failed to fetch location data');

                const data = await response.json();
                const countryCode = data.country;

                if (countryCode === 'IN') {
                    setRegionTier('IN');
                } else if (['ID', 'MY', 'SG', 'TH', 'PH', 'VN', 'KH', 'LA', 'MM', 'BN', 'TL'].includes(countryCode)) {
                    setRegionTier('SEA');
                } else if (['JP'].includes(countryCode)) {
                    setRegionTier('JP');
                } else if (['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO'].includes(countryCode)) {
                    setRegionTier('ME');
                } else if (['GB', 'FR', 'DE', 'CH', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI', 'SE', 'DK', 'NO'].includes(countryCode)) {
                    setRegionTier('EU');
                } else {
                    setRegionTier('GLOBAL');
                }
            } catch (error) {
                // Silently fall back to GLOBAL if the geolocation API is rate limited.
                setRegionTier('GLOBAL');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocation();
    }, []);

    return { regionTier, isLoading };
}
