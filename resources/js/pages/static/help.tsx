import { Link } from '@inertiajs/react';
import {
    ChevronRight,
    Search,
    Home,
    CreditCard,
    CalendarX,
    ShieldCheck,
    User,
    HelpCircle,
} from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import { Input } from '@/components/ui/input';

const categories = [
    {
        icon: Home,
        title: 'Réservations',
        items: [
            {
                q: 'Comment réserver un logement ?',
                a: "Recherchez un logement, sélectionnez vos dates et cliquez sur « Réserver ». Vous serez guidé étape par étape jusqu'au paiement sécurisé.",
            },
            {
                q: 'Comment modifier ma réservation ?',
                a: "Rendez-vous dans votre tableau de bord, onglet « Réservations ». Vous pouvez modifier les dates ou le nombre de voyageurs selon la politique de l'hôte.",
            },
            {
                q: 'Où trouver ma confirmation ?',
                a: 'Un email de confirmation vous est envoyé automatiquement. Vous retrouverez aussi tous les détails dans votre espace « Mes réservations ».',
            },
        ],
    },
    {
        icon: CreditCard,
        title: 'Paiements',
        items: [
            {
                q: 'Quels moyens de paiement sont acceptés ?',
                a: 'Nous acceptons les cartes Visa, Mastercard et American Express via notre prestataire sécurisé Stripe.',
            },
            {
                q: 'Quand suis-je débité ?',
                a: 'Le montant total est débité au moment de la confirmation de la réservation.',
            },
            {
                q: 'Comment obtenir une facture ?',
                a: 'Les factures sont disponibles dans votre tableau de bord, section « Paiements ». Vous pouvez les télécharger au format PDF.',
            },
        ],
    },
    {
        icon: CalendarX,
        title: 'Annulations',
        items: [
            {
                q: 'Comment annuler ma réservation ?',
                a: "Depuis votre tableau de bord, cliquez sur la réservation concernée puis sur « Annuler ». Le remboursement dépend de la politique d'annulation de l'hôte.",
            },
            {
                q: 'Quand suis-je remboursé ?',
                a: 'Les remboursements sont traités sous 5 à 10 jours ouvrés selon votre banque.',
            },
        ],
    },
    {
        icon: ShieldCheck,
        title: 'Sécurité',
        items: [
            {
                q: 'Mes données sont-elles protégées ?',
                a: 'Oui. Nous utilisons le chiffrement SSL et ne stockons jamais vos données bancaires. Consultez notre politique de confidentialité pour plus de détails.',
            },
            {
                q: 'Comment signaler un problème ?',
                a: "Utilisez le bouton « Signaler » sur l'annonce ou le profil concerné, ou contactez-nous directement par email.",
            },
        ],
    },
    {
        icon: User,
        title: 'Mon compte',
        items: [
            {
                q: 'Comment modifier mes informations personnelles ?',
                a: 'Rendez-vous dans votre profil accessible depuis le menu utilisateur en haut à droite de la page.',
            },
            {
                q: 'Comment supprimer mon compte ?',
                a: "Envoyez un email à contact@residotel.com avec l'objet « Suppression de compte ». Votre demande sera traitée sous 48h.",
            },
        ],
    },
];

export default function HelpCenterPage() {
    const [search, setSearch] = useState('');
    const [openCat, setOpenCat] = useState<string | null>(null);

    const filtered = categories
        .map((cat) => ({
            ...cat,
            items: cat.items.filter(
                (i) =>
                    !search ||
                    i.q.toLowerCase().includes(search.toLowerCase()) ||
                    i.a.toLowerCase().includes(search.toLowerCase()),
            ),
        }))
        .filter((cat) => cat.items.length > 0);

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
                            Centre d'aide
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Centre d'aide
                    </h1>
                    <p className="font-body mx-auto mb-8 max-w-xl text-base text-muted-foreground">
                        Comment pouvons-nous vous aider ?
                    </p>
                    <div className="relative mx-auto max-w-md">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="search"
                            type="text"
                            placeholder="Rechercher une question…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="font-body h-12 w-full rounded-xl border border-border bg-background text-sm ring-offset-2 transition-colors focus-visible:border-border/50 focus-visible:bg-card focus-visible:ring-2"
                            style={{
                                paddingLeft: '2.75rem',
                                paddingRight: '1rem',
                            }}
                        />
                    </div>
                </div>
            </div>

            <section
                className="container mx-auto px-6 py-12"
                style={{ maxWidth: '56rem' }}
            >
                {filtered.length === 0 && (
                    <p className="font-body py-12 text-center text-muted-foreground">
                        Aucun résultat pour « {search} ». Essayez un autre terme
                        ou contactez-nous.
                    </p>
                )}
                <div className="space-y-6">
                    {filtered.map(({ icon: Icon, title, items }) => (
                        <div key={title}>
                            <button
                                onClick={() =>
                                    setOpenCat(openCat === title ? null : title)
                                }
                                className="mb-3 flex w-full items-center gap-3 text-left"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-4.5 w-4.5 text-primary" />
                                </div>
                                <h2 className="font-display text-lg font-bold text-foreground">
                                    {title}
                                </h2>
                                <ChevronRight
                                    className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${openCat === title ? 'rotate-90' : ''}`}
                                />
                            </button>
                            {(openCat === title || search) && (
                                <div className="mb-4 space-y-3 pl-12">
                                    {items.map(({ q, a }) => (
                                        <div
                                            key={q}
                                            className="rounded-2xl border border-border bg-muted/30 p-5"
                                        >
                                            <h3 className="font-display mb-2 text-sm font-semibold text-foreground">
                                                {q}
                                            </h3>
                                            <p className="font-body text-sm leading-relaxed text-muted-foreground">
                                                {a}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className="border-y border-border bg-muted/30 py-12">
                <div className="container mx-auto max-w-4xl px-6 text-center">
                    <HelpCircle className="mx-auto mb-4 h-8 w-8 text-primary" />
                    <h2 className="font-display mb-2 text-xl font-bold text-foreground">
                        Besoin d'aide supplémentaire ?
                    </h2>
                    <p className="font-body mb-6 text-sm text-muted-foreground">
                        Notre équipe support vous répond sous 24h.
                    </p>
                    <a
                        href="mailto:contact@residotel.com"
                        className="font-body inline-flex h-12 items-center justify-center rounded-xl bg-gradient-coral px-8 font-semibold text-white shadow-hero transition-opacity hover:opacity-90"
                    >
                        Nous contacter
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}
