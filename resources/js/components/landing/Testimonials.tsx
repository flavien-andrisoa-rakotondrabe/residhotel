import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const testimonials = [
    {
        name: 'Sophie Lefèvre',
        role: 'Voyageuse',
        location: 'Paris, France',
        text: "Residotel m'a permis de trouver une villa magnifique à Santorin en quelques minutes. L'équipe est réactive et la plateforme super intuitive.",
        rating: 5,
        avatar: 'SL',
    },
    {
        name: 'Karim Benali',
        role: 'Hôte certifié',
        location: 'Marrakech, Maroc',
        text: "Depuis que j'ai rejoint Residotel, mes revenus locatifs ont augmenté de 40%. Le processus d'inscription est simple et le support est toujours disponible.",
        rating: 5,
        avatar: 'KB',
    },
    {
        name: 'Marie-Claire Dubois',
        role: 'Voyageuse régulière',
        location: 'Lyon, France',
        text: "Une expérience irréprochable de A à Z. La certification des propriétés et le paiement sécurisé m'ont mis en confiance dès le premier séjour.",
        rating: 5,
        avatar: 'MC',
    },
    {
        name: 'Thomas Moreau',
        role: 'Entrepreneur',
        location: 'Bordeaux, France',
        text: "J'organise tous mes voyages d'affaires via Residotel. La qualité des biens est constante et le service conciergerie fait toute la différence.",
        rating: 5,
        avatar: 'TM',
    },
];

export default function Testimonials() {
    const [active, setActive] = useState(0);
    const prev = () =>
        setActive((a) => (a - 1 + testimonials.length) % testimonials.length);
    const next = () => setActive((a) => (a + 1) % testimonials.length);

    return (
        <section className="bg-sand py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                            Ce que disent nos utilisateurs
                        </h2>
                        <p className="font-body mt-1 text-sm text-muted-foreground">
                            Plus de 1 200 avis vérifiés
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prev}
                            className="hover:shadow-hover flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-shadow"
                        >
                            <ChevronLeft className="h-4 w-4 text-foreground" />
                        </button>
                        <button
                            onClick={next}
                            className="hover:shadow-hover flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-shadow"
                        >
                            <ChevronRight className="h-4 w-4 text-foreground" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {[0, 1, 2].map((offset) => {
                        const t =
                            testimonials[
                                (active + offset) % testimonials.length
                            ];

                        return (
                            <div
                                key={t.name}
                                className="hover:shadow-hover rounded-2xl border border-border bg-card p-6 transition-shadow"
                            >
                                <div className="mb-4 flex gap-0.5">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-4 w-4 fill-foreground text-foreground"
                                        />
                                    ))}
                                </div>
                                <p className="font-body mb-6 text-sm leading-relaxed text-foreground">
                                    "{t.text}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground">
                                        <span className="font-body text-xs font-semibold text-primary-foreground">
                                            {t.avatar}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-body text-sm font-semibold text-foreground">
                                            {t.name}
                                        </p>
                                        <p className="font-body text-xs text-muted-foreground">
                                            {t.role} · {t.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Dots */}
                <div className="mt-6 flex justify-center gap-1.5">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`rounded-full transition-all ${
                                i === active
                                    ? 'h-1.5 w-5 bg-foreground'
                                    : 'h-1.5 w-1.5 bg-foreground/25'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
