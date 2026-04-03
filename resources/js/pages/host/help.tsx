import { Link } from '@inertiajs/react';
import {
    ChevronRight,
    HelpCircle,
    BookOpen,
    MessageCircle,
    FileText,
    CreditCard,
    Shield,
} from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const topics = [
    {
        icon: BookOpen,
        title: 'Créer une annonce',
        desc: 'Apprenez à créer une annonce attractive avec de belles photos, une description percutante et un prix compétitif.',
        link: '/comment-ca-marche',
    },
    {
        icon: CreditCard,
        title: 'Paiements et reversements',
        desc: 'Comprenez comment fonctionnent les paiements, les commissions et les versements sur votre compte bancaire.',
        link: '/legal#cgv',
    },
    {
        icon: Shield,
        title: 'Assurance et garanties',
        desc: 'Découvrez les protections offertes par Residotel en cas de dommages ou de litige avec un voyageur.',
        link: '/assurance',
    },
    {
        icon: FileText,
        title: 'Fiscalité et réglementation',
        desc: "Informez-vous sur vos obligations fiscales et réglementaires en tant qu'hôte de location courte durée.",
        link: '/legal#conditions-hotes',
    },
    {
        icon: MessageCircle,
        title: 'Communication voyageurs',
        desc: 'Conseils pour une communication efficace avec vos voyageurs avant, pendant et après leur séjour.',
        link: '#',
    },
    {
        icon: HelpCircle,
        title: 'Résolution de problèmes',
        desc: 'Un problème avec un voyageur ou une réservation ? Suivez nos guides pour trouver une solution rapidement.',
        link: '/aide',
    },
];

const faqs = [
    {
        q: 'Comment fixer le bon prix pour mon logement ?',
        a: 'Consultez les annonces similaires dans votre zone pour vous situer. Residotel affiche les prix moyens de votre quartier dans votre tableau de bord hôte.',
    },
    {
        q: 'Quand suis-je payé après une réservation ?',
        a: "Le paiement est viré sur votre compte bancaire 24h après le check-in du voyageur, sous réserve qu'aucun litige ne soit ouvert.",
    },
    {
        q: 'Comment gérer une annulation ?',
        a: "Vous pouvez définir votre politique d'annulation (flexible, modérée ou stricte) dans les paramètres de votre annonce.",
    },
    {
        q: 'Que faire en cas de dommages dans mon logement ?',
        a: 'Ouvrez un litige depuis votre tableau de bord dans les 48h suivant le départ du voyageur. Notre équipe médiation interviendra.',
    },
];

export default function HostHelpPage() {
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
                            Aide hôtes
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Aide pour les hôtes
                    </h1>
                    <p className="font-body mx-auto max-w-xl text-base text-muted-foreground">
                        Tout ce dont vous avez besoin pour réussir en tant
                        qu'hôte sur Residotel.
                    </p>
                </div>
            </div>

            <section className="container mx-auto max-w-4xl px-6 py-16">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {topics.map(({ icon: Icon, title, desc, link }) => (
                        <Link
                            href={link}
                            key={title}
                            className="group rounded-2xl border border-border bg-muted/30 p-6 transition-shadow hover:shadow-hero"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-display mb-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                                {title}
                            </h3>
                            <p className="font-body text-sm leading-relaxed text-muted-foreground">
                                {desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="border-y border-border bg-muted/30 py-16">
                <div className="container mx-auto max-w-3xl px-6">
                    <h2 className="font-display mb-8 text-center text-2xl font-bold text-foreground">
                        Questions fréquentes
                    </h2>
                    <div className="space-y-4">
                        {faqs.map(({ q, a }) => (
                            <div
                                key={q}
                                className="rounded-2xl border border-border bg-background p-5"
                            >
                                <h3 className="font-display mb-2 font-semibold text-foreground">
                                    {q}
                                </h3>
                                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                                    {a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container mx-auto max-w-4xl px-6 py-16 text-center">
                <p className="font-body mb-4 text-muted-foreground">
                    Vous n'avez pas trouvé votre réponse ?
                </p>
                <a
                    href="mailto:hotes@residotel.com"
                    className="font-body inline-flex h-12 items-center justify-center rounded-xl bg-gradient-coral px-8 font-semibold text-white shadow-hero transition-opacity hover:opacity-90"
                >
                    Contacter le support hôtes
                </a>
            </section>

            <Footer />
        </div>
    );
}
