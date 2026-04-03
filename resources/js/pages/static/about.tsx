import { Link } from '@inertiajs/react';
import { ChevronRight, Shield, Heart, Globe, Users } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const values = [
    {
        icon: Shield,
        title: 'Confiance',
        desc: 'Chaque hôte est vérifié et chaque logement est contrôlé avant publication pour garantir une expérience sans mauvaise surprise.',
    },
    {
        icon: Heart,
        title: 'Hospitalité',
        desc: 'Nous croyons en des séjours chaleureux où hôtes et voyageurs créent ensemble des souvenirs inoubliables.',
    },
    {
        icon: Globe,
        title: 'Accessibilité',
        desc: 'Des logements pour tous les budgets, dans toute la France et bientôt en Europe, avec une tarification transparente.',
    },
    {
        icon: Users,
        title: 'Communauté',
        desc: 'Une plateforme pensée par et pour ses utilisateurs, avec un support réactif et une écoute permanente.',
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
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
                            À propos
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Residotel, la location courte durée
                        <br className="hidden md:block" /> en toute confiance
                    </h1>
                    <p className="font-body mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
                        Née de la volonté de simplifier la location saisonnière,
                        Residotel est une plateforme française qui connecte
                        voyageurs exigeants et hôtes passionnés autour d'un
                        objectif commun : des séjours mémorables en toute
                        transparence.
                    </p>
                </div>
            </div>

            {/* Story */}
            <section className="container mx-auto max-w-4xl px-6 py-16">
                <h2 className="font-display mb-6 text-2xl font-bold text-foreground">
                    Notre histoire
                </h2>
                <div className="font-body space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Residotel est née d'un constat simple : les plateformes
                        de location courte durée existantes manquent souvent de
                        transparence sur les prix, de réactivité dans le support
                        et de proximité avec leurs utilisateurs.
                    </p>
                    <p>
                        Fondée en 2024 par Qolium SASU et basée à
                        Neuilly-sur-Seine, Residotel a pour ambition de devenir
                        la référence française de la location courte durée, en
                        plaçant la confiance et la qualité au cœur de chaque
                        interaction.
                    </p>
                    <p>
                        Notre équipe travaille chaque jour pour offrir une
                        expérience fluide, des tarifs justes et un
                        accompagnement personnalisé, que vous soyez voyageur à
                        la recherche du logement idéal ou hôte souhaitant
                        maximiser vos revenus locatifs.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="border-y border-border bg-muted/30 py-16">
                <div className="container mx-auto max-w-4xl px-6">
                    <h2 className="font-display mb-10 text-center text-2xl font-bold text-foreground">
                        Nos valeurs
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {values.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="rounded-2xl border border-border bg-background p-6"
                            >
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-display mb-2 font-semibold text-foreground">
                                    {title}
                                </h3>
                                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Numbers */}
            <section className="container mx-auto max-w-4xl px-6 py-16">
                <h2 className="font-display mb-10 text-center text-2xl font-bold text-foreground">
                    Residotel en chiffres
                </h2>
                <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
                    {[
                        { value: '500+', label: 'Logements' },
                        { value: '10 000+', label: 'Voyageurs' },
                        { value: '4.8/5', label: 'Note moyenne' },
                        { value: '50+', label: 'Villes' },
                    ].map(({ value, label }) => (
                        <div key={label}>
                            <p className="font-display text-3xl font-bold text-primary">
                                {value}
                            </p>
                            <p className="font-body mt-1 text-sm text-muted-foreground">
                                {label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
