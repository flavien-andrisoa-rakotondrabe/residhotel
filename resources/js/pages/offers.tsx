import { Link } from '@inertiajs/react';
import { ChevronRight, Tag, Calendar, Percent } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const offers = [
    {
        title: 'Réduction première réservation',
        desc: 'Bénéficiez de -15% sur votre toute première réservation Residotel. Le code promo est appliqué automatiquement à la création de votre compte.',
        badge: '-15%',
        icon: Percent,
    },
    {
        title: 'Séjours longue durée',
        desc: "Pour les séjours de 7 nuits ou plus, de nombreux hôtes proposent des réductions allant jusqu'à -25%. Cherchez le badge « Longue durée » sur les annonces.",
        badge: "Jusqu'à -25%",
        icon: Calendar,
    },
    {
        title: 'Dernière minute',
        desc: 'Profitez de tarifs réduits sur les logements disponibles dans les 48h. Les hôtes ajustent leurs prix pour remplir leurs derniers créneaux.',
        badge: 'Last minute',
        icon: Tag,
    },
];

export default function OffersPage() {
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
                            Offres spéciales
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Offres spéciales
                    </h1>
                    <p className="font-body mx-auto max-w-xl text-base text-muted-foreground">
                        Profitez de réductions exclusives pour vos prochains
                        séjours sur Residotel.
                    </p>
                </div>
            </div>

            <section className="container mx-auto max-w-4xl px-6 py-16">
                <div className="space-y-6">
                    {offers.map(({ title, desc, badge, icon: Icon }) => (
                        <div
                            key={title}
                            className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-muted/30 p-6 sm:flex-row md:p-8"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-3">
                                    <h2 className="font-display text-lg font-bold text-foreground">
                                        {title}
                                    </h2>
                                    <span className="font-body inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                        {badge}
                                    </span>
                                </div>
                                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                                    {desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/search"
                        className="font-body inline-flex h-12 items-center justify-center rounded-xl bg-gradient-coral px-8 font-semibold text-white shadow-hero transition-opacity hover:opacity-90"
                    >
                        Explorer les logements
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
