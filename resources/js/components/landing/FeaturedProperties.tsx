import { Link } from '@inertiajs/react';
import { Star, Heart, MapPin, ArrowRight } from 'lucide-react';

const properties = [
    {
        id: 1,
        title: 'Suite Panoramique — Vue Ville',
        location: 'Dubai, EAU',
        type: 'Suite de luxe',
        price: 320,
        rating: 4.9,
        reviews: 124,
        img: '/images/property-1.jpg',
        badge: 'Coup de cœur',
    },
    {
        id: 2,
        title: 'Villa Bord de Mer avec Piscine',
        location: 'Maldives',
        type: 'Villa privée',
        price: 680,
        rating: 5.0,
        reviews: 87,
        img: '/images/property-2.jpg',
        badge: 'Exclusif',
    },
    {
        id: 3,
        title: 'Appartement Vue Tour Eiffel',
        location: 'Paris, France',
        type: 'Appartement',
        price: 195,
        rating: 4.8,
        reviews: 206,
        img: '/images/property-3.jpg',
        badge: null,
    },
];
export default function FeaturedProperties() {
    return (
        <section className="bg-background py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                            À la une
                        </h2>
                        <p className="font-body mt-1 text-sm text-muted-foreground">
                            Sélectionnés par l'équipe Residotel
                        </p>
                    </div>
                    <Link
                        href="/search"
                        className="font-body hidden items-center gap-1 text-sm font-semibold text-foreground underline-offset-4 hover:underline md:flex"
                    >
                        Tout voir <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {properties.map((p) => (
                        <Link
                            href={`/property/${p.id}`}
                            key={p.id}
                            className="group cursor-pointer"
                        >
                            {/* Image */}
                            <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl">
                                <img
                                    src={p.img}
                                    alt={p.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <button
                                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <Heart className="h-4 w-4 text-foreground" />
                                </button>
                                {p.badge && (
                                    <span className="font-body absolute top-3 left-3 rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
                                        {p.badge}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="mb-0.5 flex items-center gap-1">
                                        <h3 className="font-body truncate text-sm font-semibold text-foreground">
                                            {p.title}
                                        </h3>
                                    </div>
                                    <p className="font-body flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        {p.location}
                                    </p>
                                    <p className="font-body mt-1 text-sm text-foreground">
                                        <span className="font-semibold">
                                            {p.price}€
                                        </span>
                                        <span className="text-muted-foreground">
                                            {' '}
                                            / nuit
                                        </span>
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1 pt-0.5">
                                    <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                                    <span className="font-body text-sm font-medium">
                                        {p.rating}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
