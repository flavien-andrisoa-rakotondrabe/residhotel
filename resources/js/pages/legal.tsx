import { Link } from '@inertiajs/react';
import { ChevronRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

// ── Section data ──────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'mentions-legales', label: 'Mentions légales' },
    { id: 'cgu', label: 'CGU' },
    { id: 'cgv', label: 'CGV' },
    { id: 'confidentialite', label: 'Confidentialité' },
    { id: 'annulation', label: 'Annulation' },
    { id: 'caution', label: 'Caution' },
    { id: 'litiges', label: 'Litiges' },
    { id: 'conditions-hotes', label: 'Conditions hôtes' },
    { id: 'conditions-voyageurs', label: 'Conditions voyageurs' },
    { id: 'contact', label: 'Contact' },
];

// ── Small helpers ─────────────────────────────────────────────────────────
function H1({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="font-display mb-6 border-b border-border pb-3 text-2xl font-bold text-foreground">
            {children}
        </h2>
    );
}
function H2({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="font-display mt-8 mb-3 text-lg font-semibold text-foreground">
            {children}
        </h3>
    );
}
function P({ children }: { children: React.ReactNode }) {
    return (
        <p className="font-body mb-3 text-sm leading-relaxed text-muted-foreground">
            {children}
        </p>
    );
}
function UL({ items }: { items: string[] }) {
    return (
        <ul className="mb-4 space-y-1.5 pl-5">
            {items.map((item) => (
                <li
                    key={item}
                    className="font-body list-disc text-sm leading-relaxed text-muted-foreground"
                >
                    {item}
                </li>
            ))}
        </ul>
    );
}
function Section({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <section id={id} className="mb-16 scroll-mt-28">
            {children}
        </section>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function LegalPage() {
    const [active, setActive] = useState('mentions-legales');
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Track active section via IntersectionObserver
    useEffect(() => {
        const headings = SECTIONS.map(({ id }) =>
            document.getElementById(id),
        ).filter(Boolean);
        observerRef.current?.disconnect();
        observerRef.current = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting);

                if (visible.length > 0) {
                    setActive(visible[0].target.id);
                }
            },
            { rootMargin: '-20% 0px -70% 0px' },
        );
        headings.forEach((h) => h && observerRef.current?.observe(h));

        return () => observerRef.current?.disconnect();
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setActive(id);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero band */}
            <div className="border-b border-border bg-primary/5 px-6 pt-24 pb-10">
                <div className="container mx-auto max-w-6xl">
                    <div className="font-body mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground"
                        >
                            Accueil
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-medium text-foreground">
                            Informations légales
                        </span>
                    </div>
                    <h1 className="font-display mb-2 text-4xl font-bold text-foreground">
                        Informations légales
                    </h1>
                    <p className="font-body text-sm text-muted-foreground">
                        Mentions légales, CGU, CGV, confidentialité et plus
                        encore.
                    </p>
                    <p className="font-body mt-2 text-xs text-muted-foreground">
                        Dernière mise à jour : mars 2025 · Qolium SASU
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-6 py-12">
                <div className="flex gap-10">
                    {/* ── Sticky sidebar ── */}
                    <aside className="hidden w-56 shrink-0 lg:block">
                        <div className="sticky top-28">
                            <Link
                                href="/"
                                className="font-body mb-6 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Retour à
                                l'accueil
                            </Link>
                            <p className="font-body mb-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                                Sections
                            </p>
                            <nav className="space-y-0.5">
                                {SECTIONS.map(({ id, label }) => (
                                    <button
                                        key={id}
                                        onClick={() => scrollTo(id)}
                                        className={`font-body w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                                            active === id
                                                ? 'bg-primary/10 font-semibold text-primary'
                                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* ── Content ── */}
                    <main className="min-w-0 flex-1">
                        {/* ── Mentions légales ── */}
                        <Section id="mentions-legales">
                            <H1>Mentions légales</H1>
                            <H2>Éditeur du site</H2>
                            <P>Le site Residotel est édité par :</P>
                            <div className="font-body mb-6 space-y-1 rounded-xl border border-border bg-muted/40 p-5 text-sm leading-relaxed text-foreground">
                                <p className="font-semibold">Qolium SASU</p>
                                <p className="text-muted-foreground">
                                    Société par actions simplifiée
                                    unipersonnelle au capital de 250 000 €
                                </p>
                                <p className="text-muted-foreground">
                                    RCS Nanterre : 991 607 656
                                </p>
                                <p className="text-muted-foreground">
                                    TVA intracommunautaire : FR14991607656
                                </p>
                                <p className="mt-2 text-muted-foreground">
                                    144 avenue Charles de Gaulle
                                    <br />
                                    92200 Neuilly-sur-Seine – France
                                </p>
                                <p className="text-muted-foreground">
                                    Représentée par son Président en exercice
                                </p>
                                <p className="text-muted-foreground">
                                    La marque{' '}
                                    <strong className="text-foreground">
                                        Residotel
                                    </strong>{' '}
                                    est exploitée par Qolium SASU
                                </p>
                                <p className="text-muted-foreground">
                                    Contact :{' '}
                                    <a
                                        href="mailto:contact@residotel.com"
                                        className="text-primary hover:underline"
                                    >
                                        contact@residotel.com
                                    </a>
                                </p>
                            </div>

                            <H2>Hébergement</H2>
                            <div className="font-body mb-6 space-y-1 rounded-xl border border-border bg-muted/40 p-5 text-sm text-foreground">
                                <p className="font-semibold">o2switch</p>
                                <p className="text-muted-foreground">
                                    Chemin des Pardiaux
                                    <br />
                                    63000 Clermont-Ferrand – France
                                </p>
                                <p className="text-muted-foreground">
                                    Téléphone : 04 44 44 60 40
                                </p>
                            </div>

                            <H2>Propriété intellectuelle</H2>
                            <P>
                                L'ensemble du site (textes, images, logos,
                                design, code) est protégé. Toute reproduction
                                sans autorisation est interdite.
                            </P>

                            <H2>Responsabilité</H2>
                            <P>
                                Qolium SASU ne garantit pas l'exactitude ou
                                l'exhaustivité des informations. L'utilisateur
                                utilise le site sous sa propre responsabilité.
                            </P>

                            <H2>Droit applicable</H2>
                            <P>Droit français.</P>
                        </Section>

                        {/* ── CGU ── */}
                        <Section id="cgu">
                            <H1>Conditions Générales d'Utilisation (CGU)</H1>

                            <H2>1. Objet</H2>
                            <P>
                                Les présentes CGU régissent l'utilisation de la
                                plateforme Residotel. Residotel est une
                                plateforme de mise en relation entre des hôtes
                                et des voyageurs.
                            </P>

                            <H2>2. Rôle de la plateforme</H2>
                            <P>
                                Residotel agit comme intermédiaire technique.
                                Qolium SASU :
                            </P>
                            <UL
                                items={[
                                    'ne possède pas les logements',
                                    "n'est pas partie au contrat de location",
                                    "n'intervient pas dans la relation contractuelle",
                                ]}
                            />
                            <P>
                                Le contrat est conclu directement entre l'hôte
                                et le voyageur.
                            </P>

                            <H2>3. Création de compte</H2>
                            <P>L'utilisateur doit :</P>
                            <UL
                                items={[
                                    'fournir des informations exactes',
                                    'sécuriser ses identifiants',
                                    'être majeur',
                                ]}
                            />

                            <H2>4. Fonctionnement</H2>
                            <P>La plateforme permet :</P>
                            <UL
                                items={[
                                    "la publication d'annonces",
                                    'la réservation en ligne',
                                    'la mise en relation',
                                ]}
                            />

                            <H2>5. Réservations</H2>
                            <P>Toute réservation implique l'acceptation :</P>
                            <UL
                                items={[
                                    'du prix affiché',
                                    "des conditions de l'hôte",
                                    "de la politique d'annulation",
                                ]}
                            />

                            <H2>6. Paiements</H2>
                            <P>
                                Les paiements sont traités via des prestataires
                                sécurisés. Residotel peut percevoir une
                                commission voyageur et une commission hôte.
                            </P>

                            <H2>7. Obligations des utilisateurs</H2>
                            <p className="font-body mb-1 text-sm font-semibold text-foreground">
                                Hôtes
                            </p>
                            <UL
                                items={[
                                    'informations exactes',
                                    'logement conforme',
                                    'respect des lois locales',
                                ]}
                            />
                            <p className="font-body mb-1 text-sm font-semibold text-foreground">
                                Voyageurs
                            </p>
                            <UL
                                items={[
                                    'respect du logement',
                                    'paiement',
                                    'comportement responsable',
                                ]}
                            />

                            <H2>8. Interdictions</H2>
                            <UL
                                items={[
                                    'contourner la plateforme',
                                    'frauder',
                                    'publier du contenu illégal',
                                ]}
                            />

                            <H2>9. Suspension de compte</H2>
                            <P>
                                Residotel peut suspendre un compte en cas de
                                fraude ou de non-respect des CGU.
                            </P>

                            <H2>10. Responsabilité</H2>
                            <P>
                                Qolium SASU n'est pas responsable des séjours,
                                des dommages ou des litiges entre utilisateurs.
                            </P>

                            <H2>11. Droit applicable</H2>
                            <P>Droit français.</P>
                        </Section>

                        {/* ── CGV ── */}
                        <Section id="cgv">
                            <H1>Conditions Générales de Vente (CGV)</H1>

                            <H2>1. Objet</H2>
                            <P>
                                Les CGV encadrent les transactions réalisées via
                                Residotel.
                            </P>

                            <H2>2. Prix</H2>
                            <P>
                                Les prix sont fixés par les hôtes. Residotel
                                peut ajouter des frais de service.
                            </P>

                            <H2>3. Paiement</H2>
                            <P>Paiement sécurisé via prestataire externe.</P>

                            <H2>4. Confirmation</H2>
                            <P>
                                La réservation est confirmée après validation du
                                paiement.
                            </P>

                            <H2>5. Commission</H2>
                            <P>
                                Residotel perçoit une commission sur chaque
                                transaction.
                            </P>

                            <H2>6. Litiges</H2>
                            <P>
                                Les litiges doivent être réglés entre hôte et
                                voyageur. Residotel peut intervenir en médiation
                                sans obligation de résultat.
                            </P>

                            <H2>7. Remboursement</H2>
                            <P>
                                Selon la politique d'annulation définie par
                                l'hôte.
                            </P>
                        </Section>

                        {/* ── Confidentialité ── */}
                        <Section id="confidentialite">
                            <H1>Politique de Confidentialité</H1>

                            <H2>1. Données collectées</H2>
                            <UL
                                items={[
                                    'identité',
                                    'email / téléphone',
                                    'données de réservation',
                                    'données techniques',
                                ]}
                            />

                            <H2>2. Utilisation</H2>
                            <UL
                                items={[
                                    'gestion des réservations',
                                    'mise en relation',
                                    'sécurité',
                                    'amélioration du service',
                                ]}
                            />

                            <H2>3. Partage</H2>
                            <UL
                                items={[
                                    'hôtes / voyageurs',
                                    'prestataires de paiement',
                                    'hébergement',
                                ]}
                            />

                            <H2>4. Conservation</H2>
                            <P>
                                Durée nécessaire à l'exécution du service +
                                obligations légales.
                            </P>

                            <H2>5. Droits</H2>
                            <P>
                                Vous disposez des droits d'accès, de
                                rectification et de suppression.
                            </P>
                            <P>
                                Contact :{' '}
                                <a
                                    href="mailto:contact@residotel.com"
                                    className="text-primary hover:underline"
                                >
                                    contact@residotel.com
                                </a>
                            </P>

                            <H2>6. Sécurité</H2>
                            <P>
                                Mesures techniques et organisationnelles mises
                                en œuvre pour protéger vos données.
                            </P>
                        </Section>

                        {/* ── Annulation ── */}
                        <Section id="annulation">
                            <H1>Politique d'Annulation</H1>

                            <H2>1. Principe</H2>
                            <P>
                                Chaque hôte définit ses propres règles
                                d'annulation.
                            </P>

                            <H2>2. Types de politique</H2>
                            <div className="mb-5 grid gap-3 sm:grid-cols-3">
                                {[
                                    {
                                        label: 'Flexible',
                                        color: 'emerald',
                                        desc: 'Remboursement total',
                                    },
                                    {
                                        label: 'Modérée',
                                        color: 'amber',
                                        desc: 'Remboursement partiel',
                                    },
                                    {
                                        label: 'Stricte',
                                        color: 'red',
                                        desc: 'Remboursement limité',
                                    },
                                ].map(({ label, color, desc }) => (
                                    <div
                                        key={label}
                                        className={`rounded-xl border p-4 bg-${color}-50 border-${color}-200`}
                                    >
                                        <p
                                            className={`font-display font-semibold text-${color}-700 mb-1`}
                                        >
                                            {label}
                                        </p>
                                        <p
                                            className={`font-body text-xs text-${color}-600`}
                                        >
                                            {desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <H2>3. Annulation voyageur</H2>
                            <P>Selon les conditions définies dans l'annonce.</P>

                            <H2>4. Annulation hôte</H2>
                            <P>Remboursement intégral au voyageur.</P>

                            <H2>5. Force majeure</H2>
                            <P>
                                Adaptation possible selon les circonstances
                                exceptionnelles.
                            </P>
                        </Section>

                        {/* ── Caution ── */}
                        <Section id="caution">
                            <H1>Politique de Caution</H1>

                            <H2>1. Principe</H2>
                            <P>
                                Une caution peut être exigée par l'hôte pour
                                garantir le séjour.
                            </P>

                            <H2>2. Utilisation</H2>
                            <P>
                                La caution peut être retenue en cas de
                                dégradation ou de non-respect des règles du
                                logement.
                            </P>

                            <H2>3. Gestion</H2>
                            <P>
                                La caution est traitée via le prestataire de
                                paiement partenaire.
                            </P>
                        </Section>

                        {/* ── Litiges ── */}
                        <Section id="litiges">
                            <H1>Gestion des Litiges</H1>

                            <H2>1. Principe</H2>
                            <P>
                                Les litiges sont en premier lieu traités
                                directement entre les utilisateurs concernés.
                            </P>

                            <H2>2. Médiation</H2>
                            <P>
                                Residotel peut intervenir en tant que médiateur
                                sur demande des parties.
                            </P>

                            <H2>3. Limitation</H2>
                            <P>
                                Residotel n'a aucune obligation de résultat dans
                                le cadre de la médiation.
                            </P>
                        </Section>

                        {/* ── Conditions hôtes ── */}
                        <Section id="conditions-hotes">
                            <H1>Conditions Hôtes</H1>
                            <P>Les hôtes s'engagent à :</P>
                            <UL
                                items={[
                                    'respecter la législation en vigueur (déclaration en mairie, bail, etc.)',
                                    'déclarer leurs revenus locatifs conformément aux obligations fiscales',
                                    "garantir un logement conforme à la description de l'annonce",
                                    'répondre aux messages des voyageurs dans des délais raisonnables',
                                ]}
                            />
                        </Section>

                        {/* ── Conditions voyageurs ── */}
                        <Section id="conditions-voyageurs">
                            <H1>Conditions Voyageurs</H1>
                            <P>Les voyageurs s'engagent à :</P>
                            <UL
                                items={[
                                    'respecter les lieux et le règlement intérieur du logement',
                                    'ne pas causer de dommages au bien ou aux équipements',
                                    'respecter le nombre maximum de personnes autorisées',
                                    "libérer le logement à l'heure de départ convenue",
                                ]}
                            />
                        </Section>

                        {/* ── Contact ── */}
                        <Section id="contact">
                            <H1>Contact</H1>
                            <P>
                                Pour toute question relative aux présents
                                documents :
                            </P>
                            <div className="flex flex-col items-start gap-5 rounded-xl border border-border bg-muted/40 p-6 sm:flex-row sm:items-center">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <span className="font-display text-lg font-bold text-primary">
                                        R
                                    </span>
                                </div>
                                <div>
                                    <p className="font-display mb-0.5 font-semibold text-foreground">
                                        Residotel – Qolium SASU
                                    </p>
                                    <a
                                        href="mailto:contact@residotel.com"
                                        className="font-body flex items-center gap-1.5 text-sm text-primary hover:underline"
                                    >
                                        contact@residotel.com
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                    <p className="font-body mt-1 text-xs text-muted-foreground">
                                        144 avenue Charles de Gaulle, 92200
                                        Neuilly-sur-Seine
                                    </p>
                                </div>
                            </div>
                        </Section>
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}
