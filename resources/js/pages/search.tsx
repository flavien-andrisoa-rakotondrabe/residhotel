import {
    Search,
    X,
    SlidersHorizontal,
    Map,
    LayoutGrid,
    List,
    ChevronDown,
    Check,
    Navigation,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import FilterPanel, {
    type Filters,
    DEFAULT_FILTERS,
} from '@/components/search/FilterPanel';
import { GridCard, Pagination } from '@/components/search/PropertyGrid';
import PropertyMap from '@/components/map/PropertyMap';
import { ALL_PROPERTIES, SORT_OPTIONS, type Property } from '@/data/properties';
import { useFavorites } from '@/hooks/useFavorites';
import { distanceKm } from '@/hooks/useGeolocation';

const PAGE_SIZE = 6;

// ── DB → Property mapper ──────────────────────────────────────────────────────
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
    bedrooms: number;
    bathrooms: number;
    guests: number;
    amenities: string[];
    badge: string | null;
}

function dbToProperty(p: DBProperty, index: number): Property {
    return {
        id: index + 10000, // numeric id for map compat
        title: p.title,
        location: p.location,
        price: Number(p.price),
        rating: Number(p.rating),
        reviews: p.reviews,
        lat: p.lat ?? 46.6,
        lng: p.lng ?? 2.3,
        image:
            p.image ??
            'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
        images: p.images ?? [],
        type: p.type,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        guests: p.guests,
        amenities: p.amenities ?? [],
        badge: p.badge ?? undefined,
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function countActiveFilters(f: Filters): number {
    let n = 0;
    if (f.type !== 'Tous') n++;
    if (f.priceMin > 0 || f.priceMax < 1000) n++;
    if (f.minRating > 0) n++;
    if (f.bedrooms > 0) n++;
    n += f.amenities.size;
    return n;
}

const mapCenter = (props: Property[]): [number, number] => {
    if (!props.length) return [46.6, 2.3];
    return [
        props.reduce((s, p) => s + p.lat, 0) / props.length,
        props.reduce((s, p) => s + p.lng, 0) / props.length,
    ];
};

type ViewMode = 'grid' | 'list' | 'map';
type SortKey =
    | 'recommended'
    | 'price_asc'
    | 'price_desc'
    | 'rating'
    | 'reviews';

// ── Component ─────────────────────────────────────────────────────────────────
export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') ?? '');
    const [filters, setFilters] = useState<Filters>({
        ...DEFAULT_FILTERS,
        amenities: new Set(),
    });
    const [sort, setSort] = useState<SortKey>('recommended');
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [activeId, setActiveId] = useState<number | null>(null);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Geolocation coords passed from hero search (optional)
    const userLat = searchParams.get('lat')
        ? parseFloat(searchParams.get('lat')!)
        : null;
    const userLng = searchParams.get('lng')
        ? parseFloat(searchParams.get('lng')!)
        : null;
    const hasUserGeo = userLat !== null && userLng !== null;

    const { isFavorite, toggle: toggleFav } = useFavorites();

    useEffect(() => {
        setPage(1);
    }, [query, filters, sort]);

    // ── Fetch from DB ─────────────────────────────────────────────────────────────
    const { data: dbProperties = [] } = useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data as DBProperty[]).map(dbToProperty);
        },
    });

    // Merge: DB properties first, then static ones (as catalogue fallback)
    const allProperties: Property[] = useMemo(() => {
        if (dbProperties.length > 0) return dbProperties;
        return ALL_PROPERTIES;
    }, [dbProperties]);

    // ── Filter & sort ─────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = allProperties.filter((p) => {
            if (filters.type !== 'Tous' && p.type !== filters.type)
                return false;
            if (p.price < filters.priceMin || p.price > filters.priceMax)
                return false;
            if (p.rating < filters.minRating) return false;
            if (filters.bedrooms > 0 && p.bedrooms < filters.bedrooms)
                return false;
            if (filters.amenities.size > 0) {
                for (const a of filters.amenities) {
                    if (!p.amenities.includes(a)) return false;
                }
            }
            if (query) {
                const q = query.toLowerCase();
                if (
                    !p.title.toLowerCase().includes(q) &&
                    !p.location.toLowerCase().includes(q) &&
                    !p.type.toLowerCase().includes(q)
                )
                    return false;
            }
            return true;
        });

        switch (sort) {
            case 'price_asc':
                result = [...result].sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                result = [...result].sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result = [...result].sort((a, b) => b.rating - a.rating);
                break;
            case 'reviews':
                result = [...result].sort((a, b) => b.reviews - a.reviews);
                break;
            default:
                // Si géolocalisation disponible et tri "recommandé" → trier par proximité
                if (hasUserGeo && sort === 'recommended') {
                    result = [...result].sort((a, b) => {
                        const da = distanceKm(userLat!, userLng!, a.lat, a.lng);
                        const db = distanceKm(userLat!, userLng!, b.lat, b.lng);
                        return da - db;
                    });
                }
        }
        return result;
    }, [allProperties, query, filters, sort, hasUserGeo, userLat, userLng]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const activeCount = countActiveFilters(filters);
    const center = useMemo(() => mapCenter(filtered), [filtered]);
    const sortLabel =
        SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Recommandés';

    const toggleFavorite = (id: number) => {
        const p = allProperties.find((prop) => prop.id === id);
        if (!p) return;
        toggleFav({
            propertyId: String(id),
            propertyTitle: p.title,
            propertyImage: p.image,
            propertyLocation: p.location,
            propertyPrice: p.price,
            propertyRating: p.rating,
            propertyType: p.type,
        });
    };

    const resetAll = () => {
        setQuery('');
        setFilters({ ...DEFAULT_FILTERS, amenities: new Set() });
        setSort('recommended');
    };

    const activePills: { label: string; onRemove: () => void }[] = [];
    if (filters.type !== 'Tous')
        activePills.push({
            label: filters.type,
            onRemove: () => setFilters((f) => ({ ...f, type: 'Tous' })),
        });
    if (filters.priceMin > 0 || filters.priceMax < 1000)
        activePills.push({
            label: `${filters.priceMin}–${filters.priceMax >= 1000 ? '1000+' : filters.priceMax} €`,
            onRemove: () =>
                setFilters((f) => ({ ...f, priceMin: 0, priceMax: 1000 })),
        });
    if (filters.minRating > 0)
        activePills.push({
            label: `${filters.minRating}★+`,
            onRemove: () => setFilters((f) => ({ ...f, minRating: 0 })),
        });
    if (filters.bedrooms > 0)
        activePills.push({
            label: `${filters.bedrooms}+ ch.`,
            onRemove: () => setFilters((f) => ({ ...f, bedrooms: 0 })),
        });
    for (const a of filters.amenities) {
        const captured = a;
        activePills.push({
            label: captured,
            onRemove: () =>
                setFilters((f) => {
                    const n = new Set(f.amenities);
                    n.delete(captured);
                    return { ...f, amenities: n };
                }),
        });
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* ═══ Top search bar ═══ */}
            <div className="fixed top-[64px] right-0 left-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 py-3">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Destination, type de bien..."
                                className="font-body h-10 rounded-xl border-border bg-muted/40 pr-8 pl-9 text-sm"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <Sheet
                            open={mobileFilterOpen}
                            onOpenChange={setMobileFilterOpen}
                        >
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`font-body relative h-10 shrink-0 gap-2 rounded-xl ${activeCount > 0 ? 'border-primary text-primary' : ''}`}
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Filtres
                                    </span>
                                    {activeCount > 0 && (
                                        <span className="font-body absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                            {activeCount}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-full p-0 sm:w-96"
                            >
                                <FilterPanel
                                    filters={filters}
                                    onChange={setFilters}
                                    onClose={() => setMobileFilterOpen(false)}
                                    activeCount={activeCount}
                                />
                            </SheetContent>
                        </Sheet>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="font-body hidden h-10 shrink-0 gap-2 rounded-xl sm:flex"
                                >
                                    <span className="max-w-[110px] truncate">
                                        {sortLabel}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="font-body"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <DropdownMenuItem
                                        key={o.value}
                                        onClick={() =>
                                            setSort(o.value as SortKey)
                                        }
                                        className="flex items-center justify-between"
                                    >
                                        {o.label}
                                        {sort === o.value && (
                                            <Check className="ml-2 h-4 w-4 text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="hidden shrink-0 gap-0.5 rounded-xl bg-muted p-1 md:flex">
                            {(
                                [
                                    {
                                        mode: 'grid' as ViewMode,
                                        Icon: LayoutGrid,
                                        label: 'Grille',
                                    },
                                    {
                                        mode: 'list' as ViewMode,
                                        Icon: List,
                                        label: 'Liste',
                                    },
                                    {
                                        mode: 'map' as ViewMode,
                                        Icon: Map,
                                        label: 'Carte',
                                    },
                                ] as const
                            ).map(({ mode, Icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    title={label}
                                    className={`font-body flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                        viewMode === mode
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="hidden lg:inline">
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex shrink-0 gap-0.5 rounded-xl bg-muted p-1 md:hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`font-body rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${viewMode !== 'map' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`font-body rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'map' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                            >
                                <Map className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {activePills.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-3">
                            {/* Geo badge */}
                            {hasUserGeo && sort === 'recommended' && (
                                <span className="font-body flex shrink-0 items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                                    <Navigation className="h-3 w-3" />
                                    Triés par distance
                                </span>
                            )}
                            {activePills.map((pill) => (
                                <button
                                    key={pill.label}
                                    onClick={pill.onRemove}
                                    className="font-body flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-all hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                >
                                    {pill.label}
                                    <X className="h-3 w-3" />
                                </button>
                            ))}
                            <button
                                onClick={resetAll}
                                className="font-body ml-1 shrink-0 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                            >
                                Tout effacer
                            </button>
                        </div>
                    )}
                    {/* Geo badge when no active filters */}
                    {activePills.length === 0 &&
                        hasUserGeo &&
                        sort === 'recommended' && (
                            <div className="flex items-center gap-2 pb-3">
                                <span className="font-body flex items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                                    <Navigation className="h-3 w-3" />
                                    Résultats triés par proximité
                                </span>
                            </div>
                        )}
                </div>
            </div>

            {/* ═══ Main layout ═══ */}
            <div
                className="flex"
                style={{ paddingTop: activePills.length > 0 ? 130 : 106 }}
            >
                {viewMode !== 'map' && (
                    <aside className="sticky top-[106px] hidden h-[calc(100vh-106px)] w-72 shrink-0 flex-col overflow-hidden border-r border-border bg-background lg:flex xl:w-80">
                        <FilterPanel
                            filters={filters}
                            onChange={setFilters}
                            activeCount={activeCount}
                        />
                    </aside>
                )}

                <div
                    className={`min-w-0 flex-1 ${viewMode === 'map' ? 'flex h-[calc(100vh-106px)]' : ''}`}
                >
                    {/* MAP */}
                    {viewMode === 'map' && (
                        <div className="flex h-full w-full">
                            <div className="hidden w-80 shrink-0 flex-col overflow-y-auto border-r border-border md:flex xl:w-96">
                                <div className="shrink-0 border-b border-border p-4">
                                    <p className="font-body text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">
                                            {filtered.length}
                                        </span>{' '}
                                        propriété
                                        {filtered.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="space-y-3 overflow-y-auto p-3">
                                    {filtered.map((p) => (
                                        <MapListItem
                                            key={p.id}
                                            property={p}
                                            isActive={p.id === activeId}
                                            isFavorite={isFavorite(
                                                String(p.id),
                                            )}
                                            onHover={setActiveId}
                                            onFavorite={toggleFavorite}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 p-3">
                                <div className="h-full w-full overflow-hidden rounded-2xl border border-border shadow-card">
                                    <PropertyMap
                                        properties={filtered}
                                        activeId={activeId}
                                        onMarkerClick={(id) =>
                                            setActiveId(
                                                id === activeId ? null : id,
                                            )
                                        }
                                        center={center}
                                        zoom={filtered.length === 1 ? 13 : 6}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GRID / LIST */}
                    {viewMode !== 'map' && (
                        <div className="container mx-auto px-4 py-5 lg:px-6">
                            <div className="mb-5 flex items-center justify-between">
                                <p className="font-body text-sm text-muted-foreground">
                                    <span className="font-bold text-foreground">
                                        {filtered.length}
                                    </span>{' '}
                                    propriété{filtered.length !== 1 ? 's' : ''}{' '}
                                    trouvée{filtered.length !== 1 ? 's' : ''}
                                    {query && (
                                        <span className="font-medium text-primary">
                                            {' '}
                                            · «{query}»
                                        </span>
                                    )}
                                </p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="font-body gap-1 text-xs text-muted-foreground sm:hidden"
                                        >
                                            {sortLabel}{' '}
                                            <ChevronDown className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="font-body"
                                    >
                                        {SORT_OPTIONS.map((o) => (
                                            <DropdownMenuItem
                                                key={o.value}
                                                onClick={() =>
                                                    setSort(o.value as SortKey)
                                                }
                                            >
                                                {o.label}
                                                {sort === o.value && (
                                                    <Check className="ml-2 h-4 w-4 text-primary" />
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {filtered.length === 0 && (
                                <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                        <Search className="h-9 w-9 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-display text-xl font-bold text-foreground">
                                            Aucun résultat
                                        </p>
                                        <p className="font-body mt-2 max-w-xs text-sm text-muted-foreground">
                                            Aucune propriété ne correspond à vos
                                            critères. Essayez d'élargir vos
                                            filtres.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={resetAll}
                                        variant="outline"
                                        className="font-body mt-2 gap-2"
                                    >
                                        <X className="h-4 w-4" /> Réinitialiser
                                        les filtres
                                    </Button>
                                </div>
                            )}

                            {filtered.length > 0 && viewMode === 'grid' && (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {paginated.map((p) => (
                                        <GridCard
                                            key={p.id}
                                            property={p}
                                            isActive={p.id === activeId}
                                            isFavorite={isFavorite(
                                                String(p.id),
                                            )}
                                            onHover={setActiveId}
                                            onFavorite={toggleFavorite}
                                        />
                                    ))}
                                </div>
                            )}

                            {filtered.length > 0 && viewMode === 'list' && (
                                <div className="space-y-4">
                                    {paginated.map((p) => (
                                        <ListCard
                                            key={p.id}
                                            property={p}
                                            isActive={p.id === activeId}
                                            isFavorite={isFavorite(
                                                String(p.id),
                                            )}
                                            onHover={setActiveId}
                                            onFavorite={toggleFavorite}
                                        />
                                    ))}
                                </div>
                            )}

                            {filtered.length > 0 && (
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onChange={setPage}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Inline sub-components (identical to original) ─────────────────────────────
import { Link } from 'react-router-dom';
import {
    MapPin,
    Star,
    Heart,
    Bed,
    Bath,
    Users,
    ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function MapListItem({
    property: p,
    isActive,
    isFavorite,
    onHover,
    onFavorite,
}: {
    property: Property;
    isActive: boolean;
    isFavorite: boolean;
    onHover: (id: number | null) => void;
    onFavorite: (id: number) => void;
}) {
    return (
        <div
            onMouseEnter={() => onHover(p.id)}
            onMouseLeave={() => onHover(null)}
            className={`group flex cursor-pointer gap-3 rounded-xl border p-3 transition-all ${
                isActive
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
            }`}
        >
            <Link
                to={`/property/${p.id}`}
                className="h-16 w-20 shrink-0 overflow-hidden rounded-lg"
            >
                <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </Link>
            <div className="min-w-0 flex-1">
                <Link to={`/property/${p.id}`}>
                    <h3 className="font-body line-clamp-2 text-xs leading-snug font-bold text-foreground transition-colors group-hover:text-primary">
                        {p.title}
                    </h3>
                </Link>
                <div className="mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="font-body truncate text-[11px] text-muted-foreground">
                        {p.location}
                    </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="font-body text-[11px] font-semibold">
                            {p.rating}
                        </span>
                    </div>
                    <span className="font-body text-xs font-bold text-primary">
                        {p.price}€
                        <span className="font-normal text-muted-foreground">
                            /nuit
                        </span>
                    </span>
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onFavorite(p.id);
                }}
                className={`mt-0.5 flex h-7 w-7 items-center justify-center self-start rounded-full transition-all ${
                    isFavorite
                        ? 'bg-destructive text-white'
                        : 'bg-muted text-muted-foreground hover:text-destructive'
                }`}
            >
                <Heart
                    className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`}
                />
            </button>
        </div>
    );
}

function ListCard({
    property: p,
    isActive,
    isFavorite,
    onHover,
    onFavorite,
}: {
    property: Property;
    isActive: boolean;
    isFavorite: boolean;
    onHover: (id: number | null) => void;
    onFavorite: (id: number) => void;
}) {
    return (
        <div
            onMouseEnter={() => onHover(p.id)}
            onMouseLeave={() => onHover(null)}
            className={`group flex gap-0 overflow-hidden rounded-2xl border bg-card transition-all ${
                isActive
                    ? 'border-primary shadow-card ring-2 ring-primary/20'
                    : 'border-border shadow-sm hover:border-primary/40 hover:shadow-card'
            }`}
        >
            <Link
                to={`/property/${p.id}`}
                className="relative w-52 shrink-0 overflow-hidden sm:w-64"
            >
                <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="h-full min-h-[160px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {p.badge && (
                    <div className="absolute top-3 left-3">
                        <Badge className="font-body border-0 bg-accent text-xs font-semibold text-accent-foreground shadow-sm">
                            {p.badge}
                        </Badge>
                    </div>
                )}
                <div className="absolute bottom-3 left-3">
                    <Badge className="font-body border-0 bg-white/90 px-2 py-0.5 text-xs text-primary backdrop-blur-sm">
                        {p.type}
                    </Badge>
                </div>
            </Link>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    onFavorite(p.id);
                }}
                className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all ${
                    isFavorite
                        ? 'bg-destructive text-white'
                        : 'bg-white/85 text-muted-foreground backdrop-blur-sm hover:bg-white hover:text-destructive'
                }`}
            >
                <Heart
                    className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
                />
            </button>

            <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                <div>
                    <div className="mb-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-body truncate text-xs text-muted-foreground">
                            {p.location}
                        </span>
                    </div>
                    <Link to={`/property/${p.id}`}>
                        <h3 className="font-display mb-2 text-base leading-snug font-bold text-foreground transition-colors group-hover:text-primary">
                            {p.title}
                        </h3>
                    </Link>
                    <div className="mb-3 flex items-center gap-4 text-muted-foreground">
                        <span className="font-body flex items-center gap-1 text-xs">
                            <Bed className="h-3.5 w-3.5" />
                            {p.bedrooms} ch.
                        </span>
                        <span className="font-body flex items-center gap-1 text-xs">
                            <Bath className="h-3.5 w-3.5" />
                            {p.bathrooms} sdb
                        </span>
                        <span className="font-body flex items-center gap-1 text-xs">
                            <Users className="h-3.5 w-3.5" />
                            {p.guests} pers.
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {p.amenities.slice(0, 4).map((a) => (
                            <span
                                key={a}
                                className="font-body rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                            >
                                {a}
                            </span>
                        ))}
                        {p.amenities.length > 4 && (
                            <span className="font-body px-1 text-xs text-muted-foreground">
                                +{p.amenities.length - 4}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        <span className="font-body text-xs font-bold text-foreground">
                            {p.rating}
                        </span>
                        <span className="font-body text-xs text-muted-foreground">
                            ({p.reviews})
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <span className="font-body text-lg font-bold text-primary">
                                {p.price.toLocaleString('fr-FR')} €
                            </span>
                            <span className="font-body text-xs text-muted-foreground">
                                {' '}
                                /nuit
                            </span>
                        </div>
                        <Link to={`/property/${p.id}`}>
                            <Button
                                size="sm"
                                className="font-body h-9 gap-1.5 rounded-xl bg-gradient-brand px-3 text-primary-foreground hover:opacity-90"
                            >
                                Voir <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
