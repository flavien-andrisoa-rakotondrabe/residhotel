import { router } from '@inertiajs/react';
import { MapPin, Calendar, Users, Search, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { search } from '@/routes';

export default function HeroSection() {
    const [destination, setDestination] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [showGuests, setShowGuests] = useState(false);

    const handleSearch = () => {
        // On prépare l'objet d'options pour les query parameters
        const query: Record<string, any> = {};

        if (destination) {
            query.q = destination;
        }

        // Génération de l'URL via Wayfinder
        const url = search.url({ query });

        // Navigation via Inertia
        router.get(url);
    };

    return (
        <section className="bg-sand pt-28 pb-12 md:pt-32 md:pb-16">
            <div className="container mx-auto px-4 md:px-6">
                {/* Headline */}
                <div className="mx-auto mb-8 max-w-3xl animate-fade-up text-center">
                    <h1 className="font-display mb-4 text-4xl leading-[1.1] tracking-tight text-foreground md:text-6xl">
                        Trouvez votre prochain
                        <br />
                        <span className="text-accent">séjour idéal</span>
                    </h1>
                    <p className="font-body mx-auto max-w-lg text-base text-muted-foreground md:text-lg">
                        Des logements uniques, vérifiés et prêts à vous
                        accueillir partout dans le monde.
                    </p>
                </div>

                {/* Search bar */}
                <div
                    className="mx-auto max-w-4xl animate-fade-up"
                    style={{ animationDelay: '0.1s' }}
                >
                    <div className="flex items-center rounded-full border border-border bg-card p-2 shadow-hero">
                        <div className="hidden flex-1 grid-cols-[1fr_auto_auto_auto_auto] items-center md:grid">
                            {/* Destination */}
                            <div className="flex items-center gap-3 border-r border-border px-5 py-2">
                                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="font-body text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Destination
                                    </p>
                                    <input
                                        value={destination}
                                        onChange={(e) =>
                                            setDestination(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && handleSearch()
                                        }
                                        placeholder="Où allez-vous ?"
                                        className="font-body w-full border-0 bg-transparent p-0 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            </div>

                            {/* Check-in */}
                            <div className="flex min-w-[130px] items-center gap-2 border-r border-border px-4 py-2">
                                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="font-body text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Arrivée
                                    </p>
                                    <input
                                        type="date"
                                        value={checkIn}
                                        onChange={(e) =>
                                            setCheckIn(e.target.value)
                                        }
                                        className="font-body w-full border-0 bg-transparent p-0 text-sm font-medium text-foreground outline-none"
                                    />
                                </div>
                            </div>

                            {/* Check-out */}
                            <div className="flex min-w-[130px] items-center gap-2 border-r border-border px-4 py-2">
                                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="font-body text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Départ
                                    </p>
                                    <input
                                        type="date"
                                        value={checkOut}
                                        onChange={(e) =>
                                            setCheckOut(e.target.value)
                                        }
                                        className="font-body w-full border-0 bg-transparent p-0 text-sm font-medium text-foreground outline-none"
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="relative flex min-w-[120px] items-center gap-2 px-4 py-2">
                                <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => setShowGuests(!showGuests)}
                                >
                                    <p className="font-body text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Voyageurs
                                    </p>
                                    <span className="font-body text-sm font-medium text-foreground">
                                        {guests} voyageur{guests > 1 ? 's' : ''}
                                    </span>
                                </div>
                                {showGuests && (
                                    <div className="absolute top-full right-0 z-50 mt-2 w-52 rounded-2xl border border-border bg-card p-4 shadow-hero">
                                        <div className="flex items-center justify-between">
                                            <span className="font-body text-sm text-foreground">
                                                Voyageurs
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
                                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
                                                >
                                                    <Minus className="h-3 w-3" />
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
                                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowGuests(false)}
                                            className="font-body mt-3 w-full rounded-lg bg-foreground py-2 text-xs font-semibold text-background"
                                        >
                                            Valider
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Search button */}
                            <Button
                                onClick={handleSearch}
                                className="h-12 w-12 shrink-0 rounded-full bg-accent p-0 text-accent-foreground shadow-md hover:bg-accent/90"
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Mobile version */}
                        <div className="flex flex-1 items-center gap-3 px-3 md:hidden">
                            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                            <div
                                className="flex-1"
                                // onClick={() => navigate('/search')}
                            >
                                <p className="font-body text-sm font-semibold text-foreground">
                                    Où allez-vous ?
                                </p>
                                <p className="font-body text-xs text-muted-foreground">
                                    N'importe où · N'importe quand · Voyageurs
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
