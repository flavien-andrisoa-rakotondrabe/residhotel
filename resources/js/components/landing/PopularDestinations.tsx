import { ArrowRight } from 'lucide-react';

const destinations = [
    {
        name: 'Santorin',
        country: 'Grèce',
        properties: 148,
        img: '/images/dest-santorini.jpg',
        big: true,
    },
    {
        name: 'Paris',
        country: 'France',
        properties: 312,
        img: '/images/dest-paris.jpg',
        big: false,
    },
    {
        name: 'Marrakech',
        country: 'Maroc',
        properties: 94,
        img: '/images/dest-marrakech.jpg',
        big: false,
    },
    {
        name: 'Bali',
        country: 'Indonésie',
        properties: 187,
        img: '/images/dest-bali.jpg',
        big: false,
    },
];

export default function PopularDestinations() {
    return (
        <section id="destinations" className="bg-background-fix py-24">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="font-body text-sm font-semibold tracking-widest text-accent uppercase">
                            Explorer le monde
                        </span>
                        <h2 className="font-display mt-2 text-4xl leading-tight font-bold text-foreground-fix md:text-5xl">
                            Destinations
                            <br className="md:hidden" /> populaires
                        </h2>
                    </div>
                    <a
                        href="#"
                        className="font-body flex items-center gap-2 text-sm font-semibold text-primary-fix transition-all hover:gap-3"
                    >
                        Voir toutes les destinations
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>

                {/* Grid */}
                <div className="grid h-auto grid-cols-1 gap-4 md:h-[520px] md:grid-cols-3">
                    {/* Big card */}
                    <div className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-card md:col-span-1 md:row-span-2">
                        <img
                            src={destinations[0].img}
                            alt={destinations[0].name}
                            className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-full"
                        />
                        <div className="card-overlay absolute inset-0" />
                        <div className="absolute right-0 bottom-0 left-0 p-6">
                            <p className="font-body mb-1 text-xs font-medium tracking-wider text-white/70 uppercase">
                                {destinations[0].country}
                            </p>
                            <h3 className="font-display text-3xl font-bold text-white">
                                {destinations[0].name}
                            </h3>
                            <p className="font-body mt-1 text-sm text-white/80">
                                {destinations[0].properties} propriétés
                            </p>
                        </div>
                    </div>

                    {/* Small cards */}
                    {destinations.slice(1).map((d) => (
                        <div
                            key={d.name}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-card"
                        >
                            <img
                                src={d.img}
                                alt={d.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="card-overlay absolute inset-0" />
                            <div className="absolute right-0 bottom-0 left-0 p-5">
                                <p className="font-body mb-0.5 text-xs font-medium tracking-wider text-white/70 uppercase">
                                    {d.country}
                                </p>
                                <h3 className="font-display text-2xl font-bold text-white">
                                    {d.name}
                                </h3>
                                <p className="font-body text-sm text-white/80">
                                    {d.properties} propriétés
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
