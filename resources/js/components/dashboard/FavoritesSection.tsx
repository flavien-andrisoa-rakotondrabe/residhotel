import { Heart, MapPin, Star, ArrowRight, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function FavoritesSection() {
  const { user } = useAuth();
  const { favorites, isLoading, toggle } = useFavorites();

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
              <div className="h-44 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Mes favoris</h2>
          <p className="font-body text-sm text-muted-foreground mt-0.5">
            {favorites.length > 0
              ? `${favorites.length} bien${favorites.length > 1 ? "s" : ""} sauvegardé${favorites.length > 1 ? "s" : ""}`
              : "Aucun bien sauvegardé"}
          </p>
        </div>
        {favorites.length > 0 && (
          <Link to="/search">
            <Button variant="outline" size="sm" className="font-body gap-2 rounded-xl">
              <MapPin className="w-4 h-4" /> Explorer plus
            </Button>
          </Link>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground mb-2">
            Aucun favori pour le moment
          </h3>
          <p className="font-body text-sm text-muted-foreground mb-6 max-w-xs">
            Cliquez sur le cœur d'une propriété pour la sauvegarder et la retrouver ici.
          </p>
          <Link to="/search">
            <Button className="bg-gradient-brand text-primary-foreground font-body font-semibold gap-2 rounded-xl">
              <MapPin className="w-4 h-4" /> Explorer les destinations
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="group bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-hero hover:border-primary/20 transition-all"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-muted">
                <img
                  src={
                    fav.property_image ??
                    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600"
                  }
                  alt={fav.property_title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Type badge */}
                {fav.property_type && (
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-white/90 backdrop-blur-sm text-primary border-0 font-body text-xs px-2 py-0.5 shadow-sm">
                      {fav.property_type}
                    </Badge>
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() =>
                    toggle({
                      propertyId: fav.property_id,
                      propertyTitle: fav.property_title,
                      propertyImage: fav.property_image,
                      propertyLocation: fav.property_location,
                      propertyPrice: Number(fav.property_price),
                      propertyRating: Number(fav.property_rating),
                      propertyType: fav.property_type,
                    })
                  }
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-destructive/90 backdrop-blur-sm text-white flex items-center justify-center hover:bg-destructive transition-colors shadow-sm"
                  title="Retirer des favoris"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {fav.property_location && (
                  <div className="flex items-center gap-1 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-body text-xs text-muted-foreground truncate">
                      {fav.property_location}
                    </span>
                  </div>
                )}

                <h3 className="font-display text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-3">
                  {fav.property_title}
                </h3>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1">
                    {Number(fav.property_rating) > 0 ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                        <span className="font-body text-xs font-bold text-foreground">
                          {Number(fav.property_rating).toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <span className="font-body text-xs text-muted-foreground">Nouveau</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {Number(fav.property_price) > 0 && (
                      <span className="font-body text-sm font-bold text-primary">
                        {Number(fav.property_price).toLocaleString("fr-FR")} €
                        <span className="font-normal text-muted-foreground text-xs"> /nuit</span>
                      </span>
                    )}
                    <Link to={`/property/${fav.property_id}`}>
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
          ))}
        </div>
      )}
    </div>
  );
}
