import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Check, X, Clock, MapPin, Users, Calendar, Eye, EyeOff,
  TrendingUp, Euro, BedDouble, CheckCircle2, Loader2, AlertCircle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface DBBooking {
  id: string;
  traveler_id: string;
  property_id: string;
  property_title: string;
  property_image: string | null;
  property_location: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  price_per_night: number;
  subtotal: number;
  service_fee: number;
  total: number;
  status: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
}

interface TravelerProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType; dot: string }> = {
  confirmed: { label: "Confirmée",  className: "bg-primary/10 text-primary",           icon: CheckCircle2, dot: "bg-primary" },
  pending:   { label: "En attente", className: "bg-accent/15 text-accent",              icon: AlertCircle,  dot: "bg-accent" },
  cancelled: { label: "Annulée",    className: "bg-destructive/10 text-destructive",    icon: X,            dot: "bg-destructive" },
  completed: { label: "Terminée",   className: "bg-secondary text-secondary-foreground", icon: CheckCircle2, dot: "bg-muted-foreground" },
};

const PAYMENT_CONFIG: Record<string, { label: string; className: string }> = {
  paid:     { label: "✓ Payé",        className: "bg-primary/10 text-primary" },
  pending:  { label: "⏳ En attente", className: "bg-accent/15 text-accent" },
  failed:   { label: "✗ Échoué",      className: "bg-destructive/10 text-destructive" },
  refunded: { label: "↩ Remboursé",   className: "bg-muted text-muted-foreground" },
};

function statusOf(b: DBBooking): string {
  if (b.status === "cancelled") return "cancelled";
  if (isPast(parseISO(b.check_out))) return "completed";
  return b.status;
}

function initials(fn: string | null, ln: string | null) {
  return ((fn?.[0] ?? "") + (ln?.[0] ?? "")).toUpperCase() || "?";
}

function buildMonthlyRevenue(bookings: DBBooking[]) {
  const map: Record<string, number> = {};
  bookings
    .filter((b) => b.status !== "cancelled")
    .forEach((b) => {
      const key = format(parseISO(b.check_in), "MMM yy", { locale: fr });
      map[key] = (map[key] ?? 0) + Number(b.total);
    });
  const sorted = Object.entries(map).sort(([a], [b]) => {
    const toDate = (s: string) => {
      const [mon, yr] = s.split(" ");
      return new Date(`20${yr}-${["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"].indexOf(mon.toLowerCase().slice(0, 3)) + 1}-01`);
    };
    return toDate(a).getTime() - toDate(b).getTime();
  });
  return sorted.map(([month, revenue]) => ({ month, revenue }));
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-card">
      <p className="font-body text-xs text-muted-foreground capitalize">{label}</p>
      <p className="font-display text-base font-bold text-primary">{Number(payload[0].value).toLocaleString("fr-FR")} €</p>
    </div>
  );
}

export default function DashboardBookings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: propertyIds = [] } = useQuery({
    queryKey: ["host-property-ids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("id").eq("host_id", user!.id);
      return (data ?? []).map((p) => p.id as string);
    },
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["host-bookings", propertyIds],
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

  const travelerIds = [...new Set(bookings.map((b) => b.traveler_id))];
  const { data: profiles = [] } = useQuery({
    queryKey: ["traveler-profiles", travelerIds],
    enabled: travelerIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, avatar_url")
        .in("user_id", travelerIds);
      return (data ?? []) as TravelerProfile[];
    },
  });

  const profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, p]));

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["host-bookings"] });
      toast({
        title: status === "confirmed" ? "✅ Réservation confirmée" : "Réservation refusée",
        variant: status === "cancelled" ? "destructive" : "default",
      });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const totalRevenue = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + Number(b.total), 0);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const monthlyData = buildMonthlyRevenue(bookings);

  const tabs = [
    { value: "all",       label: "Toutes",     filter: () => true },
    { value: "pending",   label: "En attente", filter: (b: DBBooking) => b.status === "pending" },
    { value: "confirmed", label: "Confirmées", filter: (b: DBBooking) => b.status === "confirmed" },
    { value: "completed", label: "Terminées",  filter: (b: DBBooking) => statusOf(b) === "completed" },
    { value: "cancelled", label: "Annulées",   filter: (b: DBBooking) => b.status === "cancelled" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Réservations reçues</h2>
          <p className="font-body text-sm text-muted-foreground mt-0.5">
            {pendingCount > 0 && (
              <span className="text-accent font-semibold">{pendingCount} en attente · </span>
            )}
            {bookings.length} au total
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-accent/15 text-accent border-0 font-body text-sm px-3 py-1.5 gap-1.5 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
          </Badge>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Revenus totaux",    value: `${totalRevenue.toLocaleString("fr-FR")} €`, icon: Euro,         colorClass: "text-primary",        bgClass: "bg-primary/8" },
          { label: "En attente",        value: pendingCount,                                icon: Clock,        colorClass: "text-accent",         bgClass: "bg-accent/10" },
          { label: "Confirmées",        value: confirmedCount,                              icon: CheckCircle2, colorClass: "text-primary",        bgClass: "bg-primary/8" },
          { label: "Total",             value: bookings.length,                             icon: BedDouble,    colorClass: "text-muted-foreground", bgClass: "bg-muted/60" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 shadow-card hover:shadow-hero transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.bgClass)}>
                <s.icon className={cn("w-4 h-4", s.colorClass)} />
              </div>
            </div>
            <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {monthlyData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-body text-sm font-semibold text-foreground">Revenus mensuels</h3>
              <p className="font-body text-xs text-muted-foreground">Basé sur vos réservations confirmées</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "inherit" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: "hsl(var(--primary))" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty states */}
      {propertyIds.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <BedDouble className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="font-display text-lg font-bold text-foreground mb-1">Aucune annonce publiée</p>
          <p className="font-body text-sm text-muted-foreground">Publiez des annonces pour recevoir des réservations.</p>
        </div>
      )}

      {propertyIds.length > 0 && !isLoading && bookings.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="font-display text-lg font-bold text-foreground mb-1">Aucune réservation reçue</p>
          <p className="font-body text-sm text-muted-foreground">Vos premières réservations apparaîtront ici.</p>
        </div>
      )}

      {/* Bookings list with tabs */}
      {bookings.length > 0 && (
        <Tabs defaultValue="all">
          <TabsList className="font-body h-auto flex-wrap gap-1 bg-muted/50 p-1">
            {tabs.map((t) => {
              const count = bookings.filter(t.filter).length;
              return (
                <TabsTrigger key={t.value} value={t.value} className="font-body text-sm gap-1.5 data-[state=active]:bg-card">
                  {t.label}
                  {count > 0 && (
                    <span className="bg-muted text-muted-foreground rounded-full text-[10px] px-1.5 py-px font-bold">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((t) => {
            const filtered = bookings.filter(t.filter);
            return (
              <TabsContent key={t.value} value={t.value} className="mt-4 space-y-3">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground font-body bg-card rounded-2xl border border-border">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucune réservation dans cette catégorie.</p>
                  </div>
                ) : (
                  filtered.map((b) => {
                    const profile = profileMap[b.traveler_id];
                    const ini = initials(profile?.first_name ?? null, profile?.last_name ?? null);
                    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Voyageur";
                    const computedStatus = statusOf(b);
                    const cfg = STATUS_CONFIG[computedStatus] ?? STATUS_CONFIG.confirmed;
                    const StatusIcon = cfg.icon;
                    const isExpanded = expanded === b.id;
                    const isPending = b.status === "pending";

                    return (
                      <div
                        key={b.id}
                        className={cn(
                          "bg-card rounded-2xl border shadow-card overflow-hidden transition-all hover:border-primary/20",
                          isPending ? "border-accent/30 ring-1 ring-accent/10" : "border-border"
                        )}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Property image */}
                          <div className="w-full sm:w-32 h-28 sm:h-auto shrink-0 bg-muted overflow-hidden relative">
                            {b.property_image ? (
                              <img src={b.property_image} alt={b.property_title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BedDouble className="w-8 h-8 text-muted-foreground/30" />
                              </div>
                            )}
                            {/* Status dot */}
                            <div className={cn("absolute top-2 left-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm", cfg.dot)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4 space-y-3">
                            {/* Row 1: Traveler + status */}
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                                  {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
                                      <span className="font-display text-primary-foreground font-bold text-sm">{ini}</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-body font-semibold text-foreground text-sm">{fullName}</p>
                                  <p className="font-body text-xs text-muted-foreground">
                                    {format(parseISO(b.created_at), "d MMM 'à' HH:mm", { locale: fr })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={cn("font-body text-xs border-0 gap-1", cfg.className)}>
                                  <StatusIcon className="w-3 h-3" /> {cfg.label}
                                </Badge>
                                {b.payment_status && (
                                  <Badge className={cn("font-body text-xs border-0", PAYMENT_CONFIG[b.payment_status]?.className ?? "bg-muted text-muted-foreground")}>
                                    {PAYMENT_CONFIG[b.payment_status]?.label ?? b.payment_status}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Row 2: Property info */}
                            <div className="bg-muted/30 rounded-xl px-3 py-2">
                              <p className="font-body font-semibold text-foreground text-sm truncate">{b.property_title}</p>
                              {b.property_location && (
                                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  <span className="font-body text-xs">{b.property_location}</span>
                                </div>
                              )}
                            </div>

                            {/* Row 3: Dates + guests + price */}
                            <div className="flex flex-wrap gap-3 text-xs font-body">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(parseISO(b.check_in), "d MMM", { locale: fr })} → {format(parseISO(b.check_out), "d MMM yyyy", { locale: fr })}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" /> {b.nights} nuit{b.nights > 1 ? "s" : ""}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="w-3.5 h-3.5" /> {b.guests} voyageur{b.guests > 1 ? "s" : ""}
                              </span>
                              <span className="font-display font-bold text-primary ml-auto">
                                {Number(b.total).toLocaleString("fr-FR")} €
                              </span>
                            </div>

                            {/* Expandable price details */}
                            {isExpanded && (
                              <div className="bg-muted/40 rounded-xl p-3 border border-border space-y-1.5 font-body text-xs animate-fade-in">
                                {[
                                  { label: `${Number(b.price_per_night).toLocaleString("fr-FR")} € × ${b.nights} nuits`, value: `${Number(b.subtotal).toLocaleString("fr-FR")} €` },
                                  { label: "Frais de service", value: `${Number(b.service_fee).toLocaleString("fr-FR")} €` },
                                ].map((row) => (
                                  <div key={row.label} className="flex justify-between text-muted-foreground">
                                    <span>{row.label}</span><span>{row.value}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1.5">
                                  <span>Total</span>
                                  <span className="text-primary">{Number(b.total).toLocaleString("fr-FR")} €</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground pt-0.5">
                                  <span>Référence</span>
                                  <span className="font-mono">{b.id.slice(0, 12).toUpperCase()}…</span>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-border flex-wrap">
                              <button
                                onClick={() => setExpanded(isExpanded ? null : b.id)}
                                className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {isExpanded ? "Masquer" : "Voir détails"}
                              </button>

                              {isPending && (
                                <div className="flex gap-2 ml-auto">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={updateMutation.isPending}
                                    className="font-body text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                                    onClick={() => updateMutation.mutate({ id: b.id, status: "cancelled" })}
                                  >
                                    {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                    Refuser
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={updateMutation.isPending}
                                    className="bg-gradient-brand text-primary-foreground hover:opacity-90 font-body text-xs gap-1 font-semibold"
                                    onClick={() => updateMutation.mutate({ id: b.id, status: "confirmed" })}
                                  >
                                    {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    Confirmer
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
