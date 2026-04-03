import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const bookingId = searchParams.get('booking_id');
    const [status, setStatus] = useState<
        'loading' | 'success' | 'pending' | 'failed'
    >('loading');

    useEffect(() => {
        if (!bookingId) {
            setStatus('failed');

            return;
        }

        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            const { data } = await supabase
                .from('bookings')
                .select('payment_status')
                .eq('id', bookingId)
                .maybeSingle();

            if (data?.payment_status === 'paid') {
                setStatus('success');
                clearInterval(interval);
            } else if (data?.payment_status === 'failed') {
                setStatus('failed');
                clearInterval(interval);
            } else if (attempts >= 10) {
                setStatus('pending');
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [bookingId]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="flex min-h-[80vh] items-center justify-center px-6">
                <div className="w-full max-w-md space-y-5 rounded-3xl border border-border bg-card p-10 text-center shadow-hero">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="mx-auto h-14 w-14 animate-spin text-primary" />
                            <h1 className="font-display text-2xl font-bold text-foreground">
                                Vérification du paiement…
                            </h1>
                            <p className="font-body text-sm text-muted-foreground">
                                Veuillez patienter, nous confirmons votre
                                paiement.
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                                <CheckCircle2 className="h-10 w-10 text-primary" />
                            </div>
                            <h1 className="font-display text-2xl font-bold text-foreground">
                                Paiement confirmé !
                            </h1>
                            <p className="font-body text-sm text-muted-foreground">
                                Votre réservation est confirmée et votre
                                paiement a bien été reçu. Bon voyage ! 🌍
                            </p>
                            <Button
                                onClick={() =>
                                    navigate('/dashboard?section=bookings')
                                }
                                className="font-body h-12 w-full gap-2 bg-gradient-brand font-semibold text-primary-foreground hover:opacity-90"
                            >
                                Voir mes réservations{' '}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {status === 'pending' && (
                        <>
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/15">
                                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                            </div>
                            <h1 className="font-display text-2xl font-bold text-foreground">
                                Paiement en cours…
                            </h1>
                            <p className="font-body text-sm text-muted-foreground">
                                Le traitement peut prendre quelques instants.
                                Votre réservation sera confirmée
                                automatiquement.
                            </p>
                            <Button
                                onClick={() =>
                                    navigate('/dashboard?section=bookings')
                                }
                                className="font-body h-12 w-full gap-2 bg-gradient-brand font-semibold text-primary-foreground hover:opacity-90"
                            >
                                Voir mes réservations{' '}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                                <XCircle className="h-10 w-10 text-destructive" />
                            </div>
                            <h1 className="font-display text-2xl font-bold text-foreground">
                                Paiement échoué
                            </h1>
                            <p className="font-body text-sm text-muted-foreground">
                                Le paiement n'a pas pu être traité. Vous pouvez
                                réessayer.
                            </p>
                            <Button
                                onClick={() => navigate(-1)}
                                className="font-body h-12 w-full gap-2 bg-gradient-brand font-semibold text-primary-foreground hover:opacity-90"
                            >
                                Réessayer
                            </Button>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
