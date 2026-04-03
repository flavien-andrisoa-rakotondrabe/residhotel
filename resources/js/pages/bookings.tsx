import { format, isPast, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    CalendarCheck,
    MapPin,
    Clock,
    Euro,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight,
    Search,
    Plane,
    TrendingUp,
    SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ReviewForm from '@/components/property/ReviewForm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Booking {
    id: string;
    property_id: string;
    property_title: string;
    property_image: string | null;
    property_location: string | null;
    check_in: string;
    check_out: string;
    nights: number;
    guests: number;
    price_per_night: number;
    subtotal: number;
    service_fee: number;
    total: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    created_at: string;
}

const STATUS_CONFIG = {
    confirmed: {
        label: 'Confirmée',
        icon: CheckCircle2,
        dot: 'bg-primary',
        badge: 'bg-primary/10 text-primary',
    },
    pending: {
        label: 'En attente',
        icon: AlertCircle,
        dot: 'bg-accent',
        badge: 'bg-accent/15 text-accent',
    },
    cancelled: {
        label: 'Annulée',
        icon: XCircle,
        dot: 'bg-destructive',
        badge: 'bg-destructive/10 text-destructive',
    },
};

const PAYMENT_CONFIG = {
    paid: { label: 'Payé', className: 'bg-primary/10 text-primary' },
    pending: {
        label: 'Paiement en attente',
        className: 'bg-accent/15 text-accent',
    },
    failed: {
        label: 'Paiement échoué',
        className: 'bg-destructive/10 text-destructive',
    },
    refunded: {
        label: 'Remboursé',
        className: 'bg-muted text-muted-foreground',
    },
};

function isUpcoming(booking: Booking) {
    return (
        !isPast(parseISO(booking.check_out)) && booking.status !== 'cancelled'
    );
}

export default function BookingsPage({
    embedded = false,
}: {
    embedded?: boolean;
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [search, setSearch] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null,
    );

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['bookings', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('traveler_id', user!.id)
                .order('check_in', { ascending: true });
            if (error) throw error;
            return data as Booking[];
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async (bookingId: string) => {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', bookingId)
                .eq('traveler_id', user!.id);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['bookings'] });
            toast({
                title: 'Réservation annulée',
                description: 'Votre réservation a été annulée.',
            });
            setSelectedBooking(null);
        },
        onError: (err: Error) =>
            toast({
                title: 'Erreur',
                description: err.message,
                variant: 'destructive',
            }),
    });

    const filtered = bookings
        .filter((b) => (tab === 'upcoming' ? isUpcoming(b) : !isUpcoming(b)))
        .filter(
            (b) =>
                !search ||
                b.property_title.toLowerCase().includes(search.toLowerCase()) ||
                (b.property_location ?? '')
                    .toLowerCase()
                    .includes(search.toLowerCase()),
        );

    const upcomingCount = bookings.filter(isUpcoming).length;
    const pastCount = bookings.filter((b) => !isUpcoming(b)).length;
    const totalSpent = bookings
        .filter((b) => b.status !== 'cancelled')
        .reduce((s, b) => s + Number(b.total), 0);
    const canCancel = (b: Booking) =>
        b.status === 'confirmed' || b.status === 'pending';

    if (!user) {
        if (embedded) return null;
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto max-w-lg px-6 pt-32 pb-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <CalendarCheck className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h1 className="font-display mb-2 text-2xl font-bold text-foreground">
                        Connexion requise
                    </h1>
                    <p className="font-body mb-6 text-muted-foreground">
                        Connectez-vous pour accéder à vos réservations.
                    </p>
                    <Link to="/auth">
                        <Button className="font-body bg-gradient-brand font-semibold text-primary-foreground">
                            Se connecter
                        </Button>
                    </Link>
                </main>
            </div>
        );
    }

    const inner = (
        <div
            className={
                embedded
                    ? 'max-w-4xl'
                    : 'container mx-auto max-w-4xl px-6 pt-28 pb-20'
            }
        >
            {/* Header */}
            {!embedded && (
                <div className="mb-8 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted transition-colors hover:bg-muted/80"
                    >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <div>
                        <h1 className="font-display text-2xl font-bold text-foreground">
                            Mes réservations
                        </h1>
                        <p className="font-body text-sm text-muted-foreground">
                            {bookings.length} réservation
                            {bookings.length !== 1 ? 's' : ''} au total
                        </p>
                    </div>
                </div>
            )}
            {embedded && (
                <div className="mb-6">
                    <h2 className="font-display text-2xl font-bold text-foreground">
                        Mes réservations
                    </h2>
                    <p className="font-body mt-0.5 text-sm text-muted-foreground">
                        {bookings.length} réservation
                        {bookings.length !== 1 ? 's' : ''} au total
                    </p>
                </div>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-3">
                {[
                    {
                        label: 'À venir',
                        value: upcomingCount,
                        icon: Plane,
                        colorClass: 'text-primary',
                        bgClass: 'bg-primary/8',
                    },
                    {
                        label: 'Total dépensé',
                        value: `${totalSpent.toLocaleString('fr-FR')} €`,
                        icon: Euro,
                        colorClass: 'text-accent',
                        bgClass: 'bg-accent/10',
                    },
                    {
                        label: 'Passés',
                        value: pastCount,
                        icon: TrendingUp,
                        colorClass: 'text-primary',
                        bgClass: 'bg-primary/8',
                    },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-2xl border border-border bg-card p-4 shadow-card"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-xl',
                                    s.bgClass,
                                )}
                            >
                                <s.icon
                                    className={cn('h-4 w-4', s.colorClass)}
                                />
                            </div>
                        </div>
                        <p className="font-display text-xl font-bold text-foreground">
                            {s.value}
                        </p>
                        <p className="font-body mt-0.5 text-xs text-muted-foreground">
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Tabs + Search */}
            <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex rounded-xl bg-muted p-1">
                    {(
                        [
                            {
                                id: 'upcoming',
                                label: 'À venir',
                                count: upcomingCount,
                            },
                            {
                                id: 'past',
                                label: 'Passés & annulés',
                                count: pastCount,
                            },
                        ] as const
                    ).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'font-body flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                                tab === t.id
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t.label}
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.5 text-xs font-bold',
                                    tab === t.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-muted-foreground/15 text-muted-foreground',
                                )}
                            >
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-56">
                    <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="font-body h-9 bg-card pl-8 text-sm"
                    />
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="flex animate-pulse gap-4 rounded-2xl border border-border bg-card p-5"
                        >
                            <div className="h-20 w-24 shrink-0 rounded-xl bg-muted" />
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 w-1/2 rounded bg-muted" />
                                <div className="h-3 w-1/3 rounded bg-muted" />
                                <div className="h-3 w-1/4 rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState tab={tab} search={search} />
            ) : (
                <div className="space-y-3">
                    {filtered.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onSelect={() => setSelectedBooking(booking)}
                            onCancel={() => cancelMutation.mutate(booking.id)}
                            cancelling={cancelMutation.isPending}
                            canCancel={canCancel(booking)}
                        />
                    ))}
                </div>
            )}

            {selectedBooking && (
                <BookingDetailSheet
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onCancel={() => cancelMutation.mutate(selectedBooking.id)}
                    cancelling={cancelMutation.isPending}
                    canCancel={canCancel(selectedBooking)}
                />
            )}
        </div>
    );

    if (embedded) return inner;
    return (
        <div className="min-h-screen bg-muted/30">
            <Navbar />
            <main>{inner}</main>
        </div>
    );
}

function BookingCard({
    booking,
    onSelect,
    onCancel,
    cancelling,
    canCancel,
}: {
    booking: Booking;
    onSelect: () => void;
    onCancel: () => void;
    cancelling: boolean;
    canCancel: boolean;
}) {
    const status = STATUS_CONFIG[booking.status];
    const StatusIcon = status.icon;
    const upcoming = isUpcoming(booking);
    const isPastStay = !upcoming && booking.status === 'confirmed';
    const isRealProperty = /^[0-9a-f-]{36}$/i.test(booking.property_id);
    const daysUntil = upcoming
        ? differenceInDays(parseISO(booking.check_in), new Date())
        : null;

    return (
        <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:border-primary/20 hover:shadow-hero">
            <div className="flex gap-0">
                {/* Image */}
                <div className="relative w-28 shrink-0 overflow-hidden sm:w-40">
                    <img
                        src={
                            booking.property_image ??
                            'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400'
                        }
                        alt={booking.property_title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ minHeight: '130px' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                    {upcoming && daysUntil !== null && daysUntil <= 7 && (
                        <div className="font-body absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            {daysUntil === 0
                                ? "Aujourd'hui"
                                : `Dans ${daysUntil}j`}
                        </div>
                    )}
                    {upcoming && daysUntil !== null && daysUntil > 7 && (
                        <div className="font-body absolute top-2 left-2 rounded-full bg-primary/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                            À venir
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                    <div>
                        <div className="mb-1 flex items-start justify-between gap-2">
                            <h3 className="font-display line-clamp-1 text-sm leading-tight font-bold text-foreground sm:text-base">
                                {booking.property_title}
                            </h3>
                            <Badge
                                className={cn(
                                    'font-body flex shrink-0 items-center gap-1 border-0 text-xs',
                                    status.badge,
                                )}
                            >
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                            </Badge>
                        </div>
                        {booking.property_location && (
                            <p className="font-body mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />{' '}
                                {booking.property_location}
                            </p>
                        )}
                        <div className="font-body flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(parseISO(booking.check_in), 'd MMM', {
                                    locale: fr,
                                })}{' '}
                                →{' '}
                                {format(
                                    parseISO(booking.check_out),
                                    'd MMM yyyy',
                                    { locale: fr },
                                )}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarCheck className="h-3 w-3" />
                                {booking.nights} nuit
                                {booking.nights > 1 ? 's' : ''}
                            </span>
                        </div>
                        {booking.payment_status && (
                            <div className="mt-2">
                                <Badge
                                    className={cn(
                                        'font-body border-0 text-xs',
                                        PAYMENT_CONFIG[booking.payment_status]
                                            ?.className ??
                                            'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {PAYMENT_CONFIG[booking.payment_status]
                                        ?.label ?? booking.payment_status}
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <span className="font-display text-base font-bold text-primary">
                            {Number(booking.total).toLocaleString('fr-FR')} €
                        </span>
                        <div className="flex flex-wrap justify-end gap-1.5">
                            {canCancel && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="font-body h-8 border-destructive/30 text-xs text-destructive hover:bg-destructive/5"
                                        >
                                            Annuler
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-display">
                                                Annuler la réservation ?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="font-body">
                                                Êtes-vous sûr de vouloir annuler
                                                votre séjour à{' '}
                                                <strong>
                                                    {booking.property_title}
                                                </strong>{' '}
                                                ? Cette action est irréversible.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="font-body">
                                                Conserver
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={onCancel}
                                                disabled={cancelling}
                                                className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {cancelling
                                                    ? 'Annulation...'
                                                    : 'Annuler le séjour'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            {isPastStay && isRealProperty && (
                                <ReviewForm
                                    bookingId={booking.id}
                                    propertyId={booking.property_id}
                                    propertyTitle={booking.property_title}
                                />
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onSelect}
                                className="font-body h-8 gap-1 text-xs text-primary hover:bg-primary/8"
                            >
                                Détails <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BookingDetailSheet({
    booking,
    onClose,
    onCancel,
    cancelling,
    canCancel,
}: {
    booking: Booking;
    onClose: () => void;
    onCancel: () => void;
    cancelling: boolean;
    canCancel: boolean;
}) {
    const status = STATUS_CONFIG[booking.status];
    const StatusIcon = status.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md animate-scale-in overflow-hidden rounded-3xl border border-border bg-card shadow-hero"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image header */}
                <div className="relative h-52">
                    <img
                        src={
                            booking.property_image ??
                            'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400'
                        }
                        alt={booking.property_title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-4 left-5">
                        <h2 className="font-display text-xl leading-tight font-bold text-white">
                            {booking.property_title}
                        </h2>
                        {booking.property_location && (
                            <p className="font-body mt-1 flex items-center gap-1 text-xs text-white/80">
                                <MapPin className="h-3 w-3" />{' '}
                                {booking.property_location}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-4 p-5">
                    {/* Status + Ref */}
                    <div className="flex items-center justify-between">
                        <Badge
                            className={cn(
                                'font-body flex items-center gap-1.5 border-0 px-3 py-1.5 text-sm',
                                status.badge,
                            )}
                        >
                            <StatusIcon className="h-4 w-4" /> {status.label}
                        </Badge>
                        <span className="font-body rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
                            #{booking.id.slice(0, 8).toUpperCase()}
                        </span>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {
                                label: 'Arrivée',
                                value: format(
                                    parseISO(booking.check_in),
                                    'EEE d MMM yyyy',
                                    { locale: fr },
                                ),
                            },
                            {
                                label: 'Départ',
                                value: format(
                                    parseISO(booking.check_out),
                                    'EEE d MMM yyyy',
                                    { locale: fr },
                                ),
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-xl border border-border bg-muted/50 p-3"
                            >
                                <p className="font-body mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    {item.label}
                                </p>
                                <p className="font-body text-sm font-semibold text-foreground capitalize">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2 rounded-xl bg-muted/30 p-4">
                        {[
                            {
                                label: 'Durée',
                                value: `${booking.nights} nuit${booking.nights > 1 ? 's' : ''}`,
                            },
                            { label: 'Voyageurs', value: `${booking.guests}` },
                            {
                                label: `${Number(booking.price_per_night).toLocaleString('fr-FR')} € × ${booking.nights} nuits`,
                                value: `${Number(booking.subtotal).toLocaleString('fr-FR')} €`,
                            },
                            {
                                label: 'Frais de service',
                                value: `${Number(booking.service_fee).toLocaleString('fr-FR')} €`,
                            },
                        ].map((row) => (
                            <div
                                key={row.label}
                                className="font-body flex justify-between text-sm text-muted-foreground"
                            >
                                <span>{row.label}</span>
                                <span className="font-medium text-foreground">
                                    {row.value}
                                </span>
                            </div>
                        ))}
                        <div className="font-body mt-2 flex justify-between border-t border-border pt-2">
                            <span className="font-semibold text-foreground">
                                Total
                            </span>
                            <span className="font-display text-lg font-bold text-primary">
                                {Number(booking.total).toLocaleString('fr-FR')}{' '}
                                €
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {canCancel && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="font-body flex-1 border-destructive/30 text-destructive hover:bg-destructive/5"
                                    >
                                        Annuler
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="font-display">
                                            Annuler le séjour ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="font-body">
                                            Annuler{' '}
                                            <strong>
                                                {booking.property_title}
                                            </strong>{' '}
                                            ? Cette action est irréversible.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="font-body">
                                            Conserver
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={onCancel}
                                            disabled={cancelling}
                                            className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {cancelling
                                                ? 'Annulation...'
                                                : 'Oui, annuler'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <Button
                            variant="outline"
                            className="font-body flex-1 gap-2"
                            onClick={onClose}
                        >
                            Fermer
                        </Button>
                    </div>

                    {!canCancel &&
                        booking.status === 'confirmed' &&
                        /^[0-9a-f-]{36}$/i.test(booking.property_id) && (
                            <ReviewForm
                                bookingId={booking.id}
                                propertyId={booking.property_id}
                                propertyTitle={booking.property_title}
                            />
                        )}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ tab, search }: { tab: string; search: string }) {
    return (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                {search ? (
                    <SlidersHorizontal className="h-8 w-8 text-muted-foreground/50" />
                ) : (
                    <CalendarCheck className="h-8 w-8 text-muted-foreground/50" />
                )}
            </div>
            <h3 className="font-display mb-2 text-xl font-bold text-foreground">
                {search
                    ? 'Aucun résultat'
                    : tab === 'upcoming'
                      ? 'Aucun séjour à venir'
                      : 'Aucun séjour passé'}
            </h3>
            <p className="font-body mx-auto mb-6 max-w-xs text-sm text-muted-foreground">
                {search
                    ? `Aucune réservation ne correspond à "${search}".`
                    : tab === 'upcoming'
                      ? 'Explorez nos destinations pour planifier votre prochain séjour.'
                      : 'Vos séjours passés et annulés apparaîtront ici.'}
            </p>
            {!search && tab === 'upcoming' && (
                <Link to="/search">
                    <Button className="font-body gap-2 bg-gradient-brand font-semibold text-primary-foreground">
                        <Plane className="h-4 w-4" /> Explorer les destinations
                    </Button>
                </Link>
            )}
        </div>
    );
}
