import { Link } from '@inertiajs/react';
import {
    Phone,
    Mail,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
} from 'lucide-react';

const footerLinks: Record<string, { label: string; href: string }[]> = {
    Residotel: [
        { label: 'À propos', href: '/a-propos' },
        { label: 'Comment ça marche', href: '/comment-ca-marche' },
        { label: 'Blog', href: '/blog' },
        { label: 'Carrières', href: '/carrieres' },
    ],
    Voyageurs: [
        { label: 'Rechercher', href: '/search' },
        { label: 'Destinations', href: '/destinations' },
        { label: 'Offres spéciales', href: '/offres' },
        { label: 'Assurance', href: '/assurance' },
    ],
    Hôtes: [
        { label: 'Devenir hôte', href: '/dashboard' },
        { label: 'Certification', href: '/certification' },
        { label: 'Revenus', href: '/dashboard' },
        { label: 'Aide hôtes', href: '/aide-hotes' },
    ],
    Support: [
        { label: "Centre d'aide", href: '/aide' },
        { label: 'CGU', href: '/legal#cgu' },
        { label: 'Confidentialité', href: '/legal#confidentialite' },
        { label: 'Contact', href: 'mailto:contact@residotel.com' },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t border-border bg-muted">
            <div className="container mx-auto px-4 py-12 md:px-6">
                <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-5">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4 flex items-center gap-2">
                            <img
                                src="/logo.svg"
                                alt="Residotel"
                                className="h-7 w-7"
                            />
                            <span className="font-display text-base text-foreground">
                                Residotel
                            </span>
                        </div>
                        <p className="font-body mb-4 max-w-[200px] text-xs leading-relaxed text-muted-foreground">
                            La plateforme qui connecte voyageurs et hôtes pour
                            des séjours mémorables.
                        </p>
                        <div className="space-y-1.5">
                            <a
                                href="tel:+33100000000"
                                className="font-body flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <Phone className="h-3.5 w-3.5" /> +33 1 00 00 00
                                00
                            </a>
                            <a
                                href="mailto:contact@residotel.com"
                                className="font-body flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <Mail className="h-3.5 w-3.5" />{' '}
                                contact@residotel.com
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([heading, links]) => (
                        <div key={heading}>
                            <h4 className="font-body mb-3 text-sm font-semibold text-foreground">
                                {heading}
                            </h4>
                            <ul className="space-y-2">
                                {links.map(({ label, href }) => (
                                    <li key={label}>
                                        {href.startsWith('mailto:') ||
                                        href.startsWith('http') ? (
                                            <a
                                                href={href}
                                                className="font-body text-xs text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={href}
                                                className="font-body text-xs text-muted-foreground transition-colors hover:text-foreground"
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

                <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
                    <p className="font-body text-xs text-muted-foreground">
                        © 2025 Residotel. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-3">
                        {[
                            {
                                Icon: Facebook,
                                href: 'https://facebook.com/Residotel',
                                label: 'Facebook',
                            },
                            {
                                Icon: Instagram,
                                href: 'https://instagram.com/Residotel',
                                label: 'Instagram',
                            },
                            {
                                Icon: Twitter,
                                href: 'https://twitter.com/Residotel',
                                label: 'X',
                            },
                            {
                                Icon: Linkedin,
                                href: 'https://linkedin.com/company/Residotel',
                                label: 'LinkedIn',
                            },
                        ].map(({ Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
