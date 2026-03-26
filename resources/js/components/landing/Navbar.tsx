import { Link, router, usePage } from '@inertiajs/react';
import {
    Menu,
    X,
    Globe,
    LayoutDashboard,
    User,
    LogOut,
    ChevronDown,
    Home,
    Compass,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationBell from '@/components/landing/NotificationBell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';
import { dashboard, lang, login, logout } from '@/routes';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // On récupère les données globales d'Inertia (auth, flash, etc.)
    const { auth }: any = usePage().props;
    const { __, locale } = useTranslation();

    const user = auth.user;
    const profile = auth.profile;
    const roles = auth.roles || [];
    const isHost = roles.includes('hote');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Deconnexion
    const handleSignOut = () => {
        const route = logout.post();

        router.visit(route.url, {
            method: route.method,
        });
    };

    const initials =
        `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase() ||
        'U';

    const displayName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
        : user?.email;

    return (
        <header
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-primary-fix/95 py-3 shadow-hero backdrop-blur-md'
                    : 'bg-transparent py-5'
            }`}
        >
            <div className="container mx-auto flex items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-amber shadow-md">
                        <span className="font-display text-base leading-none font-bold text-white">
                            R
                        </span>
                    </div>
                    <span className="font-display text-xl font-semibold tracking-wide text-white">
                        ResidHotel
                    </span>
                </Link>

                {/* CTA Desktop */}
                <div className="hidden items-center gap-3 md:flex">
                    {/* Switch Langue */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="font-body text-white/85 hover:bg-white/10 hover:text-white"
                            >
                                <Globe className="mr-1.5 h-4 w-4" />
                                {locale.toUpperCase()}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <Link href={lang({ locale: 'fr' })}>
                                    Français
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={lang({ locale: 'en' })}>
                                    English
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {user ? (
                        <>
                            <Link href={dashboard()}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="font-body gap-1.5 text-white/85 hover:bg-white/10 hover:text-white"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    {__('nav.dashboard')}
                                </Button>
                            </Link>

                            {isHost && (
                                <NotificationBell className="bg-white/15 text-white hover:bg-white/25 [&_svg]:text-white" />
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-full bg-white/15 py-1 pr-3 pl-1 transition-colors hover:bg-white/25">
                                        <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-amber">
                                            {profile?.avatar_url ? (
                                                <img
                                                    src={profile.avatar_url}
                                                    alt={initials}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="font-display text-xs font-bold text-white">
                                                    {initials}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-body max-w-[100px] truncate text-sm font-medium text-white">
                                            {displayName}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 text-white/70" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="font-body w-52"
                                >
                                    <div className="flex flex-wrap gap-1 px-2 py-2">
                                        {roles.includes('voyageur') && (
                                            <Badge
                                                variant="secondary"
                                                className="font-body gap-1 text-xs"
                                            >
                                                <Compass className="h-3 w-3" />{' '}
                                                Voyageur
                                            </Badge>
                                        )}
                                        {isHost && (
                                            <Badge className="font-body gap-1 border-0 bg-primary/10 text-xs text-primary">
                                                <Home className="h-3 w-3" />{' '}
                                                Hôte
                                            </Badge>
                                        )}
                                    </div>
                                    <DropdownMenuSeparator />

                                    {/* Menu Items */}
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={dashboard()}
                                            className="flex items-center gap-2"
                                        >
                                            <LayoutDashboard className="h-4 w-4" />{' '}
                                            {__('nav.dashboard')}
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2"
                                        >
                                            <User className="h-4 w-4" />{' '}
                                            {__('nav.profile')}
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {__('nav.logout')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Link href="/auth">
                            <Button
                                size="lg"
                                className="font-body cursor-pointer border-0 bg-gradient-amber font-semibold text-white shadow-md hover:opacity-90"
                            >
                                {'Connexion / Inscription'}
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="p-2 text-white md:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile menu content */}
            {menuOpen && (
                <div className="animate-fade-in flex flex-col gap-5 border-t border-white/10 bg-primary/98 px-6 py-6 backdrop-blur-md md:hidden">
                    {/* ... Idem avec Link d'Inertia et __() pour les textes ... */}
                </div>
            )}
        </header>
    );
}
