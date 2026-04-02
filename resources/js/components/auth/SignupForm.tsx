import { useForm } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    CheckCircle2,
    Compass,
    User,
    Phone,
    Home,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function SignupForm({
    onSwitchToLogin,
}: {
    onSwitchToLogin: () => void;
}) {
    const [showPwd, setShowPwd] = useState(false);

    const userRoles = [
        {
            value: 'voyageur',
            icon: Compass,
            label: 'Je suis voyageur',
            desc: 'Je cherche des séjours',
        },
        {
            value: 'hote',
            icon: Home,
            label: 'Je suis hôte',
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
        role: userRoles[0].value,
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
                <h1 className="font-display text-2xl font-bold text-foreground">
                    Créer un compte
                </h1>
                <p className="font-body text-sm text-muted-foreground">
                    Déjà inscrit ?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="font-semibold text-accent hover:underline"
                    >
                        Se connecter
                    </button>
                </p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3">
                {userRoles.map((item) => (
                    <button
                        key={`role-${item.value}`}
                        type="button"
                        onClick={() => setData('role', item.value)}
                        className={cn(
                            'relative flex flex-col items-start gap-1.5 rounded-2xl border-2 p-4 text-left transition-all',
                            data.role === item.value
                                ? 'border-accent bg-accent/5 shadow-card'
                                : 'border-border bg-card hover:border-accent/40',
                        )}
                    >
                        {data.role === item.value && (
                            <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-accent" />
                        )}
                        <item.icon
                            className={cn(
                                'h-5 w-5',
                                data.role === item.value
                                    ? 'text-accent'
                                    : 'text-muted-foreground',
                            )}
                        />
                        <span
                            className={cn(
                                'font-body text-sm leading-tight font-semibold',
                                data.role === item.value
                                    ? 'text-accent'
                                    : 'text-foreground',
                            )}
                        >
                            {item.label}
                        </span>
                        <span className="font-body text-xs text-muted-foreground">
                            {item.desc}
                        </span>
                    </button>
                ))}
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="">
                    <Label
                        htmlFor="firstName"
                        className={cn(
                            'font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                            errors.firstName && 'text-destructive',
                        )}
                    >
                        Prénom
                    </Label>
                    <div className="relative mt-1.5">
                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            placeholder="Jean"
                            autoComplete="given-name"
                            className={cn(
                                'font-body h-12 rounded-xl border-border bg-muted/30 pl-10 ring-ring ring-offset-2 transition-colors focus-visible:border-border/50 focus-visible:bg-card focus-visible:ring-2',
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
                        htmlFor="email"
                        className={cn(
                            'font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                            errors.email && 'text-destructive',
                        )}
                    >
                        Nom
                    </Label>
                    <div className="relative mt-1.5">
                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            placeholder="Dupont"
                            autoComplete="family-name"
                            className={cn(
                                'font-body h-12 rounded-xl border-border bg-muted/30 pl-10 ring-ring ring-offset-2 transition-colors focus-visible:border-border/50 focus-visible:bg-card focus-visible:ring-2',
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
                        'font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                        errors.tel && 'text-destructive',
                    )}
                >
                    Téléphone
                </Label>
                <div className="relative mt-1.5">
                    <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="tel"
                        name="tel"
                        type="tel"
                        required
                        placeholder="+33 6 00 00 00 00"
                        autoComplete="tel"
                        className={cn(
                            'font-body h-12 rounded-xl border-border bg-muted/30 pl-10 ring-ring ring-offset-2 transition-colors focus-visible:border-border/50 focus-visible:bg-card focus-visible:ring-2',
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
                        'font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                        errors.email && 'text-destructive',
                    )}
                >
                    Email
                </Label>
                <div className="relative mt-1.5">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="email"
                        name="email"
                        type="text"
                        required
                        placeholder="jean@email.com"
                        autoComplete="email"
                        className={cn(
                            'font-body h-12 rounded-xl border-border bg-muted/30 pl-10 ring-ring ring-offset-2 transition-colors focus-visible:border-border/50 focus-visible:bg-card focus-visible:ring-2',
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
                        'font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                        errors.password && 'text-destructive',
                    )}
                >
                    Mot de passe
                </Label>
                <div className="relative mt-1.5">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="password"
                        name="password"
                        type={showPwd ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        placeholder="Min. 8 caractères"
                        className={cn(
                            'font-body h-12 rounded-xl border-border bg-muted/30 pl-10 ring-ring ring-offset-2 transition-colors focus-visible:border-border/50 focus-visible:bg-card focus-visible:ring-2',
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
                        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
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
                        'font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                        errors.password_confirmation && 'text-destructive',
                    )}
                >
                    Confirmer mot de passe
                </Label>
                <div className="relative mt-1.5">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Min. 8 caractères"
                        className={cn(
                            'font-body h-12 rounded-xl border-border bg-muted/30 pl-10 ring-ring ring-offset-2 transition-colors focus-visible:border-border/50 focus-visible:bg-card focus-visible:ring-2',
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
                className="font-body h-12 w-full gap-2 rounded-xl bg-gradient-coral text-base font-semibold text-white shadow-hero hover:opacity-90"
                size="lg"
            >
                {processing ? 'Création du compte...' : 'Créer mon compte'}
                {!processing && <ArrowRight className="h-4 w-4" />}
            </Button>

            <p className="font-body text-center text-xs text-muted-foreground">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="#" className="text-accent hover:underline">
                    CGU
                </a>{' '}
                et notre{' '}
                <a href="#" className="text-accent hover:underline">
                    politique de confidentialité
                </a>
                .
            </p>
        </form>
    );
}
