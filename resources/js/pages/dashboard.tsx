import {
    LayoutDashboard,
    Home,
    CalendarCheck,
    MessageSquare,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Star,
    Compass,
    User,
    ArrowRight,
    Sparkles,
    Menu,
    X,
    Heart,
    LifeBuoy,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessaging } from '@/hooks/useMessaging';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardListings from '@/components/dashboard/DashboardListings';
import DashboardBookings from '@/components/dashboard/DashboardBookings';
import DashboardMessages from '@/components/dashboard/DashboardMessages';
import TravelerOverview from '@/components/dashboard/TravelerOverview';
import TravelerMessages from '@/components/dashboard/TravelerMessages';
import FavoritesSection from '@/components/dashboard/FavoritesSection';
import BecomeHostFlow from '@/components/dashboard/BecomeHostFlow';
import BookingsPage from '@/pages/BookingsPage';
import NotificationBell from '@/components/NotificationBell';
import SupportSection from '@/components/dashboard/SupportSection';
import { useSupportNotifications } from '@/hooks/useSupportNotifications';

type Section =
    | 'overview'
    | 'listings'
    | 'bookings'
    | 'messages'
    | 'favorites'
    | 'become-host'
    | 'support';

export default function Dashboard() {
    const {
        profile,
        roles,
        isHost,
        dashboardMode,
        setDashboardMode,
        signOut,
        refreshProfile,
    } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [section, setSection] = useState<Section>(() => {
        const p = searchParams.get('section') as Section | null;
        return p ?? 'overview';
    });
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const p = searchParams.get('section') as Section | null;
        if (p) setSection(p);
    }, [searchParams]);

    const isHostMode = dashboardMode === 'hote';
    const { totalUnread } = useMessaging(isHostMode ? 'hote' : 'voyageur');
    const { unreadCount: supportUnread, markAllRead: markSupportRead } =
        useSupportNotifications();

    const hostNavItems: {
        id: Section;
        icon: typeof Home;
        label: string;
        badge: string | null;
    }[] = [
        {
            id: 'overview',
            icon: LayoutDashboard,
            label: "Vue d'ensemble",
            badge: null,
        },
        { id: 'listings', icon: Home, label: 'Mes annonces', badge: null },
        {
            id: 'bookings',
            icon: CalendarCheck,
            label: 'Réservations',
            badge: null,
        },
        {
            id: 'messages',
            icon: MessageSquare,
            label: 'Messages',
            badge: totalUnread > 0 ? String(totalUnread) : null,
        },
        {
            id: 'support',
            icon: LifeBuoy,
            label: 'Support',
            badge: supportUnread > 0 ? String(supportUnread) : null,
        },
    ];

    const travelerNavItems: {
        id: Section;
        icon: typeof Home;
        label: string;
        badge: string | null;
    }[] = [
        {
            id: 'overview',
            icon: LayoutDashboard,
            label: "Vue d'ensemble",
            badge: null,
        },
        {
            id: 'bookings',
            icon: CalendarCheck,
            label: 'Mes séjours',
            badge: null,
        },
        { id: 'favorites', icon: Heart, label: 'Mes favoris', badge: null },
        {
            id: 'messages',
            icon: MessageSquare,
            label: 'Messages',
            badge: totalUnread > 0 ? String(totalUnread) : null,
        },
        {
            id: 'support',
            icon: LifeBuoy,
            label: 'Support',
            badge: supportUnread > 0 ? String(supportUnread) : null,
        },
    ];

    const navItems = isHostMode ? hostNavItems : travelerNavItems;

    const switchMode = (mode: 'voyageur' | 'hote') => {
        setDashboardMode(mode);
        setSection('overview');
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleSectionChange = (id: Section) => {
        setSection(id);
        setMobileOpen(false);
        if (id === 'support') markSupportRead();
    };

    const sectionTitle: Record<Section, string> = {
        overview: isHostMode ? "Vue d'ensemble" : 'Tableau de bord',
        listings: 'Mes annonces',
        bookings: isHostMode ? 'Réservations reçues' : 'Mes séjours',
        messages: 'Messages',
        favorites: 'Mes favoris',
        'become-host': 'Devenir hôte',
        support: 'Support & Aide',
    };

    const initials =
        `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase() ||
        'U';
    const displayName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
        : 'Utilisateur';

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div
                className={`flex items-center gap-2.5 border-b border-white/10 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}
            >
                <Link
                    to="/"
                    className="flex items-center gap-2.5"
                    onClick={() => setMobileOpen(false)}
                >
                    <div className="bg-gradient-amber flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-md">
                        <span className="font-display text-sm font-bold text-white">
                            R
                        </span>
                    </div>
                    {!collapsed && (
                        <span className="font-display text-lg font-semibold tracking-wide text-white">
                            Residotel
                        </span>
                    )}
                </Link>
            </div>

            {/* Mode switcher */}
            {!collapsed && (
                <div className="border-b border-white/10 px-4 py-3">
                    <p className="font-body mb-2 text-[10px] font-semibold tracking-widest text-white/40 uppercase">
                        Espace
                    </p>
                    <div className="flex gap-1 rounded-xl bg-white/8 p-1">
                        <button
                            onClick={() => switchMode('voyageur')}
                            className={`font-body flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                                !isHostMode
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-white/50 hover:text-white/80'
                            }`}
                        >
                            <Compass className="h-3.5 w-3.5" /> Voyageur
                        </button>
                        {isHost && (
                            <button
                                onClick={() => switchMode('hote')}
                                className={`font-body flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                                    isHostMode
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-white/50 hover:text-white/80'
                                }`}
                            >
                                <Home className="h-3.5 w-3.5" /> Hôte
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Profile */}
            {!collapsed && (
                <div className="border-b border-white/10 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-amber flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={initials}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="font-display text-sm font-bold text-white">
                                    {initials}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-body truncate text-sm font-semibold text-white">
                                {displayName}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                {roles.includes('hote') && (
                                    <div className="flex items-center gap-0.5">
                                        <Star className="h-3 w-3 fill-accent text-accent" />
                                        <span className="font-body text-xs text-white/50">
                                            Hôte certifié
                                        </span>
                                    </div>
                                )}
                                {!roles.includes('hote') && (
                                    <span className="font-body text-xs text-white/50">
                                        Voyageur
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 px-3 py-4">
                {navItems.map(({ id, icon: Icon, label, badge }) => (
                    <button
                        key={id}
                        onClick={() => handleSectionChange(id)}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                            section === id
                                ? 'bg-white/15 text-white shadow-sm'
                                : 'text-white/55 hover:bg-white/8 hover:text-white/85'
                        } ${collapsed ? 'justify-center' : ''}`}
                    >
                        <Icon
                            className={`h-4 w-4 shrink-0 transition-transform ${section === id ? 'scale-110' : ''}`}
                        />
                        {!collapsed && (
                            <>
                                <span className="font-body flex-1 text-sm font-medium">
                                    {label}
                                </span>
                                {badge && (
                                    <span className="font-body min-w-[18px] rounded-full bg-accent px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                                        {badge}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                ))}

                {!isHost && !collapsed && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                        <button
                            onClick={() => handleSectionChange('become-host')}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                                section === 'become-host'
                                    ? 'bg-accent/20 text-accent'
                                    : 'text-accent/70 hover:bg-accent/10 hover:text-accent'
                            }`}
                        >
                            <Sparkles className="h-4 w-4 shrink-0" />
                            <span className="font-body flex-1 text-sm font-semibold">
                                Devenir hôte
                            </span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </nav>

            {/* Bottom actions */}
            <div className="space-y-0.5 border-t border-white/10 px-3 py-3">
                <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/50 transition-colors hover:bg-white/8 hover:text-white/80 ${collapsed ? 'justify-center' : ''}`}
                >
                    <User className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                        <span className="font-body text-sm">Mon profil</span>
                    )}
                </Link>
                <button
                    onClick={handleSignOut}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/50 transition-colors hover:bg-white/8 hover:text-white/80 ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                        <span className="font-body text-sm">Déconnexion</span>
                    )}
                </button>
            </div>

            {/* Collapse toggle – desktop only */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="mx-3 mb-3 hidden items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-white/40 transition-colors hover:bg-white/8 hover:text-white/70 md:flex"
            >
                {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="font-body text-xs">Réduire</span>
                    </>
                )}
            </button>
        </>
    );

    return (
        <div className="flex min-h-screen bg-muted/30">
            {/* Desktop sidebar */}
            <aside
                className={`hidden shrink-0 flex-col bg-primary transition-all duration-300 md:flex ${
                    collapsed ? 'w-16' : 'w-64'
                }`}
            >
                <SidebarContent />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="animate-slide-in-right relative z-10 flex w-72 flex-col bg-primary">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main area */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Top bar */}
                <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu toggle */}
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted md:hidden"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="h-4 w-4 text-muted-foreground" />
                        </button>

                        <div>
                            <h1 className="font-display text-lg leading-tight font-bold text-foreground md:text-xl">
                                {sectionTitle[section]}
                            </h1>
                            <p className="font-body hidden text-xs text-muted-foreground sm:block">
                                Bonjour, {profile?.first_name ?? 'bienvenue'} 👋
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mode badge */}
                        <div
                            className={`font-body hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold sm:flex ${
                                isHostMode
                                    ? 'border-primary/20 bg-primary/8 text-primary'
                                    : 'border-accent/20 bg-accent/10 text-accent'
                            }`}
                        >
                            {isHostMode ? (
                                <Home className="h-3 w-3" />
                            ) : (
                                <Compass className="h-3 w-3" />
                            )}
                            <span className="hidden lg:inline">
                                {isHostMode ? 'Mode hôte' : 'Mode voyageur'}
                            </span>
                        </div>

                        {/* Notifications */}
                        {isHost && <NotificationBell />}

                        {/* Avatar */}
                        <Link to="/profile">
                            <div className="bg-gradient-amber flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-sm transition-opacity hover:opacity-90">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={initials}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="font-display text-sm font-bold text-white">
                                        {initials}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${dashboardMode}-${section}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            {isHostMode && section === 'overview' && (
                                <DashboardOverview />
                            )}
                            {isHostMode && section === 'listings' && (
                                <DashboardListings />
                            )}
                            {isHostMode && section === 'bookings' && (
                                <DashboardBookings />
                            )}
                            {isHostMode && section === 'messages' && (
                                <DashboardMessages />
                            )}

                            {!isHostMode && section === 'overview' && (
                                <TravelerOverview />
                            )}
                            {!isHostMode && section === 'bookings' && (
                                <BookingsPage embedded={true} />
                            )}
                            {!isHostMode && section === 'favorites' && (
                                <FavoritesSection />
                            )}
                            {!isHostMode && section === 'messages' && (
                                <TravelerMessages />
                            )}

                            {section === 'support' && <SupportSection />}
                            {section === 'become-host' && (
                                <BecomeHostFlow
                                    onSuccess={() => {
                                        refreshProfile();
                                        switchMode('hote');
                                    }}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
