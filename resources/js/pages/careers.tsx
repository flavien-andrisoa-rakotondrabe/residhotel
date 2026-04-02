import { Link } from '@inertiajs/react';
import { ChevronRight, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const openings = [
    {
        title: 'Développeur Full-Stack Senior',
        team: 'Tech',
        location: 'Neuilly-sur-Seine / Remote',
        type: 'CDI',
    },
    {
        title: 'Product Designer UX/UI',
        team: 'Design',
        location: 'Neuilly-sur-Seine / Remote',
        type: 'CDI',
    },
    {
        title: 'Customer Success Manager',
        team: 'Support',
        location: 'Neuilly-sur-Seine',
        type: 'CDI',
    },
    {
        title: 'Responsable Marketing Digital',
        team: 'Marketing',
        location: 'Neuilly-sur-Seine',
        type: 'CDI',
    },
    { title: 'Data Analyst', team: 'Data', location: 'Remote', type: 'CDI' },
];

const perks = [
    'Télétravail flexible',
    'Mutuelle premium prise en charge à 100%',
    'Carte Swile (titres restaurant)',
    'Budget formation annuel',
    'Séjours offerts sur Residotel',
    'Équipe bienveillante et ambitieuse',
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="border-b border-border bg-primary/5 px-6 pt-24 pb-14">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="font-body mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground"
                        >
                            Accueil
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-medium text-foreground">
                            Carrières
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Rejoignez l'aventure Residotel
                    </h1>
                    <p className="font-body mx-auto max-w-xl text-base text-muted-foreground">
                        Nous construisons l'avenir de la location courte durée
                        en France. Rejoignez une équipe passionnée et
                        ambitieuse.
                    </p>
                </div>
            </div>

            {/* Perks */}
            <section className="container mx-auto max-w-4xl px-6 py-16">
                <h2 className="font-display mb-8 text-center text-2xl font-bold text-foreground">
                    Pourquoi nous rejoindre ?
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {perks.map((p) => (
                        <div
                            key={p}
                            className="rounded-2xl border border-border bg-muted/30 p-5 text-center"
                        >
                            <p className="font-body text-sm font-medium text-foreground">
                                {p}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Openings */}
            <section className="border-y border-border bg-muted/30 py-16">
                <div className="container mx-auto max-w-4xl px-6">
                    <h2 className="font-display mb-8 text-center text-2xl font-bold text-foreground">
                        Postes ouverts
                    </h2>
                    <div className="space-y-3">
                        {openings.map((job) => (
                            <div
                                key={job.title}
                                className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-background p-5 transition-shadow hover:shadow-hero sm:flex-row sm:items-center"
                            >
                                <div>
                                    <h3 className="font-display mb-1 font-semibold text-foreground">
                                        {job.title}
                                    </h3>
                                    <div className="font-body flex flex-wrap gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" />{' '}
                                            {job.team} · {job.type}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />{' '}
                                            {job.location}
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href="mailto:careers@residotel.com"
                                    className="font-body inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                                >
                                    Postuler <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                    <p className="font-body mt-8 text-center text-sm text-muted-foreground">
                        Vous ne trouvez pas votre poste ? Envoyez une
                        candidature spontanée à{' '}
                        <a
                            href="mailto:careers@residotel.com"
                            className="text-primary hover:underline"
                        >
                            careers@residotel.com
                        </a>
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
