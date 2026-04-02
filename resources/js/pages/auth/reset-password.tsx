import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
    const [showPwd, setShowPwd] = useState(false);
    const [isRecovery, setIsRecovery] = useState(true);

    // useEffect(() => {
    //     // Check for recovery type in URL hash
    //     const hash = window.location.hash;

    //     if (hash.includes('type=recovery')) {
    //         setIsRecovery(true);
    //     }
    // }, []);

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
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        post('/auth/reset-password', {
            onSuccess: () => {
                reset();
                toast.success('Mot de passe mis à jour !');
            },
        });
    };

    if (!isRecovery) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="max-w-sm space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
                        <Lock className="h-7 w-7 text-destructive" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                        Lien invalide
                    </h2>
                    <p className="font-body text-sm text-muted-foreground">
                        Ce lien de réinitialisation est invalide ou a expiré.
                    </p>
                    <Link href="/auth/forgot-password">
                        <Button className="font-body rounded-xl bg-gradient-coral font-semibold text-white shadow-hero">
                            Demander un nouveau lien
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-sm">
                <Link href="/" className="mb-10 flex items-center gap-2">
                    <img
                        src="/logo.svg"
                        alt="Residotel"
                        className="h-8 w-8 rounded-lg"
                    />
                    <span className="font-display text-lg font-semibold text-foreground">
                        Residotel
                    </span>
                </Link>

                <h1 className="font-display mb-1 text-3xl font-bold text-foreground">
                    Nouveau mot de passe
                </h1>
                <p className="font-body mb-8 text-sm text-muted-foreground">
                    Choisissez un mot de passe sécurisé d'au moins 8 caractères.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
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

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="">
                        <Label
                            htmlFor="password_confirmation"
                            className={cn(
                                'font-body text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                                errors.password_confirmation &&
                                    'text-destructive',
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
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    );

                                    if (errors.password) {
                                        clearErrors('password');
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
                        className="font-body h-12 w-full rounded-xl bg-gradient-coral font-semibold text-white shadow-hero hover:opacity-90"
                        size="lg"
                    >
                        {processing
                            ? 'Mise à jour...'
                            : 'Mettre à jour le mot de passe'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
