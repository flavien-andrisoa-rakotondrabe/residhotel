import { Link, router, usePage } from '@inertiajs/react';
import {
    Menu,
    X,
    Globe,
    LayoutDashboard,
    User,
    LogOut,
    Home,
    Compass,
    Sparkles,
    Shield,
    CalendarCheck,
    Moon,
    Sun,
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
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/Theme.provider';
import { logout } from '@/routes';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const { theme, setTheme } = useTheme();

    // On récupère les données globales d'Inertia (auth, flash, etc.)
    const { auth }: any = usePage().props;

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
                    ? 'border-b border-border bg-card/95 py-3 shadow-card backdrop-blur-md'
                    : 'bg-transparent py-4'
            }`}
        >
            <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-2.5">
                    <img src="/logo.svg" alt="Residotel" className="h-8 w-8" />
                    <span
                        className={`font-display text-lg tracking-tight ${scrolled ? 'text-foreground' : 'text-foreground'}`}
                    >
                        Residotel
                    </span>
                </Link>

                {/* CTA */}
                <div className="hidden items-center gap-2 md:flex">
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`font-body rounded-full text-sm font-medium ${
                                scrolled
                                    ? 'text-foreground hover:bg-muted'
                                    : 'text-foreground hover:bg-foreground/5'
                            }`}
                        >
                            Devenir hôte
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            setTheme(theme === 'dark' ? 'light' : 'dark')
                        }
                        className={`rounded-full ${
                            scrolled
                                ? 'text-foreground hover:bg-muted'
                                : 'text-foreground hover:bg-foreground/5'
                        }`}
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full ${
                            scrolled
                                ? 'text-foreground hover:bg-muted'
                                : 'text-foreground hover:bg-foreground/5'
                        }`}
                    >
                        <Globe className="h-4 w-4" />
                    </Button>

                    {user ? (
                        <>
                            {isHost && (
                                <NotificationBell
                                    className={`rounded-full ${
                                        scrolled
                                            ? 'hover:bg-muted'
                                            : 'hover:bg-foreground/5'
                                    }`}
                                />
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="hover:shadow-hover flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-1 pl-3 transition-all">
                                        <Menu className="h-4 w-4 text-foreground" />
                                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-foreground">
                                            {profile?.avatar_url ? (
                                                <img
                                                    src={profile.avatar_url}
                                                    alt={initials}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="font-body text-xs font-semibold text-primary-foreground">
                                                    {initials}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="font-body w-56 rounded-2xl p-1"
                                >
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-semibold text-foreground">
                                            {displayName}
                                        </p>
                                        <div className="mt-1 flex gap-1">
                                            {roles.includes('voyageur') && (
                                                <Badge
                                                    variant="secondary"
                                                    className="font-body gap-1 rounded-full text-[10px]"
                                                >
                                                    <Compass className="h-2.5 w-2.5" />{' '}
                                                    Voyageur
                                                </Badge>
                                            )}
                                            {roles.includes('hote') && (
                                                <Badge className="font-body gap-1 rounded-full border-0 bg-accent/10 text-[10px] text-accent">
                                                    <Home className="h-2.5 w-2.5" />{' '}
                                                    Hôte
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />

                                    {isHost && (
                                        <>
                                            <div className="px-3 py-1.5">
                                                <p className="font-body mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Mode
                                                </p>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            // setDashboardMode(
                                                            //     'voyageur',
                                                            // );
                                                            // navigate(
                                                            //     '/dashboard',
                                                            // );
                                                        }}
                                                        className={cn(
                                                            'font-body flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all',
                                                            // dashboardMode ===
                                                            //     'voyageur'
                                                            true
                                                                ? 'bg-foreground text-background'
                                                                : 'text-muted-foreground hover:bg-muted',
                                                        )}
                                                    >
                                                        Voyageur
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            // setDashboardMode(
                                                            //     'hote',
                                                            // );
                                                            // navigate(
                                                            //     '/dashboard',
                                                            // );
                                                        }}
                                                        className={cn(
                                                            'font-body flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all',
                                                            false // dashboardMode ===
                                                                ? // 'hote'
                                                                  'bg-foreground text-background'
                                                                : 'text-muted-foreground hover:bg-muted',
                                                        )}
                                                    >
                                                        Hôte
                                                    </button>
                                                </div>
                                            </div>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}

                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/dashboard"
                                            className="flex cursor-pointer items-center gap-2.5 rounded-lg"
                                        >
                                            <LayoutDashboard className="h-4 w-4" />{' '}
                                            Tableau de bord
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/mes-reservations"
                                            className="flex cursor-pointer items-center gap-2.5 rounded-lg"
                                        >
                                            <CalendarCheck className="h-4 w-4" />{' '}
                                            Mes réservations
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/profile"
                                            className="flex cursor-pointer items-center gap-2.5 rounded-lg"
                                        >
                                            <User className="h-4 w-4" /> Mon
                                            profil
                                        </Link>
                                    </DropdownMenuItem>

                                    {!isHost && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex cursor-pointer items-center gap-2.5 rounded-lg text-accent"
                                                >
                                                    <Sparkles className="h-4 w-4" />{' '}
                                                    Devenir hôte
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    {/* {isAdmin && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href="/admin"
                                                    className="flex cursor-pointer items-center gap-2.5 rounded-lg text-destructive"
                                                >
                                                    <Shield className="h-4 w-4" />{' '}
                                                    Panel Admin
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )} */}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="flex cursor-pointer items-center gap-2.5 rounded-lg text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="h-4 w-4" /> Se
                                        déconnecter
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Link href="/auth">
                            <button className="hover:shadow-hover flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-1 pl-3 transition-all">
                                <Menu className="h-4 w-4 text-foreground" />
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </button>
                        </Link>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="p-2 text-foreground md:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="flex animate-fade-in flex-col gap-3 border-t border-border bg-card px-6 py-6 md:hidden">
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Button
                                    variant="ghost"
                                    className="font-body w-full justify-start gap-2 rounded-xl"
                                >
                                    <LayoutDashboard className="h-4 w-4" />{' '}
                                    Tableau de bord
                                </Button>
                            </Link>
                            <Link
                                href="/profile"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Button
                                    variant="ghost"
                                    className="font-body w-full justify-start gap-2 rounded-xl"
                                >
                                    <User className="h-4 w-4" /> Mon profil
                                </Button>
                            </Link>
                            {!isHost && (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Button
                                        variant="ghost"
                                        className="font-body w-full justify-start gap-2 rounded-xl text-accent"
                                    >
                                        <Sparkles className="h-4 w-4" /> Devenir
                                        hôte
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="ghost"
                                onClick={handleSignOut}
                                className="font-body w-full justify-start gap-2 rounded-xl text-destructive"
                            >
                                <LogOut className="h-4 w-4" /> Se déconnecter
                            </Button>
                        </>
                    ) : (
                        <Link href="/auth" onClick={() => setMenuOpen(false)}>
                            <Button className="font-body w-full rounded-xl bg-accent font-semibold text-accent-foreground hover:bg-accent/90">
                                Connexion / Inscription
                            </Button>
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
