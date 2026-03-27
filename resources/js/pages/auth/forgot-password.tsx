import { Link, useForm } from '@inertiajs/react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

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

                {sent ? (
                    <div className="space-y-4 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-fix/10">
                            <CheckCircle2 className="h-7 w-7 text-primary-fix" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-foreground-fix">
                            Email envoyé !
                        </h2>
                        <p className="font-body text-sm text-muted-foreground-fix">
                            Vérifiez votre boîte mail et cliquez sur le lien
                            pour réinitialiser votre mot de passe.
                        </p>
                        <Link href="/auth">
                            <Button
                                variant="outline"
                                className="font-body h-10 cursor-pointer rounded-sm border-input-fix px-4 py-2 text-primary-fix hover:text-primary-fix dark:border-input-fix/90"
                            >
                                Retour à la connexion
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <h1 className="font-display mb-1 text-3xl font-bold text-foreground-fix">
                            Mot de passe oublié
                        </h1>
                        <p className="font-body mb-8 text-sm text-muted-foreground-fix">
                            Entrez votre email, nous vous enverrons un lien de
                            réinitialisation.
                        </p>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="">
                                <Label className="font-body text-xs font-semibold tracking-wide text-muted-foreground-fix uppercase">
                                    Email
                                </Label>
                                <div className="relative mt-1.5">
                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground-fix" />
                                    <Input
                                        type="email"
                                        placeholder="jean@email.com"
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
                                    ? 'Envoi en cours...'
                                    : 'Envoyer le lien'}
                            </Button>
                            <div className="text-center">
                                <Link
                                    href="/auth"
                                    className="font-body text-sm text-primary-fix hover:underline"
                                >
                                    Retour à la connexion
                                </Link>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
