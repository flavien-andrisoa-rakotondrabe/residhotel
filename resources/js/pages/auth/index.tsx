import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

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
        <div className="flex min-h-screen bg-background">
            {/* ── Left illustration ── */}
            <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[45%] xl:w-1/2">
                <div className="hero-overlay absolute inset-0 z-10" />
                <img
                    src={panel.src}
                    alt="Residotel"
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
                />
                <div className="relative z-20">
                    <Link href="/" className="flex items-center gap-2.5">
                        <img
                            src="/logo.svg"
                            alt="Residotel"
                            className="h-9 w-9 rounded-xl"
                        />
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
                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-3 pt-4">
                        {[
                            { icon: '🏡', label: '2 000+ propriétés' },
                            { icon: '⭐', label: '98% satisfaction' },
                            { icon: '🔒', label: 'Paiements sécurisés' },
                        ].map((b) => (
                            <div
                                key={b.label}
                                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-sm"
                            >
                                <span className="text-sm leading-none">
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
                {/* Mobile logo */}
                <div className="flex items-center gap-2 px-6 pt-6 pb-0 lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/logo.svg"
                            alt="Residotel"
                            className="h-8 w-8 rounded-lg"
                        />
                        <span className="font-display text-lg font-semibold text-foreground">
                            Residotel
                        </span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center px-6 py-10">
                    <div className="w-full max-w-md">
                        {/* ── Tab switcher ── */}
                        <div className="mb-8 flex rounded-2xl bg-muted p-1">
                            {(['login', 'signup'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`font-body flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                                        tab === t
                                            ? 'bg-card text-foreground shadow-card'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {t === 'login'
                                        ? 'Se connecter'
                                        : 'Créer un compte'}
                                </button>
                            ))}
                        </div>

                        {/* ── Forms ── */}
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
