import { Link, useForm } from '@inertiajs/react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);

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
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/auth/forgot-password', {
            onSuccess: () => {
                reset();
                toast.success('Inscription réussie!');
            },
        });
    };

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

                {sent ? (
                    <div className="space-y-4 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                            <CheckCircle2 className="h-7 w-7 text-accent" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-foreground">
                            Email envoyé !
                        </h2>
                        <p className="font-body text-sm text-muted-foreground">
                            Vérifiez votre boîte mail et cliquez sur le lien
                            pour réinitialiser votre mot de passe.
                        </p>
                        <Link href="/auth/login">
                            <Button
                                variant="outline"
                                className="font-body mt-4 rounded-xl"
                            >
                                Retour à la connexion
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <h1 className="font-display mb-1 text-3xl font-bold text-foreground">
                            Mot de passe oublié
                        </h1>
                        <p className="font-body mb-8 text-sm text-muted-foreground">
                            Entrez votre email, nous vous enverrons un lien de
                            réinitialisation.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-5">
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

                                <InputError
                                    message={errors.email}
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
                                    ? 'Envoi en cours...'
                                    : 'Envoyer le lien'}
                            </Button>
                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="font-body text-sm text-accent hover:underline"
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
