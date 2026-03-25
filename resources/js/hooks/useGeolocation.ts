import { useState, useEffect, useCallback } from 'react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export interface GeoLocation {
    lat: number;
    lng: number;
    city: string | null;
    neighborhood: string | null;
    country: string | null;
    /** Full readable label, e.g. "Montparnasse, Paris, France" */
    label: string | null;
    /** Ready to use as search query */
    searchQuery: string | null;
}

interface UseGeolocationReturn {
    location: GeoLocation | null;
    loading: boolean;
    error: string | null;
    /** Call this to (re-)request the browser geolocation */
    request: () => void;
}

/** Haversine distance in km between two lat/lng pairs */
export function distanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function reverseGeocode(lat: number, lng: number): Promise<GeoLocation> {
    if (!MAPBOX_TOKEN) {
        return {
            lat,
            lng,
            city: null,
            neighborhood: null,
            country: null,
            label: null,
            searchQuery: null,
        };
    }

    try {
        const url =
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
            `?access_token=${MAPBOX_TOKEN}&language=fr&types=neighborhood,place,region,country&limit=1`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error('Mapbox API error');
        }

        const json = await res.json();

        const feature = json.features?.[0];

        if (!feature) {
            return {
                lat,
                lng,
                city: null,
                neighborhood: null,
                country: null,
                label: null,
                searchQuery: null,
            };
        }

        const ctx: Record<string, string> = {};
        (feature.context ?? []).forEach((c: { id: string; text: string }) => {
            const key = c.id.split('.')[0];
            ctx[key] = c.text;
        });

        // Determine place type
        const placeType: string = feature.place_type?.[0] ?? '';
        const neighborhood =
            placeType === 'neighborhood'
                ? feature.text
                : (ctx['neighborhood'] ?? null);
        const city =
            ctx['place'] ?? (placeType === 'place' ? feature.text : null);
        const country =
            ctx['country'] ?? (placeType === 'country' ? feature.text : null);

        const parts = [neighborhood, city, country].filter(Boolean);
        const label = parts.join(', ') || feature.place_name || null;

        // For search: prefer neighborhood + city, fallback to city
        const searchQuery =
            [neighborhood, city].filter(Boolean).join(', ') || city || label;

        return { lat, lng, city, neighborhood, country, label, searchQuery };
    } catch {
        return {
            lat,
            lng,
            city: null,
            neighborhood: null,
            country: null,
            label: null,
            searchQuery: null,
        };
    }
}

export function useGeolocation(): UseGeolocationReturn {
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Géolocalisation non supportée');

            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const geo = await reverseGeocode(latitude, longitude);
                setLocation(geo);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            { timeout: 8000, maximumAge: 300_000 },
        );
    }, []);

    // Auto-request on mount
    useEffect(() => {
        // On utilise setTimeout pour sortir de la pile d'exécution actuelle et éviter le "cascading render" synchrone
        const timeoutId = setTimeout(() => {
            request();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [request]);

    return { location, loading, error, request };
}
