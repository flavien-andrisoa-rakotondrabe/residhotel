import {
    MapPin,
    Star,
    Heart,
    Share2,
    Shield,
    Wifi,
    Car,
    Waves,
    ChefHat,
    AirVent,
    Tv,
    Users,
    BedDouble,
    Bath,
    ArrowLeft,
    CalendarDays,
    Images,
    Settings2,
    Eye,
    EyeOff,
    Loader2,
    MessageSquare,
    CheckCircle,
    Award,
    Languages,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import BookingForm from '@/components/property/BookingForm';
import AvailabilityCalendar from '@/components/property/AvailabilityCalendar';
import PropertyReviews from '@/components/property/PropertyReviews';
import AvailabilityManager from '@/components/dashboard/AvailabilityManager';
import ListingImageManager from '@/components/dashboard/ListingImageManager';
import { ALL_PROPERTIES } from '@/data/properties';

const AMENITY_ICONS: Record<string, React.ElementType> = {
    'Wi-Fi': Wifi,
    Parking: Car,
    Piscine: Waves,
    Cuisine: ChefHat,
    Climatisation: AirVent,
    'Vue mer': Tv,
};

interface DBProperty {
    id: string;
    host_id: string;
    title: string;
    description: string | null;
    location: string;
    price: number;
    type: string;
    bedrooms: number;
    bathrooms: number;
    guests: number;
    amenities: string[];
    images: string[];
    image: string | null;
    badge: string | null;
    rating: number;
    reviews: number;
    active: boolean;
}

export default function PropertyDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { isFavorite, toggle: toggleFav } = useFavorites();
    const [availOpen, setAvailOpen] = useState(false);
    const [photosOpen, setPhotosOpen] = useState(false);
    const [contacting, setContacting] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    const isUUID = id && /^[0-9a-f-]{36}$/i.test(id);
    const staticProp = !isUUID
        ? ALL_PROPERTIES.find((p) => String(p.id) === id)
        : undefined;

    const { data: dbProperty, isLoading } = useQuery({
        queryKey: ['property', id],
        enabled: !!isUUID,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id!)
                .single();
            if (error) throw error;
            return data as DBProperty;
        },
    });

    const property =
        dbProperty ??
        (staticProp
            ? {
                  id: String(staticProp.id),
                  host_id: '',
                  title: staticProp.title,
                  description: null,
                  location: staticProp.location,
                  price: staticProp.price,
                  type: staticProp.type,
                  bedrooms: staticProp.bedrooms,
                  bathrooms: staticProp.bathrooms,
                  guests: staticProp.guests,
                  amenities: staticProp.amenities,
                  images: staticProp.images,
                  image: staticProp.image,
                  badge: staticProp.badge ?? null,
                  rating: staticProp.rating,
                  reviews: staticProp.reviews,
                  active: true,
              }
            : null);

    const { data: hostProfile } = useQuery({
        queryKey: ['host-profile', dbProperty?.host_id],
        enabled: !!dbProperty?.host_id,
        queryFn: async () => {
            const { data } = await supabase
                .from('profiles')
                .select(
                    'user_id, first_name, last_name, avatar_url, bio, languages',
                )
                .eq('user_id', dbProperty!.host_id)
                .maybeSingle();
            return data;
        },
    });

    const contactHost = async () => {
        if (!user) {
            navigate(
                '/auth?redirect=' +
                    encodeURIComponent(window.location.pathname),
            );
            return;
        }
        if (!property?.host_id || !isUUID) {
            toast({
                title: "Impossible de contacter l'hôte.",
                variant: 'destructive',
            });
            return;
        }
        if (user.id === property.host_id) {
            toast({ title: "Vous êtes l'hôte de cette annonce." });
            return;
        }
        setContacting(true);
        try {
            const { data: existing } = await supabase
                .from('messages')
                .select('id')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .eq('property_id', property.id)
                .limit(1);
            if (!existing || existing.length === 0) {
                await supabase.from('messages').insert({
                    sender_id: user.id,
                    receiver_id: property.host_id,
                    property_id: property.id,
                    content: `Bonjour, je suis intéressé(e) par votre annonce "${property.title}". Pourriez-vous me donner plus d'informations ?`,
                });
            }
            navigate('/dashboard?section=messages');
        } catch {
            toast({
                title: 'Erreur lors de la prise de contact.',
                variant: 'destructive',
            });
        } finally {
            setContacting(false);
        }
    };

    const toggleMutation = useMutation({
        mutationFn: async (active: boolean) => {
            const { error } = await supabase
                .from('properties')
                .update({ active })
                .eq('id', property!.id)
                .eq('host_id', user!.id);
            if (error) throw error;
        },
        onSuccess: (_, active) => {
            qc.invalidateQueries({ queryKey: ['property', id] });
            qc.invalidateQueries({ queryKey: ['host-properties'] });
            toast({ title: active ? 'Annonce activée' : 'Annonce désactivée' });
        },
        onError: (e: Error) =>
            toast({
                title: 'Erreur',
                description: e.message,
                variant: 'destructive',
            }),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto max-w-7xl px-6 pt-20 pb-20">
                    <div className="mt-6 animate-pulse space-y-6">
                        <div className="h-7 w-1/3 rounded bg-muted" />
                        <div className="h-[480px] rounded-3xl bg-muted" />
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="space-y-5 lg:col-span-2">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-24 rounded-2xl bg-muted"
                                    />
                                ))}
                            </div>
                            <div className="h-80 rounded-2xl bg-muted" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-6 pt-24 pb-20 text-center">
                    <h1 className="font-display mb-4 text-2xl font-bold text-foreground">
                        Propriété introuvable
                    </h1>
                    <Link to="/search">
                        <Button className="font-body bg-gradient-brand font-semibold text-primary-foreground">
                            Parcourir les annonces
                        </Button>
                    </Link>
                </main>
            </div>
        );
    }

    // Build image array
    const allImages: string[] = [];
    if (property.image) allImages.push(property.image);
    (property.images ?? []).forEach((img) => {
        if (img && !allImages.includes(img)) allImages.push(img);
    });
    const fallback =
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200';
    const mainImg = allImages[0] ?? fallback;
    const extraImgs = allImages.slice(1, 5);

    const amenityList = property.amenities.map((name) => ({
        icon: AMENITY_ICONS[name] ?? Shield,
        label: name,
    }));
    const isOwner =
        !!user && !!property.host_id && user.id === property.host_id;

    const hostName = hostProfile
        ? `${hostProfile.first_name ?? ''} ${hostProfile.last_name ?? ''}`.trim() ||
          'Hôte Residotel'
        : 'Hôte Residotel';
    const hostInitials =
        (
            (hostProfile?.first_name?.[0] ?? '') +
            (hostProfile?.last_name?.[0] ?? '')
        ).toUpperCase() || 'R';

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Host Admin Banner */}
            {isOwner && (
                <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/10 bg-primary/95 shadow-hero backdrop-blur-md">
                    <div className="container mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/80">
                                <Settings2 className="h-3.5 w-3.5 text-white" />
                            </div>
                            <p className="font-body text-xs font-semibold text-white/80">
                                Mode hôte — Vous consultez votre annonce
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="font-body h-8 gap-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                                onClick={() => setAvailOpen(true)}
                            >
                                <CalendarDays className="h-3.5 w-3.5" />{' '}
                                Disponibilités
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="font-body h-8 gap-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                                onClick={() => setPhotosOpen(true)}
                            >
                                <Images className="h-3.5 w-3.5" /> Photos
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="font-body h-8 gap-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                                onClick={() =>
                                    toggleMutation.mutate(!dbProperty?.active)
                                }
                                disabled={toggleMutation.isPending || !isUUID}
                            >
                                {toggleMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : dbProperty?.active ? (
                                    <>
                                        <EyeOff className="h-3.5 w-3.5" />{' '}
                                        Désactiver
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-3.5 w-3.5" /> Activer
                                    </>
                                )}
                            </Button>
                            <Link to="/dashboard">
                                <Button
                                    size="sm"
                                    className="font-body h-8 gap-1.5 border-0 bg-white/20 text-xs text-white hover:bg-white/30"
                                >
                                    <Settings2 className="h-3.5 w-3.5" />{' '}
                                    Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <Dialog open={availOpen} onOpenChange={setAvailOpen}>
                <DialogContent className="font-body max-h-[90vh] max-w-2xl overflow-y-auto">
                    <AvailabilityManager
                        propertyId={property.id}
                        propertyTitle={property.title}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={photosOpen} onOpenChange={setPhotosOpen}>
                <DialogContent className="font-body max-h-[90vh] max-w-3xl overflow-y-auto">
                    <ListingImageManager
                        propertyId={property.id}
                        propertyTitle={property.title}
                        initialImages={property.images ?? []}
                        initialMainImage={property.image}
                        onClose={() => {
                            setPhotosOpen(false);
                            qc.invalidateQueries({
                                queryKey: ['property', id],
                            });
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Full gallery lightbox */}
            {galleryOpen && (
                <div
                    className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
                    onClick={() => setGalleryOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        onClick={() => setGalleryOpen(false)}
                    >
                        ×
                    </button>
                    <div
                        className="w-full max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={allImages[activeImg] ?? fallback}
                            alt=""
                            className="max-h-[80vh] w-full rounded-2xl object-contain"
                        />
                        {allImages.length > 1 && (
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        className={cn(
                                            'h-12 w-16 overflow-hidden rounded-lg border-2 transition-all',
                                            i === activeImg
                                                ? 'border-accent'
                                                : 'border-transparent opacity-60 hover:opacity-100',
                                        )}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <main className={isOwner ? 'pt-20 pb-24' : 'pt-20'}>
                {/* Breadcrumb */}
                <div className="container mx-auto max-w-7xl px-4 py-4 md:px-6">
                    <div className="flex items-center gap-1.5 text-sm">
                        <Link
                            to="/search"
                            className="font-body flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" /> Retour
                        </Link>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                        <span className="font-body text-muted-foreground">
                            {property.location}
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                        <span className="font-body max-w-[200px] truncate font-medium text-foreground">
                            {property.title}
                        </span>
                    </div>
                </div>

                <div className="container mx-auto max-w-7xl px-4 pb-20 md:px-6">
                    {/* ── Title Row ── */}
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                {property.badge && (
                                    <Badge className="font-body border-0 bg-gradient-amber text-xs font-bold text-white shadow-sm">
                                        {property.badge}
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="font-body text-xs capitalize"
                                >
                                    {property.type}
                                </Badge>
                                {!dbProperty?.active && isOwner && (
                                    <Badge className="font-body border-0 bg-destructive/10 text-xs text-destructive">
                                        Hors ligne
                                    </Badge>
                                )}
                            </div>
                            <h1 className="font-display mb-3 text-3xl leading-tight font-bold text-foreground md:text-4xl">
                                {property.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="font-body flex items-center gap-1.5 text-muted-foreground">
                                    <MapPin className="h-4 w-4 text-primary" />{' '}
                                    {property.location}
                                </span>
                                {property.rating > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <Star className="h-4 w-4 fill-accent text-accent" />
                                        <span className="font-body font-bold text-foreground">
                                            {Number(property.rating).toFixed(1)}
                                        </span>
                                        <span className="font-body text-muted-foreground">
                                            · {property.reviews} avis
                                        </span>
                                    </span>
                                )}
                                <span className="font-body flex items-center gap-1.5 text-xs font-semibold text-primary">
                                    <CheckCircle className="h-3.5 w-3.5" /> Hôte
                                    certifié Residotel
                                </span>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="font-body gap-2 rounded-xl"
                            >
                                <Share2 className="h-4 w-4" /> Partager
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'font-body gap-2 rounded-xl transition-all',
                                    property &&
                                        isFavorite(property.id) &&
                                        'border-destructive/30 bg-destructive/10 text-destructive',
                                )}
                                onClick={() =>
                                    property &&
                                    toggleFav({
                                        propertyId: property.id,
                                        propertyTitle: property.title,
                                        propertyImage: property.image,
                                        propertyLocation: property.location,
                                        propertyPrice: Number(property.price),
                                        propertyRating: Number(property.rating),
                                        propertyType: property.type,
                                    })
                                }
                            >
                                <Heart
                                    className={cn(
                                        'h-4 w-4 transition-all',
                                        property &&
                                            isFavorite(property.id) &&
                                            'fill-destructive text-destructive',
                                    )}
                                />
                                {property && isFavorite(property.id)
                                    ? 'Sauvegardé'
                                    : 'Sauvegarder'}
                            </Button>
                        </div>
                    </div>

                    {/* ── Photo Grid ── */}
                    <div className="mb-10 overflow-hidden rounded-2xl">
                        <div className="grid h-[420px] grid-cols-4 grid-rows-2 gap-2 md:h-[520px]">
                            {/* Main image */}
                            <div
                                className="group relative col-span-4 row-span-2 cursor-pointer overflow-hidden bg-muted md:col-span-2"
                                onClick={() => {
                                    setActiveImg(0);
                                    setGalleryOpen(true);
                                }}
                            >
                                <img
                                    src={mainImg}
                                    alt={property.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                            </div>

                            {/* Side images */}
                            {[0, 1, 2, 3].map((i) => {
                                const img = extraImgs[i];
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            'group relative hidden cursor-pointer overflow-hidden bg-muted md:block',
                                            i === 3 && allImages.length > 5
                                                ? 'relative'
                                                : '',
                                        )}
                                        onClick={() => {
                                            setActiveImg(i + 1);
                                            setGalleryOpen(true);
                                        }}
                                    >
                                        {img ? (
                                            <>
                                                <img
                                                    src={img}
                                                    alt=""
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {i === 3 &&
                                                    allImages.length > 5 && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                            <span className="font-display text-lg font-bold text-white">
                                                                +
                                                                {allImages.length -
                                                                    5}
                                                            </span>
                                                        </div>
                                                    )}
                                            </>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted/60">
                                                <Images className="h-8 w-8 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mobile: show all photos button */}
                        <button
                            onClick={() => {
                                setActiveImg(0);
                                setGalleryOpen(true);
                            }}
                            className="font-body mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground md:hidden"
                        >
                            <Images className="h-4 w-4" /> Voir toutes les
                            photos ({allImages.length})
                        </button>

                        {/* Desktop: view all button (bottom right of grid) */}
                        {allImages.length > 1 && (
                            <div className="mt-2 hidden justify-end md:flex">
                                <button
                                    onClick={() => {
                                        setActiveImg(0);
                                        setGalleryOpen(true);
                                    }}
                                    className="font-body flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                                >
                                    <Images className="h-3.5 w-3.5" /> Toutes
                                    les photos ({allImages.length})
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Main layout: content + sticky sidebar ── */}
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 xl:gap-14">
                        {/* ── Left column ── */}
                        <div className="space-y-10 lg:col-span-2">
                            {/* Quick stats strip */}
                            <div className="flex flex-wrap gap-0 divide-x divide-border overflow-hidden rounded-2xl border border-border">
                                {[
                                    {
                                        icon: Users,
                                        value: `${property.guests}`,
                                        label: 'voyageurs',
                                    },
                                    {
                                        icon: BedDouble,
                                        value: `${property.bedrooms}`,
                                        label: `chambre${property.bedrooms > 1 ? 's' : ''}`,
                                    },
                                    {
                                        icon: Bath,
                                        value: `${property.bathrooms}`,
                                        label: `salle${property.bathrooms > 1 ? 's' : ''} de bain`,
                                    },
                                    {
                                        icon: Star,
                                        value:
                                            property.rating > 0
                                                ? Number(
                                                      property.rating,
                                                  ).toFixed(1)
                                                : '—',
                                        label: `${property.reviews} avis`,
                                    },
                                ].map(({ icon: Icon, value, label }) => (
                                    <div
                                        key={label}
                                        className="flex min-w-[80px] flex-1 flex-col items-center justify-center gap-1 bg-card py-4 transition-colors hover:bg-muted/30"
                                    >
                                        <Icon className="h-5 w-5 text-primary" />
                                        <span className="font-display text-lg leading-none font-bold text-foreground">
                                            {value}
                                        </span>
                                        <span className="font-body text-xs text-muted-foreground">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div>
                                <h2 className="font-display mb-4 text-2xl font-bold text-foreground">
                                    À propos de ce bien
                                </h2>
                                <div className="font-body space-y-3 text-[15px] leading-relaxed text-muted-foreground">
                                    {property.description ? (
                                        <p>{property.description}</p>
                                    ) : (
                                        <>
                                            <p>
                                                Découvrez ce bien d'exception
                                                situé à{' '}
                                                <strong className="text-foreground">
                                                    {property.location}
                                                </strong>
                                                . Idéal pour {property.guests}{' '}
                                                voyageurs avec{' '}
                                                {property.bedrooms} chambre
                                                {property.bedrooms > 1
                                                    ? 's'
                                                    : ''}{' '}
                                                et {property.bathrooms} salle
                                                {property.bathrooms > 1
                                                    ? 's'
                                                    : ''}{' '}
                                                de bain.
                                            </p>
                                            <p>
                                                Via Residotel, bénéficiez d'un
                                                service de conciergerie dédié et
                                                d'une réservation entièrement
                                                sécurisée.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Amenities */}
                            {amenityList.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h2 className="font-display mb-5 text-2xl font-bold text-foreground">
                                            Équipements inclus
                                        </h2>
                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                            {amenityList.map(
                                                ({ icon: Icon, label }) => (
                                                    <div
                                                        key={label}
                                                        className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-all hover:border-primary/30 hover:shadow-sm"
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/15">
                                                            <Icon className="h-4.5 w-4.5 text-accent" />
                                                        </div>
                                                        <span className="font-body text-sm font-medium text-foreground">
                                                            {label}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Availability calendar */}
                            <Separator />
                            <div>
                                <h2 className="font-display mb-5 text-2xl font-bold text-foreground">
                                    Disponibilités
                                </h2>
                                <AvailabilityCalendar
                                    propertyId={property.id}
                                />
                            </div>

                            {/* Host card */}
                            <Separator />
                            <div>
                                <h2 className="font-display mb-5 text-2xl font-bold text-foreground">
                                    Votre hôte
                                </h2>
                                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                                    <div className="flex items-start gap-5">
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-gradient-brand shadow-md">
                                                {hostProfile?.avatar_url ? (
                                                    <img
                                                        src={
                                                            hostProfile.avatar_url
                                                        }
                                                        alt={hostName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <span className="font-display text-2xl font-bold text-primary-foreground">
                                                            {hostInitials}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary">
                                                <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <h3 className="font-display text-xl font-bold text-foreground">
                                                    {hostName}
                                                </h3>
                                                <Badge className="font-body gap-1 border-0 bg-primary/10 text-xs text-primary">
                                                    <Award className="h-3 w-3" />{' '}
                                                    Certifié
                                                </Badge>
                                            </div>

                                            {/* Host stats */}
                                            <div className="font-body mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />{' '}
                                                    Superhost
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="h-3.5 w-3.5 text-primary" />{' '}
                                                    100% de réponse
                                                </span>
                                                {hostProfile?.languages &&
                                                    hostProfile.languages
                                                        .length > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Languages className="h-3.5 w-3.5" />{' '}
                                                            {hostProfile.languages.join(
                                                                ', ',
                                                            )}
                                                        </span>
                                                    )}
                                            </div>

                                            {/* Bio */}
                                            <p className="font-body line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                {hostProfile?.bio ??
                                                    "Votre hôte s'engage à vous offrir la meilleure expérience possible pendant votre séjour. N'hésitez pas à le contacter pour toute question."}
                                            </p>

                                            {/* Actions */}
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                {property.host_id && (
                                                    <Link
                                                        to={`/hote/${property.host_id}`}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="font-body rounded-xl"
                                                        >
                                                            Voir le profil
                                                        </Button>
                                                    </Link>
                                                )}
                                                {!isOwner && (
                                                    <Button
                                                        size="sm"
                                                        className="font-body gap-2 rounded-xl bg-gradient-brand text-primary-foreground hover:opacity-90"
                                                        onClick={contactHost}
                                                        disabled={contacting}
                                                    >
                                                        {contacting ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <MessageSquare className="h-4 w-4" />
                                                        )}
                                                        Contacter l'hôte
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews */}
                            <Separator />
                            <div>
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="font-display text-2xl font-bold text-foreground">
                                        Avis des voyageurs
                                    </h2>
                                    {property.rating > 0 && (
                                        <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 px-3 py-1.5">
                                            <Star className="h-4 w-4 fill-accent text-accent" />
                                            <span className="font-body text-sm font-bold">
                                                {Number(
                                                    property.rating,
                                                ).toFixed(1)}
                                            </span>
                                            <span className="font-body text-xs text-muted-foreground">
                                                / 5
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <PropertyReviews propertyId={property.id} />
                            </div>
                        </div>

                        {/* ── Right column: Sticky booking sidebar ── */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                {/* Glassmorphism booking card */}
                                <div className="relative overflow-hidden rounded-3xl border border-border bg-card/95 shadow-hero backdrop-blur-xl">
                                    {/* Subtle gradient accent top bar */}
                                    <div className="h-1 w-full bg-gradient-amber" />
                                    <div className="p-6">
                                        <BookingForm
                                            propertyId={property.id}
                                            propertyTitle={property.title}
                                            propertyImage={
                                                property.image ?? undefined
                                            }
                                            propertyLocation={property.location}
                                            pricePerNight={Number(
                                                property.price,
                                            )}
                                            rating={
                                                Number(property.rating) ||
                                                undefined
                                            }
                                            reviewCount={property.reviews}
                                        />
                                    </div>
                                </div>

                                {/* Trust signal */}
                                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                                        <Shield className="h-4.5 w-4.5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-body text-sm font-semibold text-foreground">
                                            Réservez en toute sécurité
                                        </p>
                                        <p className="font-body mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                            Ne payez jamais en dehors de la
                                            plateforme Residotel. Vos données
                                            sont protégées par Stripe.
                                        </p>
                                    </div>
                                </div>

                                {/* Quick highlights */}
                                <div className="space-y-2.5 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
                                    {[
                                        {
                                            icon: CheckCircle,
                                            text: 'Annulation gratuite sous 48h',
                                        },
                                        {
                                            icon: Shield,
                                            text: 'Paiement 100% sécurisé',
                                        },
                                        {
                                            icon: Award,
                                            text: 'Hôte certifié Residotel',
                                        },
                                    ].map(({ icon: Icon, text }) => (
                                        <div
                                            key={text}
                                            className="font-body flex items-center gap-2.5 text-xs text-muted-foreground"
                                        >
                                            <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
