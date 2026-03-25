import { router } from '@inertiajs/react';
import {
    MapPin,
    Calendar,
    Users,
    Search,
    ChevronDown,
    Star,
    Shield,
    Zap,
    Navigation,
    Loader2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGeolocation } from '@/hooks/useGeolocation';
import { search } from '@/routes';

const POPULAR = [
    'Dubai',
    'Paris',
    'Maldives',
    'Marrakech',
    'Barcelone',
    'Santorin',
];

const STATS = [
    { value: '2 000+', label: 'Propriétés', icon: '🏠' },
    { value: '50+', label: 'Destinations', icon: '🌍' },
    { value: '98%', label: 'Satisfaction', icon: '⭐' },
    { value: '24/7', label: 'Assistance', icon: '🛎' },
];

export default function HeroSection() {
    const [destination, setDestination] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [scrollY, setScrollY] = useState(0);
    const [showGuests, setShowGuests] = useState(false);
    const [geoUsed, setGeoUsed] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const { location, loading: geoLoading } = useGeolocation();

    // Pré-remplir la barre de recherche avec la ville détectée (une seule fois)
    useEffect(() => {
        if (location?.searchQuery && !destination && !geoUsed) {
            const timeoutId = setTimeout(() => {
                setDestination(location.searchQuery!);
                setGeoUsed(true);
            }, 0);

            return () => clearTimeout(timeoutId);
        }
    }, [location, destination, geoUsed]);

    // Parallax
    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleSearch = () => {
        // On prépare l'objet d'options pour les query parameters
        const query: Record<string, any> = {};

        if (destination) {
            query.q = destination;
        }

        // Si on a la géolocalisation mais pas de destination saisie
        if (location && !destination) {
            query.lat = location.lat;
            query.lng = location.lng;
        }

        // Ajoute ici d'autres filtres si nécessaire (dates, guests, etc.)
        // if (checkIn) query.check_in = checkIn;

        // Génération de l'URL via Wayfinder
        const url = search.url({ query });

        // Navigation via Inertia
        router.get(url);
    };

    return (
        <section
            ref={sectionRef}
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[url(/images/hero-bg.jpg)] bg-fixed bg-center"
        >
            {/* ── Parallax background ── */}
            {/* <div
                className="absolute inset-0 will-change-transform"
                style={{
                    transform: `translateY(${scrollY * 0.35}px) scale(1.12)`,
                }}
            >
                <img
                    src={'/images/hero-bg.jpg'}
                    alt="Luxury property"
                    className="h-full w-full object-cover"
                    loading="eager"
                />
            </div> */}

            {/* ── Cinematic overlay: dual-layer for depth ── */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary-fix/50 via-primary-fix/40 to-primary-fix/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-fix/30 via-transparent to-primary-fix/10" />

            {/* ── Floating ambient orbs ── */}
            <div
                className="pointer-events-none absolute h-[600px] w-[600px] rounded-full opacity-[0.07] blur-3xl"
                style={{
                    background: 'hsl(36 85% 50%)',
                    top: '10%',
                    right: '-10%',
                    transform: `translateY(${scrollY * 0.15}px)`,
                }}
            />
            <div
                className="pointer-events-none absolute h-[400px] w-[400px] rounded-full opacity-[0.06] blur-3xl"
                style={{
                    background: 'hsl(196 60% 80%)',
                    bottom: '15%',
                    left: '-5%',
                    transform: `translateY(${-scrollY * 0.1}px)`,
                }}
            />

            {/* ── Content ── */}
            <div
                className="relative z-10 container mx-auto flex flex-col items-center px-4 pt-28 pb-16 text-center md:px-6"
                style={{ transform: `translateY(${scrollY * 0.08}px)` }}
            >
                {/* Trust badge */}
                <div className="animate-fade-in mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-fix" />
                    <span className="font-body text-xs font-medium tracking-widest text-white/90 uppercase">
                        La location haut de gamme simplifiée
                    </span>
                </div>

                {/* Headline */}
                <h1 className="font-display animate-fade-up mb-5 max-w-5xl text-5xl leading-[1.05] font-bold tracking-tight text-white md:text-[82px]">
                    Vivez des séjours
                    <br />
                    <span className="text-accent-fix italic">d'exception.</span>
                </h1>

                <p
                    className="font-body animate-fade-up mb-10 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl"
                    style={{ animationDelay: '0.1s' }}
                >
                    Residotel — la plateforme premium qui connecte voyageurs
                    exigeants et hôtes certifiés, partout dans le monde.
                </p>

                {/* ── Integrated Search Bar ── */}
                <div
                    className="animate-fade-up w-full max-w-4xl"
                    style={{ animationDelay: '0.2s' }}
                >
                    <div className="overflow-visible rounded-2xl bg-white/[0.97] shadow-hero">
                        <div className="grid grid-cols-1 divide-y divide-border-fix/60 md:grid-cols-[1fr_auto_auto_auto_auto] md:divide-x md:divide-y-0">
                            {/* Destination */}
                            <div className="group flex items-center gap-3 px-5 py-4">
                                {geoLoading ? (
                                    <Loader2 className="h-4.5 w-4.5 shrink-0 animate-spin text-accent" />
                                ) : location ? (
                                    <Navigation className="h-4.5 w-4.5 shrink-0 text-accent" />
                                ) : (
                                    <MapPin className="h-4.5 w-4.5 shrink-0 text-accent" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="mb-0.5 flex items-center gap-1.5">
                                        <p className="font-body text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                            Destination
                                        </p>
                                        {location && !geoLoading && (
                                            <span className="font-body text-[10px] font-medium text-accent">
                                                • Détectée
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        value={destination}
                                        onChange={(e) => {
                                            setDestination(e.target.value);
                                            setGeoUsed(true);
                                        }}
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && handleSearch()
                                        }
                                        placeholder={
                                            geoLoading
                                                ? 'Localisation en cours…'
                                                : 'Où voulez-vous aller ?'
                                        }
                                        className="font-body h-auto border-0 bg-transparent p-0 text-xs font-medium text-muted-foreground-fix placeholder:text-muted-foreground/50 focus-visible:ring-0"
                                    />
                                    {/* Quick suggestions or geo info */}
                                    {!destination && !geoLoading && (
                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                            {POPULAR.slice(0, 3).map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() =>
                                                        setDestination(d)
                                                    }
                                                    className="font-body cursor-pointer rounded-full bg-muted-fix/60 px-2 py-0.5 text-[10px] text-muted-foreground-fix transition-colors hover:bg-secondary-fix/50 hover:text-primary-fix"
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {destination &&
                                        location?.searchQuery ===
                                            destination && (
                                            <p className="font-body mt-0.5 flex items-center gap-1 text-[10px] text-accent/70">
                                                <Navigation className="h-2.5 w-2.5" />
                                                {location.label}
                                            </p>
                                        )}
                                </div>
                            </div>

                            {/* Check-in */}
                            <div className="flex min-w-[140px] items-center gap-3 px-5 py-4">
                                <Calendar className="h-4 w-4 shrink-0 text-accent" />
                                <div>
                                    <p className="font-body mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Arrivée
                                    </p>
                                    <input
                                        type="date"
                                        value={checkIn}
                                        onChange={(e) =>
                                            setCheckIn(e.target.value)
                                        }
                                        className="font-body w-full border-0 bg-transparent p-0 text-sm font-medium text-foreground-fix outline-none"
                                    />
                                </div>
                            </div>

                            {/* Check-out */}
                            <div className="flex min-w-[140px] items-center gap-3 px-5 py-4">
                                <Calendar className="h-4 w-4 shrink-0 text-accent" />
                                <div>
                                    <p className="font-body mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Départ
                                    </p>
                                    <input
                                        type="date"
                                        value={checkOut}
                                        onChange={(e) =>
                                            setCheckOut(e.target.value)
                                        }
                                        className="font-body w-full border-0 bg-transparent p-0 text-sm font-medium text-foreground-fix outline-none"
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="relative flex min-w-[130px] items-center gap-3 px-5 py-4">
                                <Users className="h-4 w-4 shrink-0 text-accent" />
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => setShowGuests(!showGuests)}
                                >
                                    <p className="font-body mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground-fix uppercase">
                                        Voyageurs
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-body text-sm font-medium text-foreground-fix">
                                            {guests} adulte
                                            {guests > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                {showGuests && (
                                    <div className="absolute top-full left-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card p-4 shadow-hero">
                                        <p className="font-body mb-3 text-xs font-semibold text-foreground">
                                            Nombre de voyageurs
                                        </p>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-body text-sm text-foreground">
                                                Adultes
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setGuests(
                                                            Math.max(
                                                                1,
                                                                guests - 1,
                                                            ),
                                                        );
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border font-bold text-foreground hover:border-primary"
                                                >
                                                    −
                                                </button>
                                                <span className="font-body w-5 text-center text-sm font-semibold">
                                                    {guests}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setGuests(
                                                            Math.min(
                                                                16,
                                                                guests + 1,
                                                            ),
                                                        );
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border font-bold text-foreground hover:border-primary"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowGuests(false)}
                                            className="font-body mt-3 w-full rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground"
                                        >
                                            Confirmer
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="flex items-center p-3">
                                <Button
                                    onClick={handleSearch}
                                    className="font-body flex h-14 w-full items-center gap-2 rounded-xl bg-gradient-brand px-6 text-sm font-semibold whitespace-nowrap text-primary-foreground-fix shadow-md hover:opacity-90 md:w-auto"
                                >
                                    <Search className="h-4 w-4" />
                                    Rechercher
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Popular destinations chips */}
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        <span className="font-body text-xs text-white/50">
                            Populaire :
                        </span>
                        {POPULAR.map((d) => (
                            <button
                                key={d}
                                onClick={() => {
                                    setDestination(d);
                                    handleSearch();
                                }}
                                className="font-body rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 transition-all hover:bg-white/20 hover:text-white"
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Trust strip ── */}
                <div
                    className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-5"
                    style={{ animationDelay: '0.3s' }}
                >
                    {[
                        { icon: Shield, text: 'Paiements sécurisés Stripe' },
                        { icon: Star, text: 'Hôtes certifiés Residotel' },
                        { icon: Zap, text: 'Réservation instantanée' },
                    ].map(({ icon: Icon, text }) => (
                        <div
                            key={text}
                            className="flex items-center gap-1.5 text-white/70"
                        >
                            <Icon className="h-3.5 w-3.5 text-accent-fix" />
                            <span className="font-body text-xs">{text}</span>
                        </div>
                    ))}
                </div>

                {/* ── Key Stats ── */}
                <div
                    className="animate-fade-up mt-10 grid w-full max-w-2xl grid-cols-2 gap-4 md:grid-cols-4"
                    style={{ animationDelay: '0.4s' }}
                >
                    {STATS.map((s) => (
                        <div
                            key={s.label}
                            className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/8 px-4 py-4 text-center transition-colors hover:bg-white/12"
                        >
                            <span className="mb-1 text-2xl">{s.icon}</span>
                            <p className="font-display text-2xl leading-none font-bold text-accent-fix">
                                {s.value}
                            </p>
                            <p className="font-body mt-0.5 text-xs text-white/60">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Scroll indicator ── */}
            <a
                href="#destinations"
                className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/50 transition-colors hover:text-white/90"
            >
                <ChevronDown className="animate-float h-5 w-5" />
            </a>
        </section>
    );
}
