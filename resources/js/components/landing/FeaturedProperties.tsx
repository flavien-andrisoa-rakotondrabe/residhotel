import { Link } from '@inertiajs/react';
import { Star, Heart, MapPin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
        <section className="bg-muted-fix py-24">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="font-body text-sm font-semibold tracking-widest text-accent uppercase">
                            Sélection Residotel
                        </span>
                        <h2 className="font-display mt-2 text-4xl leading-tight font-bold text-foreground-fix md:text-5xl">
                            Propriétés
                            <br className="md:hidden" /> à la une
                        </h2>
                    </div>
                    <a
                        href="#"
                        className="font-body flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
                    >
                        Voir toutes les propriétés
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {properties.map((p) => (
                        <div
                            key={p.id}
                            className="group bg-card-fix cursor-pointer overflow-hidden rounded-2xl shadow-card transition-shadow duration-300 hover:shadow-hero"
                        >
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={p.img}
                                    alt={p.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <button className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white">
                                    <Heart className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                                </button>
                                {p.badge && (
                                    <div className="absolute top-4 left-4">
                                        <Badge className="font-body border-0 bg-accent text-xs font-semibold text-accent-foreground shadow-md">
                                            {p.badge}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-5">
                                <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="font-body text-xs font-medium">
                                        {p.location}
                                    </span>
                                    <span className="mx-1 text-border">·</span>
                                    <span className="font-body text-xs">
                                        {p.type}
                                    </span>
                                </div>
                                <h3 className="font-display mb-3 text-lg leading-snug font-semibold text-foreground-fix transition-colors group-hover:text-primary-fix">
                                    {p.title}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="h-4 w-4 fill-accent text-accent" />
                                        <span className="font-body text-sm font-semibold text-foreground-fix">
                                            {p.rating}
                                        </span>
                                        <span className="font-body text-xs text-muted-foreground-fix">
                                            ({p.reviews} avis)
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-display text-xl font-bold text-primary-fix">
                                            {p.price}€
                                        </span>
                                        <span className="font-body text-xs text-muted-foreground-fix">
                                            {' '}
                                            / nuit
                                        </span>
                                    </div>
                                </div>
                                <Link href="/property/1">
                                    <Button className="font-body mt-4 w-full rounded-xl bg-gradient-brand font-semibold text-primary-foreground-fix hover:opacity-90">
                                        Voir le bien
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
