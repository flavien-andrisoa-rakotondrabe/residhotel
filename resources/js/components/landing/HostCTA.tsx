import { Link } from '@inertiajs/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const perks = [
    'Inscription gratuite, sans engagement',
    'Certification pour plus de visibilité',
    'Paiements sécurisés et garantis',
    'Tableau de bord de gestion complet',
    'Assistance dédiée 24/7',
    'Assurance voyageurs incluse',
];

export default function HostCTA() {
    return (
        <section className="bg-foreground py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    {/* Left content */}
                    <div>
                        <h2 className="font-display text-3xl leading-tight tracking-tight text-primary-foreground md:text-4xl">
                            Transformez votre bien en
                            <span className="text-accent">
                                {' '}
                                source de revenus
                            </span>
                        </h2>
                        <p className="font-body mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/60">
                            Rejoignez plus de 500 hôtes certifiés sur Residotel
                            et encaissez de façon sécurisée chaque mois.
                        </p>

                        <ul className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {perks.map((perk) => (
                                <li
                                    key={perk}
                                    className="flex items-start gap-2"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                    <span className="font-body text-sm text-primary-foreground/80">
                                        {perk}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href="/dashboard">
                                <Button className="font-body rounded-xl bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90">
                                    Devenir hôte gratuitement
                                </Button>
                            </Link>
                            <Link href="/search">
                                <Button
                                    variant="ghost"
                                    className="font-body gap-1 rounded-xl font-medium text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                                >
                                    Explorer les annonces{' '}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right stats */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            {
                                value: '1 850€',
                                label: 'Revenus mensuels',
                                sub: 'en moyenne par hôte',
                            },
                            {
                                value: '500+',
                                label: 'Hôtes certifiés',
                                sub: 'dans 50 pays',
                            },
                            {
                                value: '72h',
                                label: 'Mise en ligne',
                                sub: 'pour votre 1ère annonce',
                            },
                            {
                                value: '98%',
                                label: 'Satisfaction',
                                sub: 'de nos hôtes',
                            },
                        ].map((m) => (
                            <div
                                key={m.label}
                                className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-5"
                            >
                                <p className="font-display text-2xl text-accent">
                                    {m.value}
                                </p>
                                <p className="font-body mt-1 text-sm font-medium text-primary-foreground">
                                    {m.label}
                                </p>
                                <p className="font-body mt-0.5 text-xs text-primary-foreground/50">
                                    {m.sub}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
