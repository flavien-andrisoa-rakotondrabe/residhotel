import {
    User,
    Phone,
    FileText,
    LogOut,
    ArrowLeft,
    Save,
    Edit2,
    Home,
    Compass,
    Sparkles,
    Mail,
    MapPin,
    Globe2,
    Calendar,
    Languages,
    Shield,
    CreditCard,
    Receipt,
    Bell,
    Settings2,
    Building2,
    Hash,
    BadgeCheck,
    Camera,
    ChevronRight,
    Lock,
    Smartphone,
    AlertTriangle,
    Landmark,
    LayoutDashboard,
    Star,
    MessageSquare,
    FileDown,
    BookOpen,
    Loader2,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// ─── Schemas ────────────────────────────────────────────────────────────────

const profileSchema = z.object({
    first_name: z.string().trim().min(2, 'Prénom requis').max(50),
    last_name: z.string().trim().min(2, 'Nom requis').max(50),
    phone: z.string().trim().max(20).optional().or(z.literal('')),
    bio: z.string().max(500, 'Max 500 caractères').optional().or(z.literal('')),
    date_of_birth: z.string().optional().or(z.literal('')),
    nationality: z.string().max(60).optional().or(z.literal('')),
    address: z.string().max(150).optional().or(z.literal('')),
    city: z.string().max(80).optional().or(z.literal('')),
    postal_code: z.string().max(20).optional().or(z.literal('')),
    country: z.string().max(80).optional().or(z.literal('')),
});

const prefsSchema = z.object({
    currency: z.string().min(1),
    notif_email: z.boolean(),
    notif_sms: z.boolean(),
    notif_push: z.boolean(),
});

const fiscalSchema = z.object({
    fiscal_type: z.string().optional().or(z.literal('')),
    company_name: z.string().max(100).optional().or(z.literal('')),
    siret: z.string().max(20).optional().or(z.literal('')),
    vat_number: z.string().max(20).optional().or(z.literal('')),
    billing_address: z.string().max(200).optional().or(z.literal('')),
});

const bankSchema = z.object({
    iban: z.string().max(34).optional().or(z.literal('')),
    payout_method: z.string().optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PrefsForm = z.infer<typeof prefsSchema>;
type FiscalForm = z.infer<typeof fiscalSchema>;
type BankForm = z.infer<typeof bankSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

const roleBadge: Record<
    string,
    { label: string; icon: typeof Compass; className: string }
> = {
    voyageur: {
        label: 'Voyageur',
        icon: Compass,
        className: 'bg-secondary text-secondary-foreground',
    },
    hote: {
        label: 'Hôte certifié',
        icon: Home,
        className: 'bg-primary/10 text-primary',
    },
    admin: {
        label: 'Admin',
        icon: User,
        className: 'bg-destructive/10 text-destructive',
    },
};

const kycStatusConfig: Record<string, { label: string; color: string }> = {
    non_soumis: { label: 'Non soumis', color: 'text-muted-foreground' },
    en_attente: { label: 'En attente de validation', color: 'text-accent' },
    valide: { label: 'Identité vérifiée ✓', color: 'text-primary' },
    refuse: { label: 'Refusé', color: 'text-destructive' },
};

function SectionCard({
    title,
    icon: Icon,
    children,
    action,
}: {
    title: string;
    icon: typeof User;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground">
                        {title}
                    </h3>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function PlaceholderSection({
    icon: Icon,
    title,
    description,
    badge,
}: {
    icon: typeof User;
    title: string;
    description: string;
    badge?: string;
}) {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-muted/40 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-body text-sm font-semibold text-foreground">
                        {title}
                    </p>
                    {badge && (
                        <Badge className="font-body border-0 bg-accent/10 text-xs text-accent">
                            {badge}
                        </Badge>
                    )}
                </div>
                <p className="font-body mt-0.5 text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const { user, profile, roles, isHost, signOut, refreshProfile } = useAuth();

    const navigate = useNavigate();

    const [editingProfile, setEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [savingPrefs, setSavingPrefs] = useState(false);
    const [savingFiscal, setSavingFiscal] = useState(false);
    const [savingBank, setSavingBank] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwSaving, setPwSaving] = useState(false);

    // Cast profile to extended type
    const p = profile as typeof profile & {
        date_of_birth?: string | null;
        nationality?: string | null;
        languages?: string[] | null;
        address?: string | null;
        city?: string | null;
        postal_code?: string | null;
        country?: string | null;
        currency?: string | null;
        notif_email?: boolean | null;
        notif_sms?: boolean | null;
        notif_push?: boolean | null;
        kyc_status?: string | null;
        fiscal_type?: string | null;
        company_name?: string | null;
        siret?: string | null;
        vat_number?: string | null;
        billing_address?: string | null;
        iban?: string | null;
        payout_method?: string | null;
    };

    const profileForm = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        values: {
            first_name: p?.first_name ?? '',
            last_name: p?.last_name ?? '',
            phone: p?.phone ?? '',
            bio: p?.bio ?? '',
            date_of_birth: p?.date_of_birth ?? '',
            nationality: p?.nationality ?? '',
            address: p?.address ?? '',
            city: p?.city ?? '',
            postal_code: p?.postal_code ?? '',
            country: p?.country ?? '',
        },
    });

    const prefsForm = useForm<PrefsForm>({
        resolver: zodResolver(prefsSchema),
        values: {
            currency: p?.currency ?? 'EUR',
            notif_email: p?.notif_email ?? true,
            notif_sms: p?.notif_sms ?? false,
            notif_push: p?.notif_push ?? true,
        },
    });

    const fiscalForm = useForm<FiscalForm>({
        resolver: zodResolver(fiscalSchema),
        values: {
            fiscal_type: p?.fiscal_type ?? '',
            company_name: p?.company_name ?? '',
            siret: p?.siret ?? '',
            vat_number: p?.vat_number ?? '',
            billing_address: p?.billing_address ?? '',
        },
    });

    const bankForm = useForm<BankForm>({
        resolver: zodResolver(bankSchema),
        values: {
            iban: p?.iban ?? '',
            payout_method: p?.payout_method ?? '',
        },
    });

    const saveFields = async (data: Record<string, unknown>) => {
        if (!user) return false;
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('user_id', user.id);
        if (error) {
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive',
            });
            return false;
        }
        await refreshProfile();
        return true;
    };

    const onSaveProfile = async (data: ProfileForm) => {
        setSavingProfile(true);
        const ok = await saveFields({
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone || null,
            bio: data.bio || null,
            date_of_birth: data.date_of_birth || null,
            nationality: data.nationality || null,
            address: data.address || null,
            city: data.city || null,
            postal_code: data.postal_code || null,
            country: data.country || null,
        });
        setSavingProfile(false);
        if (ok) {
            setEditingProfile(false);
            toast({ title: 'Profil mis à jour ✓' });
        }
    };

    const onSavePrefs = async (data: PrefsForm) => {
        setSavingPrefs(true);
        const ok = await saveFields(data);
        setSavingPrefs(false);
        if (ok) toast({ title: 'Préférences enregistrées ✓' });
    };

    const onSaveFiscal = async (data: FiscalForm) => {
        setSavingFiscal(true);
        const ok = await saveFields({
            fiscal_type: data.fiscal_type || null,
            company_name: data.company_name || null,
            siret: data.siret || null,
            vat_number: data.vat_number || null,
            billing_address: data.billing_address || null,
        });
        setSavingFiscal(false);
        if (ok) toast({ title: 'Informations fiscales enregistrées ✓' });
    };

    const onSaveBank = async (data: BankForm) => {
        setSavingBank(true);
        const ok = await saveFields({
            iban: data.iban || null,
            payout_method: data.payout_method || null,
        });
        setSavingBank(false);
        if (ok) toast({ title: 'Informations bancaires enregistrées ✓' });
    };

    const onChangePassword = async () => {
        if (newPassword.length < 8) {
            toast({
                title: 'Mot de passe trop court',
                description: '8 caractères minimum',
                variant: 'destructive',
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({
                title: 'Les mots de passe ne correspondent pas',
                variant: 'destructive',
            });
            return;
        }
        setPwSaving(true);
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        setPwSaving(false);
        if (error) {
            toast({
                title: 'Erreur',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            toast({ title: 'Mot de passe mis à jour ✓' });
            setChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleAvatarUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Format non supporté',
                description: 'JPG, PNG ou WEBP uniquement',
                variant: 'destructive',
            });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Image trop lourde',
                description: 'Maximum 5 Mo',
                variant: 'destructive',
            });
            return;
        }

        setUploadingAvatar(true);
        const ext = file.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true, contentType: file.type });

        if (uploadError) {
            toast({
                title: 'Erreur upload',
                description: uploadError.message,
                variant: 'destructive',
            });
            setUploadingAvatar(false);
            return;
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(path);
        // Append cache-buster so the browser reloads the new image
        const avatarUrl = `${publicUrl}?t=${Date.now()}`;

        await saveFields({ avatar_url: avatarUrl });
        setUploadingAvatar(false);
        toast({ title: 'Photo de profil mise à jour ✓' });
    };

    const initials =
        `${p?.first_name?.[0] ?? ''}${p?.last_name?.[0] ?? ''}`.toUpperCase() ||
        'U';
    const kycStatus =
        kycStatusConfig[p?.kyc_status ?? 'non_soumis'] ??
        kycStatusConfig['non_soumis'];

    const FieldLabel = ({ children }: { children: React.ReactNode }) => (
        <Label className="font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {children}
        </Label>
    );

    const iconInput = (icon: React.ReactNode, input: React.ReactNode) => (
        <div className="relative mt-1.5">
            <div className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground">
                {icon}
            </div>
            {input}
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto max-w-3xl px-4 pt-28 pb-20">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                    >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                        Mon profil
                    </h1>
                </div>

                {/* Avatar card */}
                <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-card">
                    <div className="flex items-center gap-5">
                        {/* Hidden file input */}
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleAvatarUpload}
                        />
                        {/* Clickable avatar */}
                        <button
                            type="button"
                            className="group relative shrink-0"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            title="Changer la photo de profil"
                        >
                            <Avatar className="h-20 w-20 shadow-md">
                                {p?.avatar_url && (
                                    <AvatarImage
                                        src={p.avatar_url}
                                        alt={initials}
                                        className="object-cover"
                                    />
                                )}
                                <AvatarFallback className="font-display bg-gradient-brand text-3xl font-bold text-primary-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                {uploadingAvatar ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                                ) : (
                                    <Camera className="h-5 w-5 text-white" />
                                )}
                            </div>
                            {/* Small camera badge */}
                            {!uploadingAvatar && (
                                <div className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-accent shadow">
                                    <Camera className="h-3.5 w-3.5 text-accent-foreground" />
                                </div>
                            )}
                        </button>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-display truncate text-xl font-bold text-foreground">
                                {p?.first_name} {p?.last_name}
                            </h2>
                            <p className="font-body mt-0.5 truncate text-sm text-muted-foreground">
                                {user?.email}
                            </p>
                            <p className="font-body mt-0.5 text-xs text-muted-foreground/70">
                                Cliquer sur la photo pour la modifier
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {roles.map((r) => {
                                    const info = roleBadge[r];
                                    if (!info) return null;
                                    return (
                                        <Badge
                                            key={r}
                                            className={`${info.className} font-body gap-1 border-0 text-xs`}
                                        >
                                            <info.icon className="h-3 w-3" />
                                            {info.label}
                                        </Badge>
                                    );
                                })}
                                <span
                                    className={`font-body flex items-center gap-1 text-xs font-medium ${kycStatus.color}`}
                                >
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    {kycStatus.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="profil" className="space-y-6">
                    <TabsList className="grid h-auto grid-cols-3 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-6">
                        {[
                            { value: 'profil', label: 'Profil', icon: User },
                            {
                                value: 'securite',
                                label: 'Sécurité',
                                icon: Shield,
                            },
                            {
                                value: 'paiements',
                                label: 'Paiements',
                                icon: CreditCard,
                            },
                            {
                                value: 'fiscalite',
                                label: 'Fiscalité',
                                icon: Building2,
                            },
                            {
                                value: 'preferences',
                                label: 'Prefs',
                                icon: Settings2,
                            },
                            {
                                value: 'documents',
                                label: 'Documents',
                                icon: FileDown,
                            },
                        ].map(({ value, label, icon: Icon }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className="font-body flex h-auto flex-col gap-1 rounded-lg px-1 py-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {label}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* ── PROFIL ─────────────────────────────────────────── */}
                    <TabsContent value="profil" className="space-y-5">
                        <SectionCard
                            title="Informations personnelles"
                            icon={User}
                            action={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setEditingProfile(!editingProfile)
                                    }
                                    className="font-body h-8 gap-1.5"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                    {editingProfile ? 'Annuler' : 'Modifier'}
                                </Button>
                            }
                        >
                            <Form {...profileForm}>
                                <form
                                    onSubmit={profileForm.handleSubmit(
                                        onSaveProfile,
                                    )}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="first_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>
                                                        Prénom
                                                    </FieldLabel>
                                                    <FormControl>
                                                        {iconInput(
                                                            <User className="h-4 w-4" />,
                                                            <Input
                                                                {...field}
                                                                placeholder="Jean"
                                                                className="font-body h-11 pl-9"
                                                                disabled={
                                                                    !editingProfile
                                                                }
                                                            />,
                                                        )}
                                                    </FormControl>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="last_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>Nom</FieldLabel>
                                                    <FormControl>
                                                        {iconInput(
                                                            <User className="h-4 w-4" />,
                                                            <Input
                                                                {...field}
                                                                placeholder="Dupont"
                                                                className="font-body h-11 pl-9"
                                                                disabled={
                                                                    !editingProfile
                                                                }
                                                            />,
                                                        )}
                                                    </FormControl>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="date_of_birth"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>
                                                        Date de naissance
                                                    </FieldLabel>
                                                    <FormControl>
                                                        {iconInput(
                                                            <Calendar className="h-4 w-4" />,
                                                            <Input
                                                                {...field}
                                                                type="date"
                                                                className="font-body h-11 pl-9"
                                                                disabled={
                                                                    !editingProfile
                                                                }
                                                            />,
                                                        )}
                                                    </FormControl>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="nationality"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>
                                                        Nationalité
                                                    </FieldLabel>
                                                    <FormControl>
                                                        {iconInput(
                                                            <Globe2 className="h-4 w-4" />,
                                                            <Input
                                                                {...field}
                                                                placeholder="Française"
                                                                className="font-body h-11 pl-9"
                                                                disabled={
                                                                    !editingProfile
                                                                }
                                                            />,
                                                        )}
                                                    </FormControl>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={profileForm.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FieldLabel>
                                                    Biographie
                                                </FieldLabel>
                                                <FormControl>
                                                    <div className="relative mt-1.5">
                                                        <FileText className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Présentez-vous en quelques mots..."
                                                            className="font-body min-h-[80px] resize-none pl-9"
                                                            disabled={
                                                                !editingProfile
                                                            }
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="font-body text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />
                                    <p className="font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Coordonnées
                                    </p>

                                    <FormField
                                        control={profileForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FieldLabel>
                                                    Téléphone
                                                </FieldLabel>
                                                <FormControl>
                                                    {iconInput(
                                                        <Phone className="h-4 w-4" />,
                                                        <Input
                                                            {...field}
                                                            type="tel"
                                                            placeholder="+33 6 00 00 00 00"
                                                            className="font-body h-11 pl-9"
                                                            disabled={
                                                                !editingProfile
                                                            }
                                                        />,
                                                    )}
                                                </FormControl>
                                                <FormMessage className="font-body text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>
                                                        Ville
                                                    </FieldLabel>
                                                    <FormControl>
                                                        {iconInput(
                                                            <MapPin className="h-4 w-4" />,
                                                            <Input
                                                                {...field}
                                                                placeholder="Paris"
                                                                className="font-body h-11 pl-9"
                                                                disabled={
                                                                    !editingProfile
                                                                }
                                                            />,
                                                        )}
                                                    </FormControl>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="postal_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>
                                                        Code postal
                                                    </FieldLabel>
                                                    <FormControl>
                                                        {iconInput(
                                                            <Hash className="h-4 w-4" />,
                                                            <Input
                                                                {...field}
                                                                placeholder="75001"
                                                                className="font-body h-11 pl-9"
                                                                disabled={
                                                                    !editingProfile
                                                                }
                                                            />,
                                                        )}
                                                    </FormControl>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>
                                                        Adresse
                                                    </FieldLabel>
                                                    <FormControl>
                                                        {iconInput(
                                                            <MapPin className="h-4 w-4" />,
                                                            <Input
                                                                {...field}
                                                                placeholder="12 rue des Fleurs"
                                                                className="font-body h-11 pl-9"
                                                                disabled={
                                                                    !editingProfile
                                                                }
                                                            />,
                                                        )}
                                                    </FormControl>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>
                                                        Pays
                                                    </FieldLabel>
                                                    <FormControl>
                                                        {iconInput(
                                                            <Globe2 className="h-4 w-4" />,
                                                            <Input
                                                                {...field}
                                                                placeholder="France"
                                                                className="font-body h-11 pl-9"
                                                                disabled={
                                                                    !editingProfile
                                                                }
                                                            />,
                                                        )}
                                                    </FormControl>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {editingProfile && (
                                        <Button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="font-body gap-2 bg-gradient-brand font-semibold text-primary-foreground hover:opacity-90"
                                        >
                                            <Save className="h-4 w-4" />
                                            {savingProfile
                                                ? 'Enregistrement...'
                                                : 'Enregistrer'}
                                        </Button>
                                    )}
                                </form>
                            </Form>
                        </SectionCard>

                        {/* KYC */}
                        <SectionCard
                            title="Vérification d'identité (KYC)"
                            icon={BadgeCheck}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/40 p-3">
                                    <div>
                                        <p className="font-body text-sm font-semibold text-foreground">
                                            Statut de vérification
                                        </p>
                                        <p
                                            className={`font-body mt-0.5 text-sm ${kycStatus.color}`}
                                        >
                                            {kycStatus.label}
                                        </p>
                                    </div>
                                    <Badge className="font-body border-0 bg-muted text-xs text-muted-foreground">
                                        Bientôt
                                    </Badge>
                                </div>
                                <PlaceholderSection
                                    icon={User}
                                    title="Pièce d'identité"
                                    description="CNI ou passeport — indispensable pour louer ou accueillir"
                                    badge="Bientôt"
                                />
                                <PlaceholderSection
                                    icon={Camera}
                                    title="Selfie de vérification"
                                    description="Photo de vous avec votre document officiel"
                                    badge="Bientôt"
                                />
                            </div>
                        </SectionCard>

                        {/* Réputation */}
                        <SectionCard title="Avis & réputation" icon={Star}>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    {
                                        label: 'Note voyageur',
                                        value: '—',
                                        icon: Compass,
                                        desc: 'Aucun avis reçu',
                                    },
                                    {
                                        label: 'Note hôte',
                                        value: '—',
                                        icon: Home,
                                        desc: isHost
                                            ? 'Aucun avis reçu'
                                            : 'Devenez hôte pour en recevoir',
                                    },
                                ].map(({ label, value, icon: Icon, desc }) => (
                                    <div
                                        key={label}
                                        className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center"
                                    >
                                        <Icon className="mx-auto mb-1.5 h-5 w-5 text-muted-foreground" />
                                        <p className="font-display text-2xl font-bold text-foreground">
                                            {value}
                                        </p>
                                        <p className="font-body mt-0.5 text-xs font-semibold text-foreground">
                                            {label}
                                        </p>
                                        <p className="font-body text-xs text-muted-foreground">
                                            {desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 space-y-2">
                                <PlaceholderSection
                                    icon={MessageSquare}
                                    title="Avis reçus"
                                    description="Les commentaires des voyageurs et hôtes"
                                />
                                <PlaceholderSection
                                    icon={Star}
                                    title="Avis laissés"
                                    description="Vos évaluations après chaque séjour"
                                />
                            </div>
                        </SectionCard>

                        {!isHost && (
                            <div className="flex items-center gap-4 rounded-2xl bg-gradient-brand p-6">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
                                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-display text-base font-bold text-primary-foreground">
                                        Devenez hôte Residotel
                                    </p>
                                    <p className="font-body mt-0.5 text-sm text-primary-foreground/80">
                                        Proposez votre logement et générez des
                                        revenus
                                    </p>
                                </div>
                                <Link to="/dashboard">
                                    <Button
                                        size="sm"
                                        className="font-body shrink-0 bg-accent font-semibold text-accent-foreground hover:opacity-90"
                                    >
                                        Commencer
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>

                    {/* ── SÉCURITÉ ───────────────────────────────────────── */}
                    <TabsContent value="securite" className="space-y-5">
                        <SectionCard title="Mot de passe" icon={Lock}>
                            {!changingPassword ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setChangingPassword(true)}
                                    className="font-body gap-2"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Modifier le mot de passe
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <FieldLabel>
                                            Nouveau mot de passe
                                        </FieldLabel>
                                        <div className="relative mt-1.5">
                                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="8 caractères minimum"
                                                className="font-body h-11 pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <FieldLabel>
                                            Confirmer le mot de passe
                                        </FieldLabel>
                                        <div className="relative mt-1.5">
                                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Répétez le mot de passe"
                                                className="font-body h-11 pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={onChangePassword}
                                            disabled={pwSaving}
                                            className="font-body gap-2 bg-gradient-brand text-primary-foreground hover:opacity-90"
                                        >
                                            <Save className="h-4 w-4" />
                                            {pwSaving
                                                ? 'Enregistrement...'
                                                : 'Mettre à jour'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setChangingPassword(false);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            className="font-body"
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard
                            title="Double authentification (2FA)"
                            icon={Smartphone}
                        >
                            <PlaceholderSection
                                icon={Smartphone}
                                title="Authentification par SMS"
                                description="Recevez un code à chaque connexion pour sécuriser votre compte"
                                badge="Bientôt"
                            />
                            <div className="mt-3">
                                <PlaceholderSection
                                    icon={Shield}
                                    title="Application d'authentification"
                                    description="Google Authenticator, Authy ou équivalent"
                                    badge="Bientôt"
                                />
                            </div>
                        </SectionCard>

                        <SectionCard title="Sessions & appareils" icon={Globe2}>
                            <div className="rounded-xl border border-border/50 bg-muted/40 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <Globe2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-body text-sm font-semibold text-foreground">
                                            Session active
                                        </p>
                                        <p className="font-body mt-0.5 text-xs text-muted-foreground">
                                            {user?.email} · Connecté via e-mail
                                        </p>
                                        <p className="font-body text-xs text-muted-foreground">
                                            Compte créé le{' '}
                                            {user?.created_at
                                                ? new Date(
                                                      user.created_at,
                                                  ).toLocaleDateString('fr-FR')
                                                : '—'}
                                        </p>
                                    </div>
                                    <Badge className="font-body border-0 bg-secondary text-xs text-secondary-foreground">
                                        Actif
                                    </Badge>
                                </div>
                            </div>
                            <div className="mt-3">
                                <PlaceholderSection
                                    icon={AlertTriangle}
                                    title="Historique des connexions"
                                    description="Activité récente et appareils utilisés"
                                    badge="Bientôt"
                                />
                            </div>
                        </SectionCard>

                        <SectionCard title="Compte" icon={LogOut}>
                            <Button
                                variant="outline"
                                onClick={handleSignOut}
                                className="font-body gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                            >
                                <LogOut className="h-4 w-4" />
                                Se déconnecter
                            </Button>
                        </SectionCard>
                    </TabsContent>

                    {/* ── PAIEMENTS ──────────────────────────────────────── */}
                    <TabsContent value="paiements" className="space-y-5">
                        <SectionCard
                            title="Paiements voyageur"
                            icon={CreditCard}
                        >
                            <PlaceholderSection
                                icon={CreditCard}
                                title="Cartes bancaires enregistrées"
                                description="Ajoutez une carte pour réserver en un clic (Visa, Mastercard, Amex)"
                                badge="Stripe · Bientôt"
                            />
                            <div className="mt-3 space-y-2">
                                <PlaceholderSection
                                    icon={Receipt}
                                    title="Historique des paiements"
                                    description="Toutes vos transactions et reçus téléchargeables"
                                />
                            </div>
                        </SectionCard>

                        {isHost && (
                            <SectionCard
                                title="Encaissement hôte"
                                icon={Landmark}
                            >
                                <Form {...bankForm}>
                                    <form
                                        onSubmit={bankForm.handleSubmit(
                                            onSaveBank,
                                        )}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={bankForm.control}
                                            name="iban"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>
                                                        IBAN
                                                    </FieldLabel>
                                                    <FormControl>
                                                        {iconInput(
                                                            <Landmark className="h-4 w-4" />,
                                                            <Input
                                                                {...field}
                                                                placeholder="FR76 XXXX XXXX XXXX XXXX"
                                                                className="font-body h-11 pl-9"
                                                            />,
                                                        )}
                                                    </FormControl>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={bankForm.control}
                                            name="payout_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FieldLabel>
                                                        Méthode de versement
                                                    </FieldLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={
                                                            field.value ?? ''
                                                        }
                                                    >
                                                        <SelectTrigger className="font-body mt-1.5 h-11">
                                                            <SelectValue placeholder="Sélectionner..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem
                                                                value="virement"
                                                                className="font-body"
                                                            >
                                                                Virement
                                                                bancaire
                                                            </SelectItem>
                                                            <SelectItem
                                                                value="paypal"
                                                                className="font-body"
                                                            >
                                                                PayPal
                                                            </SelectItem>
                                                            <SelectItem
                                                                value="stripe"
                                                                className="font-body"
                                                            >
                                                                Stripe Connect
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="font-body text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={savingBank}
                                            className="font-body gap-2 bg-gradient-brand text-primary-foreground hover:opacity-90"
                                        >
                                            <Save className="h-4 w-4" />
                                            {savingBank
                                                ? 'Enregistrement...'
                                                : 'Enregistrer'}
                                        </Button>
                                    </form>
                                </Form>
                            </SectionCard>
                        )}

                        {!isHost && (
                            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center">
                                <Landmark className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="font-body text-sm font-semibold text-foreground">
                                    Informations d'encaissement
                                </p>
                                <p className="font-body mt-1 text-xs text-muted-foreground">
                                    Disponible après activation du rôle hôte
                                </p>
                                <Link to="/dashboard">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="font-body mt-3 gap-2"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Devenir hôte
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>

                    {/* ── FISCALITÉ ──────────────────────────────────────── */}
                    <TabsContent value="fiscalite" className="space-y-5">
                        <SectionCard
                            title="Informations fiscales"
                            icon={Building2}
                        >
                            {!isHost && (
                                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-accent/20 bg-accent/5 p-3">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                    <p className="font-body text-xs text-muted-foreground">
                                        Ces informations sont principalement
                                        utiles pour les hôtes qui génèrent des
                                        revenus sur la plateforme.
                                    </p>
                                </div>
                            )}
                            <Form {...fiscalForm}>
                                <form
                                    onSubmit={fiscalForm.handleSubmit(
                                        onSaveFiscal,
                                    )}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={fiscalForm.control}
                                        name="fiscal_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FieldLabel>
                                                    Statut fiscal
                                                </FieldLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value ?? ''}
                                                >
                                                    <SelectTrigger className="font-body mt-1.5 h-11">
                                                        <SelectValue placeholder="Sélectionner..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="particulier"
                                                            className="font-body"
                                                        >
                                                            Particulier
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="auto_entrepreneur"
                                                            className="font-body"
                                                        >
                                                            Auto-entrepreneur
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="entreprise"
                                                            className="font-body"
                                                        >
                                                            Entreprise
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="sci"
                                                            className="font-body"
                                                        >
                                                            SCI
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="font-body text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    {fiscalForm.watch('fiscal_type') !==
                                        'particulier' &&
                                        fiscalForm.watch('fiscal_type') && (
                                            <>
                                                <FormField
                                                    control={fiscalForm.control}
                                                    name="company_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FieldLabel>
                                                                Nom de société
                                                            </FieldLabel>
                                                            <FormControl>
                                                                {iconInput(
                                                                    <Building2 className="h-4 w-4" />,
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Ma Société SAS"
                                                                        className="font-body h-11 pl-9"
                                                                    />,
                                                                )}
                                                            </FormControl>
                                                            <FormMessage className="font-body text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={
                                                            fiscalForm.control
                                                        }
                                                        name="siret"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FieldLabel>
                                                                    SIRET
                                                                </FieldLabel>
                                                                <FormControl>
                                                                    {iconInput(
                                                                        <Hash className="h-4 w-4" />,
                                                                        <Input
                                                                            {...field}
                                                                            placeholder="123 456 789 00010"
                                                                            className="font-body h-11 pl-9"
                                                                        />,
                                                                    )}
                                                                </FormControl>
                                                                <FormMessage className="font-body text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={
                                                            fiscalForm.control
                                                        }
                                                        name="vat_number"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FieldLabel>
                                                                    N° TVA
                                                                </FieldLabel>
                                                                <FormControl>
                                                                    {iconInput(
                                                                        <Hash className="h-4 w-4" />,
                                                                        <Input
                                                                            {...field}
                                                                            placeholder="FR 12 345678901"
                                                                            className="font-body h-11 pl-9"
                                                                        />,
                                                                    )}
                                                                </FormControl>
                                                                <FormMessage className="font-body text-xs" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </>
                                        )}

                                    <FormField
                                        control={fiscalForm.control}
                                        name="billing_address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FieldLabel>
                                                    Adresse de facturation
                                                </FieldLabel>
                                                <FormControl>
                                                    <div className="relative mt-1.5">
                                                        <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                        <Textarea
                                                            {...field}
                                                            placeholder="12 rue des Fleurs, 75001 Paris, France"
                                                            className="font-body min-h-[70px] resize-none pl-9"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="font-body text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={savingFiscal}
                                        className="font-body gap-2 bg-gradient-brand text-primary-foreground hover:opacity-90"
                                    >
                                        <Save className="h-4 w-4" />
                                        {savingFiscal
                                            ? 'Enregistrement...'
                                            : 'Enregistrer'}
                                    </Button>
                                </form>
                            </Form>
                        </SectionCard>
                    </TabsContent>

                    {/* ── PRÉFÉRENCES ────────────────────────────────────── */}
                    <TabsContent value="preferences" className="space-y-5">
                        <SectionCard
                            title="Préférences générales"
                            icon={Settings2}
                        >
                            <Form {...prefsForm}>
                                <form
                                    onSubmit={prefsForm.handleSubmit(
                                        onSavePrefs,
                                    )}
                                    className="space-y-5"
                                >
                                    <FormField
                                        control={prefsForm.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FieldLabel>Devise</FieldLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <SelectTrigger className="font-body mt-1.5 h-11">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="EUR"
                                                            className="font-body"
                                                        >
                                                            € Euro (EUR)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="MAD"
                                                            className="font-body"
                                                        >
                                                            MAD Dirham marocain
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="USD"
                                                            className="font-body"
                                                        >
                                                            $ Dollar américain
                                                            (USD)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="GBP"
                                                            className="font-body"
                                                        >
                                                            £ Livre sterling
                                                            (GBP)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="CHF"
                                                            className="font-body"
                                                        >
                                                            CHF Franc suisse
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <div>
                                        <p className="font-body mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Notifications
                                        </p>
                                        <div className="space-y-3">
                                            {(
                                                [
                                                    {
                                                        name: 'notif_email' as const,
                                                        label: 'Par e-mail',
                                                        desc: 'Confirmations, messages, rappels',
                                                        icon: Mail,
                                                    },
                                                    {
                                                        name: 'notif_sms' as const,
                                                        label: 'Par SMS',
                                                        desc: 'Alertes urgentes uniquement',
                                                        icon: Phone,
                                                    },
                                                    {
                                                        name: 'notif_push' as const,
                                                        label: 'Notifications push',
                                                        desc: "Via le navigateur ou l'application",
                                                        icon: Bell,
                                                    },
                                                ] as const
                                            ).map(
                                                ({
                                                    name,
                                                    label,
                                                    desc,
                                                    icon: Icon,
                                                }) => (
                                                    <FormField
                                                        key={name}
                                                        control={
                                                            prefsForm.control
                                                        }
                                                        name={name}
                                                        render={({ field }) => (
                                                            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                                        <Icon className="h-4 w-4 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-body text-sm font-semibold text-foreground">
                                                                            {
                                                                                label
                                                                            }
                                                                        </p>
                                                                        <p className="font-body text-xs text-muted-foreground">
                                                                            {
                                                                                desc
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Switch
                                                                    checked={
                                                                        field.value
                                                                    }
                                                                    onCheckedChange={
                                                                        field.onChange
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={savingPrefs}
                                        className="font-body gap-2 bg-gradient-brand text-primary-foreground hover:opacity-90"
                                    >
                                        <Save className="h-4 w-4" />
                                        {savingPrefs
                                            ? 'Enregistrement...'
                                            : 'Enregistrer les préférences'}
                                    </Button>
                                </form>
                            </Form>
                        </SectionCard>

                        <SectionCard
                            title="Langue de l'interface"
                            icon={Languages}
                        >
                            <div className="space-y-2">
                                {[
                                    {
                                        code: 'fr',
                                        label: 'Français',
                                        flag: '🇫🇷',
                                        active: true,
                                    },
                                    {
                                        code: 'en',
                                        label: 'English',
                                        flag: '🇬🇧',
                                        active: false,
                                    },
                                    {
                                        code: 'ar',
                                        label: 'العربية',
                                        flag: '🇲🇦',
                                        active: false,
                                    },
                                ].map(({ code, label, flag, active }) => (
                                    <div
                                        key={code}
                                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${active ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/30 hover:bg-muted/50'}`}
                                    >
                                        <span className="font-body text-sm text-foreground">
                                            {flag} {label}
                                        </span>
                                        {active && (
                                            <Badge className="font-body border-0 bg-primary/10 text-xs text-primary">
                                                Actif
                                            </Badge>
                                        )}
                                        {!active && (
                                            <Badge className="font-body border-0 bg-muted text-xs text-muted-foreground">
                                                Bientôt
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </TabsContent>

                    {/* ── DOCUMENTS ──────────────────────────────────────── */}
                    <TabsContent value="documents" className="space-y-5">
                        <SectionCard title="Factures & reçus" icon={FileDown}>
                            <div className="space-y-2">
                                <PlaceholderSection
                                    icon={Receipt}
                                    title="Factures téléchargeables"
                                    description="Historique complet de vos paiements au format PDF"
                                    badge="Bientôt"
                                />
                                <PlaceholderSection
                                    icon={FileText}
                                    title="Reçus de paiement"
                                    description="Reçus individuels pour chaque transaction"
                                    badge="Bientôt"
                                />
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Documents administratifs"
                            icon={BookOpen}
                        >
                            <div className="space-y-2">
                                <PlaceholderSection
                                    icon={FileDown}
                                    title="Attestations de séjour"
                                    description="Documents officiels pour vos réservations confirmées"
                                    badge="Bientôt"
                                />
                                <PlaceholderSection
                                    icon={Building2}
                                    title="Relevés fiscaux annuels"
                                    description="Synthèse de vos revenus locatifs (hôtes)"
                                    badge="Bientôt"
                                />
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Support & assistance"
                            icon={MessageSquare}
                        >
                            <div className="space-y-2">
                                <Link to="/" className="block">
                                    <PlaceholderSection
                                        icon={MessageSquare}
                                        title="Contacter le support"
                                        description="Notre équipe répond sous 24h en semaine"
                                    />
                                </Link>
                                <PlaceholderSection
                                    icon={BookOpen}
                                    title="Centre d'aide"
                                    description="Guides, FAQ et tutoriels Residotel"
                                    badge="Bientôt"
                                />
                                <PlaceholderSection
                                    icon={FileText}
                                    title="Historique des tickets"
                                    description="Suivez vos demandes d'assistance"
                                    badge="Bientôt"
                                />
                            </div>
                        </SectionCard>

                        {/* Quick nav */}
                        <SectionCard
                            title="Accès rapides"
                            icon={LayoutDashboard}
                        >
                            <div className="space-y-1">
                                {[
                                    {
                                        to: '/dashboard',
                                        icon: LayoutDashboard,
                                        label: 'Tableau de bord',
                                        desc: isHost
                                            ? 'Gérer vos séjours, annonces et messages'
                                            : 'Consulter vos séjours et messages',
                                    },
                                    {
                                        to: '/mes-reservations',
                                        icon: Compass,
                                        label: 'Mes réservations',
                                        desc: 'Séjours à venir et passés',
                                    },
                                    {
                                        to: '/',
                                        icon: ArrowLeft,
                                        label: "Retour à l'accueil",
                                        desc: 'Explorer les destinations',
                                    },
                                ].map(({ to, icon: Icon, label, desc }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                                            <Icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-body text-sm font-semibold text-foreground">
                                                {label}
                                            </p>
                                            <p className="font-body text-xs text-muted-foreground">
                                                {desc}
                                            </p>
                                        </div>
                                        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                    </Link>
                                ))}
                            </div>
                        </SectionCard>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
