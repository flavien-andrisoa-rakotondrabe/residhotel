import { useQuery } from "@tanstack/react-query";
import { format, isPast, parseISO, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarCheck, MapPin, MessageSquare, TrendingUp,
  Clock, Star, ArrowRight, Plane, Heart, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  property_id: string;
  property_title: string;
  property_image: string | null;
  property_location: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total: number;
  status: "pending" | "confirmed" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
}

const STATUS_CONFIG = {
  confirmed: { label: "Confirmée", dot: "bg-primary" },
  pending:   { label: "En attente", dot: "bg-accent" },
  cancelled: { label: "Annulée", dot: "bg-destructive" },
};

const PAYMENT_CONFIG = {
  paid:     { label: "Payé", className: "bg-primary/10 text-primary" },
  pending:  { label: "En attente", className: "bg-accent/15 text-accent" },
  failed:   { label: "Échoué", className: "bg-destructive/10 text-destructive" },
  refunded: { label: "Remboursé", className: "bg-muted text-muted-foreground" },
};

function isUpcoming(b: Booking) {
  return !isPast(parseISO(b.check_out)) && b.status !== "cancelled";
}

export default function TravelerOverview() {
  const { user, profile } = useAuth();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("traveler_id", user!.id)
        .order("check_in", { ascending: true });
      if (error) throw error;
      return data as Booking[];
    },
  });

  const upcoming = bookings.filter(isUpcoming).slice(0, 3);
  const past = bookings.filter((b) => !isUpcoming(b)).slice(0, 4);
  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + Number(b.total), 0);
  const destinations = new Set(bookings.map((b) => b.property_location)).size;

  const nextTrip = upcoming[0];
  const daysUntil = nextTrip ? differenceInDays(parseISO(nextTrip.check_in), new Date()) : null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero welcome banner */}
      <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-accent/20 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="font-body text-primary-foreground/70 text-sm mb-1">Bonjour 👋</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
                {profile?.first_name ? `${profile.first_name} !` : "Bienvenue !"}
              </h2>
              {nextTrip && daysUntil !== null && daysUntil >= 0 && (
                <p className="font-body text-primary-foreground/80 text-sm mt-2 flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Prochain séjour dans <span className="font-bold text-white">{daysUntil === 0 ? "aujourd'hui !" : `${daysUntil} jours`}</span>
                </p>
              )}
            </div>
            <Link to="/search">
              <Button size="sm" className="bg-gradient-amber text-white border-0 hover:opacity-90 font-body font-semibold gap-2 shadow-lg">
                <MapPin className="w-4 h-4" /> Explorer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Séjours à venir",
            value: upcoming.length,
            icon: CalendarCheck,
            colorClass: "text-primary",
            bgClass: "bg-primary/8",
          },
          {
            label: "Total dépensé",
            value: `${totalSpent.toLocaleString("fr-FR")} €`,
            icon: TrendingUp,
            colorClass: "text-accent",
            bgClass: "bg-accent/10",
          },
          {
            label: "Séjours passés",
            value: past.length,
            icon: Heart,
            colorClass: "text-accent",
            bgClass: "bg-accent/10",
          },
          {
            label: "Destinations",
            value: destinations,
            icon: MapPin,
            colorClass: "text-secondary-foreground",
            bgClass: "bg-secondary",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl border border-border p-4 shadow-card hover:shadow-hero transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.bgClass)}>
                <s.icon className={cn("w-4 h-4", s.colorClass)} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">
              {isLoading ? (
                <span className="inline-block w-10 h-6 bg-muted rounded animate-pulse" />
              ) : s.value}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-display text-lg font-bold text-foreground">Prochains séjours</h3>
          <Link
            to="/mes-reservations"
            className="font-body text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl border border-border animate-pulse">
                  <div className="w-20 h-16 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                <CalendarCheck className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="font-body text-muted-foreground text-sm mb-4">
                Aucun séjour à venir pour le moment.
              </p>
              <Link to="/search">
                <Button size="sm" className="bg-gradient-brand text-primary-foreground font-body font-semibold gap-2">
                  <MapPin className="w-4 h-4" /> Explorer les destinations
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((booking) => {
                const days = differenceInDays(parseISO(booking.check_in), new Date());
                const status = STATUS_CONFIG[booking.status];
                const payment = booking.payment_status ? PAYMENT_CONFIG[booking.payment_status] : null;
                return (
                  <div
                    key={booking.id}
                    className="flex gap-4 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors group"
                  >
                    <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
                      <img
                        src={booking.property_image ?? "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400"}
                        alt={booking.property_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-body font-semibold text-foreground text-sm truncate">
                            {booking.property_title}
                          </p>
                          {booking.property_location && (
                            <p className="font-body text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" /> {booking.property_location}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                            <span className="font-body text-xs text-muted-foreground">{status.label}</span>
                          </div>
                          {payment && (
                            <Badge className={cn("font-body text-[10px] border-0 py-0", payment.className)}>
                              {payment.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(booking.check_in), "d MMM", { locale: fr })} →{" "}
                          {format(parseISO(booking.check_out), "d MMM yyyy", { locale: fr })}
                          {days >= 0 && (
                            <span className="ml-1 font-semibold text-primary">
                              ({days === 0 ? "aujourd'hui" : `dans ${days}j`})
                            </span>
                          )}
                        </p>
                        <p className="font-display font-bold text-sm text-primary">
                          {Number(booking.total).toLocaleString("fr-FR")} €
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Past trips */}
      {past.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-display text-lg font-bold text-foreground">Séjours passés</h3>
            <Link
              to="/mes-reservations"
              className="font-body text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {past.map((booking) => (
              <div
                key={booking.id}
                className="flex gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors group"
              >
                <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0 bg-muted">
                  <img
                    src={booking.property_image ?? "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400"}
                    alt={booking.property_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-foreground text-xs truncate">{booking.property_title}</p>
                  <p className="font-body text-xs text-muted-foreground truncate">{booking.property_location}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                      ))}
                    </div>
                    <Link to="/mes-reservations">
                      <button className="font-body text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5">
                        Avis <ChevronRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/search" className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-card transition-all group">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <p className="font-body font-semibold text-foreground text-sm">Explorer</p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">Trouver un séjour</p>
        </Link>
        <Link to="/mes-reservations" className="bg-card rounded-2xl border border-border p-5 hover:border-accent/30 hover:shadow-card transition-all group">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/15 transition-colors">
            <MessageSquare className="w-5 h-5 text-accent" />
          </div>
          <p className="font-body font-semibold text-foreground text-sm">Réservations</p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">Gérer mes séjours</p>
        </Link>
      </div>
    </div>
  );
}
