import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import {
  DollarSign, TrendingUp, CreditCard, Users, Download,
  ChevronLeft, ChevronRight, Loader2, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── helpers ───────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const STATUS_COLOR: Record<string, string> = {
  confirmed: "text-primary bg-primary/10 border-primary/20",
  pending:   "text-accent bg-accent/10 border-accent/20",
  cancelled: "text-destructive bg-destructive/10 border-destructive/20",
  completed: "text-secondary-foreground bg-secondary border-border",
};

const PAGE = 12;

// ── component ─────────────────────────────────────────────────────────────
export default function AdminFinance() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // All bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-finance-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ── KPIs ─────────────────────────────────────────────────────────────
  const paid       = bookings.filter((b) => b.payment_status === "paid");
  const totalRev   = paid.reduce((s, b) => s + (b.total ?? 0), 0);
  const commission = paid.reduce((s, b) => s + (b.service_fee ?? 0), 0);
  const avgOrder   = paid.length ? totalRev / paid.length : 0;

  // Monthly data for charts (last 12 months)
  const now = new Date();
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const y = d.getFullYear(), m = d.getMonth();
    const slice = paid.filter((b) => {
      const bd = new Date(b.created_at);
      return bd.getFullYear() === y && bd.getMonth() === m;
    });
    return {
      month: MONTHS[m],
      revenus: Math.round(slice.reduce((s, b) => s + (b.total ?? 0), 0)),
      commissions: Math.round(slice.reduce((s, b) => s + (b.service_fee ?? 0), 0)),
      reservations: slice.length,
    };
  });

  // Last month vs previous
  const lastMo = monthly[11]?.revenus ?? 0;
  const prevMo = monthly[10]?.revenus ?? 0;
  const revTrend = prevMo ? ((lastMo - prevMo) / prevMo) * 100 : 0;

  // ── Table ─────────────────────────────────────────────────────────────
  const filtered = statusFilter === "all"
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const paginated  = filtered.slice((page - 1) * PAGE, page * PAGE);

  // ── CSV Export ────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ["ID","Titre","Dates","Nuits","Voyageur","Total","Commission","Statut paiement","Statut","Créé le"];
    const rows = filtered.map((b) => [
      b.id,
      `"${b.property_title}"`,
      `${b.check_in} → ${b.check_out}`,
      b.nights,
      b.traveler_id,
      b.total,
      b.service_fee,
      b.payment_status,
      b.status,
      new Date(b.created_at).toLocaleDateString("fr-FR"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "residotel-finance.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          {
            label:   "Revenu total",
            value:   fmt(totalRev),
            icon:    DollarSign,
            trend:   revTrend,
            iconBg:  "bg-primary/10",
            iconColor: "text-primary",
            sub:     `${paid.length} paiements validés`,
          },
          {
            label:   "Commissions Residotel",
            value:   fmt(commission),
            icon:    TrendingUp,
            trend:   null,
            iconBg:  "bg-accent/10",
            iconColor: "text-accent",
            sub:     `${totalRev ? ((commission / totalRev) * 100).toFixed(1) : 0}% du CA`,
          },
          {
            label:   "Panier moyen",
            value:   fmt(avgOrder),
            icon:    CreditCard,
            trend:   null,
            iconBg:  "bg-secondary",
            iconColor: "text-secondary-foreground",
            sub:     "par réservation payée",
          },
          {
            label:   "Réservations totales",
            value:   String(bookings.length),
            icon:    Users,
            trend:   null,
            iconBg:  "bg-muted",
            iconColor: "text-foreground",
            sub:     `${bookings.filter((b) => b.status === "confirmed").length} confirmées`,
          },
        ].map(({ label, value, icon: Icon, trend, iconBg, iconColor, sub }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              {trend !== null && (
                <span className={`flex items-center gap-0.5 text-xs font-bold font-body ${trend >= 0 ? "text-primary" : "text-destructive"}`}>
                  {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(trend).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">{label}</p>
            <p className="font-display text-2xl font-bold text-foreground">{value}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue area chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-display font-semibold text-foreground mb-4">Revenus & commissions (12 mois)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gCom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Area type="monotone" dataKey="revenus"     name="Revenus"     stroke="hsl(var(--primary))" fill="url(#gRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="commissions" name="Commissions" stroke="hsl(var(--accent))"  fill="url(#gCom)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings bar chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-display font-semibold text-foreground mb-4">Volume de réservations (12 mois)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="reservations" name="Réservations" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Table header with filters ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {["all","confirmed","pending","cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
                statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "Toutes" : s === "confirmed" ? "Confirmées" : s === "pending" ? "En attente" : "Annulées"}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* ── Transactions table ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["Propriété","Dates","Nuits","Total","Commission","Paiement","Statut"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </td></tr>
              )}
              {!isLoading && paginated.map((b) => (
                <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="font-body text-sm font-medium text-foreground line-clamp-1">{b.property_title}</p>
                    {b.property_location && <p className="font-body text-xs text-muted-foreground">{b.property_location}</p>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-body text-xs text-muted-foreground">{new Date(b.check_in).toLocaleDateString("fr-FR")}</p>
                    <p className="font-body text-xs text-muted-foreground">{new Date(b.check_out).toLocaleDateString("fr-FR")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-body text-sm text-foreground">{b.nights}n</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-body text-sm font-bold text-foreground">{fmt(b.total)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-body text-sm text-accent font-semibold">{fmt(b.service_fee ?? 0)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold border ${
                      b.payment_status === "paid" ? "bg-primary/10 text-primary border-primary/20" : "bg-accent/10 text-accent border-accent/20"
                    }`}>
                      {b.payment_status === "paid" ? "Payé" : "En attente"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold border ${STATUS_COLOR[b.status] ?? ""}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && paginated.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center font-body text-muted-foreground">Aucune transaction</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3">
            <p className="font-body text-xs text-muted-foreground">{filtered.length} transactions · Page {page}/{totalPages}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
