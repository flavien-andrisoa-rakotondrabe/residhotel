import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import {
  TrendingUp, TrendingDown, CalendarCheck, Star, Euro, Home,
  ArrowUpRight, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO, startOfMonth, isThisMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface DBBooking {
  id: string;
  property_title: string;
  property_image: string | null;
  traveler_id: string;
  check_in: string;
  check_out: string;
  total: number;
  status: string;
  created_at: string;
  payment_status: string;
}

function buildMonthlyRevenue(bookings: DBBooking[]) {
  const map: Record<string, number> = {};
  bookings
    .filter((b) => b.status !== "cancelled")
    .forEach((b) => {
      const key = format(parseISO(b.check_in), "MMM", { locale: fr });
      map[key] = (map[key] ?? 0) + Number(b.total);
    });
  const months = ["jan.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return months.filter((m) => map[m]).map((month) => ({ month, revenus: map[month] }));
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-card px-3 py-2 font-body text-sm">
      <p className="font-semibold text-foreground capitalize mb-0.5">{label}</p>
      <p className="text-primary font-bold">{Number(payload[0].value).toLocaleString("fr-FR")} €</p>
    </div>
  );
};

export default function DashboardOverview() {
  const { user } = useAuth();

  const { data: propertyIds = [] } = useQuery({
    queryKey: ["host-property-ids-overview", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("id").eq("host_id", user!.id);
      return (data ?? []).map((p) => p.id as string);
    },
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["host-listings-overview", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, active, rating, reviews, price")
        .eq("host_id", user!.id);
      return data ?? [];
    },
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["host-bookings-overview", propertyIds],
    enabled: propertyIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false });
      return (data ?? []) as DBBooking[];
    },
  });

  const totalRevenue = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + Number(b.total), 0);
  const monthRevenue = bookings
    .filter((b) => b.status !== "cancelled" && isThisMonth(parseISO(b.check_in)))
    .reduce((s, b) => s + Number(b.total), 0);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const avgRating = listings.length > 0
    ? (listings.reduce((s, l) => s + Number(l.rating), 0) / listings.length).toFixed(1)
    : "—";
  const monthlyData = buildMonthlyRevenue(bookings);

  const kpis = [
    {
      label: "Revenus ce mois",
      value: `${monthRevenue.toLocaleString("fr-FR")} €`,
      change: `Total: ${totalRevenue.toLocaleString("fr-FR")} €`,
      up: true,
      icon: Euro,
      colorClass: "text-primary",
      bgClass: "bg-primary/8",
    },
    {
      label: "En attente",
      value: String(pendingCount),
      change: pendingCount > 0 ? "Action requise" : "Tout est traité",
      up: pendingCount === 0,
      icon: Clock,
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
    },
    {
      label: "Confirmées",
      value: String(confirmedCount),
      change: `${bookings.length} au total`,
      up: true,
      icon: CheckCircle2,
      colorClass: "text-primary",
      bgClass: "bg-primary/8",
    },
    {
      label: "Note moyenne",
      value: avgRating,
      change: `${listings.reduce((s, l) => s + Number(l.reviews), 0)} avis`,
      up: true,
      icon: Star,
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
    },
  ];

  const recentBookings = bookings.slice(0, 5);

  const STATUS_MAP: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    confirmed: { label: "Confirmée",  className: "bg-primary/10 text-primary",        icon: CheckCircle2 },
    pending:   { label: "En attente", className: "bg-accent/15 text-accent",           icon: AlertCircle  },
    cancelled: { label: "Annulée",    className: "bg-destructive/10 text-destructive", icon: TrendingDown },
    completed: { label: "Terminée",   className: "bg-secondary text-secondary-foreground", icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-card rounded-2xl border border-border p-5 shadow-card hover:shadow-hero transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.bgClass)}>
                <kpi.icon className={cn("w-5 h-5", kpi.colorClass)} />
              </div>
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-body font-semibold px-1.5 py-0.5 rounded-full",
                kpi.up ? "bg-primary/8 text-primary" : "bg-destructive/10 text-destructive"
              )}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground mb-0.5">
              {isLoading ? <span className="inline-block w-16 h-6 bg-muted rounded animate-pulse" /> : kpi.value}
            </p>
            <p className="font-body text-xs text-muted-foreground">{kpi.label}</p>
            <p className={cn("font-body text-xs mt-1 font-medium", kpi.up ? "text-primary/70" : "text-destructive/70")}>
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Revenus mensuels</h3>
              <p className="font-body text-xs text-muted-foreground mt-0.5">Évolution sur l'année</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold text-primary">
                {totalRevenue.toLocaleString("fr-FR")} €
              </p>
              <p className="font-body text-xs text-muted-foreground">Total cumulé</p>
            </div>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontFamily: "Inter", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "Inter", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenus" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gradRevenu)" dot={false} activeDot={{ r: 5, fill: "hsl(var(--primary))" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="font-body text-sm text-muted-foreground">Pas encore de données</p>
            </div>
          )}
        </div>

        {/* Listings summary */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card flex flex-col">
          <h3 className="font-display text-lg font-bold text-foreground mb-1">Mes annonces</h3>
          <p className="font-body text-xs text-muted-foreground mb-4">
            {listings.filter((l) => l.active).length}/{listings.length} actives
          </p>
          <div className="flex-1 space-y-2">
            {listings.slice(0, 4).map((l) => (
              <div key={l.id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted/40 transition-colors">
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  l.active ? "bg-primary" : "bg-muted-foreground/30"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-foreground truncate">{l.title}</p>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="font-body text-xs text-muted-foreground">{Number(l.rating).toFixed(1)}</span>
                  </div>
                </div>
                <span className="font-body text-sm font-bold text-primary shrink-0">{Number(l.price).toLocaleString("fr-FR")}€</span>
              </div>
            ))}
            {listings.length === 0 && (
              <div className="text-center py-6">
                <Home className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="font-body text-xs text-muted-foreground">Aucune annonce</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      {recentBookings.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-display text-lg font-bold text-foreground">Réservations récentes</h3>
            <Badge className="font-body text-xs bg-muted text-muted-foreground border-0">
              {bookings.length} au total
            </Badge>
          </div>
          <div className="divide-y divide-border">
            {recentBookings.map((b) => {
              const cfg = STATUS_MAP[b.status] ?? STATUS_MAP.confirmed;
              const StatusIcon = cfg.icon;
              return (
                <div key={b.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden shrink-0">
                    {b.property_image && (
                      <img src={b.property_image} alt={b.property_title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground text-sm truncate">{b.property_title}</p>
                    <p className="font-body text-xs text-muted-foreground">
                      {format(parseISO(b.check_in), "d MMM", { locale: fr })} → {format(parseISO(b.check_out), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <Badge className={cn("font-body text-xs border-0 gap-1 shrink-0", cfg.className)}>
                    <StatusIcon className="w-3 h-3" /> {cfg.label}
                  </Badge>
                  <span className="font-display font-bold text-sm text-primary shrink-0">
                    {Number(b.total).toLocaleString("fr-FR")} €
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for new hosts */}
      {!isLoading && bookings.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-10 text-center shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Bienvenue sur votre espace hôte</h3>
          <p className="font-body text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Publiez vos premières annonces pour commencer à recevoir des voyageurs et générer des revenus.
          </p>
          <Button className="bg-gradient-brand text-primary-foreground font-body font-semibold gap-2">
            <Home className="w-4 h-4" /> Créer une annonce
          </Button>
        </div>
      )}
    </div>
  );
}
