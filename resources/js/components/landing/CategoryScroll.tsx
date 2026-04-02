import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

const CATEGORIES = [
    { icon: '🏠', label: 'Maisons', query: 'Maison' },
    { icon: '🏢', label: 'Appartements', query: 'Appartement' },
    { icon: '🏖️', label: 'Bord de mer', query: 'bord de mer' },
    { icon: '🏔️', label: 'Montagne', query: 'montagne' },
    { icon: '🏡', label: 'Campagne', query: 'campagne' },
    { icon: '🏰', label: 'Châteaux', query: 'château' },
    { icon: '🌴', label: 'Tropical', query: 'tropical' },
    { icon: '🛖', label: 'Cabanes', query: 'cabane' },
    { icon: '⛷️', label: 'Ski', query: 'ski' },
    { icon: '🏝️', label: 'Îles', query: 'île' },
    { icon: '🌆', label: 'Centre-ville', query: 'centre-ville' },
    { icon: '🍷', label: 'Vignobles', query: 'vignoble' },
    { icon: '🏕️', label: 'Nature', query: 'nature' },
    { icon: '✨', label: 'Luxe', query: 'luxe' },
    { icon: '🏊', label: 'Piscine', query: 'piscine' },
];

export default function CategoryScroll() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) {
            return;
        }

        scrollRef.current.scrollBy({
            left: dir === 'left' ? -300 : 300,
            behavior: 'smooth',
        });
    };

    const handleClick = (cat: (typeof CATEGORIES)[0], i: number) => {
        setActiveIdx(i);

        // navigate(`/search?q=${encodeURIComponent(cat.query)}`);
    };

    return (
        <section className="sticky top-[66px] z-40 border-b border-border bg-background">
            <div className="relative container mx-auto px-4 md:px-6">
                {/* Left arrow */}
                <button
                    onClick={() => scroll('left')}
                    className="hover:shadow-hover absolute top-1/2 left-0 z-10 flex hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-card transition-shadow md:flex"
                >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>

                {/* Scrollable categories */}
                <div
                    ref={scrollRef}
                    className="hide-scrollbar flex items-center justify-center gap-1 overflow-x-auto py-3 md:mx-10"
                >
                    {CATEGORIES.map((cat, i) => (
                        <button
                            key={cat.label}
                            onClick={() => handleClick(cat, i)}
                            className={`flex min-w-[72px] shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 ${
                                activeIdx === i
                                    ? 'border-b-2 border-foreground'
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="font-body text-[11px] font-medium whitespace-nowrap text-foreground">
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Right arrow */}
                <button
                    onClick={() => scroll('right')}
                    className="hover:shadow-hover absolute top-1/2 right-0 z-10 flex hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-card transition-shadow md:flex"
                >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                </button>
            </div>
        </section>
    );
}
