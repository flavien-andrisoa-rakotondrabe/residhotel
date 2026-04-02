import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function LoginForm({
    onSwitchToSignup,
}: {
    onSwitchToSignup: () => void;
}) {
    const [showPwd, setShowPwd] = useState(false);

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
        email: '',
        password: '',
        remember: false,
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
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="mb-6 space-y-1">
                <h1 className="font-display text-2xl font-bold text-foreground">
                    Connexion
                </h1>
                <p className="font-body text-sm text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="font-semibold text-accent hover:underline"
                    >
                        Créer un compte
                    </button>
                </p>
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

            <Button
                type="submit"
                disabled={processing || hasErrors}
                className="font-body h-12 w-full gap-2 rounded-xl bg-gradient-coral text-base font-semibold text-white shadow-hero hover:opacity-90"
                size="lg"
            >
                {processing ? 'Connexion...' : 'Se connecter'}
                {!processing && <ArrowRight className="h-4 w-4" />}
            </Button>
        </form>
    );
}
