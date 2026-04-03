import { Link } from "react-router-dom";
import { MapPin, Star, Heart, Bed, Bath, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Property } from "@/data/properties";

interface GridCardProps {
  property: Property;
  isActive: boolean;
  isFavorite: boolean;
  onHover: (id: number | null) => void;
  onFavorite: (id: number) => void;
}

export function GridCard({ property: p, isActive, isFavorite, onHover, onFavorite }: GridCardProps) {
  return (
    <div
      onMouseEnter={() => onHover(p.id)}
      onMouseLeave={() => onHover(null)}
      className={`group relative bg-card rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col ${
        isActive
          ? "border-primary ring-2 ring-primary/20 shadow-card"
          : "border-border hover:border-primary/40 shadow-sm hover:shadow-card"
      }`}
    >
      {/* Image */}
      <Link to={`/property/${p.id}`} className="block relative overflow-hidden aspect-[4/3] shrink-0">
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badge */}
        {p.badge && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-accent text-accent-foreground border-0 font-body text-xs font-semibold shadow-sm">
              {p.badge}
            </Badge>
          </div>
        )}

        {/* Type */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 backdrop-blur-sm text-primary border-0 font-body text-xs px-2 py-0.5 shadow-sm">
            {p.type}
          </Badge>
        </div>
      </Link>

      {/* Favorite */}
      <button
        onClick={(e) => { e.preventDefault(); onFavorite(p.id); }}
        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
          isFavorite
            ? "bg-destructive text-white"
            : "bg-white/85 backdrop-blur-sm text-muted-foreground hover:text-destructive hover:bg-white"
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Location */}
        <div className="flex items-center gap-1 mb-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-body text-xs text-muted-foreground truncate">{p.location}</span>
        </div>

        {/* Title */}
        <Link to={`/property/${p.id}`}>
          <h3 className="font-display text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {p.title}
          </h3>
        </Link>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3 text-muted-foreground">
          <span className="flex items-center gap-1 font-body text-xs">
            <Bed className="w-3.5 h-3.5" />{p.bedrooms} ch.
          </span>
          <span className="flex items-center gap-1 font-body text-xs">
            <Bath className="w-3.5 h-3.5" />{p.bathrooms} sdb
          </span>
          <span className="flex items-center gap-1 font-body text-xs">
            <Users className="w-3.5 h-3.5" />{p.guests} pers.
          </span>
        </div>

        {/* Amenities pills — show max 3 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {p.amenities.slice(0, 3).map((a) => (
            <span key={a} className="font-body text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
              {a}
            </span>
          ))}
          {p.amenities.length > 3 && (
            <span className="font-body text-xs text-muted-foreground px-1">+{p.amenities.length - 3}</span>
          )}
        </div>

        {/* Footer: rating + price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="font-body text-xs font-bold text-foreground">{p.rating}</span>
            <span className="font-body text-xs text-muted-foreground">({p.reviews})</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-body text-base font-bold text-primary">
                {p.price.toLocaleString("fr-FR")} €
              </span>
              <span className="font-body text-xs text-muted-foreground"> /nuit</span>
            </div>
            <Link to={`/property/${p.id}`}>
              <Button
                size="sm"
                className="bg-gradient-brand text-primary-foreground hover:opacity-90 font-body h-8 w-8 p-0 rounded-lg"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-4 py-2 rounded-xl font-body text-sm font-medium border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        ← Précédent
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 py-2 font-body text-sm text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`w-9 h-9 rounded-xl font-body text-sm font-semibold transition-all ${
                page === p
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-4 py-2 rounded-xl font-body text-sm font-medium border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Suivant →
      </button>
    </div>
  );
}
