import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Home, CalendarCheck, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function buildLast12Months(): { key: string; label: string }[] {
  const result = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTHS_FR[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
    });
  }
  return result;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "text-primary bg-primary/10 border-primary/20",
  pending:   "text-accent bg-accent/10 border-accent/20",
  cancelled: "text-destructive bg-destructive/10 border-destructive/20",
};
const STATUS_ICONS: Record<string, React.ElementType> = {
  confirmed: CheckCircle2,
  pending:   Clock,
  cancelled: XCircle,
};

// ── Custom tooltip ─────────────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-body font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 font-body">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name} :</span>
          <span className="font-semibold text-foreground">
            {p.dataKey === "revenue" ? `${Number(p.value).toLocaleString("fr-FR")} €` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function UsersTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-body font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 font-body">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name} :</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminOverview() {
  const months = useMemo(() => buildLast12Months(), []);

  // ── Stats cards ─────────────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: propertiesCount },
        { count: bookingsCount },
        { data: revenueData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("total").eq("payment_status", "paid"),
      ]);
      const revenue = revenueData?.reduce((acc, b) => acc + Number(b.total), 0) ?? 0;
      return { usersCount, propertiesCount, bookingsCount, revenue };
    },
  });

  // ── Monthly revenue from bookings ─────────────────────────────────────
  const { data: allBookings = [] } = useQuery({
    queryKey: ["admin-bookings-chart"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("total,status,payment_status,created_at");
      if (error) throw error;
      return data;
    },
  });

  // ── Monthly registrations ─────────────────────────────────────────────
  const { data: allProfiles = [] } = useQuery({
    queryKey: ["admin-profiles-chart"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("created_at");
      if (error) throw error;
      return data;
    },
  });

  // ── Recent activity ───────────────────────────────────────────────────
  const { data: recentBookings = [] } = useQuery({
    queryKey: ["admin-recent-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id,property_title,property_location,total,status,payment_status,created_at,check_in,check_out")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentProperties = [] } = useQuery({
    queryKey: ["admin-recent-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id,title,location,price,rating,active,created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // ── Build chart data ──────────────────────────────────────────────────

  const revenueChartData = useMemo(() => {
    const map: Record<string, { revenue: number; bookings: number }> = {};
    months.forEach(({ key }) => { map[key] = { revenue: 0, bookings: 0 }; });

    allBookings.forEach((b) => {
      const d = new Date(b.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (map[key]) {
        map[key].bookings += 1;
        if (b.payment_status === "paid") map[key].revenue += Number(b.total);
      }
    });

    return months.map(({ key, label }) => ({ label, ...map[key] }));
  }, [allBookings, months]);

  const usersChartData = useMemo(() => {
    const map: Record<string, number> = {};
    months.forEach(({ key }) => { map[key] = 0; });

    allProfiles.forEach((p) => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (map[key] !== undefined) map[key] += 1;
    });

    // cumulative total
    let cumul = 0;
    const baseCount = allProfiles.filter((p) => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return map[key] === undefined; // before our 12-month window
    }).length;
    cumul = baseCount;

    return months.map(({ key, label }) => {
      cumul += map[key];
      return { label, nouveaux: map[key], total: cumul };
    });
  }, [allProfiles, months]);

  // ── Stats trend (current month vs last month) ──────────────────────────
  const currentMonthKey = months[11].key;
  const lastMonthKey = months[10].key;
  const curRevenue = revenueChartData[11]?.revenue ?? 0;
  const prevRevenue = revenueChartData[10]?.revenue ?? 0;
  const curUsers = usersChartData[11]?.nouveaux ?? 0;
  const prevUsers = usersChartData[10]?.nouveaux ?? 0;

  const revenueGrowth = prevRevenue === 0 ? null : ((curRevenue - prevRevenue) / prevRevenue) * 100;
  const usersGrowth   = prevUsers === 0   ? null : ((curUsers - prevUsers) / prevUsers) * 100;

  const statCards = [
    {
      label: "Utilisateurs inscrits",
      value: stats?.usersCount?.toLocaleString("fr-FR") ?? "—",
      icon: Users,
      color: "bg-primary/5 text-primary border-primary/10",
      iconBg: "bg-primary/10",
      growth: usersGrowth,
      sub: `+${curUsers} ce mois`,
    },
    {
      label: "Propriétés publiées",
      value: stats?.propertiesCount?.toLocaleString("fr-FR") ?? "—",
      icon: Home,
      color: "bg-secondary text-secondary-foreground border-border",
      iconBg: "bg-secondary",
      growth: null,
      sub: null,
    },
    {
      label: "Réservations totales",
      value: stats?.bookingsCount?.toLocaleString("fr-FR") ?? "—",
      icon: CalendarCheck,
      color: "bg-muted text-foreground border-border",
      iconBg: "bg-muted",
      growth: null,
      sub: `${revenueChartData[11]?.bookings ?? 0} ce mois`,
    },
    {
      label: "Revenus encaissés",
      value: stats?.revenue != null ? `${stats.revenue.toLocaleString("fr-FR")} €` : "—",
      icon: TrendingUp,
      color: "bg-accent/10 text-accent border-accent/20",
      iconBg: "bg-accent/15",
      growth: revenueGrowth,
      sub: `${curRevenue.toLocaleString("fr-FR")} € ce mois`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 flex items-start gap-4 ${s.color}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${s.iconBg}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-[11px] font-semibold opacity-60 uppercase tracking-wide">{s.label}</p>
              <p className="font-display text-2xl font-bold mt-0.5 leading-tight">{s.value}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {s.growth !== null && (
                  <span className={`inline-flex items-center gap-0.5 font-body text-[11px] font-semibold ${
                    s.growth >= 0 ? "text-primary" : "text-destructive"
                  }`}>
                    {s.growth >= 0
                      ? <ArrowUpRight className="w-3 h-3" />
                      : <ArrowDownRight className="w-3 h-3" />
                    }
                    {Math.abs(s.growth).toFixed(1)}% vs mois passé
                  </span>
                )}
                {s.sub && (
                  <span className="font-body text-[11px] opacity-60">{s.sub}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Revenue chart */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-foreground">Revenus mensuels</h3>
              <p className="font-body text-xs text-muted-foreground mt-0.5">12 derniers mois (réservations payées)</p>
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-bookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                  interval={1}
                />
                <YAxis
                  yAxisId="revenue"
                  tick={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`}
                  width={42}
                />
                <YAxis
                  yAxisId="bookings"
                  orientation="right"
                  tick={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend
                  wrapperStyle={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 11, paddingTop: 8 }}
                  formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>}
                />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenus (€)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#grad-revenue)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  yAxisId="bookings"
                  type="monotone"
                  dataKey="bookings"
                  name="Réservations"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#grad-bookings)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User registrations chart */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-foreground">Évolution des inscriptions</h3>
              <p className="font-body text-xs text-muted-foreground mt-0.5">Nouveaux utilisateurs par mois</p>
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={usersChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-users-bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="grad-cumul" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                  interval={1}
                />
                <YAxis
                  yAxisId="new"
                  tick={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <YAxis
                  yAxisId="total"
                  orientation="right"
                  tick={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip content={<UsersTooltip />} />
                <Legend
                  wrapperStyle={{ fontFamily: "var(--font-body, sans-serif)", fontSize: 11, paddingTop: 8 }}
                  formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>}
                />
                <Bar
                  yAxisId="new"
                  dataKey="nouveaux"
                  name="Nouveaux"
                  fill="url(#grad-users-bar)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Area
                  yAxisId="total"
                  type="monotone"
                  dataKey="total"
                  name="Total cumulé"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#grad-cumul)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-display font-semibold text-foreground">Dernières réservations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40">
                  {["Propriété", "Dates", "Montant", "Statut", "Paiement"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.map((b) => {
                  const StatusIcon = STATUS_ICONS[b.status] ?? AlertCircle;
                  return (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-body font-medium text-foreground line-clamp-1">{b.property_title}</p>
                        <p className="font-body text-xs text-muted-foreground">{b.property_location}</p>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(b.check_in).toLocaleDateString("fr-FR")} →{" "}
                        {new Date(b.check_out).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 font-display font-semibold text-foreground whitespace-nowrap">
                        {Number(b.total).toLocaleString("fr-FR")} €
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border font-body ${STATUS_COLORS[b.status] ?? ""}`}>
                          <StatusIcon className="w-3 h-3" />
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border font-body ${
                          b.payment_status === "paid"
                            ? "text-primary bg-primary/10 border-primary/20"
                            : "text-accent bg-accent/10 border-accent/20"
                        }`}>
                          {b.payment_status === "paid" ? "Payé" : "En attente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recentBookings.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center font-body text-muted-foreground">Aucune réservation</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent properties */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-display font-semibold text-foreground">Dernières annonces</h3>
          </div>
          <div className="divide-y divide-border">
            {recentProperties.map((p) => (
              <div key={p.id} className="px-5 py-4 hover:bg-muted/20 transition-colors flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-body font-medium text-foreground text-sm line-clamp-1">{p.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{p.location}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-display text-sm font-bold text-primary">{Number(p.price).toLocaleString("fr-FR")} €</span>
                  <span className={`text-[10px] font-body font-semibold px-1.5 py-0.5 rounded-full ${
                    p.active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}>
                    {p.active ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            ))}
            {recentProperties.length === 0 && (
              <div className="px-5 py-8 text-center font-body text-muted-foreground text-sm">Aucune propriété</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
