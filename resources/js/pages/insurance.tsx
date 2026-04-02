import { Link } from '@inertiajs/react';
import {
    ChevronRight,
    ShieldCheck,
    Home,
    Banknote,
    HeartPulse,
} from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const coverages = [
    {
        icon: Home,
        title: 'Protection du logement',
        desc: "En cas de dommages causés au logement pendant le séjour, la garantie Residotel couvre les réparations jusqu'à 50 000 € par sinistre.",
    },
    {
        icon: Banknote,
        title: 'Garantie remboursement',
        desc: "Si votre séjour est annulé par l'hôte ou si le logement n'est pas conforme à l'annonce, vous êtes intégralement remboursé.",
    },
    {
        icon: HeartPulse,
        title: 'Assistance 24/7',
        desc: 'Une urgence pendant votre séjour ? Notre équipe support est disponible 24h/24 et 7j/7 pour vous aider à trouver une solution.',
    },
    {
        icon: ShieldCheck,
        title: 'Paiement sécurisé',
        desc: 'Toutes les transactions passent par Stripe, leader mondial du paiement en ligne. Vos données bancaires ne sont jamais stockées sur nos serveurs.',
    },
];

export default function InsurancePage() {
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
                            Assurance
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Voyagez l'esprit tranquille
                    </h1>
                    <p className="font-body mx-auto max-w-xl text-base text-muted-foreground">
                        Residotel protège chaque réservation avec des garanties
                        complètes pour les voyageurs et les hôtes.
                    </p>
                </div>
            </div>

            <section className="container mx-auto max-w-4xl px-6 py-16">
                <div className="grid gap-6 sm:grid-cols-2">
                    {coverages.map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="rounded-2xl border border-border bg-muted/30 p-6"
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
            </section>

            <section className="border-y border-border bg-muted/30 py-16">
                <div className="container mx-auto max-w-4xl px-6 text-center">
                    <h2 className="font-display mb-4 text-2xl font-bold text-foreground">
                        Des questions sur nos garanties ?
                    </h2>
                    <p className="font-body mx-auto mb-8 max-w-lg text-muted-foreground">
                        Notre équipe est là pour vous répondre. Consultez notre
                        centre d'aide ou contactez-nous directement.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="/help"
                            className="font-body inline-flex h-12 items-center justify-center rounded-xl bg-gradient-coral px-8 font-semibold text-white shadow-hero transition-opacity hover:opacity-90"
                        >
                            Centre d'aide
                        </Link>
                        <a
                            href="mailto:contact@residotel.com"
                            className="font-body inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 font-semibold text-foreground transition-colors hover:bg-muted/50"
                        >
                            Nous contacter
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
