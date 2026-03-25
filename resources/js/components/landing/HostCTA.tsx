import { Link } from '@inertiajs/react';
import {
    CheckCircle2,
    TrendingUp,
    Clock,
    Users,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const perks = [
    'Inscription gratuite et sans engagement',
    'Certification Residotel pour plus de visibilité',
    'Paiements sécurisés et garantis',
    'Tableau de bord de gestion complet',
    'Assistance dédiée 24h/24 et 7j/7',
    'Couverture assurance voyageurs incluse',
];

const metrics = [
    {
        icon: TrendingUp,
        value: '1 850€',
        label: 'Revenus mensuels moyens',
        sub: 'par hôte actif',
    },
    {
        icon: Users,
        value: '500+',
        label: 'Hôtes certifiés actifs',
        sub: 'dans 50 pays',
    },
    {
        icon: Clock,
        value: '72h',
        label: 'Pour votre 1ère annonce',
        sub: 'mise en ligne garantie',
    },
];

export default function HostCTA() {
    return (
        <section className="relative overflow-hidden bg-muted-fix py-24">
            {/* Subtle texture */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-accent-fix/[0.06] blur-3xl" />
                <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-primary-fix/[0.06] blur-3xl" />
            </div>

            <div className="relative container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        <span className="font-body text-xs font-semibold tracking-widest text-accent uppercase">
                            Rejoignez la communauté
                        </span>
                    </div>
                    <h2 className="font-display mx-auto max-w-3xl text-4xl leading-tight font-bold text-foreground-fix md:text-[56px]">
                        Transformez votre bien en{' '}
                        <span className="text-accent italic">
                            source de revenus
                        </span>
                    </h2>
                    <p className="font-body mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                        Rejoignez plus de 500 hôtes certifiés sur Residotel et
                        encaissez de façon sécurisée chaque mois.
                    </p>
                </div>

                {/* Metrics */}
                <div className="mx-auto mb-10 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
                    {metrics.map(({ icon: Icon, value, label, sub }) => (
                        <div
                            key={label}
                            className="bg-card-fix rounded-2xl border border-border p-6 text-center shadow-card transition-all hover:border-primary/20 hover:shadow-hero"
                        >
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                                <Icon className="h-5 w-5 text-primary-fix" />
                            </div>
                            <p className="font-display mb-1 text-3xl font-bold text-accent">
                                {value}
                            </p>
                            <p className="font-body text-sm font-semibold text-foreground-fix">
                                {label}
                            </p>
                            <p className="font-body mt-0.5 text-xs text-muted-foreground-fix">
                                {sub}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main CTA card */}
                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-fix via-primary-fix to-primary-fix/90 shadow-hero">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left: features */}
                        <div className="p-8 md:p-12">
                            <h3 className="font-display mb-6 text-2xl leading-tight font-bold text-primary-foreground-fix md:text-3xl">
                                Tout ce dont vous avez besoin pour réussir en
                                tant qu'hôte
                            </h3>
                            <ul className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {perks.map((perk) => (
                                    <li
                                        key={perk}
                                        className="flex items-start gap-2.5"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent-fix" />
                                        <span className="font-body text-sm text-primary-foreground-fix/80">
                                            {perk}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link href="/dashboard">
                                    <Button
                                        size="lg"
                                        className="font-body gap-2 border-0 bg-gradient-amber text-base font-bold text-white shadow-md hover:opacity-90"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Devenir hôte gratuitement
                                    </Button>
                                </Link>
                                <Link href="/search">
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        className="font-body gap-2 font-semibold text-primary-foreground-fix/80 hover:bg-white/10 hover:text-white"
                                    >
                                        Explorer les annonces{' '}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right: visual panel */}
                        <div className="relative flex flex-col justify-center gap-6 border-l border-white/10 bg-white/[0.06] p-8 md:p-12">
                            {/* Animated income preview */}
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                                <p className="font-body mb-3 text-xs font-semibold tracking-widest text-white/60 uppercase">
                                    Revenus estimés / mois
                                </p>
                                <div className="space-y-3">
                                    {[
                                        {
                                            label: 'Studio Paris',
                                            nights: 18,
                                            price: 85,
                                            color: 'bg-accent-fix',
                                        },
                                        {
                                            label: "Villa Côte d'Azur",
                                            nights: 12,
                                            price: 320,
                                            color: 'bg-primary-foreground-fix/40',
                                        },
                                        {
                                            label: 'Appartement Lyon',
                                            nights: 22,
                                            price: 65,
                                            color: 'bg-accent-fix/70',
                                        },
                                    ].map(({ label, nights, price, color }) => {
                                        const total = nights * price;
                                        const pct = Math.min(
                                            100,
                                            Math.round((total / 5000) * 100),
                                        );

                                        return (
                                            <div key={label}>
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="font-body text-xs text-white/80">
                                                        {label}
                                                    </span>
                                                    <span className="font-display text-sm font-bold text-white">
                                                        {total.toLocaleString(
                                                            'fr-FR',
                                                        )}{' '}
                                                        €
                                                    </span>
                                                </div>
                                                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                                    <div
                                                        className={`${color} h-full rounded-full`}
                                                        style={{
                                                            width: `${pct}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="font-body mt-0.5 text-[10px] text-white/35">
                                                    {nights} nuits × {price} €
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Social proof pill */}
                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3">
                                <div className="flex -space-x-2">
                                    {['SL', 'KB', 'MC', 'TM'].map((init, i) => (
                                        <div
                                            key={i}
                                            className="font-display flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-gradient-amber text-[10px] font-bold text-white"
                                        >
                                            {init}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="font-body text-xs font-semibold text-white">
                                        +12 hôtes rejoints cette semaine
                                    </p>
                                    <p className="font-body text-[10px] text-white/50">
                                        Inscription gratuite · Aucune commission
                                        cachée
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
