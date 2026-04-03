import { Link } from '@inertiajs/react';
import {
    ChevronRight,
    BadgeCheck,
    Camera,
    FileCheck,
    Star,
} from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const steps = [
    {
        icon: FileCheck,
        title: "Vérification d'identité",
        desc: "Chaque hôte fournit une pièce d'identité valide qui est vérifiée par notre équipe avant toute publication d'annonce.",
    },
    {
        icon: Camera,
        title: 'Photos vérifiées',
        desc: 'Nos équipes peuvent vérifier la conformité des photos avec le logement réel pour garantir la transparence des annonces.',
    },
    {
        icon: Star,
        title: 'Avis authentiques',
        desc: 'Seuls les voyageurs ayant effectivement séjourné dans un logement peuvent laisser un avis. Aucun faux commentaire ne passe.',
    },
    {
        icon: BadgeCheck,
        title: 'Badge Certifié',
        desc: 'Les hôtes répondant à tous les critères de qualité reçoivent le badge « Certifié Residotel » visible sur leur annonce.',
    },
];

const criteria = [
    'Taux de réponse supérieur à 90%',
    "Note moyenne d'au moins 4.5/5",
    'Aucune annulation hôte sur les 6 derniers mois',
    'Logement conforme aux photos et à la description',
    'Respect des standards de propreté Residotel',
];

export default function CertificationPage() {
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
                            Certification
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Programme de certification
                    </h1>
                    <p className="font-body mx-auto max-w-xl text-base text-muted-foreground">
                        Notre programme garantit des logements de qualité et des
                        hôtes de confiance pour chaque séjour.
                    </p>
                </div>
            </div>

            <section className="container mx-auto max-w-4xl px-6 py-16">
                <h2 className="font-display mb-10 text-center text-2xl font-bold text-foreground">
                    Comment ça fonctionne
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                    {steps.map(({ icon: Icon, title, desc }) => (
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
                <div className="container mx-auto max-w-4xl px-6">
                    <h2 className="font-display mb-8 text-center text-2xl font-bold text-foreground">
                        Critères de certification
                    </h2>
                    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-background p-6">
                        <ul className="space-y-3">
                            {criteria.map((c) => (
                                <li key={c} className="flex items-start gap-3">
                                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <span className="font-body text-sm text-muted-foreground">
                                        {c}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="container mx-auto max-w-4xl px-6 py-16 text-center">
                <h2 className="font-display mb-4 text-2xl font-bold text-foreground">
                    Vous êtes hôte ?
                </h2>
                <p className="font-body mb-8 text-muted-foreground">
                    Rejoignez le programme de certification et augmentez la
                    visibilité de vos annonces.
                </p>
                <Link
                    href="/dashboard"
                    className="font-body inline-flex h-12 items-center justify-center rounded-xl bg-gradient-coral px-8 font-semibold text-white shadow-hero transition-opacity hover:opacity-90"
                >
                    Accéder à mon espace hôte
                </Link>
            </section>

            <Footer />
        </div>
    );
}
