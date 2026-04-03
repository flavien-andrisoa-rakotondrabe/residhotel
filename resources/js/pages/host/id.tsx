import {
    MapPin,
    Star,
    Shield,
    MessageCircle,
    Home,
    Calendar,
    BadgeCheck,
    Users,
    ArrowLeft,
    Wifi,
    Car,
    Waves,
    ChefHat,
    AirVent,
    Tv,
} from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

/* ─── Amenity icons ─────────────────────────────────── */
const AMENITY_ICONS: Record<string, React.ElementType> = {
    'Wi-Fi': Wifi,
    Parking: Car,
    Piscine: Waves,
    Cuisine: ChefHat,
    Climatisation: AirVent,
    'Vue mer': Tv,
};

/* ─── Static mock reviews for demo ──────────────────── */
const MOCK_REVIEWS = [
    {
        id: 1,
        author: 'Sophie M.',
        avatar: '',
        initials: 'SM',
        date: 'Novembre 2024',
        rating: 5,
        text: 'Hôte exceptionnel ! Très réactif, logement parfaitement conforme aux photos. Je recommande vivement.',
    },
    {
        id: 2,
        author: 'Thomas R.',
        avatar: '',
        initials: 'TR',
        date: 'Octobre 2024',
        rating: 5,
        text: 'Accueil chaleureux, appartement propre et bien équipé. Communication facile du début à la fin.',
    },
    {
        id: 3,
        author: 'Camille D.',
        avatar: '',
        initials: 'CD',
        date: 'Septembre 2024',
        rating: 4,
        text: "Très bon séjour. L'hôte est attentionné et disponible. Quelques petits détails à améliorer mais globalement excellent.",
    },
];

/* ─── Component ──────────────────────────────────────── */
export default function HostPublicProfile() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    /* Fetch host profile */
    const { data: hostProfile, isLoading: loadingProfile } = useQuery({
        queryKey: ['host-profile', id],
        enabled: !!id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', id!)
                .single();
            if (error) throw error;
            return data;
        },
    });

    /* Fetch active listings */
    const { data: listings = [], isLoading: loadingListings } = useQuery({
        queryKey: ['host-listings', id],
        enabled: !!id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('host_id', id!)
                .eq('active', true)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    const isLoading = loadingProfile || loadingListings;

    const displayName = hostProfile
        ? `${hostProfile.first_name ?? ''} ${hostProfile.last_name ?? ''}`.trim() ||
          'Hôte Residotel'
        : 'Hôte Residotel';

    const initials = hostProfile
        ? `${hostProfile.first_name?.[0] ?? ''}${hostProfile.last_name?.[0] ?? ''}`.toUpperCase() ||
          'H'
        : 'H';

    const avgRating =
        listings.length > 0
            ? (
                  listings.reduce((sum, l) => sum + Number(l.rating), 0) /
                  listings.length
              ).toFixed(1)
            : null;

    const totalReviews = listings.reduce((sum, l) => sum + (l.reviews ?? 0), 0);

    const handleContact = () => {
        if (!user) {
            navigate('/auth');
            return;
        }
        navigate('/dashboard');
    };

    /* ── Loading skeleton ── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto max-w-5xl px-6 pt-24 pb-20">
                    <div className="space-y-8">
                        <div className="flex items-start gap-6">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-8 w-56" />
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-28 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-20">
                {/* Breadcrumb */}
                <div className="container mx-auto max-w-5xl px-6 py-4">
                    <Link
                        to="/search"
                        className="font-body inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux résultats
                    </Link>
                </div>

                <div className="container mx-auto max-w-5xl space-y-12 px-6 pb-20">
                    {/* ── Hero Card ── */}
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                        {/* Cover banner */}
                        <div className="relative h-32 bg-gradient-brand">
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage:
                                        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                                }}
                            />
                        </div>

                        <div className="px-8 pb-8">
                            {/* Avatar overlapping banner */}
                            <div className="-mt-12 mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                <div className="flex items-end gap-4">
                                    <Avatar className="h-24 w-24 border-4 border-card shadow-hero">
                                        {hostProfile?.avatar_url && (
                                            <AvatarImage
                                                src={hostProfile.avatar_url}
                                                alt={displayName}
                                            />
                                        )}
                                        <AvatarFallback className="font-display bg-gradient-brand text-3xl font-bold text-primary-foreground">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="mb-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="font-display text-2xl font-bold text-foreground">
                                                {displayName}
                                            </h1>
                                            <Badge className="font-body gap-1.5 border-0 bg-primary/10 text-xs text-primary">
                                                <BadgeCheck className="h-3.5 w-3.5" />
                                                Hôte certifié
                                            </Badge>
                                        </div>
                                        {hostProfile?.city && (
                                            <div className="mt-0.5 flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="font-body text-sm">
                                                    {hostProfile.city}
                                                    {hostProfile.country
                                                        ? `, ${hostProfile.country}`
                                                        : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleContact}
                                    className="font-body shrink-0 gap-2 bg-gradient-brand font-semibold text-primary-foreground shadow-md hover:opacity-90"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Contacter{' '}
                                    {hostProfile?.first_name ?? "l'hôte"}
                                </Button>
                            </div>

                            {/* Stats row */}
                            <div className="mb-6 grid grid-cols-3 gap-4">
                                {[
                                    {
                                        icon: Home,
                                        value: listings.length,
                                        label: `Annonce${listings.length > 1 ? 's' : ''}`,
                                    },
                                    {
                                        icon: Star,
                                        value: avgRating ?? '—',
                                        label: `${totalReviews} avis`,
                                    },
                                    {
                                        icon: Shield,
                                        value: '100%',
                                        label: 'Taux de réponse',
                                    },
                                ].map(({ icon: Icon, value, label }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-4"
                                    >
                                        <Icon className="mb-0.5 h-5 w-5 text-primary" />
                                        <span className="font-display text-xl font-bold text-foreground">
                                            {value}
                                        </span>
                                        <span className="font-body text-center text-xs text-muted-foreground">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Bio */}
                            {hostProfile?.bio && (
                                <p className="font-body leading-relaxed text-muted-foreground">
                                    {hostProfile.bio}
                                </p>
                            )}
                            {!hostProfile?.bio && (
                                <p className="font-body leading-relaxed text-muted-foreground italic">
                                    Bienvenue sur le profil de {displayName}.
                                    Cet hôte partage ses logements via Residotel
                                    pour vous offrir une expérience unique et
                                    mémorable.
                                </p>
                            )}

                            {/* Languages */}
                            {hostProfile?.languages &&
                                hostProfile.languages.length > 0 && (
                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className="font-body text-sm font-medium text-muted-foreground">
                                            Langues :
                                        </span>
                                        {hostProfile.languages.map(
                                            (lang: string) => (
                                                <Badge
                                                    key={lang}
                                                    variant="secondary"
                                                    className="font-body text-xs"
                                                >
                                                    {lang}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                )}

                            {/* Member since */}
                            {hostProfile?.created_at && (
                                <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4 shrink-0" />
                                    <span className="font-body text-sm">
                                        Membre depuis{' '}
                                        {new Date(
                                            hostProfile.created_at,
                                        ).toLocaleDateString('fr-FR', {
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Listings ── */}
                    <section>
                        <h2 className="font-display mb-6 text-2xl font-bold text-foreground">
                            {listings.length > 0
                                ? `Annonces de ${hostProfile?.first_name ?? 'cet hôte'} (${listings.length})`
                                : `Annonces de ${hostProfile?.first_name ?? 'cet hôte'}`}
                        </h2>

                        {listings.length === 0 ? (
                            <div className="rounded-2xl border border-border bg-card p-12 text-center">
                                <Home className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                                <p className="font-body text-muted-foreground">
                                    Aucune annonce active pour le moment.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {listings.map((listing) => {
                                    const coverImg =
                                        listing.image ??
                                        listing.images?.[0] ??
                                        null;
                                    return (
                                        <Link
                                            key={listing.id}
                                            to={`/property/${listing.id}`}
                                            className="group block"
                                        >
                                            <Card className="overflow-hidden border-border transition-all duration-300 hover:border-primary/30 hover:shadow-hero">
                                                {/* Image */}
                                                <div className="relative h-48 overflow-hidden bg-muted">
                                                    {coverImg ? (
                                                        <img
                                                            src={coverImg}
                                                            alt={listing.title}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-gradient-brand">
                                                            <Home className="h-10 w-10 text-primary-foreground/40" />
                                                        </div>
                                                    )}
                                                    {listing.badge && (
                                                        <Badge className="font-body absolute top-3 left-3 border-0 bg-accent text-xs font-semibold text-accent-foreground">
                                                            {listing.badge}
                                                        </Badge>
                                                    )}
                                                    <div className="absolute right-3 bottom-3">
                                                        <div className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
                                                            <Star className="h-3 w-3 fill-accent text-accent" />
                                                            <span className="font-body text-xs font-semibold text-white">
                                                                {Number(
                                                                    listing.rating,
                                                                ) > 0
                                                                    ? Number(
                                                                          listing.rating,
                                                                      ).toFixed(
                                                                          1,
                                                                      )
                                                                    : 'Nouveau'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <CardContent className="p-4">
                                                    <div className="mb-1 flex items-start justify-between gap-2">
                                                        <h3 className="font-display line-clamp-1 text-sm leading-snug font-bold text-foreground transition-colors group-hover:text-primary">
                                                            {listing.title}
                                                        </h3>
                                                    </div>
                                                    <div className="mb-3 flex items-center gap-1.5 text-muted-foreground">
                                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="font-body truncate text-xs">
                                                            {listing.location}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-body flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3.5 w-3.5" />
                                                                {listing.guests}
                                                            </span>
                                                            <span>
                                                                {
                                                                    listing.bedrooms
                                                                }{' '}
                                                                ch.
                                                            </span>
                                                            <span>
                                                                {
                                                                    listing.bathrooms
                                                                }{' '}
                                                                sdb.
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-display text-base font-bold text-foreground">
                                                                {Number(
                                                                    listing.price,
                                                                ).toLocaleString(
                                                                    'fr-FR',
                                                                )}{' '}
                                                                €
                                                            </span>
                                                            <span className="font-body text-xs text-muted-foreground">
                                                                {' '}
                                                                /nuit
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {listing.amenities?.length >
                                                        0 && (
                                                        <div className="mt-3 flex flex-wrap gap-1">
                                                            {listing.amenities
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        a: string,
                                                                    ) => {
                                                                        const Icon =
                                                                            AMENITY_ICONS[
                                                                                a
                                                                            ];
                                                                        return Icon ? (
                                                                            <span
                                                                                key={
                                                                                    a
                                                                                }
                                                                                className="font-body flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5 text-xs text-secondary-foreground"
                                                                            >
                                                                                <Icon className="h-3 w-3" />
                                                                                {
                                                                                    a
                                                                                }
                                                                            </span>
                                                                        ) : null;
                                                                    },
                                                                )}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <Separator />

                    {/* ── Reviews ── */}
                    <section>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-display text-2xl font-bold text-foreground">
                                Avis des voyageurs
                            </h2>
                            {avgRating && (
                                <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-4 py-2">
                                    <Star className="h-5 w-5 fill-accent text-accent" />
                                    <span className="font-display text-xl font-bold text-foreground">
                                        {avgRating}
                                    </span>
                                    <span className="font-body text-sm text-muted-foreground">
                                        / 5 · {totalReviews} avis
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {MOCK_REVIEWS.map((review) => (
                                <Card key={review.id} className="border-border">
                                    <CardContent className="p-5">
                                        <div className="mb-3 flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="font-body bg-secondary text-xs font-semibold text-secondary-foreground">
                                                    {review.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-body text-sm font-semibold text-foreground">
                                                    {review.author}
                                                </p>
                                                <p className="font-body text-xs text-muted-foreground">
                                                    {review.date}
                                                </p>
                                            </div>
                                            <div className="ml-auto flex items-center gap-0.5">
                                                {Array.from({
                                                    length: review.rating,
                                                }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="h-3.5 w-3.5 fill-accent text-accent"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="font-body text-sm leading-relaxed text-muted-foreground">
                                            {review.text}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* ── Contact CTA ── */}
                    <section className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-md">
                            <MessageCircle className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h2 className="font-display mb-2 text-xl font-bold text-foreground">
                            Une question pour{' '}
                            {hostProfile?.first_name ?? 'cet hôte'} ?
                        </h2>
                        <p className="font-body mx-auto mb-6 max-w-sm text-muted-foreground">
                            Contactez-le directement via la messagerie
                            Residotel. Il répond généralement en moins d'une
                            heure.
                        </p>
                        <Button
                            onClick={handleContact}
                            size="lg"
                            className="font-body gap-2 bg-gradient-brand font-semibold text-primary-foreground shadow-hero hover:opacity-90"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Envoyer un message
                        </Button>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
