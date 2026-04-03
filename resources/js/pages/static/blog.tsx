import { Link } from '@inertiajs/react';
import { ChevronRight, Clock } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const articles = [
    {
        id: 1,
        category: 'Conseils voyageurs',
        title: '10 astuces pour trouver le logement idéal en location courte durée',
        excerpt:
            "Découvrez nos meilleurs conseils pour dénicher la perle rare et profiter d'un séjour inoubliable, quel que soit votre budget.",
        date: '15 mars 2025',
        readTime: '5 min',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop',
    },
    {
        id: 2,
        category: 'Hôtes',
        title: 'Comment optimiser votre annonce pour attirer plus de voyageurs',
        excerpt:
            'Photos professionnelles, description percutante, tarification dynamique… Les clés pour maximiser vos réservations sur Residotel.',
        date: '10 mars 2025',
        readTime: '7 min',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
    },
    {
        id: 3,
        category: 'Destinations',
        title: 'Les 5 destinations tendance du printemps 2025 en France',
        excerpt:
            "De la Côte d'Azur aux villages alsaciens, découvrez les destinations qui font rêver les voyageurs cette saison.",
        date: '5 mars 2025',
        readTime: '4 min',
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=400&fit=crop',
    },
    {
        id: 4,
        category: 'Réglementation',
        title: 'Location saisonnière : ce que dit la loi en 2025',
        excerpt:
            'Déclaration en mairie, plafond de 120 jours, fiscalité… Tout ce que les hôtes doivent savoir pour rester en conformité.',
        date: '28 février 2025',
        readTime: '8 min',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop',
    },
    {
        id: 5,
        category: 'Expériences',
        title: "Séjourner chez l'habitant : témoignages de voyageurs Residotel",
        excerpt:
            'Trois voyageurs partagent leurs plus belles expériences de séjours réservés sur Residotel.',
        date: '20 février 2025',
        readTime: '6 min',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
    },
    {
        id: 6,
        category: 'Conseils hôtes',
        title: 'Accueil 5 étoiles : le guide complet pour les nouveaux hôtes',
        excerpt:
            'De la préparation du logement à la communication avec les voyageurs, voici comment offrir une expérience mémorable.',
        date: '15 février 2025',
        readTime: '6 min',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    },
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="border-b border-border bg-primary/5 px-6 pt-24 pb-14">
                <div className="container mx-auto max-w-5xl text-center">
                    <div className="font-body mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground"
                        >
                            Accueil
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-medium text-foreground">
                            Blog
                        </span>
                    </div>
                    <h1 className="font-display mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        Le blog Residotel
                    </h1>
                    <p className="font-body mx-auto max-w-xl text-base text-muted-foreground">
                        Conseils, tendances et actualités de la location courte
                        durée.
                    </p>
                </div>
            </div>

            <section className="container mx-auto max-w-5xl px-6 py-12">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((a) => (
                        <article
                            key={a.id}
                            className="group overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-hero"
                        >
                            <div className="aspect-[3/2] overflow-hidden">
                                <img
                                    src={a.image}
                                    alt={a.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-5">
                                <span className="font-body mb-2 inline-block text-[11px] font-semibold tracking-wider text-primary uppercase">
                                    {a.category}
                                </span>
                                <h2 className="font-display mb-2 line-clamp-2 leading-snug font-semibold text-foreground">
                                    {a.title}
                                </h2>
                                <p className="font-body mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                    {a.excerpt}
                                </p>
                                <div className="font-body flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{a.date}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />{' '}
                                        {a.readTime}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
