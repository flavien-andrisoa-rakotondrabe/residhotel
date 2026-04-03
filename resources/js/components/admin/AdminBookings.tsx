import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Clock, CheckCircle2, XCircle, CreditCard, Loader2,
  ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  traveler_id: string;
  property_id: string;
  property_title: string;
  property_location: string | null;
  property_image: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total: number;
  subtotal: number;
  service_fee: number;
  status: string;
  payment_status: string;
  created_at: string;
  stripe_session_id: string | null;
}

const STATUS_STYLE: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  confirmed: { label: "Confirmé",   icon: CheckCircle2, className: "text-primary bg-primary/10 border-primary/20" },
  pending:   { label: "En attente", icon: Clock,        className: "text-accent bg-accent/10 border-accent/20" },
  cancelled: { label: "Annulé",     icon: XCircle,      className: "text-destructive bg-destructive/10 border-destructive/20" },
};

const PAYMENT_STYLE: Record<string, { label: string; className: string }> = {
  paid:    { label: "Payé",        className: "text-primary bg-primary/10" },
  pending: { label: "En attente",  className: "text-accent bg-accent/10" },
  failed:  { label: "Échoué",      className: "text-destructive bg-destructive/10" },
};

const PAGE_SIZE = 12;

export default function AdminBookings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id,traveler_id,property_id,property_title,property_location,property_image,check_in,check_out,nights,guests,total,subtotal,service_fee,status,payment_status,created_at,stripe_session_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-bookings"] }); toast({ title: "Statut mis à jour" }); },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !search || b.property_title.toLowerCase().includes(q) || b.id.includes(q);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchPayment = paymentFilter === "all" || b.payment_status === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const total = filtered.length;
  const totalRevenue = bookings.filter((b) => b.payment_status === "paid").reduce((s, b) => s + Number(b.total), 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total réservations", value: bookings.length },
          { label: "Confirmées", value: bookings.filter((b) => b.status === "confirmed").length },
          { label: "En attente", value: bookings.filter((b) => b.status === "pending").length },
          { label: "Revenus totaux", value: `${totalRevenue.toLocaleString("fr-FR")} €` },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
            <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher…"
            className="pl-9 font-body"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {["all", "confirmed", "pending", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
                statusFilter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Tous" : STATUS_STYLE[f]?.label ?? f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {["all", "paid", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => { setPaymentFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
                paymentFilter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Tout paiement" : PAYMENT_STYLE[f]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["Propriété", "Dates", "Voyageurs", "Montant", "Statut", "Paiement", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              )}
              {!isLoading && paginated.map((b) => {
                const ss = STATUS_STYLE[b.status] ?? { label: b.status, icon: AlertCircle, className: "" };
                const ps = PAYMENT_STYLE[b.payment_status] ?? { label: b.payment_status, className: "" };
                return (
                  <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {b.property_image && (
                          <img src={b.property_image} alt="" className="w-10 h-9 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-body font-medium text-foreground line-clamp-1">{b.property_title}</p>
                          <p className="font-body text-xs text-muted-foreground">{b.property_location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(b.check_in).toLocaleDateString("fr-FR")} →{" "}
                      {new Date(b.check_out).toLocaleDateString("fr-FR")}
                      <br />
                      <span className="text-foreground font-semibold">{b.nights} nuit{b.nights > 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground text-center">{b.guests}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-display font-bold text-foreground">{Number(b.total).toLocaleString("fr-FR")} €</p>
                      <p className="font-body text-[11px] text-muted-foreground">dont {Number(b.service_fee).toLocaleString("fr-FR")} € frais</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border font-body ${ss.className}`}>
                        <ss.icon className="w-3 h-3" />
                        {ss.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold font-body ${ps.className}`}>
                        <CreditCard className="w-3 h-3" />
                        {ps.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-body text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => updateStatusMutation.mutate({ id: b.id, status: "cancelled" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Annuler
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && paginated.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center font-body text-muted-foreground">Aucune réservation</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3">
            <p className="font-body text-xs text-muted-foreground">
              {total} résultat{total > 1 ? "s" : ""} · Page {page} / {totalPages}
            </p>
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
