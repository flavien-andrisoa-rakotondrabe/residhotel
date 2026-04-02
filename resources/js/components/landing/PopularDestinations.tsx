import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

const destinations = [
    {
        name: 'Santorin',
        country: 'Grèce',
        properties: 148,
        img: '/images/dest-santorini.jpg',
    },
    {
        name: 'Paris',
        country: 'France',
        properties: 312,
        img: '/images/dest-paris.jpg',
    },
    {
        name: 'Marrakech',
        country: 'Maroc',
        properties: 94,
        img: '/images/dest-marrakech.jpg',
    },
    {
        name: 'Bali',
        country: 'Indonésie',
        properties: 187,
        img: '/images/dest-bali.jpg',
    },
];

export default function PopularDestinations() {
    return (
        <section id="destinations" className="bg-background py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                            Destinations populaires
                        </h2>
                        <p className="font-body mt-1 text-sm text-muted-foreground">
                            Les lieux les plus prisés par nos voyageurs
                        </p>
                    </div>
                    <Link
                        href="/search"
                        className="font-body hidden items-center gap-1 text-sm font-semibold text-foreground underline-offset-4 hover:underline md:flex"
                    >
                        Tout voir <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {destinations.map((d) => (
                        <Link
                            key={d.name}
                            href={`/search?q=${encodeURIComponent(d.name)}`}
                            className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl"
                        >
                            <img
                                src={d.img}
                                alt={d.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute right-0 bottom-0 left-0 p-4">
                                <h3 className="font-display text-xl tracking-tight text-white">
                                    {d.name}
                                </h3>
                                <p className="font-body mt-0.5 text-xs text-white/70">
                                    {d.properties} logements
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
