import { Link } from '@inertiajs/react';
import { ChevronRight, Search, CalendarCheck, Key, Star } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const steps = [
    {
        icon: Search,
        step: '1',
        title: 'Recherchez',
        desc: 'Explorez des centaines de logements vérifiés partout en France. Filtrez par lieu, dates, budget et équipements pour trouver le séjour idéal.',
    },
    {
        icon: CalendarCheck,
        step: '2',
        title: 'Réservez',
        desc: 'Réservez en quelques clics avec un paiement sécurisé par Stripe. Recevez une confirmation instantanée par email avec tous les détails de votre séjour.',
    },
    {
        icon: Key,
        step: '3',
        title: 'Séjournez',
        desc: 'Profitez de votre séjour en toute sérénité. Votre hôte vous accueille et reste disponible tout au long de votre expérience.',
    },
    {
        icon: Star,
        step: '4',
        title: 'Évaluez',
        desc: "Partagez votre expérience en laissant un avis. Vos retours aident la communauté et permettent d'améliorer continuellement la qualité des logements.",
    },
];

const hostSteps = [
    {
        step: '1',
        title: 'Créez votre annonce',
        desc: 'Décrivez votre logement, ajoutez de belles photos, fixez votre prix et définissez vos disponibilités en quelques minutes.',
    },
    {
        step: '2',
        title: 'Recevez des réservations',
        desc: 'Les voyageurs réservent directement. Vous êtes notifié instantanément et pouvez échanger avec eux via la messagerie intégrée.',
    },
    {
        step: '3',
        title: 'Accueillez vos voyageurs',
        desc: 'Offrez une expérience inoubliable. Un bon accueil se traduit par de bons avis et plus de réservations futures.',
    },
    {
        step: '4',
        title: 'Recevez vos paiements',
        desc: 'Les paiements sont versés automatiquement sur votre compte après le check-in du voyageur, en toute sécurité.',
    },
];

export default function HowItWorksPage() {
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
                            Comment ça marche
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Comment ça marche ?
                    </h1>
                    <p className="font-body mx-auto max-w-xl text-base text-muted-foreground">
                        Réserver ou proposer un logement sur Residotel, c'est
                        simple, rapide et sécurisé.
                    </p>
                </div>
            </div>

            {/* Traveler steps */}
            <section className="container mx-auto max-w-4xl px-6 py-16">
                <h2 className="font-display mb-10 text-center text-2xl font-bold text-foreground">
                    Pour les voyageurs
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                    {steps.map(({ icon: Icon, step, title, desc }) => (
                        <div
                            key={step}
                            className="relative rounded-2xl border border-border bg-muted/30 p-6"
                        >
                            <span className="font-display absolute top-4 right-4 text-4xl font-bold text-primary/10">
                                {step}
                            </span>
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
            </section>

            {/* Host steps */}
            <section className="border-y border-border bg-muted/30 py-16">
                <div className="container mx-auto max-w-4xl px-6">
                    <h2 className="font-display mb-10 text-center text-2xl font-bold text-foreground">
                        Pour les hôtes
                    </h2>
                    <div className="space-y-4">
                        {hostSteps.map(({ step, title, desc }) => (
                            <div
                                key={step}
                                className="flex items-start gap-5 rounded-2xl border border-border bg-background p-6"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <span className="font-display font-bold text-primary">
                                        {step}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-display mb-1 font-semibold text-foreground">
                                        {title}
                                    </h3>
                                    <p className="font-body text-sm leading-relaxed text-muted-foreground">
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto max-w-4xl px-6 py-16 text-center">
                <h2 className="font-display mb-4 text-2xl font-bold text-foreground">
                    Prêt à commencer ?
                </h2>
                <p className="font-body mb-8 text-muted-foreground">
                    Rejoignez des milliers de voyageurs et d'hôtes sur
                    Residotel.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link
                        href="/search"
                        className="font-body inline-flex h-12 items-center justify-center rounded-xl bg-gradient-coral px-8 font-semibold text-white shadow-hero transition-opacity hover:opacity-90"
                    >
                        Rechercher un logement
                    </Link>
                    <Link
                        href="/dashboard"
                        className="font-body inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 font-semibold text-foreground transition-colors hover:bg-muted/50"
                    >
                        Devenir hôte
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
