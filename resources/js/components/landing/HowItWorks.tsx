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
        desc: 'Parcourez des milliers de logements vérifiés selon votre destination et budget.',
    },
    {
        icon: CalendarCheck,
        title: 'Réservez',
        desc: 'Réservez en quelques clics avec paiement sécurisé et confirmation instantanée.',
    },
    {
        icon: Home,
        title: 'Séjournez',
        desc: 'Profitez de votre logement avec le support 24/7 de Residotel.',
    },
];

const hostSteps = [
    {
        icon: PlusCircle,
        title: 'Inscrivez votre bien',
        desc: 'Créez votre annonce facilement avec photos, description et tarifs.',
    },
    {
        icon: BadgeCheck,
        title: 'Certification',
        desc: 'Residotel vérifie votre propriété pour attirer plus de voyageurs.',
    },
    {
        icon: Banknote,
        title: 'Encaissez',
        desc: 'Recevez vos paiements de façon sécurisée. Gérez tout depuis votre dashboard.',
    },
];

export default function HowItWorks() {
    return (
        <section className="bg-background py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                        Comment ça marche
                    </h2>
                    <p className="font-body mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        Que vous soyez voyageur ou hôte, tout est simple.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Travelers */}
                    <div className="rounded-2xl border border-border bg-card p-8">
                        <h3 className="font-display mb-6 text-lg text-foreground">
                            Pour les voyageurs
                        </h3>
                        <div className="space-y-6">
                            {travelerSteps.map((step, i) => (
                                <div key={step.title} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground">
                                            <step.icon className="h-5 w-5 text-primary-foreground" />
                                        </div>
                                        {i < travelerSteps.length - 1 && (
                                            <div className="my-2 w-px flex-1 bg-border" />
                                        )}
                                    </div>
                                    <div className="pb-1">
                                        <h4 className="font-body mb-1 text-sm font-semibold text-foreground">
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

                    {/* Hosts */}
                    <div className="rounded-2xl border border-border bg-card p-8">
                        <h3 className="font-display mb-6 text-lg text-foreground">
                            Pour les hôtes
                        </h3>
                        <div className="space-y-6">
                            {hostSteps.map((step, i) => (
                                <div key={step.title} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                                            <step.icon className="h-5 w-5 text-accent-foreground" />
                                        </div>
                                        {i < hostSteps.length - 1 && (
                                            <div className="my-2 w-px flex-1 bg-border" />
                                        )}
                                    </div>
                                    <div className="pb-1">
                                        <h4 className="font-body mb-1 text-sm font-semibold text-foreground">
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
