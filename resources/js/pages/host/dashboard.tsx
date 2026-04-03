import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Home,
    CalendarCheck,
    MessageSquare,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Bell,
    Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardListings from '@/components/dashboard/DashboardListings';
import DashboardBookings from '@/components/dashboard/DashboardBookings';
import DashboardMessages from '@/components/dashboard/DashboardMessages';

type Section = 'overview' | 'listings' | 'bookings' | 'messages';

const navItems = [
    {
        id: 'overview' as Section,
        icon: LayoutDashboard,
        label: "Vue d'ensemble",
        badge: null,
    },
    {
        id: 'listings' as Section,
        icon: Home,
        label: 'Mes annonces',
        badge: '3',
    },
    {
        id: 'bookings' as Section,
        icon: CalendarCheck,
        label: 'Réservations',
        badge: '2',
    },
    {
        id: 'messages' as Section,
        icon: MessageSquare,
        label: 'Messages',
        badge: '3',
    },
];

export default function HostDashboard() {
    const [section, setSection] = useState<Section>('overview');
    const [collapsed, setCollapsed] = useState(false);

    const sectionTitles: Record<Section, string> = {
        overview: "Vue d'ensemble",
        listings: 'Mes annonces',
        bookings: 'Réservations',
        messages: 'Messages',
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside
                className={`flex shrink-0 flex-col bg-primary transition-all duration-300 ${
                    collapsed ? 'w-16' : 'w-60'
                }`}
            >
                {/* Logo */}
                <div
                    className={`flex items-center gap-2.5 border-b border-white/10 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}
                >
                    <div className="bg-gradient-amber flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <span className="font-display text-sm font-bold text-white">
                            R
                        </span>
                    </div>
                    {!collapsed && (
                        <span className="font-display text-lg font-semibold tracking-wide text-white">
                            Residotel
                        </span>
                    )}
                </div>

                {/* Host profile */}
                {!collapsed && (
                    <div className="border-b border-white/10 px-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-amber flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                                <span className="font-display font-bold text-white">
                                    AK
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="font-body truncate text-sm font-semibold text-primary-foreground">
                                    Ahmed Khaleel
                                </p>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-accent text-accent" />
                                    <span className="font-body text-xs text-primary-foreground/70">
                                        Hôte certifié
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map(({ id, icon: Icon, label, badge }) => (
                        <button
                            key={id}
                            onClick={() => setSection(id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                                section === id
                                    ? 'bg-white/15 text-white'
                                    : 'text-primary-foreground/65 hover:bg-white/8 hover:text-primary-foreground'
                            } ${collapsed ? 'justify-center' : ''}`}
                        >
                            <Icon className="h-4.5 w-4.5 shrink-0" />
                            {!collapsed && (
                                <>
                                    <span className="font-body flex-1 text-sm font-medium">
                                        {label}
                                    </span>
                                    {badge && (
                                        <Badge className="font-body h-5 border-0 bg-accent px-1.5 text-xs text-white">
                                            {badge}
                                        </Badge>
                                    )}
                                </>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="space-y-1 border-t border-white/10 px-3 py-4">
                    <button
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-primary-foreground/65 transition-colors hover:bg-white/8 hover:text-primary-foreground ${collapsed ? 'justify-center' : ''}`}
                    >
                        <Settings className="h-4.5 w-4.5 shrink-0" />
                        {!collapsed && (
                            <span className="font-body text-sm">
                                Paramètres
                            </span>
                        )}
                    </button>
                    <Link
                        to="/"
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-primary-foreground/65 transition-colors hover:bg-white/8 hover:text-primary-foreground ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="h-4.5 w-4.5 shrink-0" />
                        {!collapsed && (
                            <span className="font-body text-sm">
                                Retour au site
                            </span>
                        )}
                    </Link>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="mx-3 mb-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-primary-foreground/50 transition-colors hover:bg-white/8 hover:text-primary-foreground"
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
            </aside>

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Top bar */}
                <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-4">
                    <div>
                        <h1 className="font-display text-xl font-bold text-foreground">
                            {sectionTitles[section]}
                        </h1>
                        <p className="font-body mt-0.5 text-xs text-muted-foreground">
                            Bienvenue sur votre espace hôte Residotel
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                        </button>
                        <div className="bg-gradient-amber flex h-9 w-9 items-center justify-center rounded-full">
                            <span className="font-display text-sm font-bold text-white">
                                AK
                            </span>
                        </div>
                    </div>
                </header>

                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {section === 'overview' && <DashboardOverview />}
                    {section === 'listings' && <DashboardListings />}
                    {section === 'bookings' && <DashboardBookings />}
                    {section === 'messages' && <DashboardMessages />}
                </main>
            </div>
        </div>
    );
}
