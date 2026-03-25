import { MapPin, Star, Navigation, ArrowRight, Heart } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';
import { useFavorites } from '@/hooks/useFavorites';

interface DBProperty {
    id: string;
    title: string;
    location: string;
    price: number;
    rating: number;
    reviews: number;
    lat: number | null;
    lng: number | null;
    image: string | null;
    images: string[];
    type: string;
    badge: string | null;
}

interface NearbyProperty extends DBProperty {
    distanceKm: number;
}

const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800';
const RADIUS_KM = 50;

export default function NearbyProperties() {
    const { location, loading: geoLoading, error: geoError } = useGeolocation();
    const { isFavorite, toggle: toggleFav } = useFavorites();

    const { data: dbProperties = [], isLoading: dbLoading } = useQuery({
        queryKey: ['properties-nearby'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select(
                    'id,title,location,price,rating,reviews,lat,lng,image,images,type,badge',
                )
                .eq('active', true)
                .not('lat', 'is', null)
                .not('lng', 'is', null);
            if (error) throw error;
            return data as DBProperty[];
        },
    });

    const nearby: NearbyProperty[] = useMemo(() => {
        if (!location || !dbProperties.length) return [];
        return dbProperties
            .map((p) => ({
                ...p,
                distanceKm: distanceKm(
                    location.lat,
                    location.lng,
                    p.lat!,
                    p.lng!,
                ),
            }))
            .filter((p) => p.distanceKm <= RADIUS_KM)
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 6);
    }, [location, dbProperties]);

    // Don't render the section if no geo or no nearby results
    if (geoError || (!geoLoading && !location)) return null;
    if (!geoLoading && location && nearby.length === 0) return null;

    const isLoading = geoLoading || dbLoading;

    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-10 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15">
                                <Navigation className="h-3 w-3 text-accent" />
                            </div>
                            <span className="font-body text-sm font-semibold tracking-widest text-accent uppercase">
                                Autour de vous
                            </span>
                        </div>
                        <h2 className="font-display text-3xl leading-tight font-bold text-foreground md:text-4xl">
                            {location?.label ? (
                                <>
                                    Logements près de{' '}
                                    <span className="text-primary italic">
                                        {location.neighborhood ??
                                            location.city ??
                                            location.label}
                                    </span>
                                </>
                            ) : (
                                'Logements à proximité'
                            )}
                        </h2>
                        {location?.label && (
                            <p className="font-body mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {location.label} · dans un rayon de {RADIUS_KM}{' '}
                                km
                            </p>
                        )}
                    </div>
                    <Link
                        to={`/search${location?.searchQuery ? `?q=${encodeURIComponent(location.searchQuery)}` : ''}`}
                        className="font-body flex shrink-0 items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
                    >
                        Voir tout
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card"
                            >
                                <div className="h-48 bg-muted" />
                                <div className="space-y-3 p-5">
                                    <div className="h-3 w-1/2 rounded bg-muted" />
                                    <div className="h-5 w-3/4 rounded bg-muted" />
                                    <div className="h-4 w-full rounded bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cards */}
                {!isLoading && nearby.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {nearby.map((p) => {
                            const fav = isFavorite(p.id);
                            return (
                                <Link
                                    to={`/property/${p.id}`}
                                    key={p.id}
                                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-hero"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={
                                                p.images?.[0] ??
                                                p.image ??
                                                FALLBACK_IMG
                                            }
                                            alt={p.title}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />

                                        {/* Distance badge */}
                                        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-white backdrop-blur-sm">
                                            <Navigation className="h-3 w-3" />
                                            <span className="font-body text-[11px] font-semibold">
                                                {p.distanceKm < 1
                                                    ? `${Math.round(p.distanceKm * 1000)} m`
                                                    : `${p.distanceKm.toFixed(1)} km`}
                                            </span>
                                        </div>

                                        {/* Favorite */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleFav({
                                                    propertyId: p.id,
                                                    propertyTitle: p.title,
                                                    propertyImage: p.image,
                                                    propertyLocation:
                                                        p.location,
                                                    propertyPrice: Number(
                                                        p.price,
                                                    ),
                                                    propertyRating: Number(
                                                        p.rating,
                                                    ),
                                                    propertyType: p.type,
                                                });
                                            }}
                                            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                                        >
                                            <Heart
                                                className={`h-3.5 w-3.5 transition-colors ${
                                                    fav
                                                        ? 'fill-destructive text-destructive'
                                                        : 'text-muted-foreground'
                                                }`}
                                            />
                                        </button>

                                        {p.badge && (
                                            <div className="absolute bottom-3 left-3">
                                                <Badge className="font-body border-0 bg-accent text-[10px] font-semibold text-accent-foreground">
                                                    {p.badge}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="mb-1.5 flex items-center gap-1 text-muted-foreground">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="font-body truncate text-xs">
                                                {p.location}
                                            </span>
                                            <span className="mx-1 text-border">
                                                ·
                                            </span>
                                            <span className="font-body shrink-0 text-xs">
                                                {p.type}
                                            </span>
                                        </div>
                                        <h3 className="font-display mb-2 line-clamp-2 text-base leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
                                            {p.title}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                                                <span className="font-body text-xs font-semibold">
                                                    {Number(p.rating).toFixed(
                                                        1,
                                                    )}
                                                </span>
                                                <span className="font-body text-[11px] text-muted-foreground">
                                                    ({p.reviews})
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-display text-lg font-bold text-primary">
                                                    {Number(
                                                        p.price,
                                                    ).toLocaleString('fr-FR')}
                                                    €
                                                </span>
                                                <span className="font-body text-xs text-muted-foreground">
                                                    {' '}
                                                    /nuit
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
