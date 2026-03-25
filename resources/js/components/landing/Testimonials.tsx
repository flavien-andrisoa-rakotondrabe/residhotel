import { Star, Quote, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useState } from 'react';

const testimonials = [
    {
        name: 'Sophie Lefèvre',
        role: 'Voyageuse',
        location: 'Paris, France',
        text: "Residotel m'a permis de trouver une villa magnifique à Santorin en quelques minutes. L'équipe est réactive et la plateforme super intuitive. Je ne réserve plus autrement !",
        rating: 5,
        avatar: 'SL',
        stay: 'Villa à Santorin',
        color: 'from-primary-fix/80 to-primary-fix',
    },
    {
        name: 'Karim Benali',
        role: 'Hôte certifié',
        location: 'Marrakech, Maroc',
        text: "Depuis que j'ai rejoint Residotel, mes revenus locatifs ont augmenté de 40%. Le processus d'inscription est simple et le support est toujours disponible à toute heure.",
        rating: 5,
        avatar: 'KB',
        stay: 'Riad — Hôte depuis 2023',
        color: 'from-accent-fix/80 to-accent-fix',
    },
    {
        name: 'Marie-Claire Dubois',
        role: 'Voyageuse régulière',
        location: 'Lyon, France',
        text: "Une expérience irréprochable de A à Z. La certification des propriétés et le paiement sécurisé m'ont mis en confiance dès le premier séjour. Je recommande vivement.",
        rating: 5,
        avatar: 'MC',
        stay: 'Suite à Dubaï',
        color: 'from-primary-fix/70 to-primary-fix/90',
    },
    {
        name: 'Thomas Moreau',
        role: 'Entrepreneur',
        location: 'Bordeaux, France',
        text: "J'organise tous mes voyages d'affaires via Residotel. La qualité des biens est constante et le service conciergerie fait toute la différence par rapport aux autres plateformes.",
        rating: 5,
        avatar: 'TM',
        stay: 'Appartement à Barcelone',
        color: 'from-accent-fix/70 to-accent-fix/90',
    },
];

export default function Testimonials() {
    const [active, setActive] = useState(0);
    const prev = () =>
        setActive((a) => (a - 1 + testimonials.length) % testimonials.length);
    const next = () => setActive((a) => (a + 1) % testimonials.length);

    const t = testimonials[active];

    return (
        <section className="relative overflow-hidden bg-primary-fix py-24">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/4 -translate-y-1/2 rounded-full bg-white/[0.04]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/2 rounded-full bg-accent-fix/[0.08]" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground-fix/[0.02]" />

            <div className="relative container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="font-body text-sm font-semibold tracking-widest text-accent-fix uppercase">
                            Ils nous font confiance
                        </span>
                        <h2 className="font-display mt-2 text-4xl leading-tight font-bold text-primary-foreground-fix md:text-5xl">
                            Des séjours qui marquent
                            <br className="hidden md:block" /> les esprits
                        </h2>
                    </div>
                    {/* Aggregate rating */}
                    <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className="h-4 w-4 fill-accent-fix text-accent-fix"
                                />
                            ))}
                        </div>
                        <div>
                            <p className="font-display text-sm font-bold text-white">
                                4.9 / 5
                            </p>
                            <p className="font-body text-xs text-white/50">
                                1 200+ avis vérifiés
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
                    {/* Featured testimonial — large */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 md:p-10 lg:col-span-3">
                        {/* Quote mark */}
                        <Quote className="absolute top-6 right-8 h-20 w-20 rotate-180 text-white/[0.06]" />

                        <div className="mb-6 flex gap-0.5">
                            {[...Array(t.rating)].map((_, i) => (
                                <Star
                                    key={i}
                                    className="h-5 w-5 fill-accent-fix text-accent-fix"
                                />
                            ))}
                        </div>

                        <blockquote className="font-display mb-8 text-xl leading-relaxed font-medium text-white/95 md:text-2xl">
                            "{t.text}"
                        </blockquote>

                        <div className="flex items-center gap-4">
                            <div
                                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${t.color} flex shrink-0 items-center justify-center shadow-md`}
                            >
                                <span className="font-display text-lg font-bold text-white">
                                    {t.avatar}
                                </span>
                            </div>
                            <div>
                                <p className="font-body text-base font-bold text-white">
                                    {t.name}
                                </p>
                                <div className="mt-0.5 flex items-center gap-2">
                                    <p className="font-body text-xs text-white/60">
                                        {t.role}
                                    </p>
                                    <span className="text-white/25">·</span>
                                    <p className="font-body flex items-center gap-1 text-xs text-accent/80">
                                        <MapPin className="h-3 w-3" />
                                        {t.location}
                                    </p>
                                </div>
                                <p className="font-body mt-1 text-[11px] text-white/40 italic">
                                    {t.stay}
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="mt-8 flex items-center gap-3">
                            <button
                                onClick={prev}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all hover:border-white/40 hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div className="flex gap-1.5">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActive(i)}
                                        className={`rounded-full transition-all ${
                                            i === active
                                                ? 'h-1.5 w-5 bg-accent-fix'
                                                : 'h-1.5 w-1.5 bg-white/30 hover:bg-white/50'
                                        }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={next}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all hover:border-white/40 hover:text-white"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Side cards */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {testimonials
                            .filter((_, i) => i !== active)
                            .slice(0, 2)
                            .map((card) => (
                                <button
                                    key={card.name}
                                    onClick={() =>
                                        setActive(testimonials.indexOf(card))
                                    }
                                    className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-left transition-all hover:border-white/20 hover:bg-white/[0.12]"
                                >
                                    <div className="mb-3 flex gap-0.5">
                                        {[...Array(card.rating)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-3.5 w-3.5 fill-accent-fix text-accent-fix"
                                            />
                                        ))}
                                    </div>
                                    <p className="font-body mb-4 line-clamp-3 text-sm leading-relaxed text-white/70 transition-colors group-hover:text-white/85">
                                        "{card.text}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-9 w-9 rounded-xl bg-gradient-to-br ${card.color} flex shrink-0 items-center justify-center`}
                                        >
                                            <span className="font-display text-xs font-bold text-white">
                                                {card.avatar}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-body text-xs font-semibold text-white/90">
                                                {card.name}
                                            </p>
                                            <p className="font-body text-[10px] text-white/40">
                                                {card.location}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}

                        {/* Summary stat card */}
                        <div className="rounded-2xl border border-accent-fix/20 bg-accent-fix/15 p-5">
                            <p className="font-display mb-1 text-3xl font-bold text-accent-fix">
                                +40%
                            </p>
                            <p className="font-body text-sm leading-snug text-white/70">
                                De revenus en moyenne pour nos hôtes après 6
                                mois sur Residotel
                            </p>
                            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-accent-fix"
                                    style={{ width: '75%' }}
                                />
                            </div>
                            <p className="font-body mt-1.5 text-xs text-white/40">
                                75% de nos hôtes renouvellent leur abonnement
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
