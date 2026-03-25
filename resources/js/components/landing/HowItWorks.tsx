import {
    Search,
    CalendarCheck,
    Home,
    PlusCircle,
    BadgeCheck,
    Banknote,
} from 'lucide-react';

const travelerSteps = [
    {
        icon: Search,
        title: 'Recherchez',
        desc: 'Parcourez des milliers de propriétés vérifiées par Residotel selon votre destination, dates et budget.',
    },
    {
        icon: CalendarCheck,
        title: 'Réservez',
        desc: 'Réservez en quelques clics avec paiement sécurisé. Confirmez votre séjour instantanément.',
    },
    {
        icon: Home,
        title: 'Séjournez',
        desc: "Profitez de votre hébergement avec l'assurance et le support 24/7 de Residotel à vos côtés.",
    },
];

const hostSteps = [
    {
        icon: PlusCircle,
        title: 'Inscrivez votre bien',
        desc: 'Créez votre annonce facilement avec photos, description et tarifs. Nous vous accompagnons.',
    },
    {
        icon: BadgeCheck,
        title: 'Obtenez la certification',
        desc: 'Residotel vérifie votre propriété et vous attribue un badge de confiance pour attirer plus de voyageurs.',
    },
    {
        icon: Banknote,
        title: 'Encaissez vos revenus',
        desc: 'Recevez vos paiements de façon sécurisée et ponctuelle. Gérez tout depuis votre tableau de bord.',
    },
];

export default function HowItWorks() {
    return (
        <section className="bg-background-fix py-24">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-16 text-center">
                    <span className="font-body text-sm font-semibold tracking-widest text-accent uppercase">
                        Simple & transparent
                    </span>
                    <h2 className="font-display mt-2 text-4xl leading-tight font-bold text-foreground-fix md:text-5xl">
                        Comment ça marche ?
                    </h2>
                    <p className="font-body mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                        Que vous soyez voyageur ou hôte, Residotel simplifie
                        chaque étape de votre expérience.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Traveler */}
                    <div className="rounded-3xl border border-secondary-fix bg-secondary-fix/40 p-8">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand">
                                <Search className="h-5 w-5 text-primary-foreground-fix" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-primary-fix">
                                Pour les voyageurs
                            </h3>
                        </div>
                        <div className="space-y-8">
                            {travelerSteps.map((step, i) => (
                                <div key={step.title} className="flex gap-5">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fix shadow-md">
                                            <step.icon className="h-5 w-5 text-primary-foreground-fix" />
                                        </div>
                                        {i < travelerSteps.length - 1 && (
                                            <div className="my-2 min-h-[24px] w-px flex-1 bg-primary-fix/20" />
                                        )}
                                    </div>
                                    <div className="pb-2">
                                        <h4 className="font-display mb-1 text-lg font-semibold text-foreground">
                                            {step.title}
                                        </h4>
                                        <p className="font-body text-sm leading-relaxed text-muted-foreground">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Host */}
                    <div className="rounded-3xl border border-accent/20 bg-amber-50/60 p-8">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-amber">
                                <Home className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-foreground">
                                Pour les hôtes
                            </h3>
                        </div>
                        <div className="space-y-8">
                            {hostSteps.map((step, i) => (
                                <div key={step.title} className="flex gap-5">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-amber shadow-md">
                                            <step.icon className="h-5 w-5 text-white" />
                                        </div>
                                        {i < hostSteps.length - 1 && (
                                            <div className="my-2 min-h-[24px] w-px flex-1 bg-accent/25" />
                                        )}
                                    </div>
                                    <div className="pb-2">
                                        <h4 className="font-display mb-1 text-lg font-semibold text-foreground">
                                            {step.title}
                                        </h4>
                                        <p className="font-body text-sm leading-relaxed text-muted-foreground">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
