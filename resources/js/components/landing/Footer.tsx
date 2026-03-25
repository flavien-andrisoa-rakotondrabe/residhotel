import { Link } from '@inertiajs/react';
import {
    Globe,
    Phone,
    Mail,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
} from 'lucide-react';

const footerLinks: Record<string, { label: string; href: string }[]> = {
    Residotel: [
        { label: 'À propos de nous', href: '#' },
        { label: 'Comment ça marche', href: '#' },
        { label: 'Blog & actualités', href: '#' },
        { label: 'Presse', href: '#' },
        { label: 'Carrières', href: '#' },
    ],
    Voyageurs: [
        { label: 'Rechercher un séjour', href: '/search' },
        { label: 'Destinations populaires', href: '#' },
        { label: 'Offres spéciales', href: '#' },
        { label: 'Programme fidélité', href: '#' },
        { label: 'Assurance voyageur', href: '#' },
    ],
    Hôtes: [
        { label: 'Devenir hôte', href: '/dashboard' },
        { label: 'Certification Residotel', href: '#' },
        { label: 'Gestion des annonces', href: '/dashboard' },
        { label: 'Revenus & paiements', href: '/dashboard' },
        { label: "Centre d'aide hôtes", href: '#' },
    ],
    'Aide & Support': [
        { label: "Centre d'aide", href: '#' },
        { label: "Conditions d'utilisation", href: '/legal#cgu' },
        {
            label: 'Politique de confidentialité',
            href: '/legal#confidentialite',
        },
        { label: "Politique d'annulation", href: '/legal#annulation' },
        { label: 'Mentions légales', href: '/legal#mentions-legales' },
        { label: 'Nous contacter', href: 'mailto:contact@residotel.com' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-primary-fix text-primary-foreground-fix">
            <div className="container mx-auto px-6 py-16">
                {/* Top row */}
                <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="mb-5 flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-amber">
                                <span className="font-display text-base font-bold text-white">
                                    R
                                </span>
                            </div>
                            <span className="font-display text-xl font-semibold tracking-wide">
                                Residotel
                            </span>
                        </div>
                        <p className="font-body mb-6 max-w-xs text-sm leading-relaxed text-primary-foreground-fix/65">
                            La plateforme qui connecte voyageurs et hôtes pour
                            des séjours mémorables, en toute confiance.
                        </p>
                        <div className="space-y-2.5">
                            <a
                                href="tel:+33100000000"
                                className="font-body flex items-center gap-2.5 text-sm text-primary-foreground-fix/70 transition-colors hover:text-primary-foreground-fix"
                            >
                                <Phone className="h-4 w-4" />
                                +33 1 00 00 00 00
                            </a>
                            <a
                                href="mailto:contact@residotel.com"
                                className="font-body flex items-center gap-2.5 text-sm text-primary-foreground-fix/70 transition-colors hover:text-primary-foreground-fix"
                            >
                                <Mail className="h-4 w-4" />
                                contact@residotel.com
                            </a>
                            <div className="font-body flex items-center gap-2.5 text-sm text-primary-foreground-fix/70">
                                <Globe className="h-4 w-4" />
                                Français · English · العربية
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([heading, links]) => (
                        <div key={heading}>
                            <h4 className="font-display mb-4 text-base font-semibold text-primary-foreground-fix">
                                {heading}
                            </h4>
                            <ul className="space-y-2.5">
                                {links.map(({ label, href }) => (
                                    <li key={label}>
                                        {href.startsWith('mailto:') ||
                                        href.startsWith('http') ? (
                                            <a
                                                href={href}
                                                className="font-body text-sm text-primary-foreground-fix/60 transition-colors hover:text-primary-foreground-fix"
                                            >
                                                {label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={href}
                                                className="font-body text-sm text-primary-foreground-fix/60 transition-colors hover:text-primary-foreground-fix"
                                            >
                                                {label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-8 md:flex-row">
                    <p className="font-body text-center text-sm text-primary-foreground-fix/50 md:text-left">
                        © 2025 Residotel. Tous droits réservés. — Plateforme
                        certifiée & sécurisée.
                    </p>
                    {/* Social icons */}
                    <div className="flex items-center gap-4">
                        {[
                            {
                                Icon: Facebook,
                                href: 'https://www.facebook.com/Residotel',
                                label: 'Facebook',
                            },
                            {
                                Icon: Instagram,
                                href: 'https://www.instagram.com/Residotel',
                                label: 'Instagram',
                            },
                            {
                                Icon: Twitter,
                                href: 'https://www.twitter.com/Residotel',
                                label: 'X / Twitter',
                            },
                            {
                                Icon: Linkedin,
                                href: 'https://www.linkedin.com/company/Residotel',
                                label: 'LinkedIn',
                            },
                        ].map(({ Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent-fix/80"
                            >
                                <Icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
