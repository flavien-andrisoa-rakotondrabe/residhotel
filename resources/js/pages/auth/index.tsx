import { Link, Form, useForm, usePage } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Compass,
    ArrowRight,
    Phone,
    User,
    CheckCircle2,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { register } from '@/routes/auth';

const PANEL_IMAGES = {
    login: {
        src: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
        title: 'Bon retour parmi nous !',
        sub: 'Accédez à vos réservations, vos annonces et vos messages.',
    },
    signup: {
        src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
        title: 'Voyagez autrement,\nséjournez mieux.',
        sub: 'Rejoignez 12 000+ voyageurs et hôtes sur Residotel.',
    },
};

export default function AuthPage() {
    // Récupérer les query params via Inertia
    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1]);
    const defaultTab =
        (searchParams.get('tab') as 'login' | 'signup') || 'login';

    const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
    const panel = PANEL_IMAGES[tab];

    return (
        <div className="flex min-h-screen bg-background-fix">
            {/* ── Left illustration ── */}
            <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[45%] xl:w-1/2">
                <div className="hero-overlay absolute inset-0 z-10 bg-black/40" />
                <img
                    src={panel.src}
                    alt="Residotel"
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
                />
                <div className="relative z-20">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-amber shadow-md">
                            <span className="font-display text-base font-bold text-white">
                                R
                            </span>
                        </div>
                        <span className="font-display text-xl font-semibold text-white">
                            Residotel
                        </span>
                    </Link>
                </div>
                <div className="relative z-20 space-y-3">
                    <p className="font-display text-3xl leading-tight font-bold whitespace-pre-line text-white">
                        {panel.title}
                    </p>
                    <p className="font-body text-sm text-white/70">
                        {panel.sub}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        {[
                            { icon: '🏡', label: '2 000+ propriétés' },
                            { icon: '⭐', label: '98% satisfaction' },
                            { icon: '🔒', label: 'Paiements sécurisés' },
                        ].map((b) => (
                            <div
                                key={b.label}
                                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm"
                            >
                                <span className="text-base leading-none">
                                    {b.icon}
                                </span>
                                <span className="font-body text-xs font-medium text-white/90">
                                    {b.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right form area ── */}
            <div className="flex flex-1 flex-col">
                <div className="flex flex-1 items-center justify-center px-6 py-10">
                    <div className="w-full max-w-md">
                        {/* ── Tab switcher ── */}
                        <div className="mb-8 flex rounded-2xl bg-muted-fix p-1">
                            {(['login', 'signup'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`font-body flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                                        tab === t
                                            ? 'bg-background-fix text-foreground-fix shadow-sm'
                                            : 'text-muted-foreground-fix hover:text-foreground-fix'
                                    }`}
                                >
                                    {t === 'login'
                                        ? 'Se connecter'
                                        : 'Créer un compte'}
                                </button>
                            ))}
                        </div>

                        {tab === 'login' ? (
                            <LoginForm
                                onSwitchToSignup={() => setTab('signup')}
                            />
                        ) : (
                            <SignupForm
                                onSwitchToLogin={() => setTab('login')}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Login form ───────────────────────────────────────────────────────────────
function LoginForm({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // post(route('login.custom'));
    };

    return (
        <Form onSubmit={onSubmit} className="space-y-4">
            <div className="mb-6 space-y-1">
                <h1 className="font-display text-2xl font-bold text-foreground-fix">
                    Connexion
                </h1>
                <p className="font-body text-sm text-muted-foreground-fix">
                    Pas encore de compte ?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="font-semibold text-primary-fix hover:underline"
                    >
                        Créer un compte
                    </button>
                </p>
            </div>

            <div className="space-y-2">
                <Label className="font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase">
                    Email
                </Label>
                <div className="relative mt-1.5">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                    <Input
                        type="email"
                        placeholder="jean@email.com"
                        autoComplete="email"
                        required
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/50 focus-visible:ring-2 focus-visible:ring-ring-fix"
                    />
                </div>
                {errors.email && (
                    <span className="text-desctructive text-xs">
                        {errors.email}
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase">
                        Mot de passe
                    </Label>
                    <Link
                        href="/auth/forgot-password"
                        className="font-body text-xs text-primary-fix hover:underline"
                    >
                        Mot de passe oublié ?
                    </Link>
                </div>
                <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                    <Input
                        type={showPwd ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/50 focus-visible:ring-2 focus-visible:ring-ring-fix"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground-fix hover:text-foreground-fix"
                    >
                        {showPwd ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <span className="text-xs text-red-500">
                        {errors.password}
                    </span>
                )}
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="font-body h-12 w-full gap-2 rounded-xl bg-gradient-brand text-base font-semibold text-primary-foreground-fix hover:opacity-90"
                size="lg"
            >
                {loading ? 'Connexion...' : 'Se connecter'}
                {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
        </Form>
    );
}

// ─── Signup form ──────────────────────────────────────────────────────────────
function SignupForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
    const [showPwd, setShowPwd] = useState(false);

    const userRoles = [
        {
            key: 'client',
            title: 'Je suis voyageur',
            desc: 'Je cherche des séjours',
        },
        {
            key: 'hote',
            title: 'Je suis hôte',
            desc: 'Je propose un bien',
        },
    ];

    const {
        post,
        data,
        setData,
        errors,
        hasErrors,
        clearErrors,
        processing,
        reset,
    } = useForm({
        firstName: '',
        lastName: '',
        tel: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: userRoles[0].key,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/auth/register', {
            onSuccess: () => {
                reset();
                toast.success('Inscription réussie!');
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-5 space-y-1">
                <h1 className="font-display text-2xl font-bold text-foreground-fix">
                    Créer un compte
                </h1>
                <p className="font-body text-sm text-muted-foreground-fix">
                    Déjà inscrit ?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="font-semibold text-primary-fix hover:underline"
                    >
                        Se connecter
                    </button>
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <input type="hidden" name="role" value={data.role} />

                {userRoles.map((item) => (
                    <button
                        key={`user-${item.key}`}
                        type="button"
                        className={cn(
                            '${ ? relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left',
                            data.role === item.key
                                ? 'border-primary-fix bg-secondary-fix/60'
                                : 'border-border-fix hover:border-primary-fix/40',
                        )}
                        onClick={() => setData('role', item.key)}
                    >
                        {data.role === item.key && (
                            <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-primary-fix" />
                        )}
                        <Compass
                            className={cn(
                                'h-5 w-5',
                                data.role === item.key
                                    ? 'text-primary-fix'
                                    : 'text-muted-foreground-fix',
                            )}
                        />
                        <span
                            className={cn(
                                'font-body text-sm leading-tight font-semibold',
                                data.role === item.key
                                    ? 'text-primary-fix'
                                    : 'text-foreground-fix',
                            )}
                        >
                            {item.title}
                        </span>
                        <span className="font-body text-xs text-muted-foreground-fix">
                            {item.desc}
                        </span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="">
                    <Label
                        htmlFor="firstName"
                        className={cn(
                            'font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase',
                            errors.firstName && 'text-destructive',
                        )}
                    >
                        Prénom
                    </Label>
                    <div className="relative mt-1.5">
                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                        <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="Jean"
                            required
                            autoComplete="given-name"
                            className={cn(
                                'font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/50 focus-visible:ring-2 focus-visible:ring-ring-fix',
                                errors.firstName &&
                                    'border-destructive focus-visible:ring-destructive',
                            )}
                            value={data.firstName}
                            onChange={(e) => {
                                setData('firstName', e.target.value);

                                if (errors.firstName) {
                                    clearErrors('firstName');
                                }
                            }}
                        />
                    </div>
                    <InputError message={errors.firstName} className="mt-2" />
                </div>

                <div className="">
                    <Label
                        htmlFor="lastName"
                        className={cn(
                            'font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase',
                            errors.lastName && 'text-destructive',
                        )}
                    >
                        Nom
                    </Label>
                    <div className="relative mt-1.5">
                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                        <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            placeholder="Dupont"
                            autoComplete="family-name"
                            className={cn(
                                'font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/50 focus-visible:ring-2 focus-visible:ring-ring-fix',
                                errors.lastName &&
                                    'border-destructive focus-visible:ring-destructive',
                            )}
                            value={data.lastName}
                            onChange={(e) => {
                                setData('lastName', e.target.value);

                                if (errors.lastName) {
                                    clearErrors('lastName');
                                }
                            }}
                        />
                    </div>

                    <InputError message={errors.lastName} className="mt-2" />
                </div>
            </div>

            <div className="">
                <Label
                    htmlFor="tel"
                    className={cn(
                        'font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase',
                        errors.tel && 'text-destructive',
                    )}
                >
                    Téléphone
                </Label>
                <div className="relative mt-1.5">
                    <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                    <Input
                        id="tel"
                        name="tel"
                        type="tel"
                        required
                        placeholder="+33 6 00 00 00 00"
                        autoComplete="tel"
                        className={cn(
                            'font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/50 focus-visible:ring-2 focus-visible:ring-ring-fix',
                            errors.tel &&
                                'border-destructive focus-visible:ring-destructive',
                        )}
                        value={data.tel}
                        onChange={(e) => {
                            setData('tel', e.target.value);

                            if (errors.tel) {
                                clearErrors('tel');
                            }
                        }}
                    />
                </div>

                <InputError message={errors.tel} className="mt-2" />
            </div>

            <div className="">
                <Label
                    htmlFor="email"
                    className={cn(
                        'font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase',
                        errors.email && 'text-destructive',
                    )}
                >
                    Email
                </Label>
                <div className="relative mt-1.5">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                    <Input
                        id="email"
                        name="email"
                        type="text"
                        required
                        placeholder="jean@email.com"
                        autoComplete="email"
                        className={cn(
                            'font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/50 focus-visible:ring-2 focus-visible:ring-ring-fix',
                            errors.email &&
                                'border-destructive focus-visible:ring-destructive',
                        )}
                        value={data.email}
                        onChange={(e) => {
                            setData('email', e.target.value);

                            if (errors.email) {
                                clearErrors('email');
                            }
                        }}
                    />
                </div>

                <InputError message={errors.email} className="mt-2" />
            </div>

            <div className="">
                <Label
                    htmlFor="password"
                    className={cn(
                        'font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase',
                        errors.password && 'text-destructive',
                    )}
                >
                    Mot de passe
                </Label>
                <div className="relative mt-1.5">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                    <Input
                        id="password"
                        name="password"
                        type={showPwd ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        placeholder="Min. 8 caractères"
                        className={cn(
                            'font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/50 focus-visible:ring-2 focus-visible:ring-ring-fix',
                            errors.password &&
                                'border-destructive focus-visible:ring-destructive',
                        )}
                        value={data.password}
                        onChange={(e) => {
                            setData('password', e.target.value);

                            if (errors.password) {
                                clearErrors('password');
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground-fix hover:text-foreground-fix"
                    >
                        {showPwd ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>

                <InputError message={errors.password} className="mt-2" />
            </div>

            <div className="">
                <Label
                    htmlFor="password_confirmation"
                    className={cn(
                        'font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase',
                        errors.password_confirmation && 'text-destructive',
                    )}
                >
                    Confirmer
                </Label>
                <div className="relative mt-1.5">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                    <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Répétez le mot de passe"
                        className={cn(
                            'font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/50 focus-visible:ring-2 focus-visible:ring-ring-fix',
                            errors.password_confirmation &&
                                'border-destructive focus-visible:ring-destructive',
                        )}
                        value={data.password_confirmation}
                        onChange={(e) => {
                            setData('password_confirmation', e.target.value);

                            if (errors.password_confirmation) {
                                clearErrors('password_confirmation');
                            }
                        }}
                    />
                </div>

                <InputError
                    message={errors.password_confirmation}
                    className="mt-2"
                />
            </div>

            <Button
                type="submit"
                disabled={processing || hasErrors}
                className="font-body h-12 w-full gap-2 rounded-xl bg-gradient-brand text-base font-semibold text-primary-foreground-fix hover:opacity-90"
                size="lg"
            >
                {processing ? 'Création du compte...' : 'Créer mon compte'}
                {!processing && <ArrowRight className="h-4 w-4" />}
            </Button>

            <p className="font-body text-center text-xs text-muted-foreground-fix">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="#" className="text-primary-fix hover:underline">
                    CGU
                </a>{' '}
                et notre{' '}
                <a href="#" className="text-primary-fix hover:underline">
                    politique de confidentialité
                </a>
                .
            </p>
        </form>
    );
}
