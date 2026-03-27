import { usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    CalendarIcon,
    Users,
    ChevronDown,
    ChevronUp,
    Shield,
    Star,
    CreditCard,
    Info,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PlatformSettings } from '@/types/platform/platformSettings';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
    propertyId?: string | number;
    propertyTitle?: string;
    propertyImage?: string;
    propertyLocation?: string;
    pricePerNight?: number;
    rating?: number;
    reviewCount?: number;
}

export default function BookingForm({
    pricePerNight = 680,
    rating = 5.0,
    reviewCount = 87,
}: Props) {
    const { platform } = usePage<{ platform: { settings: PlatformSettings } }>()
        .props;
    const [guestsOpen, setGuestsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const platformSettings = platform.settings;

    const onSubmit = async (e: React.FormEvent) => {};

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Price header */}
            <div className="mb-1 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-foreground">
                    {pricePerNight}€
                </span>
                <span className="font-body text-sm text-muted-foreground">
                    / nuit
                </span>
                <div className="ml-auto flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-body text-sm font-semibold">
                        {rating.toFixed(1)}
                    </span>
                    <span className="font-body text-xs text-muted-foreground">
                        ({reviewCount} avis)
                    </span>
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Arrivée
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'font-body h-11 w-full justify-start border-border text-left',
                                    'text-muted-foreground',
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-accent" />
                                {'Date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                modifiersClassNames={{
                                    unavailable:
                                        'bg-destructive/15 text-destructive line-through',
                                }}
                                initialFocus
                                className="pointer-events-auto p-3"
                                locale={fr}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <Label className="font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Départ
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'font-body h-11 w-full justify-start border-border text-left',
                                    'text-muted-foreground',
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-accent" />
                                {'Date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                modifiersClassNames={{
                                    unavailable:
                                        'bg-destructive/15 text-destructive line-through',
                                }}
                                initialFocus
                                className="pointer-events-auto p-3"
                                locale={fr}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Guests */}
            <div>
                <Label className="font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Voyageurs
                </Label>
                <button
                    type="button"
                    onClick={() => setGuestsOpen(!guestsOpen)}
                    className="mt-1.5 flex h-11 w-full items-center justify-between rounded-lg border border-border px-4 transition-colors hover:border-primary/40"
                >
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent" />
                        <span className="font-body text-sm">
                            adulte, enfant
                        </span>
                    </div>
                    {guestsOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>
                {guestsOpen && (
                    <div className="animate-fade-in mt-1 space-y-4 rounded-lg border border-border bg-card p-4 shadow-card">
                        {[
                            {
                                label: 'Adultes',
                                sub: '13 ans et plus',
                                field: 'adults' as const,
                                min: 1,
                                max: 10,
                            },
                            {
                                label: 'Enfants',
                                sub: '2–12 ans',
                                field: 'children' as const,
                                min: 0,
                                max: 8,
                            },
                        ].map(({ label, sub, field, min, max }) => (
                            <div
                                key={field}
                                className="flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-body text-sm font-medium">
                                        {label}
                                    </p>
                                    <p className="font-body text-xs text-muted-foreground">
                                        {sub}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        className="font-body flex h-8 w-8 items-center justify-center rounded-full border border-border text-lg leading-none transition-colors hover:border-primary"
                                    >
                                        −
                                    </button>
                                    {/* <span className="font-body w-5 text-center text-sm font-semibold">
                                        {form.watch(field)}
                                    </span> */}
                                    <button
                                        type="button"
                                        className="font-body flex h-8 w-8 items-center justify-center rounded-full border border-border text-lg leading-none transition-colors hover:border-primary"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="font-body h-12 w-full rounded-xl bg-gradient-brand text-base font-semibold text-primary-foreground shadow-md hover:opacity-90"
                size="lg"
            >
                {loading ? 'Redirection vers le paiement…' : 'Réserver ce bien'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-body text-xs">
                    Paiement sécurisé par Stripe · Annulation gratuite sous 48h
                </span>
            </div>
        </form>
    );
}
