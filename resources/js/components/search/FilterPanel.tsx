import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ALL_AMENITIES, AMENITY_ICONS, PROPERTY_TYPES } from "@/data/properties";

export interface Filters {
  type: string;
  priceMin: number;
  priceMax: number;
  minRating: number;
  bedrooms: number;       // 0 = tous
  amenities: Set<string>;
}

export const DEFAULT_FILTERS: Filters = {
  type: "Tous",
  priceMin: 0,
  priceMax: 1000,
  minRating: 0,
  bedrooms: 0,
  amenities: new Set(),
};

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose?: () => void;
  activeCount: number;
}

const RATING_OPTIONS = [0, 4, 4.5, 4.8];
const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5];

export default function FilterPanel({ filters, onChange, onClose, activeCount }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const toggleAmenity = (a: string) => {
    const next = new Set(filters.amenities);
    next.has(a) ? next.delete(a) : next.add(a);
    set({ amenities: next });
  };

  const reset = () => onChange({ ...DEFAULT_FILTERS, amenities: new Set() });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Filtres</h2>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground font-body text-xs font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

        {/* ── Type de bien ── */}
        <section>
          <p className="font-body text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Type de bien
          </p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => set({ type: t })}
                className={`px-3 py-1.5 rounded-full font-body text-xs font-semibold border transition-all ${
                  filters.type === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Prix ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Prix / nuit
            </p>
            <span className="font-body text-sm font-bold text-primary">
              {filters.priceMin} € — {filters.priceMax >= 1000 ? "1000 €+" : `${filters.priceMax} €`}
            </span>
          </div>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={[filters.priceMin, filters.priceMax]}
            onValueChange={([min, max]) => set({ priceMin: min, priceMax: max })}
            className="mt-1"
          />
          <div className="flex justify-between mt-2">
            <span className="font-body text-xs text-muted-foreground">0 €</span>
            <span className="font-body text-xs text-muted-foreground">1 000 €+</span>
          </div>
        </section>

        <Separator />

        {/* ── Note minimale ── */}
        <section>
          <p className="font-body text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Note minimale
          </p>
          <div className="flex gap-2">
            {RATING_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => set({ minRating: r })}
                className={`flex-1 py-2 rounded-xl font-body text-xs font-semibold border transition-all ${
                  filters.minRating === r
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {r === 0 ? "Tous" : `${r}★+`}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Chambres ── */}
        <section>
          <p className="font-body text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Chambres (min.)
          </p>
          <div className="flex gap-2">
            {BEDROOM_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => set({ bedrooms: n })}
                className={`flex-1 py-2 rounded-xl font-body text-xs font-semibold border transition-all ${
                  filters.bedrooms === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {n === 0 ? "Tous" : n === 5 ? "5+" : String(n)}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Équipements ── */}
        <section>
          <p className="font-body text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Équipements
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_AMENITIES.map((a) => {
              const active = filters.amenities.has(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    active
                      ? "bg-secondary border-primary text-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span className="text-base leading-none">{AMENITY_ICONS[a] ?? "✦"}</span>
                  <span className="font-body text-xs font-medium leading-tight">{a}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer — mobile only */}
      {onClose && (
        <div className="shrink-0 px-5 py-4 border-t border-border">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90 font-body font-semibold h-11 rounded-xl"
          >
            Voir les résultats
          </Button>
        </div>
      )}
    </div>
  );
}
