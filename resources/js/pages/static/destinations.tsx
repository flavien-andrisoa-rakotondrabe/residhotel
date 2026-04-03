import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const destinations = [
    {
        name: 'Paris',
        region: 'Île-de-France',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
        count: 120,
    },
    {
        name: 'Nice',
        region: "Côte d'Azur",
        image: 'https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=600&h=400&fit=crop',
        count: 85,
    },
    {
        name: 'Lyon',
        region: 'Auvergne-Rhône-Alpes',
        image: 'https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=600&h=400&fit=crop',
        count: 65,
    },
    {
        name: 'Bordeaux',
        region: 'Nouvelle-Aquitaine',
        image: 'https://images.unsplash.com/photo-1565020011609-b732e6dcbaab?w=600&h=400&fit=crop',
        count: 55,
    },
    {
        name: 'Marseille',
        region: 'Provence',
        image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&h=400&fit=crop',
        count: 70,
    },
    {
        name: 'Strasbourg',
        region: 'Grand Est',
        image: 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=600&h=400&fit=crop',
        count: 40,
    },
    {
        name: 'Biarritz',
        region: 'Pays Basque',
        image: 'https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=600&h=400&fit=crop',
        count: 35,
    },
    {
        name: 'Annecy',
        region: 'Haute-Savoie',
        image: 'https://images.unsplash.com/photo-1601920374411-950a035c0ffc?w=600&h=400&fit=crop',
        count: 30,
    },
    {
        name: 'Montpellier',
        region: 'Occitanie',
        image: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=600&h=400&fit=crop',
        count: 45,
    },
];

export default function DestinationsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="border-b border-border bg-primary/5 px-6 pt-24 pb-14">
                <div className="container mx-auto max-w-5xl text-center">
                    <div className="font-body mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground"
                        >
                            Accueil
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-medium text-foreground">
                            Destinations
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Destinations populaires
                    </h1>
                    <p className="font-body mx-auto max-w-xl text-base text-muted-foreground">
                        Explorez les villes les plus demandées sur Residotel et
                        trouvez votre prochain séjour.
                    </p>
                </div>
            </div>

            <section className="container mx-auto max-w-5xl! px-6 py-12">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {destinations.map((d) => (
                        <Link
                            key={d.name}
                            href={`/search?location=${encodeURIComponent(d.name)}`}
                            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border transition-shadow hover:shadow-hero"
                        >
                            <img
                                src={d.image}
                                alt={d.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-5">
                                <h3 className="font-display mb-0.5 text-xl font-bold text-white">
                                    {d.name}
                                </h3>
                                <p className="font-body text-sm text-white/80">
                                    {d.region} · {d.count} logements
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
