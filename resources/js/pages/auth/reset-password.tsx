import { Link } from '@inertiajs/react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isRecovery, setIsRecovery] = useState(true);

    // useEffect(() => {
    //     // Check for recovery type in URL hash
    //     const hash = window.location.hash;

    //     if (hash.includes('type=recovery')) {
    //         setIsRecovery(true);
    //     }
    // }, []);

    const onSubmit = async (e: React.FormEvent) => {};

    if (!isRecovery) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-fix px-6">
                <div className="max-w-sm space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                        <Lock className="h-7 w-7 text-destructive" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground-fix">
                        Lien invalide
                    </h2>
                    <p className="font-body text-sm text-muted-foreground-fix">
                        Ce lien de réinitialisation est invalide ou a expiré.
                    </p>
                    <Link href="/auth/forgot-password">
                        <Button
                            size="lg"
                            className="font-body h-10 bg-gradient-brand px-4 py-2 font-semibold text-primary-foreground-fix"
                        >
                            Demander un nouveau lien
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background-fix px-6">
            <div className="w-full max-w-sm">
                <Link href="/" className="mb-10 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-amber">
                        <span className="font-display text-sm font-bold text-white">
                            R
                        </span>
                    </div>
                    <span className="font-display text-lg font-semibold text-primary-fix">
                        Residotel
                    </span>
                </Link>

                <h1 className="font-display mb-1 text-3xl font-bold text-foreground-fix">
                    Nouveau mot de passe
                </h1>
                <p className="font-body mb-8 text-sm text-muted-foreground-fix">
                    Choisissez un mot de passe sécurisé d'au moins 8 caractères.
                </p>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="">
                        <Label className="font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase">
                            Nouveau mot de passe
                        </Label>
                        <div className="relative mt-1.5">
                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                            <Input
                                type={showPwd ? 'text' : 'password'}
                                placeholder="Min. 8 caractères"
                                className="font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/70 focus-visible:ring-2 focus-visible:ring-ring-fix"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(!showPwd)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPwd ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="">
                        <Label className="font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase">
                            Confirmer
                        </Label>
                        <div className="relative mt-1.5">
                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Répétez le mot de passe"
                                className="font-body h-11 border-input-fix pl-9 text-muted-foreground-fix ring-offset-2 placeholder:text-muted-foreground-fix focus-visible:border-input-fix/70 focus-visible:ring-2 focus-visible:ring-ring-fix"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="font-body h-12 w-full rounded-xl bg-gradient-brand font-semibold text-primary-foreground-fix hover:opacity-90"
                        size="lg"
                    >
                        {loading
                            ? 'Mise à jour...'
                            : 'Mettre à jour le mot de passe'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
