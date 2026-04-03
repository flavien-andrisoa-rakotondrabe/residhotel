import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShieldAlert, Flag, Activity, CheckCircle2, XCircle,
  Clock, Loader2, ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_property_id: string | null;
  reason: string;
  description: string | null;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
  admin_note: string | null;
  created_at: string;
  reporter_name?: string;
  reported_user_name?: string;
  reported_property_title?: string;
}

const STATUS_CFG = {
  pending:    { label: "En attente",  color: "text-accent bg-accent/10 border-accent/20",         icon: Clock },
  reviewed:   { label: "Examiné",    color: "text-primary bg-primary/10 border-primary/20",       icon: CheckCircle2 },
  dismissed:  { label: "Rejeté",     color: "text-muted-foreground bg-muted border-border",       icon: XCircle },
  actioned:   { label: "Traité",     color: "text-primary bg-primary/10 border-primary/20",       icon: ShieldAlert },
};

const PAGE = 10;

export default function AdminSecurity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");

  // ── Fetch reports ──────────────────────────────────────────────────────
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const [{ data: raw, error }, { data: profiles }, { data: properties }] = await Promise.all([
        supabase.from("user_reports" as "user_reports").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id,first_name,last_name"),
        supabase.from("properties").select("id,title"),
      ]);
      if (error) throw error;
      const profMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Inconnu"]));
      const propMap = Object.fromEntries((properties ?? []).map((p) => [p.id, p.title]));
      return (raw ?? []).map((r) => ({
        ...r,
        status: r.status as Report["status"],
        reporter_name: profMap[r.reporter_id] ?? "Inconnu",
        reported_user_name: r.reported_user_id ? (profMap[r.reported_user_id] ?? "Inconnu") : null,
        reported_property_title: r.reported_property_id ? (propMap[r.reported_property_id] ?? "Propriété inconnue") : null,
      })) as Report[];
    },
  });

  // ── Update report status ───────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Report["status"] }) => {
      const { error } = await supabase.from("user_reports" as "user_reports")
        .update({
          status,
          admin_note: adminNote || null,
          reviewed_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      toast({ title: "Signalement mis à jour" });
      setSelectedId(null);
      setAdminNote("");
    },
    onError: () => toast({ title: "Erreur mise à jour", variant: "destructive" }),
  });

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || r.reason.toLowerCase().includes(q)
      || (r.reporter_name ?? "").toLowerCase().includes(q)
      || (r.reported_user_name ?? "").toLowerCase().includes(q)
      || (r.reported_property_title ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const paginated  = filtered.slice((page - 1) * PAGE, page * PAGE);

  const counts = {
    pending:   reports.filter((r) => r.status === "pending").length,
    reviewed:  reports.filter((r) => r.status === "reviewed").length,
    actioned:  reports.filter((r) => r.status === "actioned").length,
  };

  const selected = selectedId ? reports.find((r) => r.id === selectedId) : null;

  return (
    <div className="space-y-7">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "En attente",  value: counts.pending,  color: "amber",   icon: Clock },
          { label: "Examinés",    value: counts.reviewed, color: "sky",     icon: CheckCircle2 },
          { label: "Traités",     value: counts.actioned, color: "emerald", icon: ShieldAlert },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">{value}</p>
              <p className="font-body text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher…" className="pl-9 font-body" />
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {["all","pending","reviewed","dismissed","actioned"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-2.5 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
                statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "Tous" : STATUS_CFG[s as keyof typeof STATUS_CFG]?.label ?? s}
            </button>
          ))}
        </div>
        <p className="font-body text-sm text-muted-foreground">{filtered.length} signalement{filtered.length > 1 ? "s" : ""}</p>
      </div>

      {/* ── Reports table ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["Signalé par","Cible","Raison","Statut","Date","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-10 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </td></tr>
              )}
              {!isLoading && paginated.map((r) => {
                const cfg = STATUS_CFG[r.status];
                const StatusIcon = cfg.icon;
                const isSelected = selectedId === r.id;
                return (
                  <>
                  <tr key={r.id} className={`hover:bg-muted/20 transition-colors ${isSelected ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-body text-sm font-medium text-foreground">{r.reporter_name}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      {r.reported_user_name && <p className="font-body text-sm text-foreground">👤 {r.reported_user_name}</p>}
                      {r.reported_property_title && <p className="font-body text-sm text-foreground line-clamp-1">🏠 {r.reported_property_title}</p>}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-body text-sm text-foreground font-semibold">{r.reason}</p>
                      {r.description && <p className="font-body text-xs text-muted-foreground line-clamp-1">{r.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-semibold border ${cfg.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-body text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className="h-7 text-xs"
                        onClick={() => { setSelectedId(isSelected ? null : r.id); setAdminNote(r.admin_note ?? ""); }}
                      >
                        {isSelected ? "Fermer" : "Traiter"}
                      </Button>
                    </td>
                  </tr>
                  {/* Inline action panel */}
                  {isSelected && (
                    <tr key={`${r.id}-action`} className="bg-primary/5">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex-1 min-w-[200px]">
                            <label className="font-body text-xs text-muted-foreground mb-1 block">Note admin</label>
                            <Input
                              value={adminNote}
                              onChange={(e) => setAdminNote(e.target.value)}
                              placeholder="Commentaire interne…"
                              className="font-body text-sm h-8"
                            />
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {(["reviewed","dismissed","actioned"] as Report["status"][]).map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1"
                                onClick={() => updateMutation.mutate({ id: r.id, status: s })}
                                disabled={updateMutation.isPending}
                              >
                                {STATUS_CFG[s].label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </>
                );
              })}
              {!isLoading && paginated.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Flag className="w-8 h-8 opacity-20" />
                    <p className="font-body text-sm">Aucun signalement</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3">
            <p className="font-body text-xs text-muted-foreground">{filtered.length} · Page {page}/{totalPages}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Activity log placeholder ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Journal d'activité admin</h3>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          Les actions admin (suspensions, modérations, décisions) seront automatiquement loguées ici dès qu'elles sont effectuées via le panel.
        </p>
        <div className="mt-3 bg-muted/30 rounded-lg px-4 py-3 font-mono text-xs text-muted-foreground space-y-1">
          <p>» Logs d'audit activés · Table admin_logs prête</p>
          <p>» Données disponibles via la table <code className="text-primary">public.admin_logs</code></p>
        </div>
      </div>
    </div>
  );
}
