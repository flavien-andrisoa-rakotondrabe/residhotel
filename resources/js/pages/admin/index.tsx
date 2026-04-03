import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Home,
    CalendarCheck,
    Star,
    DollarSign,
    Scale,
    Settings,
    Shield,
    LifeBuoy,
    LogOut,
    Menu,
    ChevronRight,
    ArrowLeft,
} from 'lucide-react';

import AdminOverview from '@/components/admin/AdminOverview';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminProperties from '@/components/admin/AdminProperties';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminReviews from '@/components/admin/AdminReviews';
import AdminFinance from '@/components/admin/AdminFinance';
import AdminDisputes from '@/components/admin/AdminDisputes';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminSecurity from '@/components/admin/AdminSecurity';
import AdminSupport from '@/components/admin/AdminSupport';

type Section =
    | 'overview'
    | 'users'
    | 'properties'
    | 'bookings'
    | 'reviews'
    | 'finance'
    | 'disputes'
    | 'support'
    | 'settings'
    | 'security';

const NAV: {
    id: Section;
    label: string;
    icon: React.ElementType;
    description: string;
    group?: string;
}[] = [
    {
        id: 'overview',
        label: "Vue d'ensemble",
        icon: LayoutDashboard,
        description: 'Statistiques globales',
    },
    {
        id: 'users',
        label: 'Utilisateurs',
        icon: Users,
        description: 'Gérer les comptes',
        group: 'Gestion',
    },
    {
        id: 'properties',
        label: 'Propriétés',
        icon: Home,
        description: 'Modérer les annonces',
        group: 'Gestion',
    },
    {
        id: 'bookings',
        label: 'Réservations',
        icon: CalendarCheck,
        description: 'Suivre les séjours',
        group: 'Gestion',
    },
    {
        id: 'reviews',
        label: 'Avis',
        icon: Star,
        description: 'Modérer les commentaires',
        group: 'Gestion',
    },
    {
        id: 'disputes',
        label: 'Litiges',
        icon: Scale,
        description: 'Résoudre les litiges',
        group: 'Gestion',
    },
    {
        id: 'support',
        label: 'Support',
        icon: LifeBuoy,
        description: 'Tickets utilisateurs',
        group: 'Gestion',
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: DollarSign,
        description: 'Revenus & paiements',
        group: 'Business',
    },
    {
        id: 'security',
        label: 'Sécurité',
        icon: Shield,
        description: 'Signalements & logs',
        group: 'Admin',
    },
    {
        id: 'settings',
        label: 'Paramètres',
        icon: Settings,
        description: 'Configuration plateforme',
        group: 'Admin',
    },
];

const SECTION_TITLES: Record<Section, string> = {
    overview: "Vue d'ensemble",
    users: 'Gestion des utilisateurs',
    properties: 'Gestion des propriétés',
    bookings: 'Gestion des réservations',
    reviews: 'Modération des avis',
    finance: 'Finance & Paiements',
    disputes: 'Gestion des litiges',
    support: 'Support client',
    settings: 'Paramètres plateforme',
    security: 'Sécurité & Modération',
};

export default function AdminPanel() {
    const [section, setSection] = useState<Section>('overview');
    const [mobileOpen, setMobileOpen] = useState(false);
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="border-b border-white/10 px-5 pt-6 pb-5">
                <div className="mb-1 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/80">
                        <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="font-display text-sm leading-tight font-bold text-white">
                            Admin Panel
                        </p>
                        <p className="font-body text-[10px] text-white/50">
                            Residotel
                        </p>
                    </div>
                </div>
            </div>

            {/* Admin identity */}
            <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="font-display text-xs font-bold text-white">
                                {`${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase() ||
                                    'A'}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-body truncate text-xs font-semibold text-white">
                            {profile?.first_name
                                ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
                                : 'Administrateur'}
                        </p>
                        <p className="font-body text-[10px] text-white/50">
                            Gestionnaire de plateforme
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                {/* Group the nav items */}
                {(() => {
                    const groups: { label?: string; items: typeof NAV }[] = [
                        { items: NAV.filter((n) => !n.group) },
                        {
                            label: 'Gestion',
                            items: NAV.filter((n) => n.group === 'Gestion'),
                        },
                        {
                            label: 'Business',
                            items: NAV.filter((n) => n.group === 'Business'),
                        },
                        {
                            label: 'Admin',
                            items: NAV.filter((n) => n.group === 'Admin'),
                        },
                    ];

                    return groups.map(({ label, items }) =>
                        items.length ? (
                            <div key={label ?? 'top'} className="mb-4">
                                {label && (
                                    <p className="font-body px-3 py-1 text-[9px] font-bold tracking-widest text-white/30 uppercase">
                                        {label}
                                    </p>
                                )}
                                <div className="space-y-0.5">
                                    {items.map((item) => {
                                        const active = section === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setSection(item.id);
                                                    setMobileOpen(false);
                                                }}
                                                className={`font-body group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                                    active
                                                        ? 'bg-white/15 text-white'
                                                        : 'text-white/65 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                <item.icon
                                                    className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-accent' : 'text-white/50 group-hover:text-white/80'}`}
                                                />
                                                <span className="flex-1 text-left">
                                                    {item.label}
                                                </span>
                                                {active && (
                                                    <ChevronRight className="h-3 w-3 text-white/40" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null,
                    );
                })()}
            </nav>

            {/* Footer actions */}
            <div className="space-y-1 border-t border-white/10 px-3 pt-3 pb-5">
                <Link
                    to="/"
                    className="font-body flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition-all hover:bg-white/8 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    Retour au site
                </Link>
                <button
                    onClick={handleSignOut}
                    className="font-body flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition-all hover:bg-accent/10 hover:text-accent"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Déconnexion
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-muted/30">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 shrink-0 flex-col bg-primary md:flex">
                <SidebarContent />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative z-50 flex w-64 flex-col bg-primary">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex min-h-screen flex-1 flex-col md:ml-60">
                {/* Header */}
                <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background px-5 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            className="rounded-lg p-2 transition-colors hover:bg-muted md:hidden"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="font-display text-lg font-bold text-foreground">
                                {SECTION_TITLES[section]}
                            </h1>
                            <p className="font-body hidden text-xs text-muted-foreground sm:block">
                                {NAV.find((n) => n.id === section)?.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-accent sm:flex">
                            <Shield className="h-3 w-3" />
                            <span className="font-body text-xs font-semibold">
                                Mode admin
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-5 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={section}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            {section === 'overview' && <AdminOverview />}
                            {section === 'users' && <AdminUsers />}
                            {section === 'properties' && <AdminProperties />}
                            {section === 'bookings' && <AdminBookings />}
                            {section === 'reviews' && <AdminReviews />}
                            {section === 'finance' && <AdminFinance />}
                            {section === 'disputes' && <AdminDisputes />}
                            {section === 'support' && <AdminSupport />}
                            {section === 'settings' && <AdminSettings />}
                            {section === 'security' && <AdminSecurity />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
